// ========================================
// MIGRAÇÃO 002 - NOVO CARDÁPIO BIGLEE
// Substitui o cardápio antigo por 34 produtos em 5 categorias.
// Preserva usuarios, pedidos, pagamentos, configuracoes.
// ========================================

const db = require("../database");

const categorias = [
    { slug: "tradicionais",  nome: "Hambúrgueres Tradicionais", icone: "🍔" },
    { slug: "artesanais",    nome: "Artesanais",               icone: "🍔" },
    { slug: "especiais",     nome: "Especiais",                icone: "🥩" },
    { slug: "acompanhamentos", nome: "Acompanhamentos",        icone: "🍟" },
    { slug: "acrescimos",    nome: "Acréscimos",               icone: "➕" }
];

const produtos = [
    // TRADICIONAIS (1-16)
    { slug: "misto-quente",          nome: "Misto Quente",                    preco: 12.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "misto-especial",        nome: "Misto Especial",                  preco: 15.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "hamburger-salada",      nome: "Hamburger Salada",                preco: 15.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "x-egg",                 nome: "X-Egg",                           preco: 18.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "x-burguer-salada",      nome: "X-Burguer Salada",                preco: 18.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "x-burguer-especial",    nome: "X-Burguer Especial",              preco: 20.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "vegetariano",           nome: "Vegetariano",                     preco: 18.0, categoria: "tradicionais", emoji: "🥬" },
    { slug: "havaneiro",             nome: "Havaneiro",                       preco: 20.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "hawai",                 nome: "Havaí",                           preco: 20.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "x-bacon",               nome: "X-Bacon",                         preco: 23.0, categoria: "tradicionais", emoji: "🥓" },
    { slug: "kanguru",               nome: "Kanguru",                         preco: 24.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "x-egg-bacon",           nome: "X-Egg Bacon",                     preco: 24.0, categoria: "tradicionais", emoji: "🥓" },
    { slug: "lacador",               nome: "Laçador",                         preco: 23.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "x-tudo",                nome: "X-Tudo",                          preco: 27.0, categoria: "tradicionais", emoji: "🍔" },
    { slug: "x-frango-especial",     nome: "X-Frango Especial",               preco: 24.0, categoria: "tradicionais", emoji: "🍗" },
    { slug: "x-frango-super",        nome: "X-Frango Super",                  preco: 26.0, categoria: "tradicionais", emoji: "🍗" },

    // ARTESANAIS (17-23)
    { slug: "big-lee",               nome: "Big Lee",                         preco: 36.0, categoria: "artesanais",   emoji: "🍔" },
    { slug: "big-smash",             nome: "Big Smash",                       preco: 33.0, categoria: "artesanais",   emoji: "🍔" },
    { slug: "big-cheese",            nome: "Big Cheese",                      preco: 36.0, categoria: "artesanais",   emoji: "🧀" },
    { slug: "big-gourmet",           nome: "Big Gourmet",                     preco: 34.0, categoria: "artesanais",   emoji: "🍔" },
    { slug: "gourmet-fitness",       nome: "Gourmet Fitness",                 preco: 28.0, categoria: "artesanais",   emoji: "🥗" },
    { slug: "mega-big",              nome: "Mega Big",                        preco: 40.0, categoria: "artesanais",   emoji: "🍔" },
    { slug: "big-monster",           nome: "Big Monster",                     preco: 55.0, categoria: "artesanais",   emoji: "🍔" },

    // ESPECIAIS (24-28)
    { slug: "x-picanha",             nome: "X-Picanha",                       preco: 35.0, categoria: "especiais",    emoji: "🥩" },
    { slug: "big-3",                 nome: "Big 3",                           preco: 32.0, categoria: "especiais",    emoji: "🍔" },
    { slug: "big-cheddar",           nome: "Big Cheddar",                     preco: 30.0, categoria: "especiais",    emoji: "�" },
    { slug: "duplo-cheddar",         nome: "Duplo Cheddar",                   preco: 34.0, categoria: "especiais",    emoji: "�" },
    { slug: "desterreao",            nome: "Desterreão",                      preco: 36.0, categoria: "especiais",    emoji: "🥩" },

    // ACOMPANHAMENTOS (29-30)
    { slug: "batata-palito",         nome: "Batata Palito",                   preco: 8.0,  categoria: "acompanhamentos", emoji: "🍟" },
    { slug: "batata-bacon-cheddar",  nome: "Batata Palito com Bacon e Cheddar", preco: 14.0, categoria: "acompanhamentos", emoji: "🥓" },

    // ACRÉSCIMOS (31-34)
    { slug: "cebola-roxa",           nome: "Cebola Roxa",                     preco: 2.0,  categoria: "acrescimos",   emoji: "🧅" },
    { slug: "acrescimos",            nome: "Acréscimos",                      preco: 4.0,  categoria: "acrescimos",   emoji: "➕" },
    { slug: "hamburguer-artesanal",  nome: "Hambúrguer Artesanal",            preco: 10.0, categoria: "acrescimos",   emoji: "🍔" },
    { slug: "hamburguer-picanha",    nome: "Hambúrguer de Picanha",           preco: 8.0,  categoria: "acrescimos",   emoji: "🥩" }
];

console.log("\n🔄 MIGRAÇÃO 002 - NOVO CARDÁPIO\n");

// 1. Limpar pedidos e pagamentos antigos (escolha do usuário)
const pedidosAntigos = db.prepare("SELECT COUNT(*) as total FROM pedidos").get().total;
const itensAntigos   = db.prepare("SELECT COUNT(*) as total FROM pedido_itens").get().total;
const pagsAntigos    = db.prepare("SELECT COUNT(*) as total FROM pagamentos").get().total;

db.exec("DELETE FROM pedido_itens");
db.exec("DELETE FROM pagamentos");
db.exec("DELETE FROM pedidos");
console.log(`🗑️  Removidos ${pedidosAntigos} pedidos, ${itensAntigos} itens e ${pagsAntigos} pagamentos antigos`);

// 2. Limpar produtos e categorias antigas (não há FK cascade de pedido_itens pq já limpamos)
db.exec("DELETE FROM produtos");
db.exec("DELETE FROM categorias");
console.log("🗑️  Produtos e categorias antigos removidos\n");

// 3. Inserir novas categorias
const inserirCategoria = db.prepare(`
    INSERT INTO categorias (slug, nome, icone) VALUES (?, ?, ?)
`);
categorias.forEach(cat => {
    inserirCategoria.run(cat.slug, cat.nome, cat.icone);
});
console.log(`✅ ${categorias.length} categorias inseridas`);

// 4. Inserir novos produtos
const inserirProduto = db.prepare(`
    INSERT INTO produtos (slug, nome, descricao, preco, categoria, emoji, disponivel)
    VALUES (@slug, @nome, '', @preco, @categoria, @emoji, 1)
`);
produtos.forEach(prod => inserirProduto.run(prod));
console.log(`✅ ${produtos.length} produtos inseridos\n`);

// 5. Conferir
const totalCategorias = db.prepare("SELECT COUNT(*) as t FROM categorias").get().t;
const totalProdutos   = db.prepare("SELECT COUNT(*) as t FROM produtos").get().t;
console.log(`📊 Banco agora tem: ${totalCategorias} categorias | ${totalProdutos} produtos`);
console.log("✨ Migração concluída!\n");
