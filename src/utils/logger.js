// ========================================
// UTILS - LOGGER
// ========================================

const cores = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m"
};

function timestamp() {
    return new Date().toLocaleTimeString("pt-BR");
}

const logger = {
    info: (msg) => console.log(`${cores.gray}[${timestamp()}]${cores.reset} ${cores.blue}ℹ${cores.reset}  ${msg}`),
    success: (msg) => console.log(`${cores.gray}[${timestamp()}]${cores.reset} ${cores.green}✓${cores.reset}  ${msg}`),
    warn: (msg) => console.log(`${cores.gray}[${timestamp()}]${cores.reset} ${cores.yellow}⚠${cores.reset}  ${msg}`),
    error: (msg) => console.log(`${cores.gray}[${timestamp()}]${cores.reset} ${cores.red}✗${cores.reset}  ${msg}`),
    pedido: (msg) => console.log(`${cores.gray}[${timestamp()}]${cores.reset} ${cores.magenta}🍔${cores.reset} ${msg}`),
    pagamento: (msg) => console.log(`${cores.gray}[${timestamp()}]${cores.reset} ${cores.green}💳${cores.reset} ${msg}`),
    socket: (msg) => console.log(`${cores.gray}[${timestamp()}]${cores.reset} ${cores.cyan}🔌${cores.reset} ${msg}`)
};

module.exports = logger;