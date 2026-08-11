// ========================================
// MODEL - CONFIGURAÇÃO
// ========================================

const db = require("../database/database");

const Config = {

    obter(chave) {
        const row = db.prepare(`SELECT valor FROM configuracoes WHERE chave = ?`).get(chave);
        return row ? row.valor : null;
    },

    obterTodas() {
        const rows = db.prepare(`SELECT * FROM configuracoes ORDER BY chave`).all();
        const config = {};
        rows.forEach(row => { config[row.chave] = row.valor; });
        return config;
    },

    obterPublicas() {
        // Configurações visíveis para o cliente
        const chaves = [
            "loja_aberta",
            "taxa_entrega",
            "pedido_minimo",
            "horario_funcionamento",
            "nome_loja",
            "whatsapp_loja"
        ];
        const config = {};
        chaves.forEach(c => config[c] = this.obter(c));
        return config;
    },

    definir(chave, valor) {
        db.prepare(`
            INSERT OR REPLACE INTO configuracoes (chave, valor)
            VALUES (?, ?)
        `).run(chave, valor);
        return this.obter(chave);
    },

    atualizarMultiplas(configs) {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO configuracoes (chave, valor)
            VALUES (?, ?)
        `);
        Object.entries(configs).forEach(([chave, valor]) => {
            stmt.run(chave, String(valor));
        });
        return this.obterTodas();
    }

};

module.exports = Config;