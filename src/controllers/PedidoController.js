// ========================================
// CONTROLLER - PEDIDOS
// ========================================

const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");
const Config = require("../models/Config");
const logger = require("../utils/logger");
const SocketService = require("../services/SocketService");

const PedidoController = {

    // Cliente cria pedido
    criar(req, res) {

        try {
            const {
                itens,
                cliente,
                tipo,
                endereco,
                forma_pagamento,
                troco_para,
                observacao
            } = req.body;

            // ========================================
            // NORMALIZA FORMA DE PAGAMENTO
            // ========================================

            const formaPagamentoOriginal = String(forma_pagamento || "")
                .trim()
                .toLowerCase();

            const mapaFormasPagamento = {
                pix: "pix",
                "cartão": "cartao",
                cartao: "cartao",
                dinheiro: "dinheiro"
            };

            const formaPagamentoNormalizada =
                mapaFormasPagamento[formaPagamentoOriginal];

            if (!formaPagamentoNormalizada) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Forma de pagamento inválida"
                });
            }

            // ========================================
            // VALIDAÇÕES
            // ========================================

            if (!itens || !Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Pedido sem itens"
                });
            }

            if (!cliente || !cliente.nome) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nome do cliente é obrigatório"
                });
            }

            if (
                tipo === "entrega" &&
                (!endereco || !endereco.rua || !endereco.numero)
            ) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Endereço completo é obrigatório para entrega"
                });
            }

            // ========================================
            // VERIFICA LOJA ABERTA
            // ========================================

            const lojaAberta = Config.obter("loja_aberta");

            if (lojaAberta === "0") {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: "Loja fechada no momento. Tente novamente mais tarde."
                });
            }

            // ========================================
            // BUSCA PRODUTOS PELO ID NUMÉRICO
            // (cliente envia produto_id vindo da API)
            // ========================================

            const itensCompletos = [];
            let subtotal = 0;

            for (const item of itens) {

                const produto = Produto.buscarPorId(item.produto_id);

                if (!produto || !produto.disponivel) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: `Produto ${item.produto_id} não disponível`
                    });
                }

                const quantidade = Number(item.quantidade) || 1;

                if (quantidade <= 0) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: `Quantidade inválida para o produto ${item.produto_id}`
                    });
                }

                itensCompletos.push({
                    produto_id: produto.id,
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade
                });

                subtotal += produto.preco * quantidade;
            }

            // ========================================
            // TAXA DE ENTREGA
            // ========================================

            const taxaEntrega =
                tipo === "entrega"
                    ? Number(Config.obter("taxa_entrega") || 0)
                    : 0;

            const total = subtotal + taxaEntrega;

            // ========================================
            // GERA CÓDIGO DO PEDIDO
            // ========================================

            const codigo = Pedido.proximoCodigo();

            // ========================================
            // CRIA O PEDIDO
            // ========================================

            const pedido = Pedido.criar({
                codigo,

                cliente_nome: cliente.nome,
                cliente_telefone: cliente.telefone || null,

                tipo,

                endereco_rua: endereco?.rua || null,
                endereco_numero: endereco?.numero || null,
                endereco_bairro: endereco?.bairro || null,
                endereco_cidade: endereco?.cidade || null,
                endereco_referencia: endereco?.referencia || null,

                taxa_entrega: taxaEntrega,

                forma_pagamento: formaPagamentoNormalizada,

                troco_para: troco_para || null,

                subtotal,
                total,

                observacao: observacao || null,

                itens: itensCompletos
            });

            // ========================================
            // LOG DO PEDIDO
            // ========================================

            logger.pedido(
                `Novo pedido: ${codigo} | ${cliente.nome} | R$ ${total.toFixed(2)} | ${formaPagamentoNormalizada}`
            );

            // ========================================
            // AVISA O ADMIN VIA WEBSOCKET
            // ========================================

            SocketService.novoPedido(pedido);

            // ========================================
            // RESPOSTA
            // ========================================

            return res.status(201).json({
                sucesso: true,
                mensagem: "Pedido criado com sucesso",
                pedido
            });

        } catch (err) {

            logger.error(
                `Erro ao criar pedido: ${err.message}`
            );

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar pedido",
                erro: err.message
            });
        }

    },

    // ========================================
    // CONSULTAR PEDIDO POR CÓDIGO
    // ========================================

    consultarPorCodigo(req, res) {

        const { codigo } = req.params;

        const pedido = Pedido.buscarPorCodigo(codigo);

        if (!pedido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pedido não encontrado"
            });
        }

        delete pedido.pagamento_id;
        delete pedido.pagamento_status;

        return res.json({
            sucesso: true,
            pedido
        });

    },

    // ========================================
    // ADMIN - LISTAR PEDIDOS
    // ========================================

    listar(req, res) {

        const { status, data } = req.query;

        const pedidos = Pedido.listar({
            status,
            data
        });

        return res.json({
            sucesso: true,
            total: pedidos.length,
            pedidos
        });

    },

    // ========================================
    // ADMIN - BUSCAR PEDIDO
    // ========================================

    buscarPorId(req, res) {

        const { id } = req.params;

        const pedido = Pedido.buscarPorId(id);

        if (!pedido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pedido não encontrado"
            });
        }

        return res.json({
            sucesso: true,
            pedido
        });

    },

    // ========================================
    // ADMIN - ATUALIZAR STATUS
    // ========================================

    atualizarStatus(req, res) {

        const { id } = req.params;
        const { status } = req.body;

        const statusValidos = [
            "pendente",
            "confirmado",
            "em_preparo",
            "saiu",
            "entregue",
            "cancelado"
        ];

        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Status inválido"
            });
        }

        const pedido = Pedido.atualizarStatus(id, status);

        if (!pedido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pedido não encontrado"
            });
        }

        logger.pedido(
            `Pedido ${pedido.codigo} → ${status}`
        );

        SocketService.statusAtualizado(pedido);

        return res.json({
            sucesso: true,
            mensagem: "Status atualizado",
            pedido
        });

    }

};

module.exports = PedidoController;