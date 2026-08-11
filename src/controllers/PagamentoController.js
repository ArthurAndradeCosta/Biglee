// ========================================
// CONTROLLER - PAGAMENTOS
// ========================================

const Pagamento = require("../models/Pagamento");
const Pedido = require("../models/Pedido");
const MercadoPagoService = require("../services/MercadoPagoService");
const SocketService = require("../services/SocketService");
const logger = require("../utils/logger");

const PagamentoController = {

    // Cria pagamento (Pix ou Checkout Pro)
    async criar(req, res) {

        try {
            const { pedido_id, metodo } = req.body;

            if (!pedido_id || !metodo) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "pedido_id e metodo são obrigatórios"
                });
            }

            if (!["pix", "cartao"].includes(metodo)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Método deve ser 'pix' ou 'cartao'"
                });
            }

            const pedido = Pedido.buscarPorId(pedido_id);

            if (!pedido) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Pedido não encontrado"
                });
            }

            // Verifica se MP está configurado
            if (!MercadoPagoService.isConfigured()) {
                // Modo simulado para desenvolvimento sem MP configurado
                logger.warn("MP não configurado - criando pagamento simulado");

                const pagamentoSimulado = Pagamento.criar({
                    pedido_id,
                    metodo,
                    provider_id: `SIMULADO-${Date.now()}`,
                    qr_code: metodo === "pix" ? "00020126580014BR.GOV.BCB.PIX0136simulado@bigleeburger.com5204000053039865802BR5913BIGLEE BURGUER6009SAO PAULO62070503***6304ABCD" : null,
                    qr_code_base64: null,
                    ticket_url: null,
                    valor: pedido.total
                });

                return res.json({
                    sucesso: true,
                    mensagem: "Pagamento simulado criado (Mercado Pago não configurado)",
                    pagamento: pagamentoSimulado,
                    simulado: true
                });
            }

            let pagamento;

            if (metodo === "pix") {
                const mpResult = await MercadoPagoService.criarPagamentoPix({
                    valor: pedido.total,
                    descricao: `Pedido ${pedido.codigo} - Biglee Burguer`,
                    pedidoId: pedido.id,
                    email: req.body.email || `cliente${pedido.id}@bigleeburger.com`
                });

                pagamento = Pagamento.criar({
                    pedido_id,
                    metodo: "pix",
                    ...mpResult,
                    valor: pedido.total
                });

            } else {
                // Cartão via Checkout Pro (Preference)
                const mpResult = await MercadoPagoService.criarPreferencia({
                    itens: pedido.itens,
                    pedidoId: pedido.id,
                    email: req.body.email || `cliente${pedido.id}@bigleeburger.com`
                });

                pagamento = Pagamento.criar({
                    pedido_id,
                    metodo: "cartao",
                    ...mpResult,
                    valor: pedido.total
                });
            }

            // Atualiza pedido com referência ao pagamento
            Pedido.atualizarPagamento(pedido_id, pagamento.id, "pendente");

            logger.pagamento(`Pagamento ${metodo.toUpperCase()} criado para pedido ${pedido.codigo}`);

            res.json({
                sucesso: true,
                pagamento
            });

        } catch (err) {
            logger.error(`Erro ao criar pagamento: ${err.message}`);
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar pagamento",
                erro: err.message
            });
        }

    },

    // Consulta um pagamento
    consultar(req, res) {

        const { id } = req.params;
        const pagamento = Pagamento.buscarPorId(id);

        if (!pagamento) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pagamento não encontrado"
            });
        }

        res.json({
            sucesso: true,
            pagamento
        });

    },

    // Webhook do Mercado Pago
    async webhook(req, res) {

        try {
            // Responde 200 imediatamente (MP espera resposta rápida)
            res.status(200).send("OK");

            // Mercado Pago envia notificação via query ou body
            // Tipo pode ser "payment" ou "test"
            const { type, data, resource } = req.query;

            if (type !== "payment") {
                return;
            }

            // data.id ou resource podem conter o ID do pagamento
            let paymentId;
            if (data && data.id) {
                paymentId = data.id;
            } else if (resource) {
                paymentId = resource.split("/").pop();
            }

            if (!paymentId) {
                return;
            }

            logger.pagamento(`Webhook recebido para pagamento ${paymentId}`);

            if (!MercadoPagoService.isConfigured()) {
                return;
            }

            // Consulta status no MP
            const mpPayment = await MercadoPagoService.consultarPagamento(paymentId);

            const statusMap = {
                "approved": "aprovado",
                "rejected": "rejeitado",
                "cancelled": "rejeitado",
                "refunded": "reembolsado",
                "pending": "pendente",
                "in_process": "pendente",
                "authorized": "pendente"
            };

            const novoStatus = statusMap[mpPayment.status] || "pendente";

            // Atualiza no banco
            Pagamento.atualizarPorProviderId(String(paymentId), novoStatus);

            // Se aprovado, atualiza pedido
            if (novoStatus === "aprovado") {
                const pagamento = Pagamento.buscarPorProviderId(String(paymentId));
                if (pagamento && pagamento.pedido_id) {
                    Pedido.atualizarPagamento(pagamento.pedido_id, pagamento.id, "pago");
                    const pedido = Pedido.buscarPorId(pagamento.pedido_id);
                    if (pedido) {
                        SocketService.pagamentoAtualizado(pedido);
                        logger.pagamento(`✅ Pagamento aprovado - Pedido ${pedido.codigo}`);
                    }
                }
            } else if (novoStatus === "rejeitado") {
                const pagamento = Pagamento.buscarPorProviderId(String(paymentId));
                if (pagamento && pagamento.pedido_id) {
                    Pedido.atualizarPagamento(pagamento.pedido_id, pagamento.id, "rejeitado");
                }
            }

        } catch (err) {
            logger.error(`Erro no webhook: ${err.message}`);
        }

    },

    // Simular aprovação de pagamento (apenas para testes sem MP)
    simularAprovacao(req, res) {

        const { id } = req.params;
        const pagamento = Pagamento.buscarPorId(id);

        if (!pagamento) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pagamento não encontrado"
            });
        }

        Pagamento.atualizarStatus(id, "aprovado");
        Pedido.atualizarPagamento(pagamento.pedido_id, id, "pago");

        const pedido = Pedido.buscarPorId(pagamento.pedido_id);
        if (pedido) {
            SocketService.pagamentoAtualizado(pedido);
        }

        logger.pagamento(`Pagamento ${id} simulado como aprovado`);

        res.json({
            sucesso: true,
            mensagem: "Pagamento aprovado (simulação)",
            pagamento: Pagamento.buscarPorId(id)
        });

    }

};

module.exports = PagamentoController;