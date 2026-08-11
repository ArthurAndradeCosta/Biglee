// ========================================
// ROTAS - PEDIDOS
// ========================================

const express = require("express");
const router = express.Router();

const PedidoController = require("../controllers/PedidoController");
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");

// Cliente
router.post("/", PedidoController.criar);
router.get("/:codigo", PedidoController.consultarPorCodigo);

// Admin
router.get("/", auth, adminOnly, PedidoController.listar);
router.get("/id/:id", auth, adminOnly, PedidoController.buscarPorId);
router.patch("/:id/status", auth, adminOnly, PedidoController.atualizarStatus);

module.exports = router;