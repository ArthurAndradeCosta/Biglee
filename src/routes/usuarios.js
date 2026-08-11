// ========================================
// ROTAS - USUÁRIOS (Admin)
// ========================================

const express = require("express");
const router = express.Router();

const UsuarioController = require("../controllers/UsuarioController");
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");

router.get("/", auth, adminOnly, UsuarioController.listar);
router.post("/", auth, adminOnly, UsuarioController.criar);
router.put("/:id", auth, adminOnly, UsuarioController.atualizar);
router.delete("/:id", auth, adminOnly, UsuarioController.deletar);

module.exports = router;
