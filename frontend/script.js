// =========================================================
// 1. DADOS DAS UNIDADES (HORÁRIOS, LOCALIZAÇÃO E LOTAÇÃO)
// =========================================================
let unidadesSaude = [
    {
        id: 1,
        nome: "UBS Jardim das Oliveiras",
        endereco: "Rua das Acácias, 120 - Centro",
        horario: "Seg a Sex: 07h00 às 19h00",
        statusAberto: "Aberto agora",
        pessoas_atuais: 12,
        capacidade_maxima: 50,
        tempo_estimado_min: 15,
        entradas_hoje: 48,
        saidas_hoje: 36
    },
    {
        id: 2,
        nome: "UPA 24h Vila Nova",
        endereco: "Av. Brasil, 1500 - Vila Nova",
        horario: "Atendimento 24 horas (Todos os dias)",
        statusAberto: "Aberto 24h",
        pessoas_atuais: 43,
        capacidade_maxima: 50,
        tempo_estimado_min: 70,
        entradas_hoje: 142,
        saidas_hoje: 99
    },
    {
        id: 3,
        nome: "AMA / UBS Integrada Parque Verde",
        endereco: "Rua Ipê Roxo, 45 - Parque Verde",
        horario: "Seg a Sáb: 07h00 às 22h00",
        statusAberto: "Aberto agora",
        pessoas_atuais: 25,
        capacidade_maxima: 50,
        tempo_estimado_min: 35,
        entradas_hoje: 85,
        saidas_hoje: 60
    }
];

// =========================================================
// 2. ACESSIBILIDADE PARA TERCEIRA IDADE (FONTE E CONTRASTE)
// =========================================================
let tamanhoFonteAtual = 16;

document.getElementById("btn-aumentar-fonte").addEventListener("click", () => {
    if (tamanhoFonteAtual < 22) {
        tamanhoFonteAtual += 2;
        document.documentElement.style.fontSize = tamanhoFonteAtual + "px";
    }
});

document.getElementById("btn-diminuir-fonte").addEventListener("click", () => {
    if (tamanhoFonteAtual > 14) {
        tamanhoFonteAtual -= 2;
        document.documentElement.style.fontSize = tamanhoFonteAtual + "px";
    }
});

document.getElementById("btn-resetar-fonte").addEventListener("click", () => {
    tamanhoFonteAtual = 16;
    document.documentElement.style.fontSize = "16px";
});

document.getElementById("btn-contraste").addEventListener("click", () => {
    document.body.classList.toggle("alto-contraste");
});

// =========================================================
// 3. RENDERIZAÇÃO DOS CARDS E DESTAQUE DA MELHOR UNIDADE
// =========================================================
function classificarLotacao(atuais, maxima) {
    const pct = Math.round((atuais / maxima) * 100);
    if (pct <= 40) return { classe: "baixo", texto: "Tranquilo", pct };
    if (pct <= 75) return { classe: "moderado", texto: "Moderado", pct };
    return { classe: "alto", texto: "Muito Cheio", pct };
}

function atualizarDestaqueMelhorUnidade() {
    const ordenada = [...unidadesSaude].sort((a, b) => a.tempo_estimado_min - b.tempo_estimado_min);
    const melhor = ordenada[0];
    if (melhor) {
        document.getElementById("destaque-melhor-unidade").textContent = melhor.nome;
        document.getElementById("destaque-melhor-tempo").textContent = 
            `Espera estimada: ~${melhor.tempo_estimado_min} min (${melhor.pessoas_atuais} pessoas)`;
    }
}

function renderizarUnidades(lista) {
    const container = document.getElementById("lista-unidades");
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = "<p>Nenhuma unidade encontrada com esse filtro.</p>";
        return;
    }

    lista.forEach(u => {
        const status = classificarLotacao(u.pessoas_atuais, u.capacidade_maxima);

        const card = document.createElement("article");
        card.className = `card-unidade ${status.classe}`;
        card.innerHTML = `
            <div>
                <div class="card-topo">
                    <h3>${u.nome}</h3>
                    <span class="badge-status ${status.classe}">${status.texto}</span>
                </div>

                <div class="info-local-horario">
                    <p><strong>Endereço:</strong> ${u.endereco}</p>
                    <p><strong>Horário:</strong> ${u.horario} (${u.statusAberto})</p>
                </div>

                <div class="painel-numeros">
                    <div class="numero-item">
                        <span>Pessoas no local</span>
                        <strong>${u.pessoas_atuais} / ${u.capacidade_maxima}</strong>
                    </div>
                    <div class="numero-item">
                        <span>Espera estimada</span>
                        <strong>~${u.tempo_estimado_min} min</strong>
                    </div>
                </div>

                <div class="barra-progresso" aria-label="Ocupação de ${status.pct}%">
                    <div class="barra-valor" style="width: ${Math.min(status.pct, 100)}%"></div>
                </div>
            </div>

            <div class="card-botoes">
                <button type="button" class="btn-card btn-mapa" onclick="abrirModalMapa(${u.id})">
                    Ver Mapa
                </button>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.nome + ' ' + u.endereco)}" 
                   target="_blank" class="btn-card btn-ir">
                    Como Chegar
                </a>
            </div>
        `;
        container.appendChild(card);
    });

    atualizarDestaqueMelhorUnidade();
}

// =========================================================
// 4. MODAL DE LOCALIZAÇÃO INTERATIVO
// =========================================================
function abrirModalMapa(idUnidade) {
    const unidade = unidadesSaude.find(u => u.id === idUnidade);
    if (!unidade) return;

    document.getElementById("modal-titulo").textContent = unidade.nome;
    document.getElementById("modal-endereco").textContent = "Endereço: " + unidade.endereco;
    document.getElementById("modal-horario").textContent = "Funcionamento: " + unidade.horario;

    const queryBusca = encodeURIComponent(`${unidade.nome}, ${unidade.endereco}`);
    document.getElementById("iframe-mapa").src = `https://maps.google.com/maps?q=${queryBusca}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    document.getElementById("link-externo-maps").href = `https://www.google.com/maps/search/?api=1&query=${queryBusca}`;

    document.getElementById("modal-mapa").style.display = "flex";
}

document.getElementById("btn-fechar-modal").addEventListener("click", () => {
    document.getElementById("modal-mapa").style.display = "none";
});

// =========================================================
// 5. VISÃO COMPUTACIONAL (SIMULAÇÃO VISUAL OPENCV + INTEGRAÇÃO API)
// =========================================================
const canvas = document.getElementById("canvas-simulacao");
const ctx = canvas.getContext("2d");

// Bonecos simulando detecção OpenCV (Bounding Boxes verdes)
let pessoasDetectadas = [
    { x: 120, y: 90, vy: 1.2, id: 101 },
    { x: 310, y: 240, vy: -1.1, id: 102 },
    { x: 470, y: 140, vy: 0.9, id: 103 }
];

function desenharVisaoComputacional() {
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade de piso simulando recepção
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }

    // Linha virtual de contagem (igual ao contador_pessoas em OpenCV)
    const linhaY = canvas.height / 2;
    ctx.strokeStyle = "#00E676";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(0, linhaY);
    ctx.lineTo(canvas.width, linhaY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#00E676";
    ctx.font = "bold 14px Arial";
    ctx.fillText("LINHA DE CONTAGEM VIRTUAL (OPENCV)", 15, linhaY - 10);

    // Atualiza e desenha bounding boxes de pessoas
    pessoasDetectadas.forEach(p => {
        p.y += p.vy;
        if (p.y > canvas.height - 60 || p.y < 30) p.vy *= -1;

        // Retângulo de detecção
        ctx.strokeStyle = "#00E676";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, 46, 75);

        // Etiqueta superior
        ctx.fillStyle = "#008C45";
        ctx.fillRect(p.x, p.y - 20, 78, 20);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px Arial";
        ctx.fillText(`Pessoa #${p.id}`, p.x + 4, p.y - 6);
    });

    requestAnimationFrame(desenharVisaoComputacional);
}

function atualizarPainelCamera() {
    const uPiloto = unidadesSaude[0];
    document.getElementById("cam-pessoas-atuais").textContent = uPiloto.pessoas_atuais;
    document.getElementById("cam-entradas").textContent = uPiloto.entradas_hoje;
    document.getElementById("cam-saidas").textContent = uPiloto.saidas_hoje;
    aplicarFiltros();
}

// Botões interativos para demonstrar na banca ao vivo
document.getElementById("btn-simular-entrada").addEventListener("click", () => {
    const u = unidadesSaude[0];
    if (u.pessoas_atuais < u.capacidade_maxima) {
        u.pessoas_atuais++;
        u.entradas_hoje++;
        u.tempo_estimado_min = Math.max(5, Math.round(u.pessoas_atuais * 1.4));
        atualizarPainelCamera();
    }
});

document.getElementById("btn-simular-saida").addEventListener("click", () => {
    const u = unidadesSaude[0];
    if (u.pessoas_atuais > 0) {
        u.pessoas_atuais--;
        u.saidas_hoje++;
        u.tempo_estimado_min = Math.max(5, Math.round(u.pessoas_atuais * 1.4));
        atualizarPainelCamera();
    }
});

// Conectar ao stream real da API Python (Flask/FastAPI)
document.getElementById("btn-conectar-api").addEventListener("click", () => {
    const imgStream = document.getElementById("stream-opencv");
    const statusLabel = document.getElementById("status-conexao-cam");

    imgStream.src = "http://127.0.0.1:5000/video_feed";
    imgStream.onload = () => {
        canvas.style.display = "none";
        imgStream.style.display = "block";
        statusLabel.textContent = "Conectado ao Python OpenCV (Ao Vivo)";
        statusLabel.style.backgroundColor = "#008C45";
    };
    imgStream.onerror = () => {
        alert("API Python não detectada em http://127.0.0.1:5000. Mantendo o modo de simulação visual ativo.");
    };
});

// =========================================================
// 6. FILTROS DE BUSCA E INICIALIZAÇÃO
// =========================================================
function aplicarFiltros() {
    const termo = document.getElementById("busca-unidade").value.toLowerCase();
    const statusFiltro = document.getElementById("filtro-status").value;

    const filtradas = unidadesSaude.filter(u => {
        const bateTexto = u.nome.toLowerCase().includes(termo) || u.endereco.toLowerCase().includes(termo);
        const bateStatus = statusFiltro === "todos" || classificarLotacao(u.pessoas_atuais, u.capacidade_maxima).classe === statusFiltro;
        return bateTexto && bateStatus;
    });

    renderizarUnidades(filtradas);
}

document.getElementById("busca-unidade").addEventListener("input", aplicarFiltros);
document.getElementById("filtro-status").addEventListener("change", aplicarFiltros);

// Inicia tudo
renderizarUnidades(unidadesSaude);
desenharVisaoComputacional();