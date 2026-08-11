// ========================================
// BIGLEE BURGER - APP DO CLIENTE
// Versão dinâmica: cardápio carrega da API.
// Carrinho: produto_id numérico (banco) + slug + nome + preco
// ========================================

const CHAVE_CARRINHO = "biglee_carrinho";

let carrinho = carregarCarrinho();
let produtosCache = [];   // cache local dos produtos vindos da API


// ========================================
// CARRINHO (localStorage)
// ========================================

function carregarCarrinho() {
    try {
        const salvo = localStorage.getItem(CHAVE_CARRINHO);
        return salvo ? JSON.parse(salvo) : [];
    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);
        return [];
    }
}

function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escaparHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function quantidadeCarrinho() {
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
}

function totalCarrinho() {
    return carrinho.reduce(
        (total, item) => total + item.preco * item.quantidade,
        0
    );
}

function atualizarContador() {
    const contador = document.getElementById("contadorCarrinho");
    if (contador) contador.textContent = quantidadeCarrinho();
}


// ========================================
// CARREGAR CARDÁPIO DA API
// ========================================

async function carregarCardapio() {
    try {
        const [resCats, resProds] = await Promise.all([
            fetch("/api/categorias"),
            fetch("/api/produtos")
        ]);
        const catsData = await resCats.json();
        const prodsData = await resProds.json();

        if (!catsData.sucesso || !prodsData.sucesso) {
            throw new Error("Falha ao buscar cardápio");
        }

        const categorias = catsData.categorias;
        const produtos = prodsData.produtos;
        produtosCache = produtos;

        renderizarCategorias(categorias);
        renderizarProdutos(categorias, produtos);

        // Esconde loading, mostra cardápio
        document.getElementById("carregando").style.display = "none";
        document.getElementById("cardapio").style.display = "";

        configurarCategorias();
    } catch (erro) {
        console.error(erro);
        const loading = document.getElementById("carregando");
        if (loading) {
            loading.innerHTML = `
                <p style="color:#c00">⚠️ Não foi possível carregar o cardápio.</p>
                <p>Tente recarregar a página em instantes.</p>
            `;
        }
    }
}

function renderizarCategorias(categorias) {
    const nav = document.getElementById("categorias");
    if (!nav) return;
    const botoes = [{ slug: "todos", nome: "Todos" }, ...categorias]
        .map(cat => `
            <button class="categoria${cat.slug === "todos" ? " ativa" : ""}"
                    data-categoria="${escaparHtml(cat.slug)}">
                ${escaparHtml(cat.nome)}
            </button>
        `).join("");
    nav.innerHTML = botoes;
}

function renderizarProdutos(categorias, produtos) {
    const cardapio = document.getElementById("cardapio");
    if (!cardapio) return;

    const subtitulos = {
        tradicionais:    { small: "PARA TODOS OS DIAS" },
        artesanais:      { small: "ARTESANAIS" },
        especiais:       { small: "ESPECIAIS DA CASA" },
        acompanhamentos: { small: "PARA ACOMPANHAR" },
        acrescimos:      { small: "ADICIONAIS" }
    };

    const blocos = categorias.map(cat => {
        const itens = produtos.filter(p => p.categoria === cat.slug && p.disponivel);
        if (itens.length === 0) return "";
        const sub = subtitulos[cat.slug]?.small || "";
        return `
            <div class="categoria-bloco" data-categoria-bloco="${escaparHtml(cat.slug)}">
                <div class="categoria-titulo">
                    <span>${escaparHtml(cat.icone || "🍔")}</span>
                    <div>
                        <small>${escaparHtml(sub)}</small>
                        <h2>${escaparHtml(cat.nome)}</h2>
                    </div>
                </div>
                <div class="produtos-grid">
                    ${itens.map(p => renderizarProduto(p)).join("")}
                </div>
            </div>
        `;
    }).join("");

    cardapio.innerHTML = blocos;
}

function renderizarProduto(p) {
    return `
        <article class="produto"
                 data-categoria="${escaparHtml(p.categoria)}"
                 data-id="${p.id}"
                 data-nome="${escaparHtml(p.nome)}"
                 data-preco="${p.preco}">
            <div class="produto-foto">
                <span>${escaparHtml(p.emoji || "🍔")}</span>
            </div>
            <div class="produto-conteudo">
                <h3>${escaparHtml(p.nome)}</h3>
                <p>${escaparHtml(p.descricao || "")}</p>
                <div class="produto-footer">
                    <strong>${formatarPreco(p.preco)}</strong>
                    <button class="adicionar" data-produto="${p.id}">
                        + ADICIONAR
                    </button>
                </div>
            </div>
        </article>
    `;
}


// ========================================
// FILTRO POR CATEGORIA (DOM)
// ========================================

function configurarCategorias() {
    const botoes = document.querySelectorAll("#categorias .categoria");
    const blocos = document.querySelectorAll(".categoria-bloco");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            const categoria = botao.dataset.categoria;
            botoes.forEach(b => b.classList.remove("ativa"));
            botao.classList.add("ativa");

            blocos.forEach(bloco => {
                if (categoria === "todos") {
                    bloco.style.display = "";
                } else {
                    bloco.style.display =
                        bloco.dataset.categoriaBloco === categoria ? "" : "none";
                }
            });
        });
    });
}


// ========================================
// CARRINHO - OPERAÇÕES
// ========================================

function adicionarProduto(id) {
    // id agora é o produto_id numérico vindo da API
    const idNum = Number(id);
    const produto = produtosCache.find(p => p.id === idNum);
    if (!produto) {
        console.error("Produto não encontrado:", id);
        return;
    }

    const existente = carrinho.find(item => item.id === idNum);
    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }
    salvarCarrinho();
    atualizarCarrinho();
    atualizarContador();
    abrirCarrinhoElemento();
}

function alterarQuantidade(id, delta) {
    const idNum = Number(id);
    const item = carrinho.find(produto => produto.id === idNum);
    if (!item) return;
    item.quantidade += delta;
    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(produto => produto.id !== idNum);
    }
    salvarCarrinho();
    atualizarCarrinho();
    atualizarContador();
}

function removerProduto(id) {
    const idNum = Number(id);
    carrinho = carrinho.filter(item => item.id !== idNum);
    salvarCarrinho();
    atualizarCarrinho();
    atualizarContador();
}

function atualizarCarrinho() {
    const container = document.getElementById("carrinhoProdutos");
    const total = document.getElementById("totalCarrinho");
    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="carrinho-vazio">
                <span>🛒</span>
                <h3>Seu carrinho está vazio</h3>
                <p>Adicione alguns produtos deliciosos.</p>
            </div>
        `;
    } else {
        container.innerHTML = carrinho.map(item => `
            <article class="item-carrinho">
                <div class="item-carrinho-info">
                    <h3>${escaparHtml(item.nome)}</h3>
                    <strong>${formatarPreco(item.preco)}</strong>
                </div>
                <div class="item-carrinho-acoes">
                    <button type="button" class="quantidade-btn" data-acao="diminuir" data-id="${item.id}">−</button>
                    <span>${item.quantidade}</span>
                    <button type="button" class="quantidade-btn" data-acao="aumentar" data-id="${item.id}">+</button>
                    <button type="button" class="remover-item" data-acao="remover" data-id="${item.id}" aria-label="Remover ${escaparHtml(item.nome)}">×</button>
                </div>
            </article>
        `).join("");
    }
    if (total) total.textContent = formatarPreco(totalCarrinho());
}

function abrirCarrinhoElemento() {
    const c = document.getElementById("carrinho");
    const o = document.getElementById("overlay");
    if (c) c.classList.add("aberto");
    if (o) o.classList.add("aberto");
    document.body.classList.add("carrinho-aberto");
}

function fecharCarrinhoElemento() {
    const c = document.getElementById("carrinho");
    const o = document.getElementById("overlay");
    if (c) c.classList.remove("aberto");
    if (o) o.classList.remove("aberto");
    document.body.classList.remove("carrinho-aberto");
}


// ========================================
// EVENTOS
// ========================================

function configurarEventosCarrinho() {
    document.getElementById("abrirCarrinho")?.addEventListener("click", abrirCarrinhoElemento);
    document.getElementById("fecharCarrinho")?.addEventListener("click", fecharCarrinhoElemento);
    document.getElementById("overlay")?.addEventListener("click", fecharCarrinhoElemento);

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") fecharCarrinhoElemento();
    });

    // Delegação: ouve cliques em .adicionar a qualquer momento
    // (funciona mesmo com produtos renderizados dinamicamente)
    document.addEventListener("click", evento => {
        const botao = evento.target.closest(".adicionar");
        if (!botao) return;
        evento.preventDefault();
        evento.stopPropagation();
        adicionarProduto(botao.dataset.produto);
    });

    document.getElementById("carrinhoProdutos")?.addEventListener("click", evento => {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) return;
        const id = botao.dataset.id;
        const acao = botao.dataset.acao;
        if (acao === "aumentar") alterarQuantidade(id, 1);
        if (acao === "diminuir") alterarQuantidade(id, -1);
        if (acao === "remover") removerProduto(id);
    });

    document.getElementById("finalizarPedido")?.addEventListener("click", () => {
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio. Adicione um produto primeiro.");
            return;
        }
        window.location.href = "checkout.html";
    });
}


// ========================================
// CHECKOUT
// ========================================

function renderizarResumoCheckout() {
    const container = document.getElementById("resumoProdutos");
    const total = document.getElementById("resumoTotal");
    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="carrinho-vazio">
                <span>🛒</span>
                <h3>Seu carrinho está vazio</h3>
                <p>Volte ao cardápio para escolher seus produtos.</p>
            </div>
        `;
        if (total) total.textContent = formatarPreco(0);
        return;
    }

    container.innerHTML = carrinho.map(item => `
        <div class="resumo-item">
            <div>
                <strong>${item.quantidade}x ${escaparHtml(item.nome)}</strong>
                <small>${formatarPreco(item.preco)} cada</small>
            </div>
            <strong>${formatarPreco(item.preco * item.quantidade)}</strong>
        </div>
    `).join("");

    if (total) total.textContent = formatarPreco(totalCarrinho());
}

function configurarCheckout() {
    if (!document.getElementById("enviarPedido")) return;

    const radiosTipo = document.querySelectorAll('input[name="tipoPedido"]');
    const enderecoContainer = document.getElementById("enderecoContainer");
    const radiosPagamento = document.querySelectorAll('input[name="pagamento"]');
    const trocoContainer = document.getElementById("trocoContainer");

    function atualizarTipoPedido() {
        const tipo = document.querySelector('input[name="tipoPedido"]:checked')?.value;
        if (enderecoContainer) enderecoContainer.style.display = tipo === "entrega" ? "block" : "none";
    }
    function atualizarPagamento() {
        const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value;
        if (trocoContainer) trocoContainer.style.display = pagamento === "dinheiro" ? "block" : "none";
    }

    radiosTipo.forEach(r => r.addEventListener("change", atualizarTipoPedido));
    radiosPagamento.forEach(r => r.addEventListener("change", atualizarPagamento));
    atualizarTipoPedido();
    atualizarPagamento();

    // Máscara de telefone (XX) XXXXX-XXXX
    const tel = document.getElementById("telefone");
    if (tel) {
        tel.addEventListener("input", () => {
            let v = tel.value.replace(/\D/g, "").slice(0, 11);
            if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
            if (v.length > 10) v = v.replace(/(\(\d{2}\)\s\d{5})(\d)/, "$1-$2");
            else if (v.length > 9) v = v.replace(/(\(\d{2}\)\s\d{4})(\d)/, "$1-$2");
            tel.value = v;
        });
    }

    // Máscara de troco (R$)
    const troco = document.getElementById("troco");
    if (troco) {
        troco.addEventListener("input", () => {
            let v = troco.value.replace(/\D/g, "");
            if (v) v = (Number(v) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            troco.value = v;
        });
    }

    document.getElementById("enviarPedido").addEventListener("click", enviarPedidoParaApi);
}

async function enviarPedidoParaApi() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const nome = document.getElementById("nome")?.value.trim();
    const telefone = document.getElementById("telefone")?.value.trim();
    const tipo = document.querySelector('input[name="tipoPedido"]:checked')?.value;
    const formaPagamento = document.querySelector('input[name="pagamento"]:checked')?.value;
    const rua = document.getElementById("enderecoRua")?.value.trim() || "";
    const numero = document.getElementById("enderecoNumero")?.value.trim() || "";
    const bairro = document.getElementById("enderecoBairro")?.value.trim() || "";
    const referencia = document.getElementById("referencia")?.value.trim() || "";
    const troco = document.getElementById("troco")?.value;
    const observacao = document.getElementById("observacao")?.value.trim() || "";
    if (!nome) { alert("Informe seu nome."); document.getElementById("nome")?.focus(); return; }
    if (!formaPagamento) { alert("Escolha a forma de pagamento."); return; }

    if (tipo === "entrega") {
        if (!rua) {
            alert("Informe a rua para entrega.");
            document.getElementById("enderecoRua")?.focus();
            return;
        }
        if (!numero) {
            alert("Informe o número para entrega.");
            document.getElementById("enderecoNumero")?.focus();
            return;
        }
    }

    const botao = document.getElementById("enviarPedido");
    const textoOriginal = botao.innerHTML;
    botao.disabled = true;
    botao.innerHTML = "ENVIANDO...";

    try {
        const resposta = await fetch("/api/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                itens: carrinho.map(item => ({
                    produto_id: item.id,         // ID numérico do banco
                    quantidade: item.quantidade
                })),
                cliente: { nome, telefone },
                tipo,
                endereco: tipo === "entrega" ? {
                    rua,
                    numero,
                    bairro,
                    cidade: "Desterro de Entre Rios",
                    referencia
                } : {},
                forma_pagamento: formaPagamento,
                troco_para: formaPagamento === "dinheiro" && troco
                    ? Number(troco.replace(/\D/g, "")) / 100
                    : null,
                observacao
            })
        });

        const dados = await resposta.json();
        if (!resposta.ok || !dados.sucesso) {
            throw new Error(dados.mensagem || "Não foi possível enviar o pedido.");
        }

        localStorage.removeItem(CHAVE_CARRINHO);
        carrinho = [];

        alert(`Pedido ${dados.pedido.codigo} enviado com sucesso!`);
        window.location.href = `cardapio.html?pedido=${encodeURIComponent(dados.pedido.codigo)}`;
    } catch (erro) {
        console.error("Erro ao enviar pedido:", erro);
        alert(`Não foi possível enviar o pedido. ${erro.message}`);
    } finally {
        botao.disabled = false;
        botao.innerHTML = textoOriginal;
    }
}


// ========================================
// INICIALIZAÇÃO
// ========================================

async function iniciar() {
    atualizarContador();
    atualizarCarrinho();
    renderizarResumoCheckout();
    configurarEventosCarrinho();
    configurarCheckout();
    await carregarCardapio();
}

document.addEventListener("DOMContentLoaded", iniciar);
