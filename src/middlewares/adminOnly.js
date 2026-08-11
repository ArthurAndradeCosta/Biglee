// ========================================
// MIDDLEWARE - ADMIN ONLY
// ========================================

function adminOnly(req, res, next) {

    if (!req.usuario) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Não autenticado"
        });
    }

    if (!["admin", "gerente"].includes(req.usuario.role)) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Acesso negado. Apenas administradores."
        });
    }

    next();

}

module.exports = adminOnly;