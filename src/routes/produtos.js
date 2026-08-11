// ========================================
// ROTAS DE PRODUTOS
// Biglee Burguer
// ========================================

const express = require("express");
const router = express.Router();

const ProdutoController = require("../controllers/ProdutoController");


// GET    /api/produtos            → listar (com filtro ?categoria=)
// GET    /api/produtos/:id        → buscar por id
// POST   /api/produtos            → criar
// PUT    /api/produtos/:id        → atualizar
// DELETE /api/produtos/:id        → deletar (soft delete)

router.get("/", ProdutoController.listar);
router.get("/:id", ProdutoController.buscarPorId);
router.post("/", ProdutoController.criar);
router.put("/:id", ProdutoController.atualizar);
router.delete("/:id", ProdutoController.deletar);


module.exports = router;