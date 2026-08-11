// ========================================
// MIDDLEWARE - AUTENTICAÇÃO JWT
// ========================================

const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

function auth(req, res, next) {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token não fornecido"
        });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = Usuario.buscarPorId(decoded.id);

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário inválido ou desativado"
            });
        }

        // Anexa usuário à requisição (sem a senha)
        req.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            primeiro_login: usuario.primeiro_login
        };

        next();

    } catch (err) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token inválido ou expirado"
        });
    }

}

module.exports = auth;