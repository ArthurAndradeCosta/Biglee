// ========================================
// MODEL - CATEGORIA
// ========================================

const db = require("../database/database");

const Categoria = {

    listar() {
        return db.prepare(`SELECT * FROM categorias ORDER BY id`).all();
    },

    buscarPorId(id) {
        return db.prepare(`SELECT * FROM categorias WHERE id = ?`).get(id);
    },

    buscarPorSlug(slug) {
        return db.prepare(`SELECT * FROM categorias WHERE slug = ?`).get(slug);
    }

};

module.exports = Categoria;