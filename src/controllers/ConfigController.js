// ========================================
// CONTROLLER - CONFIGURAÇÕES
// ========================================

const Config = require("../models/Config");
const logger = require("../utils/logger");

const ConfigController = {

    publicas(req, res) {
        res.json({
            sucesso: true,
            configuracoes: Config.obterPublicas()
        });
    },

    listar(req, res) {
        res.json({
            sucesso: true,
            configuracoes: Config.obterTodas()
        });
    },

    atualizar(req, res) {

        try {
            const configs = req.body;

            if (!configs || typeof configs !== "object") {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Configurações inválidas"
                });
            }

            const atualizadas = Config.atualizarMultiplas(configs);

            logger.success("Configurações atualizadas");

            res.json({
                sucesso: true,
                mensagem: "Configurações atualizadas",
                configuracoes: atualizadas
            });

        } catch (err) {
            logger.error(`Erro ao atualizar configurações: ${err.message}`);
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar configurações",
                erro: err.message
            });
        }

    }

};

module.exports = ConfigController;