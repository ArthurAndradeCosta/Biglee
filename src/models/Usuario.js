// ========================================
// MODEL - USUÁRIO
// ========================================

const db = require("../database/database");

const Usuario = {

    criar({ nome, email, senha_hash, role = "admin" }) {
        const stmt = db.prepare(`
            INSERT INTO usuarios (nome, email, senha_hash, role)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(nome, email, senha_hash, role);
        return this.buscarPorId(result.lastInsertRowid);
    },

    buscarPorId(id) {
        return db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(id);
    },

    buscarPorEmail(email) {
        return db.prepare(`SELECT * FROM usuarios WHERE email = ?`).get(email);
    },

    listar() {
        return db.prepare(`SELECT id, nome, email, role, ativo, criado_em, ultimo_login FROM usuarios ORDER BY id`).all();
    },

    atualizarUltimoLogin(id) {
        db.prepare(`UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
    },

    atualizarSenha(id, senha_hash) {
        db.prepare(`UPDATE usuarios SET senha_hash = ?, primeiro_login = 0 WHERE id = ?`).run(senha_hash, id);
    },

    desativar(id) {
        db.prepare(`UPDATE usuarios SET ativo = 0 WHERE id = ?`).run(id);
    },

    ativar(id) {
        db.prepare(`UPDATE usuarios SET ativo = 1 WHERE id = ?`).run(id);
    },

    deletar(id) {
        db.prepare(`DELETE FROM usuarios WHERE id = ?`).run(id);
    }

};

module.exports = Usuario;