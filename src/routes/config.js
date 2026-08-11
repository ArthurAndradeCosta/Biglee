// ========================================
// ROTAS - CONFIGURAÇÕES
// ========================================

const express = require("express");
const router = express.Router();

const ConfigController = require("../controllers/ConfigController");
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");

router.get("/", ConfigController.publicas);
router.get("/admin", auth, adminOnly, ConfigController.listar);
router.put("/admin", auth, adminOnly, ConfigController.atualizar);

module.exports = router;