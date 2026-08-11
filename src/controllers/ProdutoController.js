// ========================================
// CONTROLLER - PRODUTOS (refatorado usando Model)
// ========================================

const Produto = require("../models/Produto");

const ProdutoController = {

    listar(req, res) {
        try {
            const { categoria } = req.query;
            const produtos = Produto.listar({ categoria });
            res.json({
                sucesso: true,
                total: produtos.length,
                produtos
            });
        } catch (err) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar produtos",
                erro: err.message
            });
        }
    },

    buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const produto = Produto.buscarPorId(id);
            if (!produto) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Produto não encontrado"
                });
            }
            res.json({ sucesso: true, produto });
        } catch (err) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar produto",
                erro: err.message
            });
        }
    },

    criar(req, res) {
        try {
            const { slug, nome, descricao, preco, categoria, emoji, imagem } = req.body;
            if (!nome || !preco || !categoria) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Campos obrigatórios: nome, preco, categoria"
                });
            }
            const produto = Produto.criar({ slug, nome, descricao, preco, categoria, emoji, imagem });
            res.status(201).json({
                sucesso: true,
                mensagem: "Produto criado com sucesso",
                produto
            });
        } catch (err) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar produto",
                erro: err.message
            });
        }
    },

    atualizar(req, res) {
        try {
            const { id } = req.params;
            const produto = Produto.atualizar(id, req.body);
            if (!produto) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Produto não encontrado"
                });
            }
            res.json({
                sucesso: true,
                mensagem: "Produto atualizado com sucesso",
                produto
            });
        } catch (err) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar produto",
                erro: err.message
            });
        }
    },

    deletar(req, res) {
        try {
            const { id } = req.params;
            const produto = Produto.buscarPorId(id);
            if (!produto) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Produto não encontrado"
                });
            }
            Produto.deletar(id);
            res.json({
                sucesso: true,
                mensagem: "Produto removido com sucesso"
            });
        } catch (err) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar produto",
                erro: err.message
            });
        }
    }

};

module.exports = ProdutoController;