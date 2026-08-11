// ========================================
// MIDDLEWARE - VALIDAÇÃO SIMPLES
// ========================================

function validarCampos(camposObrigatorios) {

    return (req, res, next) => {

        const faltando = camposObrigatorios.filter(campo => {
            const valor = req.body[campo];
            return valor === undefined || valor === null || valor === "";
        });

        if (faltando.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `Campos obrigatórios faltando: ${faltando.join(", ")}`
            });
        }

        next();

    };

}

module.exports = { validarCampos };