// ========================================
// MODEL - PRODUTO
// ========================================

const db = require("../database/database");

const Produto = {

    listar({ categoria, disponivel = true } = {}) {

        let sql = `SELECT * FROM produtos WHERE 1=1`;
        const params = [];

        if (categoria && categoria !== "todos") {
            sql += ` AND categoria = ?`;
            params.push(categoria);
        }

        if (disponivel !== null && disponivel !== undefined) {
            sql += ` AND disponivel = ?`;
            params.push(disponivel ? 1 : 0);
        }

        sql += ` ORDER BY categoria, id`;

        return db.prepare(sql).all(...params);

    },

    buscarPorId(id) {
        return db.prepare(`SELECT * FROM produtos WHERE id = ?`).get(id);
    },

    buscarPorSlug(slug) {
        return db.prepare(`SELECT * FROM produtos WHERE slug = ?`).get(slug);
    },

    criar({ slug, nome, descricao, preco, categoria, emoji, imagem }) {

        const stmt = db.prepare(`
            INSERT INTO produtos (slug, nome, descricao, preco, categoria, emoji, imagem)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(slug || null, nome, descricao || "", preco, categoria, emoji || "🍔", imagem || null);
        return this.buscarPorId(result.lastInsertRowid);

    },

    atualizar(id, dados) {

        const existente = this.buscarPorId(id);
        if (!existente) return null;

        const atualizado = { ...existente, ...dados };

        db.prepare(`
            UPDATE produtos SET
                slug = ?, nome = ?, descricao = ?, preco = ?, categoria = ?,
                emoji = ?, imagem = ?, disponivel = ?
            WHERE id = ?
        `).run(
            atualizado.slug,
            atualizado.nome,
            atualizado.descricao,
            atualizado.preco,
            atualizado.categoria,
            atualizado.emoji,
            atualizado.imagem,
            atualizado.disponivel ?? 1,
            id
        );

        return this.buscarPorId(id);

    },

    deletar(id) {
        // Soft delete
        db.prepare(`UPDATE produtos SET disponivel = 0 WHERE id = ?`).run(id);
    },

    reativar(id) {
        db.prepare(`UPDATE produtos SET disponivel = 1 WHERE id = ?`).run(id);
    },

    removerPermanente(id) {
        db.prepare(`DELETE FROM produtos WHERE id = ?`).run(id);
    }

};

module.exports = Produto;