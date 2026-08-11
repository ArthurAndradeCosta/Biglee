// ========================================
// UTILS - FORMATTERS
// ========================================

const formatters = {

    preco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    numero(valor, casas = 2) {
        return Number(valor || 0).toFixed(casas);
    },

    data(dataStr) {
        if (!dataStr) return "";
        const d = new Date(dataStr);
        return d.toLocaleString("pt-BR");
    },

    dataCurta(dataStr) {
        if (!dataStr) return "";
        const d = new Date(dataStr);
        return d.toLocaleDateString("pt-BR");
    },

    hora(dataStr) {
        if (!dataStr) return "";
        const d = new Date(dataStr);
        return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    },

    statusLabel(status) {
        const labels = {
            pendente: "Pendente",
            confirmado: "Confirmado",
            em_preparo: "Em Preparo",
            saiu: "Saiu para entrega",
            entregue: "Entregue",
            cancelado: "Cancelado"
        };
        return labels[status] || status;
    },

    pagamentoLabel(metodo) {
        const labels = {
            pix: "PIX",
            cartao: "Cartão",
            dinheiro: "Dinheiro"
        };
        return labels[metodo] || metodo;
    }

};

module.exports = formatters;