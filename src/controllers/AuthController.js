// ========================================
// CONTROLLER - AUTENTICAÇÃO
// ========================================

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuario");
const logger = require("../utils/logger");

const AuthController = {

    async login(req, res) {

        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email e senha são obrigatórios"
            });
        }

        const usuario = Usuario.buscarPorEmail(email);

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Credenciais inválidas"
            });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Credenciais inválidas"
            });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
        );

        Usuario.atualizarUltimoLogin(usuario.id);

        logger.success(`Login: ${usuario.email} (${usuario.role})`);

        res.json({
            sucesso: true,
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                primeiro_login: usuario.primeiro_login
            }
        });

    },

    me(req, res) {
        res.json({
            sucesso: true,
            usuario: req.usuario
        });
    },

    async trocarSenha(req, res) {

        const { senha_atual, senha_nova } = req.body;

        if (!senha_atual || !senha_nova) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Senha atual e nova senha são obrigatórias"
            });
        }

        if (senha_nova.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Nova senha deve ter no mínimo 6 caracteres"
            });
        }

        const usuario = Usuario.buscarPorId(req.usuario.id);
        const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Senha atual incorreta"
            });
        }

        const novaHash = await bcrypt.hash(senha_nova, 10);
        Usuario.atualizarSenha(usuario.id, novaHash);

        logger.success(`Senha alterada: ${usuario.email}`);

        res.json({
            sucesso: true,
            mensagem: "Senha alterada com sucesso"
        });

    }

};

module.exports = AuthController;