// ========================================
// MODEL - PAGAMENTO
// ========================================

const db = require("../database/database");

const Pagamento = {

    criar(dados) {
        const { pedido_id, metodo, provider_id, qr_code, qr_code_base64, ticket_url, valor } = dados;

        const stmt = db.prepare(`
            INSERT INTO pagamentos (
                pedido_id, metodo, provider_id, qr_code, qr_code_base64, ticket_url, valor, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')
        `);

        const result = stmt.run(pedido_id, metodo, provider_id, qr_code, qr_code_base64, ticket_url, valor);
        return this.buscarPorId(result.lastInsertRowid);
    },

    buscarPorId(id) {
        return db.prepare(`SELECT * FROM pagamentos WHERE id = ?`).get(id);
    },

    buscarPorProviderId(provider_id) {
        return db.prepare(`SELECT * FROM pagamentos WHERE provider_id = ?`).get(provider_id);
    },

    buscarPorPedido(pedido_id) {
        return db.prepare(`SELECT * FROM pagamentos WHERE pedido_id = ? ORDER BY criado_em DESC`).all(pedido_id);
    },

    atualizarStatus(id, status) {
        db.prepare(`UPDATE pagamentos SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`).run(status, id);
        return this.buscarPorId(id);
    },

    atualizarPorProviderId(provider_id, status) {
        db.prepare(`
            UPDATE pagamentos
            SET status = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE provider_id = ?
        `).run(status, provider_id);
        return this.buscarPorProviderId(provider_id);
    }

};

module.exports = Pagamento;