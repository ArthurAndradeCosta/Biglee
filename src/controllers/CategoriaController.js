// ========================================
// CONTROLLER DE CATEGORIAS
// Biglee Burguer
// ========================================

const db = require("../database/database");


// ========================================
// LISTAR CATEGORIAS
// GET /api/categorias
// ========================================

const listar = (req, res) => {

    try {

        const categorias = db
            .prepare(`SELECT * FROM categorias ORDER BY id`)
            .all();

        res.json({
            sucesso: true,
            total: categorias.length,
            categorias
        });

    } catch (erro) {

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar categorias",
            erro: erro.message
        });

    }

};


// ========================================
// DELETAR CATEGORIA
// DELETE /api/categorias/:id
// ========================================

const deletar = (req, res) => {
    try {
        const { id } = req.params;
        const cat = db.prepare(`SELECT id FROM categorias WHERE id = ?`).get(id);
        if (!cat) {
            return res.status(404).json({ sucesso: false, mensagem: "Categoria não encontrada" });
        }
        // Impede deletar categoria que tem produto vinculado
        const temProdutos = db.prepare(`SELECT COUNT(*) as t FROM produtos WHERE categoria = (SELECT slug FROM categorias WHERE id = ?)`).get(id).t;
        if (temProdutos > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `Não é possível deletar: existem ${temProdutos} produto(s) nesta categoria`
            });
        }
        db.prepare(`DELETE FROM categorias WHERE id = ?`).run(id);
        res.json({ sucesso: true, mensagem: "Categoria removida" });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: "Erro ao deletar categoria", erro: erro.message });
    }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
    listar,
    deletar
};
