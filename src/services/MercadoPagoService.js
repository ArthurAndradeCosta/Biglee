// ========================================
// SERVICE - MERCADO PAGO
// ========================================

const { MercadoPagoConfig, Payment, Preference } = require("mercadopago");

const accessToken = process.env.MP_ACCESS_TOKEN;

let client = null;
let paymentClient = null;
let preferenceClient = null;

if (accessToken) {
    client = new MercadoPagoConfig({ accessToken });
    paymentClient = new Payment(client);
    preferenceClient = new Preference(client);
}

const MercadoPagoService = {

    isConfigured() {
        return !!accessToken;
    },

    /**
     * Cria um pagamento PIX
     */
    async criarPagamentoPix({ valor, descricao, pedidoId, email }) {

        if (!this.isConfigured()) {
            throw new Error("Mercado Pago não configurado. Defina MP_ACCESS_TOKEN no .env");
        }

        const dados = {
            body: {
                transaction_amount: Number(valor),
                description: descricao || `Pedido #${pedidoId}`,
                payment_method_id: "pix",
                payer: {
                    email: email || "cliente@bigleeburger.com"
                },
                external_reference: String(pedidoId),
                notification_url: process.env.WEBHOOK_URL
            }
        };

        const result = await paymentClient.create(dados);

        return {
            provider_id: String(result.id),
            qr_code: result.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: null,
            status: result.status
        };

    },

    /**
     * Cria uma preferência para pagamento via Checkout Pro (Cartão/Pix/boleto)
     */
    async criarPreferencia({ itens, pedidoId, email }) {

        if (!this.isConfigured()) {
            throw new Error("Mercado Pago não configurado");
        }

        const baseUrl = process.env.PUBLIC_URL || "http://localhost:3000";

        const preference = {
            items: itens.map(item => ({
                title: item.nome,
                quantity: Number(item.quantidade),
                unit_price: Number(item.preco),
                currency_id: "BRL"
            })),
            payer: { email: email || "cliente@bigleeburger.com" },
            external_reference: String(pedidoId),
            back_urls: {
                success: `${baseUrl}/cliente/pedido-confirmado.html?codigo=${pedidoId}`,
                failure: `${baseUrl}/cliente/checkout.html?erro=1`,
                pending: `${baseUrl}/cliente/pedido-confirmado.html?codigo=${pedidoId}&pendente=1`
            },
            notification_url: process.env.WEBHOOK_URL,
            auto_return: "approved"
        };

        const result = await preferenceClient.create({ body: preference });

        return {
            provider_id: String(result.id),
            ticket_url: result.init_point,
            status: "pendente"
        };

    },

    /**
     * Consulta o status de um pagamento
     */
    async consultarPagamento(providerId) {

        if (!this.isConfigured()) {
            throw new Error("Mercado Pago não configurado");
        }

        const result = await paymentClient.get({ id: providerId });
        return result;
    }

};

module.exports = MercadoPagoService;