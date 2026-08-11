// ========================================
// SERVICE - SOCKET (WebSocket)
// ========================================

let io = null;

const SocketService = {

    init(server) {
        const { Server } = require("socket.io");
        io = new Server(server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });

        io.on("connection", (socket) => {
            require("../utils/logger").socket(`Cliente conectado: ${socket.id}`);

            socket.on("disconnect", () => {
                require("../utils/logger").socket(`Cliente desconectado: ${socket.id}`);
            });
        });

        return io;
    },

    emitir(evento, dados) {
        if (io) {
            io.emit(evento, dados);
        }
    },

    novoPedido(pedido) {
        this.emitir("novo-pedido", pedido);
    },

    statusAtualizado(pedido) {
        this.emitir("pedido-status", pedido);
    },

    pagamentoAtualizado(pedido) {
        this.emitir("pagamento-status", pedido);
    }

};

module.exports = SocketService;