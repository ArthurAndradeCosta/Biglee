// ========================================
// ROTAS DE CATEGORIAS
// Biglee Burguer
// ========================================

const express = require("express");
const router = express.Router();

const CategoriaController = require("../controllers/CategoriaController");
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");


// GET /api/categorias
router.get("/", CategoriaController.listar);


// DELETE /api/categorias/:id (admin)
router.delete("/:id", auth, adminOnly, CategoriaController.deletar);


module.exports = router;
