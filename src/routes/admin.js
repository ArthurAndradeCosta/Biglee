// ========================================
// ROTAS - ADMIN
// ========================================

const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/AdminController");
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");
const ProdutoController = require("../controllers/ProdutoController");

router.use(auth, adminOnly);

// Dashboard
router.get("/dashboard", AdminController.dashboard);

// CRUD de produtos via admin (mesmo que /api/produtos mas protegido)
router.post("/produtos", ProdutoController.criar);
router.put("/produtos/:id", ProdutoController.atualizar);
router.delete("/produtos/:id", ProdutoController.deletar);

module.exports = router;