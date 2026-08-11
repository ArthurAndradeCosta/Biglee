// ========================================
// SERVIDOR EXPRESS + SOCKET.IO
// Biglee Burguer
// ========================================

const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
require("dotenv").config();


// Inicializa banco (cria tabelas e popula seeds se necessário)
require("./database/database");

const produtosRoutes = require("./routes/produtos");
const categoriasRoutes = require("./routes/categorias");
const authRoutes = require("./routes/auth");
const pedidosRoutes = require("./routes/pedidos");
const pagamentosRoutes = require("./routes/pagamentos");
const adminRoutes = require("./routes/admin");
const configRoutes = require("./routes/config");
const usuariosRoutes = require("./routes/usuarios");

const logger = require("./utils/logger");
const SocketService = require("./services/SocketService");
const errorHandler = require("./middlewares/errorHandler");


const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;


// ========================================
// MIDDLEWARES
// ========================================

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


// ========================================
// SERVIR FRONT-END ESTÁTICO
// ========================================

app.use("/cliente", express.static(path.resolve(__dirname, "..", "..", "Front-End", "cliente")));
app.use("/admin", express.static(path.resolve(__dirname, "..", "..", "Front-End", "admin")));
app.use("/assets", express.static(path.resolve(__dirname, "..", "..", "Front-End", "cliente", "assets")));


// ========================================
// ROTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {

    res.json({
        sucesso: true,
        mensagem: "🍔 API da Biglee Burger funcionando!",
        versao: "2.0.0",
        rotas: {
            cliente: "/cliente/cardapio.html",
            admin: "/admin/login.html",
            api: {
                auth: "/api/auth/login",
                produtos: "/api/produtos",
                categorias: "/api/categorias",
                pedidos: "/api/pedidos",
                pagamentos: "/api/pagamentos/mercadopago",
                config: "/api/config"
            }
        }
    });

});


// ========================================
// ROTAS DA API
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/pagamentos", pagamentosRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/config", configRoutes);
app.use("/api/usuarios", usuariosRoutes);


// ========================================
// 404 - ROTA NÃO ENCONTRADA
// ========================================

app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: "Rota não encontrada"
    });
});


// ========================================
// ERROR HANDLER
// ========================================

app.use(errorHandler);


// ========================================
// SOCKET.IO
// ========================================

SocketService.init(server);


// ========================================
// INICIAR SERVIDOR
// ========================================

server.listen(PORT, () => {

    console.log("");
    console.log("╔════════════════════════════════════════╗");
    console.log("║   🍔 BIGLEE BURGUER - API v2.0        ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("");
    logger.info(`Servidor rodando em http://localhost:${PORT}`);
    logger.info(`Cliente:   http://localhost:${PORT}/cliente/cardapio.html`);
    logger.info(`Admin:     http://localhost:${PORT}/admin/login.html`);
    logger.info(`Mercado Pago: ${process.env.MP_ACCESS_TOKEN ? "✅ Configurado" : "⚠️  Não configurado (modo simulação)"}`);
    console.log("");
});