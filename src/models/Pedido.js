// ========================================
// MODEL - PEDIDO
// ========================================

const db = require("../database/database");

const Pedido = {

    criar(dados) {
        const {
            codigo, cliente_nome, cliente_telefone, tipo,
            endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_referencia,
            taxa_entrega, forma_pagamento, troco_para,
            subtotal, total, observacao, itens
        } = dados;

        const stmt = db.prepare(`
            INSERT INTO pedidos (
                codigo, cliente_nome, cliente_telefone, tipo,
                endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_referencia,
                taxa_entrega, forma_pagamento, troco_para,
                subtotal, total, observacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertItem = db.prepare(`
            INSERT INTO pedido_itens (pedido_id, produto_id, nome_snapshot, preco_snapshot, quantidade, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = db.transaction(() => {
            const info = stmt.run(
                codigo, cliente_nome, cliente_telefone, tipo,
                endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_referencia,
                taxa_entrega, forma_pagamento, troco_para,
                subtotal, total, observacao
            );
            const pedidoId = info.lastInsertRowid;
            itens.forEach(item => {
                insertItem.run(
                    pedidoId,
                    item.produto_id,
                    item.nome,
                    item.preco,
                    item.quantidade,
                    item.preco * item.quantidade
                );
            });
            return pedidoId;
        })();

        return this.buscarPorId(result);
    },

    buscarPorId(id) {
        const pedido = db.prepare(`SELECT * FROM pedidos WHERE id = ?`).get(id);
        if (!pedido) return null;
        pedido.itens = db.prepare(`SELECT * FROM pedido_itens WHERE pedido_id = ?`).all(id);
        return pedido;
    },

    buscarPorCodigo(codigo) {
        const pedido = db.prepare(`SELECT * FROM pedidos WHERE codigo = ?`).get(codigo);
        if (!pedido) return null;
        pedido.itens = db.prepare(`SELECT * FROM pedido_itens WHERE pedido_id = ?`).all(pedido.id);
        return pedido;
    },

    listar({ status, data, limite = 100 } = {}) {
        let sql = `SELECT * FROM pedidos WHERE 1=1`;
        const params = [];

        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }

        if (data) {
            sql += ` AND DATE(criado_em) = ?`;
            params.push(data);
        }

        sql += ` ORDER BY criado_em DESC LIMIT ?`;
        params.push(limite);

        const pedidos = db.prepare(sql).all(...params);

        // Anexa os itens de cada pedido (pra exibir no admin)
        const itensStmt = db.prepare(`SELECT * FROM pedido_itens WHERE pedido_id = ?`);
        pedidos.forEach(p => {
            p.itens = itensStmt.all(p.id);
        });

        return pedidos;
    },

    atualizarStatus(id, status) {
        db.prepare(`UPDATE pedidos SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`).run(status, id);
        return this.buscarPorId(id);
    },

    atualizarPagamento(id, pagamento_id, pagamento_status) {
        db.prepare(`
            UPDATE pedidos
            SET pagamento_id = ?, pagamento_status = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(pagamento_id, pagamento_status, id);
    },

    deletar(id) {
        db.prepare(`DELETE FROM pedidos WHERE id = ?`).run(id);
    },

    proximoCodigo() {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        const prefixo = `BB-${ano}${mes}${dia}`;

        const ultimo = db.prepare(`
            SELECT codigo FROM pedidos WHERE codigo LIKE ?
            ORDER BY id DESC LIMIT 1
        `).get(`${prefixo}-%`);

        let seq = 1;
        if (ultimo) {
            seq = parseInt(ultimo.codigo.split('-').pop(), 10) + 1;
        }

        return `${prefixo}-${String(seq).padStart(4, '0')}`;
    },

    // Métricas para dashboard
    contarPorStatus() {
        return db.prepare(`
            SELECT status, COUNT(*) as total
            FROM pedidos
            WHERE DATE(criado_em) = DATE('now')
            GROUP BY status
        `).all();
    },

    faturamentoHoje() {
        return db.prepare(`
            SELECT COALESCE(SUM(total), 0) as total
            FROM pedidos
            WHERE DATE(criado_em) = DATE('now') AND pagamento_status = 'pago'
        `).get().total;
    },

    totalPedidosHoje() {
        return db.prepare(`
            SELECT COUNT(*) as total FROM pedidos
            WHERE DATE(criado_em) = DATE('now')
        `).get().total;
    },

    vendasUltimos7Dias() {
        return db.prepare(`
            SELECT DATE(criado_em) as dia, COALESCE(SUM(total), 0) as total
            FROM pedidos
            WHERE criado_em >= DATE('now', '-7 days') AND pagamento_status = 'pago'
            GROUP BY DATE(criado_em)
            ORDER BY dia
        `).all();
    },

    topProdutos(limite = 5) {
        return db.prepare(`
            SELECT nome_snapshot as nome, SUM(quantidade) as total_vendido, SUM(subtotal) as receita
            FROM pedido_itens
            GROUP BY nome_snapshot
            ORDER BY total_vendido DESC
            LIMIT ?
        `).all(limite);
    }

};

module.exports = Pedido;