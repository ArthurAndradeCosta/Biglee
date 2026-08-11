// ========================================
// CONTROLLER - USUÁRIOS (Admin)
// ========================================

const bcrypt = require("bcrypt");
const db = require("../database/database");
const Usuario = require("../models/Usuario");

const UsuarioController = {

    listar(req, res) {
        try {
            const usuarios = Usuario.listar();
            res.json({ sucesso: true, total: usuarios.length, usuarios });
        } catch (err) {
            res.status(500).json({ sucesso: false, mensagem: "Erro ao listar usuários", erro: err.message });
        }
    },

    criar(req, res) {
        try {
            const { nome, email, senha, role } = req.body;
            if (!nome || !email || !senha) {
                return res.status(400).json({ sucesso: false, mensagem: "Campos obrigatórios: nome, email, senha" });
            }
            if (Usuario.buscarPorEmail(email)) {
                return res.status(400).json({ sucesso: false, mensagem: "E-mail já cadastrado" });
            }
            const senha_hash = bcrypt.hashSync(senha, 10);
            const usuario = Usuario.criar({ nome, email, senha_hash, role: role || "admin" });
            delete usuario.senha_hash;
            res.status(201).json({ sucesso: true, mensagem: "Usuário criado", usuario });
        } catch (err) {
            res.status(500).json({ sucesso: false, mensagem: "Erro ao criar usuário", erro: err.message });
        }
    },

    atualizar(req, res) {
        try {
            const { id } = req.params;
            const existente = Usuario.buscarPorId(id);
            if (!existente) return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado" });

            const { nome, email, role, ativo } = req.body;
            db.prepare(`
                UPDATE usuarios SET
                    nome = COALESCE(?, nome),
                    email = COALESCE(?, email),
                    role = COALESCE(?, role),
                    ativo = COALESCE(?, ativo)
                WHERE id = ?
            `).run(nome || null, email || null, role || null, ativo ?? null, id);

            const usuario = Usuario.buscarPorId(id);
            delete usuario.senha_hash;
            res.json({ sucesso: true, mensagem: "Usuário atualizado", usuario });
        } catch (err) {
            res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar usuário", erro: err.message });
        }
    },

    deletar(req, res) {
        try {
            const { id } = req.params;
            const existente = Usuario.buscarPorId(id);
            if (!existente) return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado" });
            Usuario.deletar(id);
            res.json({ sucesso: true, mensagem: "Usuário removido" });
        } catch (err) {
            res.status(500).json({ sucesso: false, mensagem: "Erro ao deletar usuário", erro: err.message });
        }
    }

};

module.exports = UsuarioController;
