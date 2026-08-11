// ========================================
// ROTAS - AUTENTICAÇÃO
// ========================================

const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");
const auth = require("../middlewares/auth");

router.post("/login", AuthController.login);
router.get("/me", auth, AuthController.me);
router.post("/trocar-senha", auth, AuthController.trocarSenha);

module.exports = router;