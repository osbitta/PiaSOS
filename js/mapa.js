let mapaGlobal = null;
let markersMapa = {}; // id_ocorrencia -> leaflet marker
let timerUpdateMapa = null;

// Controle do Painel Lateral
function toggleMapaDrawer() {
    const drawer = document.getElementById('mapaDrawer');
    if (drawer) {
        drawer.classList.toggle('hidden');
    }
}

// Inicializa o mapa
function initMapaGlobal() {
    if (mapaGlobal) {
        mapaGlobal.invalidateSize();
        // Se já inicializou, só atualiza os dados e garante que o timer tá rodando
        iniciarLoopMapa();
        return;
    }

    // Configuração base (Leaflet)
    mapaGlobal = L.map('mapa-global', {
        zoomControl: false // vamos colocar depois se precisar
    }).setView([-25.4284, -49.2733], 7); // Default Sul/Sudeste

    L.control.zoom({ position: 'bottomright' }).addTo(mapaGlobal);

    // Tema Claro (Voyager - Mesmo do Atendimento)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapaGlobal);

    ajustarVisaoInicialPorAgencia();
    iniciarLoopMapa();
}

function iniciarLoopMapa() {
    carregarOcorrenciasMapa();
    if (!timerUpdateMapa) {
        timerUpdateMapa = setInterval(carregarOcorrenciasMapa, 10000); // Atualiza a cada 10s
    }
}

function pararLoopMapa() {
    if (timerUpdateMapa) {
        clearInterval(timerUpdateMapa);
        timerUpdateMapa = null;
    }
}

// Quando mudar de aba no main.js, seria bom pausar o mapa para economizar ram. 
// Vamos injetar uma escuta na div view-mapa usando IntersectionObserver ou apenas sobrescrever.
// Por simplicidade, vamos deixar rodando se a aba estiver visível.

// Persistência de Filtros
function salvarConfigMapa() {
    const estado = document.getElementById('mapaFiltroEstado').value;
    const cidade = document.getElementById('mapaFiltroCidade').value;
    const bairro = document.getElementById('mapaFiltroBairro').value;
    localStorage.setItem('piabi_mapa_config', JSON.stringify({estado, cidade, bairro}));
}

function carregarConfigMapa() {
    try {
        const confStr = localStorage.getItem('piabi_mapa_config');
        if (confStr) return JSON.parse(confStr);
    } catch(e) {}
    return null;
}

function ajustarVisaoInicialPorAgencia() {
    const mem = carregarConfigMapa();
    const uf = mem ? mem.estado : (usuarioAtual?.uf_origem || 'PR');
    const cid = mem ? mem.cidade : (usuarioAtual?.cidade || '');
    const bai = mem ? mem.bairro : '';

    const selectEstado = document.getElementById('mapaFiltroEstado');
    const cidadeFiltroContainer = document.getElementById('mapa-filtro-cidade-container');
    const inputCidade = document.getElementById('mapaFiltroCidade');
    const inputBairro = document.getElementById('mapaFiltroBairro');

    if (selectEstado) selectEstado.value = uf;

    // Se é agência municipal, não deixa mudar cidade e estado? 
    // O usuário pediu: "caso seja uma agencia municipal, faça com que essa informação também esteja salva de forma automatica no preenximento do mapa, restando somente bairro caso seja necessário fazer o filtro pelo usuario."
    const isMunicipal = usuarioAtual?.cidade && usuarioAtual.cidade.trim() !== '';

    if (isMunicipal) {
        cidadeFiltroContainer.style.display = 'none';
        if(selectEstado) selectEstado.disabled = true; // Trava o estado para municipal
        inputCidade.value = usuarioAtual.cidade;
        inputBairro.value = bai;
        
        let queryStr = bai ? `${bai}, ${usuarioAtual.cidade}, ${uf}` : `${usuarioAtual.cidade}, ${uf}`;
        focarMapaEmLocal(queryStr, bai ? 15 : 13);
    } else {
        cidadeFiltroContainer.style.display = 'block';
        if(selectEstado) selectEstado.disabled = false;
        inputCidade.value = cid;
        inputBairro.value = bai;

        let queryStr = bai && cid ? `${bai}, ${cid}, ${uf}` : (cid ? `${cid}, ${uf}` : `Estado de ${uf}, Brasil`);
        focarMapaEmLocal(queryStr, bai ? 15 : (cid ? 13 : 6));
    }
}

function mudarEstadoMapa(novoEstado) {
    document.getElementById('mapaFiltroCidade').value = '';
    document.getElementById('mapaFiltroBairro').value = '';
    salvarConfigMapa();
    focarMapaEmLocal(`Estado de ${novoEstado}, Brasil`, 6);
}

async function focarMapaEmLocal(query, defZoom = 13) {
    try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].geometry.coordinates;
            mapaGlobal.flyTo([lat, lng], defZoom, { duration: 1.5 });
        }
    } catch (e) {
        console.warn("Erro ao focar mapa via Photon:", e);
    }
}

// Carregar Ocorrências do Supabase
async function carregarOcorrenciasMapa() {
    // Só carrega se a aba do mapa estiver visível para poupar recursos
    const viewMapa = document.getElementById('view-mapa');
    if (viewMapa && viewMapa.classList.contains('hidden')) return;

    if (!usuarioAtual) return;
    
    try {
        // 1. Buscar Ocorrências AGUARDANDO e EM_ANDAMENTO
        // 2. Buscar ALERTA
        // Lógica de filtro por agência usando a função global
        const filtro = (typeof _filtroAgencia === 'function') ? _filtroAgencia() : '';

        const urlOcorrencias = `${PROJECT_URL}/rest/v1/tb_triagem?select=id,status,criado_em,hora_despacho,hora_local,hora_saida,viaturas_empenhadas,agencia_origem,latitude,longitude,dados_preenchidos,resumo_texto&status=in.(AGUARDANDO,EM_TRIAGEM,EM_ANDAMENTO,ALERTA)${filtro}`;

        const resp = await fetch(urlOcorrencias, {
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
        });
        
        if (!resp.ok) throw new Error("Erro ao carregar dados do mapa");
        const ocorrencias = await resp.json();

        const novosIds = ocorrencias.map(o => o.id);

        // Remover marcadores velhos
        Object.keys(markersMapa).forEach(id => {
            if (!novosIds.includes(Number(id))) {
                mapaGlobal.removeLayer(markersMapa[id]);
                delete markersMapa[id];
            }
        });

        // Atualizar ou criar marcadores
        ocorrencias.forEach(oc => {
            const coords = (oc.latitude && oc.longitude) ? { lat: parseFloat(oc.latitude), lng: parseFloat(oc.longitude) } : null;
            if (!coords) return; // Se não tem GPS, não plota

            const isAlerta = oc.status === 'ALERTA';
            const isAndamento = oc.status === 'EM_ANDAMENTO';
            
            const tooltipHTML = gerarTooltip(oc);
            const iconHtml = gerarIconeHTML(oc, isAlerta, isAndamento);

            const divIcon = L.divIcon({
                className: 'custom-map-icon',
                html: iconHtml,
                iconSize: isAlerta ? [30, 30] : [32, 32],
                iconAnchor: isAlerta ? [15, 15] : [16, 16]
            });

            if (markersMapa[oc.id]) {
                const mk = markersMapa[oc.id];
                mk.setLatLng([coords.lat, coords.lng]);
                mk.setIcon(divIcon);
                // Atualizar tooltip content
                if (mk.getTooltip()) {
                    mk.setTooltipContent(tooltipHTML);
                }
            } else {
                const mk = L.marker([coords.lat, coords.lng], { icon: divIcon })
                    .bindTooltip(tooltipHTML, {
                        className: 'mapa-tooltip',
                        direction: 'top',
                        offset: [0, -15]
                    })
                    .addTo(mapaGlobal);
                
                markersMapa[oc.id] = mk;
            }
        });

    } catch (e) {
        console.error("Erro no update do mapa:", e);
    }
}



// Limpa o endereço para o tooltip
function limparEnderecoTooltip(ref) {
    if (!ref) return "Endereço não informado";
    // Remove as coordenadas brutos e pluscode do texto visível
    let limpo = ref.replace(/GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+/i, '')
                   .replace(/\.?\s*PLUS CODE:\s*[A-Z0-9\+]+/i, '')
                   .replace(/\s*\/\s*$/, '') // remove barra no fim se sobrar
                   .trim();
    // Limpa excesso de espaços e pontuação sobrando
    limpo = limpo.replace(/^[.,\s]+|[.,\s]+$/g, '').replace(/\s{2,}/g, ' ');
    return limpo || "Endereço não identificado";
}

// Gera o HTML do Icone Baseado no Status
function gerarIconeHTML(oc, isAlerta, isAndamento) {
    if (isAlerta) {
        return `<div class="marker-alerta"><i class="fas fa-exclamation-triangle"></i></div>`;
    }

    const info = typeof oc.dados_preenchidos === 'string' ? JSON.parse(oc.dados_preenchidos || '{}') : (oc.dados_preenchidos || {});
    const prioridade = info.prioridade || 'normal';
    const priClass = `pri-${prioridade.toLowerCase()}`;
    const statusClass = isAndamento ? 'marker-andamento' : 'marker-aguardando';
    
    // Ícone interno (pode variar por natureza se no futuro tivermos mapeamento, por hora estrela ou flag)
    const innerIcon = isAndamento ? '<i class="fas fa-shield-alt"></i>' : '<i class="fas fa-phone-alt"></i>';

    let badgeHTML = '';
    if (isAndamento && oc.viaturas_empenhadas) {
        try {
            const viaturas = JSON.parse(oc.viaturas_empenhadas);
            if (viaturas && viaturas.length > 0) {
                const prefixo = viaturas[0].prefixo || viaturas[0].guarnicao || 'VTR';
                badgeHTML = `<div class="badge-vtr">${prefixo}</div>`;
            }
        } catch (e) {}
    }

    return `
        <div class="marker-oco ${statusClass} ${priClass}">
            ${innerIcon}
            ${badgeHTML}
        </div>
    `;
}

function gerarTooltip(oc) {
    const isAlerta = oc.status === 'ALERTA';
    let iconHeader = isAlerta ? '<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i>' : '<i class="fas fa-info-circle" style="color:var(--accent);"></i>';
    
    let tempoDecorrido = obterDuracaoUltimaAtualizacaoMapa(oc);

    const info = typeof oc.dados_preenchidos === 'string' ? JSON.parse(oc.dados_preenchidos || '{}') : (oc.dados_preenchidos || {});
    const natureza = info.natureza || (isAlerta ? 'Alerta Manual' : 'Ocorrência');
    const descricao = oc.resumo_texto ? oc.resumo_texto : (isAlerta ? 'Alerta gerado por viatura ou operador.' : 'Sem descrição detalhada.');
    
    const enderecoFormatado = info.endereco?.formatado || '';
    const esquina = info.endereco?.esquina ? `<strong>Esq:</strong> ${info.endereco.esquina}<br>` : '';
    const referencia = info.endereco?.referencia ? `<strong>Ref:</strong> ${limparEnderecoTooltip(info.endereco.referencia)}` : '';

    return `
        <div class="tooltip-header">
            ${iconHeader}
            <span class="natureza">${natureza}</span>
            <span style="margin-left:auto; font-size:10px; color:var(--text-muted);">${tempoDecorrido}</span>
        </div>
        <div class="tooltip-body">
            <div style="margin-bottom:6px;">"${descricao}"</div>
            <div class="endereco">
                <i class="fas fa-map-marker-alt" style="margin-right:4px;"></i> ${enderecoFormatado}<br>
                ${esquina}
                ${referencia}
            </div>
        </div>
    `;
}

function obterDuracaoUltimaAtualizacaoMapa(oc) {
    let baseTimeStr = oc.criado_em;
    if (oc.hora_saida) baseTimeStr = oc.hora_saida;
    else if (oc.hora_local) baseTimeStr = oc.hora_local;
    else if (oc.hora_despacho) baseTimeStr = oc.hora_despacho;
    
    if (!baseTimeStr) return '0m';
    
    const diffMs = new Date() - new Date(baseTimeStr);
    const m = Math.floor(diffMs / 60000);
    if (m >= 60) {
        return `${Math.floor(m/60)}h ${m%60}m`;
    }
    return `${m >= 0 ? m : 0}m`;
}

// ==========================================
// AUTOCOMPLETE PARA OS FILTROS DO MAPA
// ==========================================
let mapFilterCidTimeout;
function sugerirCidadeMapa(txt) {
    const box = document.getElementById('sugestoesCidadeMapa');
    clearTimeout(mapFilterCidTimeout);
    
    if(!txt || txt.length < 2) { box.classList.add('hidden'); return; }
    
    mapFilterCidTimeout = setTimeout(() => {
        const uf = document.getElementById('mapaFiltroEstado')?.value || usuarioAtual?.uf_origem || 'PR';
        const arrCidades = uf === 'SC' ? cidadesSC : (uf === 'SP' ? cidadesSP : cidadesPR);
        const termo = _sugNorm(txt);
        const matches = arrCidades.filter(c => _sugNorm(c).includes(termo)).slice(0, 8);
        
        box.innerHTML = '';
        if(matches.length) {
            matches.forEach(c => {
                const div = document.createElement('div');
                div.className = 'sug-item';
                div.innerText = c;
                div.onclick = () => {
                    document.getElementById('mapaFiltroCidade').value = c;
                    document.getElementById('mapaFiltroBairro').value = '';
                    salvarConfigMapa();
                    box.classList.add('hidden');
                    focarMapaEmLocal(c + ', ' + uf, 13);
                    document.getElementById('mapaFiltroBairro').focus();
                };
                box.appendChild(div);
            });
            box.classList.remove('hidden');
        } else {
            box.classList.add('hidden');
        }
    }, 300);
}

let mapFilterBaiTimeout;
function sugerirBairroMapa(txt) {
    const box = document.getElementById('sugestoesBairroMapa');
    clearTimeout(mapFilterBaiTimeout);
    
    const uf = document.getElementById('mapaFiltroEstado')?.value || usuarioAtual?.uf_origem || 'PR';
    // Se for municipal usa a cidade do usuarioAtual, senao pega do inputCidadeMapa
    let cidTarget = usuarioAtual?.cidade || document.getElementById('mapaFiltroCidade')?.value || '';
    
    if(!txt || txt.length < 1 || !cidTarget) { box.classList.add('hidden'); return; }
    
    mapFilterBaiTimeout = setTimeout(() => {
        const arrLocalidades = uf === 'SC' ? localidadesSC : (uf === 'SP' ? localidadesSP : localidadesPR);
        const bairrosDaCidade = arrLocalidades[_sugNorm(cidTarget)];
        if(!bairrosDaCidade) { box.classList.add('hidden'); return; }
        
        const termo = _sugNorm(txt);
        const matches = bairrosDaCidade.filter(b => _sugNorm(b).includes(termo)).slice(0, 8);
        
        box.innerHTML = '';
        if(matches.length) {
            matches.forEach(b => {
                const div = document.createElement('div');
                div.className = 'sug-item';
                div.innerText = b;
                div.onclick = () => {
                    document.getElementById('mapaFiltroBairro').value = b;
                    salvarConfigMapa();
                    box.classList.add('hidden');
                    focarMapaEmLocal(b + ', ' + cidTarget + ', ' + uf, 15);
                };
                box.appendChild(div);
            });
            box.classList.remove('hidden');
        } else {
            box.classList.add('hidden');
        }
    }, 200);
}

// Fechar popups clicando fora
document.addEventListener('click', (e) => {
    const cidBox = document.getElementById('sugestoesCidadeMapa');
    const baiBox = document.getElementById('sugestoesBairroMapa');
    if (cidBox && !cidBox.contains(e.target) && e.target.id !== 'mapaFiltroCidade') cidBox.classList.add('hidden');
    if (baiBox && !baiBox.contains(e.target) && e.target.id !== 'mapaFiltroBairro') baiBox.classList.add('hidden');
});
