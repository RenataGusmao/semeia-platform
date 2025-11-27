// ==========================================================
// Semeia+ — script principal
// - Gerencia login, perfis, pedidos, QR code e portal
// - Usa localStorage como "banco" mockado
// ==========================================================

// ---------- Utilidades de armazenamento ----------

function loadJSON(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Sessão / usuário atual ----------

function getCurrentUser() {
  return loadJSON("usuarioLogado", null);
}

function setCurrentUser(user) {
  saveJSON("usuarioLogado", user);
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// ---------- Dados principais ----------

function getUsers() {
  return loadJSON("usuariosSemeia", []);
}

function saveUsers(list) {
  saveJSON("usuariosSemeia", list);
}

function getSolicitacoes() {
  return loadJSON("solicitacoesSemeia", []);
}

function saveSolicitacoes(list) {
  saveJSON("solicitacoesSemeia", list);
}

// Gera um "id" simples e código para QR
function gerarId() {
  return Date.now() + Math.random().toString(16).slice(2);
}

// ---------- Toast (feedback visual) ----------

function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1600);
}

// ---------- Regras de permissão ----------

/*
Perfis:
- admin        → vê tudo, avança status, exclui qualquer pedido
- agricultor   → cadastra, vê e exclui seus pedidos (até "analise")
- cooperativa  → igual agricultor, mas em nome da cooperativa
- geral        → apenas portal de transparência
*/

function canAdvance(user) {
  return user && user.perfil === "admin";
}

function canDelete(user, solic) {
  if (!user || !solic) return false;
  if (user.perfil === "admin") return true;

  const deletavel = ["recebido", "analise"];
  const ehDoUsuario = solic.usuario === user.usuario;
  const statusOk = deletavel.includes(solic.status || "recebido");

  return (user.perfil === "agricultor" || user.perfil === "cooperativa") &&
         ehDoUsuario && statusOk;
}

// Guard de rota: bloqueia acesso se não estiver logado ou se perfil não for permitido
function ensureAuth(allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.perfil)) {
    // Para simplificar, se não tem permissão manda sempre pro acompanhamento
    window.location.href = "acompanhamento.html";
    return null;
  }
  return user;
}

// ==========================================================
//  PÁGINAS
// ==========================================================

// ---------- LOGIN (index.html) ----------

function initLogin() {
  const form = document.getElementById("formLogin");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const usuario = document.getElementById("user").value.trim();
    const senha   = document.getElementById("pass").value.trim();

    // Admin fixo (mock)
    if (usuario === "admin" && senha === "admin") {
      setCurrentUser({
        usuario:"admin",
        nome:"Administrador",
        perfil:"admin"
      });
      showToast("Login como administrador");
      setTimeout(() => window.location.href = "acompanhamento.html", 800);
      return;
    }

    const users = getUsers();
    const found = users.find(u => u.usuario === usuario && u.senha === senha);

    if (!found) {
      showToast("Usuário ou senha incorretos.");
      return;
    }

    setCurrentUser(found);
    showToast("Login realizado.");

    // Redireciona por perfil
    setTimeout(() => {
      if (found.perfil === "geral") {
        window.location.href = "portal-transparencia.html";
      } else {
        window.location.href = "acompanhamento.html";
      }
    }, 900);
  });
}

// ---------- CADASTRO DE USUÁRIO ----------

function initCadastroUsuario() {
  const form = document.getElementById("formCadastroUsuario");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome     = document.getElementById("nome").value.trim();
    const usuario  = document.getElementById("usuario").value.trim();
    const senha    = document.getElementById("senha").value.trim();
    const perfil   = document.getElementById("perfil").value;
    const municipio= document.getElementById("municipio").value.trim();

    if (!nome || !usuario || !senha || !perfil) {
      showToast("Preencha todos os campos obrigatórios.");
      return;
    }

    const list = getUsers();
    if (list.some(u => u.usuario === usuario)) {
      showToast("Já existe um usuário com esse login.");
      return;
    }

    list.push({ nome, usuario, senha, perfil, municipio });
    saveUsers(list);
    showToast("Conta criada com sucesso.");
    setTimeout(() => window.location.href = "index.html", 1000);
  });
}

// ---------- CADASTRO DE DEMANDA ----------

function initCadastroDemanda() {
  const user = ensureAuth(["agricultor", "cooperativa", "admin"]);
  if (!user) return;

  const saudacao = document.getElementById("saudacao");
  if (saudacao) {
    saudacao.textContent = `Bem-vindo(a), ${user.nome || user.usuario}. Cadastre uma nova solicitação.`;
  }

  const form = document.getElementById("formDemanda");
  const modal = document.getElementById("modalConfirmacao");
  const btnCancelar = document.getElementById("btnCancelarModal");
  const btnConfirmar = document.getElementById("btnConfirmarModal");
  const resumo = document.getElementById("resumoSolicitacao");

  if (!form || !modal) return;

  let draft = null;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const agricultor = document.getElementById("agricultor").value.trim();
    const cultura    = document.getElementById("cultura").value.trim();
    const quantidade = document.getElementById("quantidade").value.trim();
    const obs        = document.getElementById("obs").value.trim();

    if (!agricultor || !cultura || !quantidade) {
      showToast("Preencha agricultor, cultura e quantidade.");
      return;
    }

    // Monta rascunho (draft) para confirmar
    draft = {
      id: gerarId(),
      agricultor,
      cultura,
      quantidade: String(parseInt(quantidade, 10)),
      obs,
      usuario: user.usuario,
      perfilCriador: user.perfil,
      municipio: user.municipio || "—",
      data: new Date().toISOString().slice(0,10),
      status: "recebido"
    };

    // Mostra resumo no modal
    resumo.innerHTML = `
      <p><strong>Agricultor/Cooperativa:</strong> ${draft.agricultor}</p>
      <p><strong>Cultura:</strong> ${draft.cultura}</p>
      <p><strong>Quantidade:</strong> ${draft.quantidade} sacas</p>
      ${draft.obs ? `<p><strong>Observações:</strong> ${draft.obs}</p>` : ""}
    `;
    modal.classList.remove("hidden");
  });

  btnCancelar && btnCancelar.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  btnConfirmar && btnConfirmar.addEventListener("click", () => {
    if (!draft) return;
    const list = getSolicitacoes();

    // Para rastreio via QR, usamos o próprio id como conteúdo
    draft.qrCodeData = `SEMEIA+|${draft.id}`;

    list.unshift(draft);
    saveSolicitacoes(list);

    modal.classList.add("hidden");
    showToast("Solicitação registrada.");
    setTimeout(() => window.location.href = "acompanhamento.html", 800);
  });
}

// ---------- ACOMPANHAMENTO (histórico por perfil) ----------

function initAcompanhamento() {
  const user = ensureAuth(["admin", "agricultor", "cooperativa"]);
  if (!user) return;

  const listEl  = document.getElementById("listaSolicitacoes");
  const filtroStatus = document.getElementById("filtroStatus");

  if (!listEl) return;

  function filtrarESortear() {
    let list = getSolicitacoes();

    // Admin vê tudo, demais veem apenas os próprios
    if (user.perfil !== "admin") {
      list = list.filter(s => s.usuario === user.usuario);
    }

    const statusFiltro = filtroStatus ? filtroStatus.value : "";
    if (statusFiltro) {
      list = list.filter(s => (s.status || "recebido") === statusFiltro);
    }

    // Ordena por data mais recente (simplesmente pelo id)
    return list;
  }

  function render() {
    const dados = filtrarESortear();
    listEl.innerHTML = "";

    if (dados.length === 0) {
      listEl.innerHTML = `<p class="help">Nenhuma solicitação encontrada.</p>`;
      return;
    }

    dados.forEach(s => {
      const li = document.createElement("div");
      li.className = "item";

      const status = s.status || "recebido";
      const tag = `<span class="tag ${status}">${statusLabel(status)}</span>`;

      li.innerHTML = `
        <div class="grid" style="grid-template-columns:1fr auto;align-items:center;">
          <h4>${s.cultura} — ${s.quantidade} sacas</h4>
          ${tag}
        </div>
        <div class="help">
          Agricultor/Cooperativa: ${s.agricultor} • Data: ${s.data} • Município: ${s.municipio || "—"}
        </div>
        ${s.obs ? `<div class="help"><strong>Obs.:</strong> ${s.obs}</div>` : ""}
        <div class="help">QR: ${s.qrCodeData || s.id}</div>
        <div class="top-actions" style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
          ${ canAdvance(user) ? `<button class="btn btn-primary" data-id="${s.id}" data-action="avancar">Avançar status</button>` : "" }
          ${ canDelete(user, s)  ? `<button class="btn btn-danger" data-id="${s.id}" data-action="excluir">Excluir</button>` : "" }
        </div>
        <canvas id="qr_${s.id}" width="80" height="80" aria-label="QR Code do pedido"></canvas>
      `;

      listEl.appendChild(li);

      // Gera o QR code real (via biblioteca QRious, carregada na página)
      if (window.QRious) {
        new QRious({
          element: document.getElementById(`qr_${s.id}`),
          value: s.qrCodeData || s.id,
          size: 80
        });
      }
    });
  }

  // Label legível para status
  function statusLabel(st) {
    const map = {
      recebido:"Recebido",
      analise:"Em análise",
      aprovado:"Aprovado",
      expedicao:"Em expedição",
      entregue:"Entregue"
    };
    return map[st] || st;
  }

  // Avançar status (apenas admin)
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    let list = getSolicitacoes();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return;

    const solic = list[idx];

    if (action === "avancar" && canAdvance(user)) {
      const ordem = ["recebido","analise","aprovado","expedicao","entregue"];
      const atual = solic.status || "recebido";
      const pos = ordem.indexOf(atual);
      const proximo = ordem[Math.min(pos+1, ordem.length-1)];
      solic.status = proximo;
      list[idx] = solic;
      saveSolicitacoes(list);
      showToast("Status atualizado.");
      render();
    }

    if (action === "excluir" && canDelete(user, solic)) {
      list = list.filter(s => s.id !== id);
      saveSolicitacoes(list);
      showToast("Solicitação excluída.");
      render();
    }
  });

  filtroStatus && filtroStatus.addEventListener("change", render);

  render();
}

// ---------- Portal de Transparência (geral e admin) ----------

function initPortalTransparencia() {
  // Perfil geral e admin podem ver
  const user = getCurrentUser(); // aqui não bloqueio usuário sem login "geral", mas se quiser, use ensureAuth(["geral","admin"])
  const tabela = document.getElementById("tabelaTransparencia");
  const btnPDF = document.getElementById("btnPDF");
  if (!tabela) return;

  const dados = getSolicitacoes().filter(s => (s.status || "recebido") === "entregue");

  if (dados.length === 0) {
    tabela.innerHTML = "<p class='help'>Ainda não há entregas concluídas.</p>";
    return;
  }

  tabela.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Agricultor/Cooperativa</th>
          <th>Cultura</th>
          <th>Quantidade (sacas)</th>
          <th>Município</th>
          <th>Data da entrega</th>
        </tr>
      </thead>
      <tbody>
        ${dados.map(s => `
          <tr>
            <td>${s.agricultor}</td>
            <td>${s.cultura}</td>
            <td>${s.quantidade}</td>
            <td>${s.municipio || "—"}</td>
            <td>${s.data}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  if (btnPDF && window.html2pdf) {
    btnPDF.addEventListener("click", () => {
      const opt = {
        margin:10,
        filename:"relatorio-entregas-semeia.pdf",
        html2canvas:{ scale:2 },
        jsPDF:{ unit:"mm", format:"a4", orientation:"portrait" }
      };
      window.html2pdf().set(opt).from(tabela).save();
    });
  }
}

// ---------- Perfil ----------

function initPerfil() {
  const user = ensureAuth(["admin","agricultor","cooperativa","geral"]);
  if (!user) return;

  const nomeEl      = document.getElementById("pNome");
  const usuarioEl   = document.getElementById("pUsuario");
  const perfilEl    = document.getElementById("pPerfil");
  const municipioEl = document.getElementById("pMunicipio");
  const btnSalvar   = document.getElementById("btnSalvarPerfil");

  if (nomeEl)      nomeEl.value      = user.nome || "";
  if (usuarioEl)   usuarioEl.value   = user.usuario || "";
  if (perfilEl)    perfilEl.value    = user.perfil || "geral";
  if (municipioEl) municipioEl.value = user.municipio || "";

  btnSalvar && btnSalvar.addEventListener("click", () => {
    user.nome      = nomeEl.value.trim();
    user.usuario   = usuarioEl.value.trim();
    user.perfil    = perfilEl.value;
    user.municipio = municipioEl.value.trim();
    setCurrentUser(user);
    showToast("Perfil atualizado (armazenado neste navegador).");
  });
}

// ---------- Quem somos / Relatórios / Expedição (placeholders) ----------

function initQuemSomos() {
  // Informativo, sem lógica dinâmica por enquanto
}

function initRelatorios() {
  // Poderia futuramente usar as mesmas informações do portal com filtros extras
}

function initRetirada() {
  // Em um próximo passo, poderíamos listar pedidos em expedição para conferência
}

// ==========================================================
//  BOOT: descobre a página pelo data-page do <body>
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.dataset.page;

  if (page === "login")              initLogin();
  if (page === "cadastro-usuario")   initCadastroUsuario();
  if (page === "cadastro-demanda")   initCadastroDemanda();
  if (page === "acompanhamento")     initAcompanhamento();
  if (page === "portal-transparencia") initPortalTransparencia();
  if (page === "perfil")             initPerfil();
  if (page === "quem-somos")         initQuemSomos();
  if (page === "relatorios")         initRelatorios();
  if (page === "retirada")           initRetirada();

  // Deixo logout disponível globalmente
  window.logout = logout;
});
