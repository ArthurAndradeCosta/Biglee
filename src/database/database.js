// ========================================
// DATABASE - SQLite
// Biglee Burguer
// ========================================

const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();


// Caminho do arquivo do banco
const dbPath = process.env.DB_PATH
    ? path.resolve(__dirname, "..", "..", process.env.DB_PATH.replace("./", ""))
    : path.resolve(__dirname, "biglee.db");


// Conexão
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");


// ========================================
// MIGRATIONS
// ========================================

const migrations = [

    // 001 - categorias e produtos
    `
    CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        icone TEXT
    );

    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco REAL NOT NULL,
        categoria TEXT NOT NULL,
        imagem TEXT,
        emoji TEXT DEFAULT '🍔',
        disponivel INTEGER DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `,

    // 002 - usuarios
    `
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin','gerente','cozinha')),
        ativo INTEGER DEFAULT 1,
        primeiro_login INTEGER DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultimo_login DATETIME
    );
    `,

    // 003 - pedidos e itens
    `
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL UNIQUE,
        cliente_nome TEXT NOT NULL,
        cliente_telefone TEXT,
        tipo TEXT NOT NULL CHECK(tipo IN ('entrega','retirada')),
        endereco_rua TEXT,
        endereco_numero TEXT,
        endereco_bairro TEXT,
        endereco_cidade TEXT,
        endereco_referencia TEXT,
        taxa_entrega REAL DEFAULT 0,
        forma_pagamento TEXT NOT NULL CHECK(forma_pagamento IN ('pix','cartao','dinheiro')),
        troco_para REAL,
        subtotal REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pendente'
            CHECK(status IN ('pendente','confirmado','em_preparo','saiu','entregue','cancelado')),
        observacao TEXT,
        pagamento_id INTEGER,
        pagamento_status TEXT DEFAULT 'pendente'
            CHECK(pagamento_status IN ('pendente','pago','rejeitado')),
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pagamento_id) REFERENCES pagamentos(id)
    );

    CREATE TABLE IF NOT EXISTS pedido_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        nome_snapshot TEXT NOT NULL,
        preco_snapshot REAL NOT NULL,
        quantidade INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES produtos(id)
    );
    `,

    // 004 - pagamentos
    `
    CREATE TABLE IF NOT EXISTS pagamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER,
        metodo TEXT NOT NULL CHECK(metodo IN ('pix','cartao')),
        provider_id TEXT,
        qr_code TEXT,
        qr_code_base64 TEXT,
        ticket_url TEXT,
        status TEXT NOT NULL DEFAULT 'pendente'
            CHECK(status IN ('pendente','aprovado','rejeitado','reembolsado')),
        valor REAL NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL
    );
    `,

    // 005 - configuracoes
    `
    CREATE TABLE IF NOT EXISTS configuracoes (
        chave TEXT PRIMARY KEY,
        valor TEXT,
        descricao TEXT
    );
    `

];


// Aplica migrations
migrations.forEach((sql, idx) => {
    db.exec(sql);
    console.log(`✅ Migration ${String(idx + 1).padStart(3, '0')} aplicada`);
});


// ========================================
// SEEDS
// ========================================

// Categorias (cardápio atual)
const categoriasSeed = [
    { slug: "tradicionais",    nome: "Hambúrgueres Tradicionais", icone: "🍔" },
    { slug: "artesanais",      nome: "Artesanais",               icone: "🍔" },
    { slug: "especiais",       nome: "Especiais",                icone: "🥩" },
    { slug: "acompanhamentos", nome: "Acompanhamentos",          icone: "🍟" },
    { slug: "acrescimos",      nome: "Acréscimos",               icone: "➕" }
];

const inserirCategoria = db.prepare(`
    INSERT OR IGNORE INTO categorias (slug, nome, icone)
    VALUES (?, ?, ?)
`);
categoriasSeed.forEach(cat => inserirCategoria.run(cat.slug, cat.nome, cat.icone));


// Produtos (cardápio atual - 34 itens)
const produtosSeed = [
    // TRADICIONAIS (1-16)
    { slug: "misto-quente",         nome: "Misto Quente",                     descricao: "Pão, presunto, queijo e manteiga.",                            preco: 12.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "misto-especial",       nome: "Misto Especial",                   descricao: "Pão, presunto, queijo, tomate e orégano.",                    preco: 15.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "hamburger-salada",     nome: "Hamburger Salada",                 descricao: "Pão, hambúrguer, alface, tomate e maionese.",                 preco: 15.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "x-egg",                nome: "X-Egg",                            descricao: "Pão, hambúrguer, queijo, ovo, alface e tomate.",              preco: 18.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "x-burguer-salada",     nome: "X-Burguer Salada",                 descricao: "Pão, hambúrguer, queijo, alface, tomate e maionese.",         preco: 18.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "x-burguer-especial",   nome: "X-Burguer Especial",               descricao: "Pão, hambúrguer, queijo, presunto, ovo, alface e tomate.",     preco: 20.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "vegetariano",          nome: "Vegetariano",                      descricao: "Pão, hambúrguer de grão-de-bico, queijo, alface e tomate.",   preco: 18.0, categoria: "tradicionais", emoji: "🥬", imagem: null },
    { slug: "havaneiro",            nome: "Havaneiro",                        descricao: "Pão, hambúrguer, queijo, presunto, ovo e abacaxi.",            preco: 20.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "hawai",                nome: "Havaí",                            descricao: "Pão, hambúrguer, queijo, presunto e abacaxi.",                preco: 20.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "x-bacon",              nome: "X-Bacon",                          descricao: "Pão, hambúrguer, queijo, bacon, alface e tomate.",             preco: 23.0, categoria: "tradicionais", emoji: "🥓", imagem: null },
    { slug: "kanguru",              nome: "Kanguru",                          descricao: "Pão, hambúrguer, queijo, presunto, ovo e bacon.",             preco: 24.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "x-egg-bacon",          nome: "X-Egg Bacon",                      descricao: "Pão, hambúrguer, queijo, ovo, bacon, alface e tomate.",        preco: 24.0, categoria: "tradicionais", emoji: "🥓", imagem: null },
    { slug: "lacador",              nome: "Laçador",                          descricao: "Pão, hambúrguer, queijo, bacon, ovo, alface e tomate.",        preco: 23.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "x-tudo",               nome: "X-Tudo",                           descricao: "Pão, hambúrguer, queijo, presunto, ovo, bacon, alface e tomate.", preco: 27.0, categoria: "tradicionais", emoji: "🍔", imagem: null },
    { slug: "x-frango-especial",    nome: "X-Frango Especial",                descricao: "Pão, filé de frango, queijo, presunto, alface e tomate.",      preco: 24.0, categoria: "tradicionais", emoji: "🍗", imagem: null },
    { slug: "x-frango-super",       nome: "X-Frango Super",                   descricao: "Pão, filé de frango, queijo, bacon, ovo, alface e tomate.",    preco: 26.0, categoria: "tradicionais", emoji: "🍗", imagem: null },

    // ARTESANAIS (17-23)
    { slug: "big-lee",              nome: "Big Lee",                          descricao: "Pão brioche, hambúrguer artesanal, queijo, bacon, alface e molho da casa.", preco: 36.0, categoria: "artesanais", emoji: "🍔", imagem: null },
    { slug: "big-smash",            nome: "Big Smash",                        descricao: "Pão brioche, hambúrguer smash, queijo cheddar e molho barbecue.", preco: 33.0, categoria: "artesanais", emoji: "🍔", imagem: null },
    { slug: "big-cheese",           nome: "Big Cheese",                       descricao: "Pão brioche, hambúrguer artesanal, queijo prato, cheddar e catupiry.", preco: 36.0, categoria: "artesanais", emoji: "🧀", imagem: null },
    { slug: "big-gourmet",          nome: "Big Gourmet",                      descricao: "Pão brioche, hambúrguer artesanal, queijo, cebola caramelizada e molho mostarda.", preco: 34.0, categoria: "artesanais", emoji: "🍔", imagem: null },
    { slug: "gourmet-fitness",      nome: "Gourmet Fitness",                  descricao: "Pão integral, hambúrguer de frango, queijo branco, alface e tomate.", preco: 28.0, categoria: "artesanais", emoji: "🥗", imagem: null },
    { slug: "mega-big",             nome: "Mega Big",                         descricao: "Pão brioche, dois hambúrgueres artesanais, queijo, bacon e molho da casa.", preco: 40.0, categoria: "artesanais", emoji: "🍔", imagem: null },
    { slug: "big-monster",          nome: "Big Monster",                      descricao: "Pão brioche, três hambúrgueres artesanais, queijo, bacon, ovo e molho da casa.", preco: 55.0, categoria: "artesanais", emoji: "🍔", imagem: null },

    // ESPECIAIS (24-28)
    { slug: "x-picanha",            nome: "X-Picanha",                        descricao: "Pão, hambúrguer de picanha, queijo, bacon, alface e tomate.",   preco: 35.0, categoria: "especiais", emoji: "🥩", imagem: null },
    { slug: "big-3",                nome: "Big 3",                            descricao: "Pão, três hambúrgueres, queijo, bacon e molho da casa.",       preco: 32.0, categoria: "especiais", emoji: "🍔", imagem: null },
    { slug: "big-cheddar",          nome: "Big Cheddar",                      descricao: "Pão, hambúrguer, cheddar cremoso, bacon e cebola caramelizada.", preco: 30.0, categoria: "especiais", emoji: "🧀", imagem: null },
    { slug: "duplo-cheddar",        nome: "Duplo Cheddar",                    descricao: "Pão, dois hambúrgueres, cheddar duplo, bacon e cebola caramelizada.", preco: 34.0, categoria: "especiais", emoji: "🧀", imagem: null },
    { slug: "desterreao",           nome: "Desterreão",                       descricao: "Pão, hambúrguer de picanha, cheddar, bacon, ovo, alface e tomate.", preco: 36.0, categoria: "especiais", emoji: "🥩", imagem: null },

    // ACOMPANHAMENTOS (29-30)
    { slug: "batata-palito",        nome: "Batata Palito",                    descricao: "Porção de batata palito crocante.",                            preco: 8.0,  categoria: "acompanhamentos", emoji: "🍟", imagem: null },
    { slug: "batata-bacon-cheddar", nome: "Batata Palito com Bacon e Cheddar", descricao: "Batata palito crocante coberta com bacon e cheddar.",           preco: 14.0, categoria: "acompanhamentos", emoji: "🥓", imagem: null },

    // ACRÉSCIMOS (31-34)
    { slug: "cebola-roxa",          nome: "Cebola Roxa",                      descricao: "Acréscimo de cebola roxa.",                                   preco: 2.0,  categoria: "acrescimos", emoji: "🧅", imagem: null },
    { slug: "acrescimos",           nome: "Acréscimos",                       descricao: "Acréscimo genérico (consultar disponibilidade).",               preco: 4.0,  categoria: "acrescimos", emoji: "➕", imagem: null },
    { slug: "hamburguer-artesanal", nome: "Hambúrguer Artesanal",             descricao: "Acréscimo de hambúrguer artesanal 120g.",                      preco: 10.0, categoria: "acrescimos", emoji: "🍔", imagem: null },
    { slug: "hamburguer-picanha",   nome: "Hambúrguer de Picanha",            descricao: "Acréscimo de hambúrguer de picanha 120g.",                     preco: 8.0,  categoria: "acrescimos", emoji: "🥩", imagem: null }
];

const inserirProduto = db.prepare(`
    INSERT OR IGNORE INTO produtos
        (slug, nome, descricao, preco, categoria, emoji, imagem)
    VALUES
        (@slug, @nome, @descricao, @preco, @categoria, @emoji, @imagem)
`);
produtosSeed.forEach(prod => inserirProduto.run(prod));


// Configurações padrão
const configsSeed = [
    { chave: "loja_aberta",          valor: "1",      descricao: "Loja aberta/fechada para pedidos" },
    { chave: "taxa_entrega",         valor: "7.00",   descricao: "Taxa de entrega em R$" },
    { chave: "pedido_minimo",        valor: "20.00",  descricao: "Pedido mínimo em R$" },
    { chave: "horario_funcionamento", valor: "18:00-23:30", descricao: "Horário de funcionamento" },
    { chave: "mensagem_whatsapp",    valor: "Seu pedido foi confirmado! Em breve estará pronto.", descricao: "Mensagem automática após confirmar" },
    { chave: "nome_loja",            valor: "Biglee Burguer", descricao: "Nome da loja" },
    { chave: "whatsapp_loja",        valor: "5531984817321", descricao: "WhatsApp da loja" }
];

const inserirConfig = db.prepare(`
    INSERT OR IGNORE INTO configuracoes (chave, valor, descricao)
    VALUES (@chave, @valor, @descricao)
`);
configsSeed.forEach(cfg => inserirConfig.run(cfg));


// Admin padrão
const adminExistente = db.prepare(`SELECT id FROM usuarios WHERE email = ?`).get("admin@bigleeburger.com");
if (!adminExistente) {
    const senhaHash = bcrypt.hashSync("admin123", 10);
    db.prepare(`
        INSERT INTO usuarios (nome, email, senha_hash, role, primeiro_login)
        VALUES (?, ?, ?, 'admin', 1)
    `).run("Administrador", "admin@bigleeburger.com", senhaHash);
    console.log("👤 Admin padrão criado: admin@bigleeburger.com / admin123");
}


// Mensagem de inicialização
console.log(`\n🍔 Banco SQLite conectado: ${dbPath}`);
console.log(`📦 ${categoriasSeed.length} categorias | ${produtosSeed.length} produtos | ${configsSeed.length} configurações\n`);


// ========================================
// EXPORT
// ========================================

module.exports = db;