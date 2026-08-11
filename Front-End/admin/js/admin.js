// ========================================
// BIGLEE BURGUER - ADMIN
// ========================================

const API_URL = "/api";

// ========================================
// AUTH
// ========================================

const auth = {
    token: localStorage.getItem("token"),
    usuario: JSON.parse(localStorage.getItem("usuario") || "null"),

    headers() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
        };
    },

    requireAuth() {
        if (!this.token || !this.usuario) {
            window.location.href = "login.html";
            return false;
        }
        return true;
    },

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "login.html";
    }
};


// ========================================
// TOAST
// ========================================

function toast(mensagem, tipo = "info", duracao = 3000) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const el = document.createElement("div");
    el.className = `adm-toast ${tipo}`;
    el.textContent = mensagem;
    container.appendChild(el);

    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateX(120%)";
        el.style.transition = "all 0.25s ease";
        setTimeout(() => el.remove(), 250);
    }, duracao);
}


// ========================================
// MODAL
// ========================================

const modal = {
    abrir(html) {
        const m = document.getElementById("modal");
        document.getElementById("modalContent").innerHTML = html;
        m.classList.add("aberto");
    },

    fechar() {
        document.getElementById("modal").classList.remove("aberto");
    }
};

document.getElementById("modalOverlay")?.addEventListener("click", () => modal.fechar());
document.addEventListener("keydown", e => {
    if (e.key === "Escape") modal.fechar();
});


// ========================================
// HELPERS
// ========================================

const fmt = {
    preco(v) {
        return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },
    data(d) {
        if (!d) return "-";
        return new Date(d).toLocaleString("pt-BR");
    },
    numero(v) {
        return new Intl.NumberFormat("pt-BR").format(v || 0);
    }
};

function escapar(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ========================================
// NAVEGAÇÃO
// ========================================

async function loadPage(page) {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="adm-loading">
            <div class="adm-spinner"></div>
            <p>Carregando...</p>
        </div>
    `;

    // atualiza sidebar
    document.querySelectorAll(".adm-nav-link").forEach(l => l.classList.remove("active"));
    document.querySelector(`.adm-nav-link[data-page="${page}"]`)?.classList.add("active");

    // fecha sidebar mobile
    document.getElementById("sidebar")?.classList.remove("aberto");
    document.getElementById("sidebarOverlay")?.classList.remove("aberto");

    try {
        const renderers = {
            dashboard: renderDashboard,
            pedidos: renderPedidos,
            produtos: renderProdutos,
            categorias: renderCategorias,
            usuarios: renderUsuarios,
            configuracoes: renderConfiguracoes
        };
        await renderers[page](content);
    } catch (err) {
        content.innerHTML = `
            <div class="adm-empty">
                <div class="adm-empty-icon">⚠️</div>
                <h3>Erro ao carregar</h3>
                <p>${escapar(err.message)}</p>
            </div>
        `;
    }
}


// ========================================
// DASHBOARD
// ========================================

async function renderDashboard(content) {
    const r = await fetch(`${API_URL}/admin/dashboard`, { headers: auth.headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.mensagem || "Erro");

    const m = data.metricas;

    content.innerHTML = `
        <h1 class="adm-title">📊 Dashboard</h1>

        <div class="adm-metrics">
            <div class="adm-metric success">
                <div class="adm-metric-label">Faturamento Hoje</div>
                <div class="adm-metric-value">${fmt.preco(m.faturamento_hoje)}</div>
            </div>
            <div class="adm-metric info">
                <div class="adm-metric-label">Pedidos Hoje</div>
                <div class="adm-metric-value">${fmt.numero(m.total_pedidos_hoje)}</div>
            </div>
            <div class="adm-metric warning">
                <div class="adm-metric-label">Pendentes</div>
                <div class="adm-metric-value">${fmt.numero(m.pedidos_pendentes)}</div>
            </div>
            <div class="adm-metric info">
                <div class="adm-metric-label">Confirmados</div>
                <div class="adm-metric-value">${fmt.numero(m.pedidos_confirmados)}</div>
            </div>
            <div class="adm-metric info">
                <div class="adm-metric-label">Em Preparo</div>
                <div class="adm-metric-value">${fmt.numero(m.pedidos_em_preparo)}</div>
            </div>
            <div class="adm-metric success">
                <div class="adm-metric-label">Saiu</div>
                <div class="adm-metric-value">${fmt.numero(m.pedidos_saiu)}</div>
            </div>
            <div class="adm-metric success">
                <div class="adm-metric-label">Entregues</div>
                <div class="adm-metric-value">${fmt.numero(m.pedidos_entregues)}</div>
            </div>
            <div class="adm-metric danger">
                <div class="adm-metric-label">Cancelados</div>
                <div class="adm-metric-value">${fmt.numero(m.pedidos_cancelados)}</div>
            </div>
        </div>

        <div class="adm-section">
            <h2 class="adm-section-title">🏆 Top 5 Produtos (todos os tempos)</h2>
            ${data.top_produtos.length === 0
                ? `<div class="adm-empty"><div class="adm-empty-icon">📦</div><p>Nenhuma venda registrada ainda.</p></div>`
                : `<div class="adm-table-wrap"><table class="adm-table">
                    <thead><tr><th>Produto</th><th>Vendidos</th><th>Receita</th></tr></thead>
                    <tbody>
                        ${data.top_produtos.map(p => `
                            <tr>
                                <td>${escapar(p.nome)}</td>
                                <td>${fmt.numero(p.total_vendido)} un</td>
                                <td><strong>${fmt.preco(p.receita)}</strong></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table></div>`
            }
        </div>

        <div class="adm-section">
            <h2 class="adm-section-title">📦 Últimos Pedidos</h2>
            ${data.ultimos_pedidos.length === 0
                ? `<div class="adm-empty"><div class="adm-empty-icon">🍔</div><p>Nenhum pedido registrado.</p></div>`
                : `<div class="adm-table-wrap"><table class="adm-table">
                    <thead><tr><th>Código</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
                    <tbody>
                        ${data.ultimos_pedidos.map(p => `
                            <tr>
                                <td><strong>${escapar(p.codigo)}</strong></td>
                                <td>${escapar(p.cliente_nome)}</td>
                                <td><strong>${fmt.preco(p.total)}</strong></td>
                                <td><span class="adm-status adm-status-${p.status}">${p.status.replace("_", " ")}</span></td>
                                <td>${fmt.data(p.criado_em)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table></div>`
            }
        </div>
    `;
}


// ========================================
// PEDIDOS
// ========================================

const STATUS_VALIDOS = [
    { valor: "pendente",    label: "Pendente" },
    { valor: "confirmado",  label: "Confirmado" },
    { valor: "em_preparo",  label: "Em Preparo" },
    { valor: "saiu",        label: "Saiu para entrega" },
    { valor: "entregue",    label: "Entregue" },
    { valor: "cancelado",   label: "Cancelado" }
];

let pedidosFiltroStatus = "";

async function renderPedidos(content) {
    const url = pedidosFiltroStatus
        ? `${API_URL}/pedidos?status=${pedidosFiltroStatus}`
        : `${API_URL}/pedidos`;

    const r = await fetch(url, { headers: auth.headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.mensagem || "Erro");

    content.innerHTML = `
        <h1 class="adm-title">
            <span>📦 Pedidos</span>
            <button class="adm-btn adm-btn-ghost adm-btn-sm" id="btnRecarregarPedidos">🔄 Atualizar</button>
        </h1>

        <div class="adm-section">
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
                <button class="adm-btn adm-btn-sm ${!pedidosFiltroStatus ? "adm-btn-primary" : "adm-btn-ghost"}" data-filtro-status="">Todos</button>
                ${STATUS_VALIDOS.map(s => `
                    <button class="adm-btn adm-btn-sm ${pedidosFiltroStatus === s.valor ? "adm-btn-primary" : "adm-btn-ghost"}" data-filtro-status="${s.valor}">${s.label}</button>
                `).join("")}
            </div>

            ${data.pedidos.length === 0
                ? `<div class="adm-empty"><div class="adm-empty-icon">📦</div><p>Nenhum pedido encontrado.</p></div>`
                : `<div class="adm-table-wrap"><table class="adm-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cliente</th>
                            <th>Itens</th>
                            <th>Total</th>
                            <th>Tipo</th>
                            <th>Status</th>
                            <th>Data</th>
                            <th class="col-actions">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.pedidos.map(p => `
                            <tr>
                                <td><strong style="color:var(--cor-primaria)">${escapar(p.codigo)}</strong></td>
                                <td>
                                    <div><strong>${escapar(p.cliente_nome)}</strong></div>
                                    <small style="color:var(--cor-texto-suave)">${escapar(p.cliente_telefone || "-")}</small>
                                </td>
                                <td>
                                    <small>${(p.itens || []).map(i => `${i.quantidade}x ${escapar(i.nome_snapshot)}`).join(", ") || "-"}</small>
                                </td>
                                <td><strong>${fmt.preco(p.total)}</strong></td>
                                <td><small>${p.tipo === "entrega" ? "🛵 Entrega" : "🏪 Retirada"}</small></td>
                                <td><span class="adm-status adm-status-${p.status}">${p.status.replace("_", " ")}</span></td>
                                <td><small>${fmt.data(p.criado_em)}</small></td>
                                <td class="col-actions">
                                    <button class="adm-btn adm-btn-primary adm-btn-sm" data-acao="status" data-id="${p.id}">Editar Status</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table></div>`
            }
        </div>
    `;

    document.getElementById("btnRecarregarPedidos").addEventListener("click", () => renderPedidos(content));

    document.querySelectorAll("[data-filtro-status]").forEach(btn => {
        btn.addEventListener("click", () => {
            pedidosFiltroStatus = btn.dataset.filtroStatus;
            renderPedidos(content);
        });
    });

    document.querySelectorAll('[data-acao="status"]').forEach(btn => {
        btn.addEventListener("click", () => abrirModalStatus(btn.dataset.id));
    });
}


async function abrirModalStatus(id) {
    const r = await fetch(`${API_URL}/pedidos/id/${id}`, { headers: auth.headers() });
    const data = await r.json();
    if (!r.ok || !data.pedido) {
        toast(data.mensagem || "Erro ao carregar pedido", "error");
        return;
    }
    const p = data.pedido;

    const proximoStatus = {
        pendente: "confirmado",
        confirmado: "em_preparo",
        em_preparo: p.tipo === "entrega" ? "saiu" : "entregue",
        saiu: "entregue",
        entregue: null,
        cancelado: null
    };

    const acaoRapida = proximoStatus[p.status];

    modal.abrir(`
        <div class="adm-modal-header">
            <h2 class="adm-modal-title">📦 Pedido ${escapar(p.codigo)}</h2>
            <button class="adm-modal-close" id="btnFecharModal">×</button>
        </div>
        <div class="adm-modal-body">
            <div style="margin-bottom:20px;">
                <strong>Cliente:</strong> ${escapar(p.cliente_nome)}<br>
                <strong>Telefone:</strong> ${escapar(p.cliente_telefone || "-")}<br>
                <strong>Tipo:</strong> ${p.tipo === "entrega" ? "🛵 Entrega" : "🏪 Retirada"}<br>
                ${p.endereco_rua ? `<strong>Endereço:</strong> ${escapar(p.endereco_rua)}, ${escapar(p.endereco_numero)} - ${escapar(p.endereco_bairro || "")}<br>` : ""}
                <strong>Pagamento:</strong> ${escapar(p.forma_pagamento)}${p.troco_para ? ` (troco p/ ${fmt.preco(p.troco_para)})` : ""}<br>
                ${p.observacao ? `<strong>Obs:</strong> ${escapar(p.observacao)}<br>` : ""}
            </div>

            <div style="background:var(--cor-fundo); padding:12px; border-radius:8px; margin-bottom:20px;">
                <strong style="display:block; margin-bottom:8px;">Itens:</strong>
                ${(p.itens || []).map(i => `
                    <div style="display:flex; justify-content:space-between; padding:4px 0;">
                        <span>${i.quantidade}x ${escapar(i.nome_snapshot)}</span>
                        <span>${fmt.preco(i.subtotal)}</span>
                    </div>
                `).join("")}
                <div style="border-top:1px solid var(--cor-borda); margin-top:8px; padding-top:8px; display:flex; justify-content:space-between;">
                    <strong>Total</strong>
                    <strong>${fmt.preco(p.total)}</strong>
                </div>
            </div>

            <div class="adm-form-group">
                <label>Status atual: <span class="adm-status adm-status-${p.status}">${p.status.replace("_", " ")}</span></label>
                <select id="novoStatus">
                    ${STATUS_VALIDOS.map(s => `
                        <option value="${s.valor}" ${s.valor === p.status ? "selected" : ""}>${s.label}</option>
                    `).join("")}
                </select>
            </div>
        </div>
        <div class="adm-modal-footer">
            ${acaoRapida ? `<button class="adm-btn adm-btn-success" id="btnStatusRapido">⚡ Marcar como ${STATUS_VALIDOS.find(s => s.valor === acaoRapida).label}</button>` : ""}
            <button class="adm-btn adm-btn-ghost" id="btnCancelarModal">Cancelar</button>
            <button class="adm-btn adm-btn-primary" id="btnSalvarStatus">Salvar</button>
        </div>
    `);

    document.getElementById("btnFecharModal").addEventListener("click", modal.fechar);
    document.getElementById("btnCancelarModal").addEventListener("click", modal.fechar);

    document.getElementById("btnSalvarStatus").addEventListener("click", async () => {
        const novoStatus = document.getElementById("novoStatus").value;
        await atualizarStatus(id, novoStatus);
    });

    if (acaoRapida) {
        document.getElementById("btnStatusRapido").addEventListener("click", async () => {
            await atualizarStatus(id, acaoRapida);
        });
    }
}


async function atualizarStatus(id, novoStatus) {
    try {
        const r = await fetch(`${API_URL}/pedidos/${id}/status`, {
            method: "PATCH",
            headers: auth.headers(),
            body: JSON.stringify({ status: novoStatus })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.mensagem || "Erro");

        toast(`Status atualizado para "${novoStatus.replace("_", " ")}"`, "success");
        modal.fechar();
        loadPage("pedidos");
    } catch (err) {
        toast(err.message, "error");
    }
}


// ========================================
// PRODUTOS
// ========================================

async function renderProdutos(content) {
    const r = await fetch(`${API_URL}/produtos`, { headers: auth.headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.mensagem || "Erro");

    content.innerHTML = `
        <h1 class="adm-title">🍔 Produtos</h1>

        <div class="adm-section">
            <div class="adm-table-wrap">
                <table class="adm-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.produtos.map(p => `
                            <tr>
                                <td>${p.id}</td>
                                <td>
                                    <strong>${escapar(p.nome)}</strong><br>
                                    <small style="color:var(--cor-texto-suave)">${escapar(p.slug)}</small>
                                </td>
                                <td><small>${escapar(p.categoria)}</small></td>
                                <td><strong>${fmt.preco(p.preco)}</strong></td>
                                <td>
                                    ${p.disponivel
                                        ? `<span style="color:var(--cor-sucesso)">● Disponível</span>`
                                        : `<span style="color:var(--cor-erro)">● Indisponível</span>`}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


// ========================================
// CATEGORIAS
// ========================================

async function renderCategorias(content) {
    const r = await fetch(`${API_URL}/categorias`, { headers: auth.headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.mensagem || "Erro");

    content.innerHTML = `
        <h1 class="adm-title">🏷️ Categorias</h1>
        <div class="adm-section">
            <div class="adm-table-wrap">
                <table class="adm-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ícone</th>
                            <th>Nome</th>
                            <th>Slug</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.categorias.map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td style="font-size:24px">${escapar(c.icone || "—")}</td>
                                <td><strong>${escapar(c.nome)}</strong></td>
                                <td><code>${escapar(c.slug)}</code></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


// ========================================
// USUÁRIOS
// ========================================

async function renderUsuarios(content) {
    const r = await fetch(`${API_URL}/usuarios`, { headers: auth.headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.mensagem || "Erro");

    content.innerHTML = `
        <h1 class="adm-title">👥 Usuários</h1>
        <div class="adm-section">
            <div class="adm-table-wrap">
                <table class="adm-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Último login</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.usuarios.map(u => `
                            <tr>
                                <td>${u.id}</td>
                                <td><strong>${escapar(u.nome)}</strong></td>
                                <td>${escapar(u.email)}</td>
                                <td><span class="adm-status" style="background:#dbeafe;color:#1e40af;">${escapar(u.role)}</span></td>
                                <td>
                                    ${u.ativo
                                        ? `<span style="color:var(--cor-sucesso)">● Ativo</span>`
                                        : `<span style="color:var(--cor-erro)">● Inativo</span>`}
                                </td>
                                <td><small>${fmt.data(u.ultimo_login)}</small></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


// ========================================
// CONFIGURAÇÕES
// ========================================

async function renderConfiguracoes(content) {
    const [pubR, admR] = await Promise.all([
        fetch(`${API_URL}/config`),
        fetch(`${API_URL}/config/admin`, { headers: auth.headers() })
    ]);
    const pubData = await pubR.json();
    const admData = await admR.json();
    if (!pubR.ok) throw new Error(pubData.mensagem);
    if (!admR.ok) throw new Error(admData.mensagem);

    content.innerHTML = `
        <h1 class="adm-title">⚙️ Configurações</h1>

        <div class="adm-section">
            <h2 class="adm-section-title">Públicas (visíveis ao cliente)</h2>
            <div class="adm-table-wrap">
                <table class="adm-table">
                    <thead><tr><th>Chave</th><th>Valor</th><th>Descrição</th></tr></thead>
                    <tbody>
                        ${Object.entries(pubData.configuracoes).map(([k, v]) => `
                            <tr>
                                <td><code>${escapar(k)}</code></td>
                                <td><strong>${escapar(v)}</strong></td>
                                <td><small>${escapar(descreverConfig(k))}</small></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="adm-section">
            <h2 class="adm-section-title">Sistema (apenas admin)</h2>
            <div class="adm-table-wrap">
                <table class="adm-table">
                    <thead><tr><th>Chave</th><th>Valor</th><th>Descrição</th></tr></thead>
                    <tbody>
                        ${admData.configuracoes.map(c => `
                            <tr>
                                <td><code>${escapar(c.chave)}</code></td>
                                <td><strong>${escapar(c.valor)}</strong></td>
                                <td><small>${escapar(c.descricao || "-")}</small></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function descreverConfig(k) {
    const descs = {
        loja_aberta: "Loja aberta/fechada",
        taxa_entrega: "Taxa de entrega (R$)",
        pedido_minimo: "Pedido mínimo (R$)",
        horario_funcionamento: "Horário de funcionamento",
        nome_loja: "Nome da loja",
        whatsapp_loja: "WhatsApp da loja",
        mensagem_whatsapp: "Mensagem automática pós-pedido"
    };
    return descs[k] || "";
}


// ========================================
// MENU MOBILE
// ========================================

document.getElementById("btnMenu")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("aberto");
    document.getElementById("sidebarOverlay")?.classList.toggle("aberto");
});

document.getElementById("sidebarOverlay")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.remove("aberto");
    document.getElementById("sidebarOverlay")?.classList.remove("aberto");
});


// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    if (!auth.requireAuth()) return;

    document.getElementById("userName").textContent = `${auth.usuario.nome} (${auth.usuario.role})`;

    document.querySelectorAll(".adm-nav-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            loadPage(link.dataset.page);
        });
    });

    document.getElementById("btnLogout").addEventListener("click", () => auth.logout());

    loadPage("dashboard");
});
