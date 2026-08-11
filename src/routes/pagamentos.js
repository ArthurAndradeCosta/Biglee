// ========================================
// ROTAS - PAGAMENTOS
// ========================================

const express = require("express");
const router = express.Router();

const PagamentoController = require("../controllers/PagamentoController");
const auth = require("../middlewares/auth");

router.post("/mercadopago", PagamentoController.criar);
router.post("/webhook", PagamentoController.webhook);
router.get("/:id", auth, PagamentoController.consultar);
router.post("/:id/simular-aprovacao", auth, PagamentoController.simularAprovacao);

module.exports = router;