// ========================================
// CONTROLLER - ADMIN (DASHBOARD)
// ========================================

const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");
const Config = require("../models/Config");
const Usuario = require("../models/Usuario");
const logger = require("../utils/logger");

const AdminController = {

    dashboard(req, res) {

        try {
            const pedidosPorStatus = Pedido.contarPorStatus();
            const faturamentoHoje = Pedido.faturamentoHoje();
            const totalPedidosHoje = Pedido.totalPedidosHoje();
            const vendasUltimos7Dias = Pedido.vendasUltimos7Dias();
            const topProdutos = Pedido.topProdutos(5);

            // Converte status para objeto
            const statusCount = {};
            pedidosPorStatus.forEach(p => { statusCount[p.status] = p.total; });

            // Pedidos em destaque (últimos 10)
            const ultimosPedidos = Pedido.listar({ limite: 10 });

            res.json({
                sucesso: true,
                metricas: {
                    faturamento_hoje: faturamentoHoje,
                    total_pedidos_hoje: totalPedidosHoje,
                    pedidos_pendentes: statusCount.pendente || 0,
                    pedidos_confirmados: statusCount.confirmado || 0,
                    pedidos_em_preparo: statusCount.em_preparo || 0,
                    pedidos_saiu: statusCount.saiu || 0,
                    pedidos_entregues: statusCount.entregue || 0,
                    pedidos_cancelados: statusCount.cancelado || 0
                },
                grafico_vendas: vendasUltimos7Dias,
                top_produtos: topProdutos,
                ultimos_pedidos: ultimosPedidos
            });

        } catch (err) {
            logger.error(`Erro no dashboard: ${err.message}`);
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao carregar dashboard",
                erro: err.message
            });
        }

    }

};

module.exports = AdminController;