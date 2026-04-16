        const PROJECT_URL = 'https://rgenujwwhgcnpmqfswzi.supabase.co';
        const API_KEY = 'sb_publishable_70vDCsbBzp_1YgPvWacPvQ_n_WfBqnf';
        let usuarioAtual = null;
        let idOcorrenciaSelecao = null;
        let idOcorrenciaAberta = null;
        let idParaFinalizar = null;
        let tipoFuncaoSelecao = null;
        let timerOcorrencia = null;
        let veiculosArray = [], suspeitosArray = [], veiculoTemp = null, idEmEdicao = null, idSelecionadoDespacho = null, ocoAtual = null;

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const modais = document.querySelectorAll('.modal-overlay');
                modais.forEach(modal => modal.style.display = 'none');
            }
        });

function switchTabClassif(aba) {
    document.getElementById('boxPiasos').classList.toggle('hidden', aba !== 'PIASOS');
    document.getElementById('boxSade').classList.toggle('hidden', aba !== 'SADE');
    document.getElementById('tabPiasos').className = aba === 'PIASOS' ? 'btn btn-sm btn-info' : 'btn btn-sm btn-outline';
    document.getElementById('tabSade').className = aba === 'SADE' ? 'btn btn-sm btn-info' : 'btn btn-sm btn-outline';
}

let txtOrigPui = '';
function configurarGroq() {
    document.getElementById('puiApiKey').value = localStorage.getItem('gk') || '';
    document.getElementById('puiPrompt').value = localStorage.getItem('gp') || 'Aja como um sistema de correção de texto para despachos policiais (190). Sua única função é reescrever o relato fornecido para torná-lo formal, impessoal e técnico, seguindo o padrão culto da língua portuguesa.\n\nRegras Rígidas:\n1 - SEM TÍTULOS OU INTRODUÇÕES: Não coloque cabeçalhos como "Relatório de Ocorrência". Comece o texto diretamente pela narrativa.\n2 - CONCORDÂNCIA DE GÊNERO: Identifique se o relato original se refere a uma solicitante (feminino) ou um solicitante (masculino). Mantenha rigorosamente o gênero original. Se o texto mencionar "A solicitante", o texto corrigido deve manter "A solicitante" e todas as concordâncias femininas.\n3 - TERMOS TÉCNICOS: Substitua termos informais por técnicos (ex: "perturbando" por "perturbação do sossego alheio", "solicitante informa" por "Relata o/a solicitante").\n4 - FIDELIDADE AOS FATOS: Mantenha os fatos estritamente como narrados, sem inventar informações.\n5 - EVITE PLEONASMOS: Jamais utilize "O/A solicitante solicita". Prefira "Relata o/a solicitante", "Informa a parte solicitante" ou "Solicita a presença da viatura".\n6 - SAÍDA EXCLUSIVA: Retorne APENAS o texto corrigido, sem comentários adicionais.';
    document.getElementById('modalConfigPui').style.display = 'flex';
}

function salvarConfigPui() {
    localStorage.setItem('gk', document.getElementById('puiApiKey').value.trim());
    localStorage.setItem('gp', document.getElementById('puiPrompt').value.trim());
    fecharModal('modalConfigPui');
}
function desfazerPui() { if(txtOrigPui) { document.getElementById('ocRelato').value = txtOrigPui; document.getElementById('btnDesfazerPui').disabled = true; } }

async function aplicarPui() {
    const k = localStorage.getItem('gk'); if(!k) return alert('Configure API Key Groq');
    const promptSys = localStorage.getItem('gp') || 'Aja como um sistema de correção de texto para despachos policiais (190). Sua única função é reescrever o relato fornecido para torná-lo formal, impessoal e técnico, seguindo o padrão culto da língua portuguesa.\n\nRegras Rígidas:\n1 - SEM TÍTULOS OU INTRODUÇÕES: Não coloque cabeçalhos como "Relatório de Ocorrência". Comece o texto diretamente pela narrativa.\n2 - CONCORDÂNCIA DE GÊNERO: Identifique se o relato original se refere a uma solicitante (feminino) ou um solicitante (masculino). Mantenha rigorosamente o gênero original. Se o texto mencionar "A solicitante", o texto corrigido deve manter "A solicitante" e todas as concordâncias femininas.\n3 - TERMOS TÉCNICOS: Substitua termos informais por técnicos (ex: "perturbando" por "perturbação do sossego alheio", "solicitante informa" por "Relata o/a solicitante").\n4 - FIDELIDADE AOS FATOS: Mantenha os fatos estritamente como narrados, sem inventar informações.\n5 - EVITE PLEONASMOS: Jamais utilize "O/A solicitante solicita". Prefira "Relata o/a solicitante", "Informa a parte solicitante" ou "Solicita a presença da viatura".\n6 - SAÍDA EXCLUSIVA: Retorne APENAS o texto corrigido, sem comentários adicionais.';
    const ta = document.getElementById('ocRelato'); const txt = ta.value; if(!txt.trim()) return;
    
    let mask = txt; const map = { d: [], p: [] };
    mask = mask.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b|\b\d{1,2}\.\d{3}\.\d{3}-[A-Za-z0-9]{1}\b/g, m => { map.d.push(m); return `{{D_${map.d.length-1}}}`; });
    mask = mask.replace(/\b[A-Z]{3}[0-9][0-9A-Z][0-9]{2}\b|\b[A-Z]{3}-?\d{4}\b/gi, m => { map.p.push(m); return `{{P_${map.p.length-1}}}`; });
    
    txtOrigPui = txt; ta.value = 'IA PROCESSANDO...';
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{role: "system", content: promptSys}, {role: "user", content: mask}], temperature: 0.2, max_tokens: 1000 }) });
        let fim = (await res.json()).choices[0].message.content.toUpperCase();
        map.d.forEach((v,i)=> fim = fim.replace(`{{D_${i}}}`, v)); map.p.forEach((v,i)=> fim = fim.replace(`{{P_${i}}}`, v.toUpperCase()));
        ta.value = fim; document.getElementById('btnDesfazerPui').disabled = false;
    } catch(e) { ta.value = txtOrigPui; alert('Erro IA'); }
}

        window.onload = function() {
            // Carregar preferência de tema
            const temaSalvo = localStorage.getItem('piabi_theme');
            if(temaSalvo === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.getElementById('themeToggleBtn').className = 'fas fa-sun';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                document.getElementById('themeToggleBtn').className = 'fas fa-moon';
            }
            
            const sessao = localStorage.getItem('piabi_user');
            if(sessao) { usuarioAtual = JSON.parse(sessao); mostrarApp(); } 
            else { document.getElementById('login-wrapper').style.display = 'flex'; }
            
            // Loop de atualização de dados do monitoramento a cada 60 segundos (busca no banco)
            setInterval(() => { const vm = document.getElementById('view-monitoramento'); if(vm && !vm.classList.contains('hidden')) carregarMonitoramento(); }, 60000);
            
            // Loop de atualização visual dos timers a cada 1 segundo (sem piscagem)
            setInterval(() => { const vm = document.getElementById('view-monitoramento'); if(vm && !vm.classList.contains('hidden')) atualizarTimersMonitoramento(); }, 1000);
            
            // Loop de atualização automática dos alertas a cada 60 segundos
            setInterval(() => { const va = document.getElementById('view-alertas'); if(va && !va.classList.contains('hidden')) carregarAlertas(); }, 60000);

            // Permite desmarcar rádios com duplo clique (ou clique sobre já selecionado)
            document.querySelectorAll('.tag-radio').forEach(radio => {
                radio.addEventListener('click', function(e) {
                    if (this.getAttribute('data-checked') === 'true') {
                        this.checked = false;
                        this.setAttribute('data-checked', 'false');
                    } else {
                        document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => r.setAttribute('data-checked', 'false'));
                        this.setAttribute('data-checked', 'true');
                    }
                });
            });
        }

        async function api(tabela, query, method='GET', body=null) {
            const opt = { method, headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' } };
            if(body) opt.body = JSON.stringify(body);
            const res = await fetch(`${PROJECT_URL}/rest/v1/${tabela}?${query}`, opt);
            if(!res.ok) {
                const erro = await res.json().catch(()=>({message:res.statusText}));
                throw new Error(erro.message || 'Erro na API');
            }
            // Retorna json se houver conteúdo, senão null (para DELETE)
            if(res.status === 204) return null;
            return await res.json();
        }

        function obterCodigoStatusOcorrencia(oc) {
            // Retorna APENAS o código de status (C/D/L/S) - para futuras implementações
            // C = CRIADA | D = DESPACHADA | L = NO LOCAL | S = SAIU
            
            if (oc.hora_saida) return 'S';
            if (oc.hora_local) return 'L';
            if (oc.hora_despacho) return 'D';
            return 'C';
        }

        function calcularTimerTatico(oc) {
            // Calcula timer baseado na última atualização de status
            // Hierarquia: S > L > D > C (usa a mais recente)
            
            let baseTimeStr = oc.criado_em; // Padrão: Hora de criação

            if (oc.hora_saida) {
                baseTimeStr = oc.hora_saida;
            } else if (oc.hora_local) {
                baseTimeStr = oc.hora_local;
            } else if (oc.hora_despacho) {
                baseTimeStr = oc.hora_despacho;
            }

            if (!baseTimeStr) return '--/-- --:--';

            const baseTime = new Date(baseTimeStr);
            const agora = new Date();
            const diffMs = agora - baseTime;
            const diffMinutes = Math.floor(diffMs / 60000);

            const dia = String(baseTime.getDate()).padStart(2, '0');
            const mes = String(baseTime.getMonth() + 1).padStart(2, '0');
            const hora = String(baseTime.getHours()).padStart(2, '0');
            const min = String(baseTime.getMinutes()).padStart(2, '0');
            const dataHoraFmt = `${dia}/${mes} ${hora}:${min}`;

            let duracaoFmt = `${diffMinutes}m`;
            if (diffMinutes >= 60) {
                const h = Math.floor(diffMinutes / 60);
                const m = diffMinutes % 60;
                duracaoFmt = `${h}h ${m}m`;
            }

            return `${dataHoraFmt} (${duracaoFmt})`;
        }

        function obterHoraCriacao(oc) {
            // Retorna apenas data/hora de criação sem duração
            if (!oc.criado_em) return '--/-- --:--';
            const dataHora = new Date(oc.criado_em);
            const dia = String(dataHora.getDate()).padStart(2, '0');
            const mes = String(dataHora.getMonth() + 1).padStart(2, '0');
            const hora = String(dataHora.getHours()).padStart(2, '0');
            const min = String(dataHora.getMinutes()).padStart(2, '0');
            return `${dia}/${mes} ${hora}:${min}`;
        }

        function obterDuracaoUltimaAtualizacao(oc) {
            // Retorna a duração desde a ÚLTIMA atualização de status
            // Hierarquia: hora_saida > hora_local > hora_despacho > criado_em
            let baseTimeStr = oc.criado_em;
            
            if (oc.hora_saida) baseTimeStr = oc.hora_saida;
            else if (oc.hora_local) baseTimeStr = oc.hora_local;
            else if (oc.hora_despacho) baseTimeStr = oc.hora_despacho;
            
            if (!baseTimeStr) return '(00m)';
            
            const baseTime = new Date(baseTimeStr);
            const agora = new Date();
            const diffMs = agora - baseTime;
            const diffMinutes = Math.floor(diffMs / 60000);
            
            if (diffMinutes >= 60) {
                const h = Math.floor(diffMinutes / 60);
                const m = diffMinutes % 60;
                return `(${h}h ${m}m)`;
            }
            return `(${diffMinutes >= 0 ? diffMinutes : 0}m)`;
        }

        function navegar(tela) {
            // Guardrails por perfil
            const perfil = usuarioAtual?.perfil_acesso;
            if (perfil === 'MODERADOR' && tela !== 'moderador') tela = 'moderador';
            if (perfil === 'Admin' && tela === 'moderador') tela = 'atendimento';
            if (perfil !== 'Admin' && perfil !== 'MODERADOR' && ['admin','moderador'].includes(tela)) tela = 'atendimento';

            ['atendimento', 'triagem', 'monitoramento', 'frota', 'alertas', 'admin', 'moderador'].forEach(t => {
                const el = document.getElementById('view-'+t);
                const nav = document.getElementById('nav-'+t);
                if(el) el.classList.add('hidden');
                if(nav) nav.classList.remove('active');
            });
            
            const view = document.getElementById('view-'+tela);
            if(view) view.classList.remove('hidden');
            
            const nav = document.getElementById('nav-'+tela);
            if(nav) nav.classList.add('active');
            
            // Carregamentos específicos
            if(tela === 'triagem') carregarTriagem();
            if(tela === 'monitoramento') { carregarMonitoramento(); expandMob('wait'); }
            if(tela === 'frota') carregarFrota();
            if(tela === 'alertas') { carregarAlertas(); }
            if(tela === 'admin') {
                // Abre aba usuários por padrão se nenhuma estiver ativa
                if(document.getElementById('admin-usuarios').classList.contains('hidden')) adminSwitch('usuarios');
            }
            if(tela === 'moderador') carregarUsuariosModerador();
        }

        function expandMob(side) {
            if(side === 'wait') {
                document.getElementById('mob-panel-wait').className = 'sliding-panel panel-expanded';
                document.getElementById('mob-panel-active').className = 'sliding-panel panel-collapsed';
            } else {
                document.getElementById('mob-panel-wait').className = 'sliding-panel panel-collapsed';
                document.getElementById('mob-panel-active').className = 'sliding-panel panel-expanded';
            }
        }

        function mostrarApp() {
            document.getElementById('login-wrapper').style.display='none';
            document.getElementById('app-wrapper').classList.remove('hidden');
            document.getElementById('userAvatar').innerText=usuarioAtual.nome_guerra[0];

            // Controle de visibilidade da navbar por perfil
            const perfil = usuarioAtual.perfil_acesso;
            const todosNavIds = ['atendimento','triagem','monitoramento','frota','alertas','admin','moderador'];
            const permitidos = perfil === 'MODERADOR'
                ? ['moderador']
                : perfil === 'Admin'
                    ? ['atendimento','triagem','monitoramento','frota','alertas','admin']
                    : ['atendimento','triagem','monitoramento','frota','alertas'];

            todosNavIds.forEach(id => {
                const el = document.getElementById('nav-' + id);
                if(el) el.classList.toggle('hidden', !permitidos.includes(id));
            });

            navegar('atendimento'); // navegar() redireciona para 'moderador' se perfil for MODERADOR
            // Carregar o radar com filtro de agência correto após login
            if(typeof carregarOcorrenciasParaRadar === 'function') carregarOcorrenciasParaRadar();
        }

        // --- PERFIL DO USUÁRIO ---
        function abrirModalPerfil() {
            if(!usuarioAtual) return;
            // Preencher dados somente leitura
            const cpf = usuarioAtual.cpf_login || '---';
            const cpfFmt = cpf.length === 11 ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
            document.getElementById('pf_cpf').innerText = cpfFmt;
            document.getElementById('pf_perfil').innerText = usuarioAtual.perfil_acesso || '---';
            document.getElementById('pf_agencia').innerText = usuarioAtual.agencia || '---';
            document.getElementById('pf_uf').innerText = usuarioAtual.uf_origem || '---';
            document.getElementById('pf_cidade').innerText = usuarioAtual.cidade_origem || 'ESTADUAL';
            
            const statusEl = document.getElementById('pf_status');
            const st = usuarioAtual.status_conta || '---';
            statusEl.innerText = st;
            statusEl.style.color = st === 'VALIDADO' ? 'var(--success)' : st === 'PENDENTE' ? 'var(--warning)' : st === 'BLOQUEADO' ? 'var(--danger)' : 'var(--text-light)';

            // Preencher dados editáveis
            document.getElementById('pf_nome_completo').value = usuarioAtual.nome_completo || '';
            document.getElementById('pf_nome_guerra').value = usuarioAtual.nome_guerra || '';
            document.getElementById('pf_senha').value = '';

            document.getElementById('modalPerfil').style.display = 'flex';
        }

        async function salvarPerfil() {
            const nomeCompleto = document.getElementById('pf_nome_completo').value.trim();
            const nomeGuerra = document.getElementById('pf_nome_guerra').value.trim();
            const novaSenha = document.getElementById('pf_senha').value;

            if(!nomeCompleto || !nomeGuerra) {
                alert('Nome Completo e Nome de Guerra são obrigatórios.');
                return;
            }

            const payload = {
                nome_completo: nomeCompleto,
                nome_guerra: nomeGuerra
            };
            if(novaSenha) payload.senha = novaSenha;

            try {
                await api('tb_usuarios', `id=eq.${usuarioAtual.id}`, 'PATCH', payload);
                // Atualizar dados locais
                usuarioAtual.nome_completo = nomeCompleto;
                usuarioAtual.nome_guerra = nomeGuerra;
                if(novaSenha) usuarioAtual.senha = novaSenha;
                localStorage.setItem('piabi_user', JSON.stringify(usuarioAtual));
                // Atualizar avatar
                document.getElementById('userAvatar').innerText = nomeGuerra[0];
                alert('Perfil atualizado com sucesso!');
                fecharModal('modalPerfil');
            } catch(e) {
                alert('Erro ao salvar perfil: ' + e.message);
            }
        }

        function logout() { localStorage.removeItem('piabi_user'); window.location.reload(); }
        function toggleTheme() { 
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            const btn = document.getElementById('themeToggleBtn');
            btn.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('piabi_theme', newTheme);
        }
        
        async function handleLogin(e) { 
            e.preventDefault(); 
            const u=document.getElementById('loginUser').value.replace(/\D/g,''); 
            const p=document.getElementById('loginPass').value; 
            try{ 
                const d=await api('tb_usuarios', `cpf_login=eq.${u}&senha=eq.${p}&select=*`); 
                if(!d.length) throw new Error('Dados inválidos');
                if(d[0].status_conta!=='VALIDADO') throw new Error('Conta aguardando aprovação'); 
                usuarioAtual=d[0]; 
                localStorage.setItem('piabi_user', JSON.stringify(usuarioAtual)); 
                mostrarApp(); 
            } catch(e){ alert(e.message); } 
        }

        // --- FUNÇÕES PARA SOLICITAR ACESSO ---
        function abrirModalCadastro() {
            // Limpar campos do modal
            document.getElementById('cad_chave').value = '';
            document.getElementById('cad_nome').value = '';
            document.getElementById('cad_guerra').value = '';
            document.getElementById('cad_cpf').value = '';
            document.getElementById('cad_senha').value = '';
            // Abrir modal
            document.getElementById('modalCadastro').style.display = 'flex';
        }

        async function solicitarCadastro() {
            const cad_agencia = document.getElementById('cad_agencia') ? document.getElementById('cad_agencia').value : '';
            const cad_uf = document.getElementById('cad_uf') ? document.getElementById('cad_uf').value : '';
            const cad_cidade = document.getElementById('cad_cidade') ? document.getElementById('cad_cidade').value.trim().toUpperCase() : '';

            const chave = document.getElementById('cad_chave').value.trim();
            const nome = document.getElementById('cad_nome').value.trim();
            const guerra = document.getElementById('cad_guerra').value.trim();
            const cpf = document.getElementById('cad_cpf').value.replace(/\D/g, '');
            const senha = document.getElementById('cad_senha').value;

            // Validações
            if(!cad_agencia || !cad_uf || !nome || !guerra || !cpf || !senha) {
                alert('Preencha os dados da Agência, UF e todos os campos obrigatórios.');
                return;
            }

            if(cpf.length !== 11) {
                alert('CPF deve conter 11 dígitos.');
                return;
            }

            let status = 'PENDENTE';
            let perfil = 'ATENDENTE';

            try {
                // Se chave foi fornecida, validar
                if(chave) {
                    const k = await api('tb_chaves_acesso', `codigo=eq.${chave}&ativa=eq.true&select=*`);
                    if(k.length > 0) {
                        // Verificar restrição de cidade da chave
                        const restricaoCidade = (k[0].cidade_restricao || '').trim().toUpperCase();
                        if(restricaoCidade) {
                            const cidadeInformada = cad_cidade.trim().toUpperCase();
                            if(cidadeInformada !== restricaoCidade) {
                                alert(`❌ Esta chave de acesso só pode ser utilizada para cadastros na cidade de ${restricaoCidade}.\n\nInforme a cidade correta no campo "Jurisdição Municipal".`);
                                return;
                            }
                        }
                        status = 'VALIDADO';
                        if(k[0].perfil_padrao) perfil = k[0].perfil_padrao;
                    } else {
                        alert('Chave de acesso inválida ou inativa.');
                        return;
                    }
                }

                await api('tb_usuarios', '', 'POST', {
                    nome_completo: nome,
                    nome_guerra: guerra,
                    cpf_login: cpf,
                    senha: senha,
                    perfil_acesso: perfil,
                    status_conta: status,
                    agencia: cad_agencia,
                    uf_origem: cad_uf,
                    cidade_origem: cad_cidade
                });

                const msg = status === 'VALIDADO' 
                    ? 'Cadastro aprovado! Você pode fazer login agora.' 
                    : 'Solicitação enviada com sucesso. Aguarde aprovação do administrador.';
                alert(msg);
                fecharModal('modalCadastro');
            } catch(e) {
                alert('Erro ao cadastrar: ' + e.message);
            }
        }

        // --- ATENDIMENTO ---
        async function buscarCep(cep) { cep=cep.replace(/\D/g,''); if(cep.length!==8)return; try{const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`);const d=await r.json();if(!d.erro){ document.getElementById('endLog').value=d.logradouro; document.getElementById('endBairro').value=d.bairro; document.getElementById('endCidade').value=d.localidade; }}catch(e){} }

        // --- HELPERS DE AGÊNCIA ---
        function _agenciaOrigem() {
            const agencia = usuarioAtual?.agencia || 'SISTEMA';
            const cidade  = (usuarioAtual?.cidade_origem || '').trim().toUpperCase();
            return cidade ? `${agencia}-${cidade}` : agencia;
            // Ex: GM Curitiba → 'GM-CURITIBA' | PM estadual → 'PM'
        }

        function _confirmarForaDeArea() {
            const cidadeAgencia = (usuarioAtual?.cidade_origem || '').trim().toUpperCase();
            if(!cidadeAgencia) return true; // Estadual → sem restrição
            const cidadeOco = (document.getElementById('endCidade')?.value || '').trim().toUpperCase();
            if(!cidadeOco || cidadeOco === cidadeAgencia) return true; // Mesma cidade → ok
            const agencia = usuarioAtual?.agencia || 'sua agência';
            return confirm(
                `⚠️ Registro fora da área de atuação\n\n` +
                `Esta ocorrência está sendo registrada em ${cidadeOco}, ` +
                `fora da área de atuação da ${agencia} de ${cidadeAgencia}.\n\n` +
                `Deseja registrar assim mesmo?`
            );
        }

        function _filtroAgencia() {
            const ao = _agenciaOrigem();
            return ao !== 'SISTEMA' ? `&agencia_origem=eq.${encodeURIComponent(ao)}` : '';
        }
        
        function mascaraTelefone(el) {
            if(!el) return;
            
            // Remove tudo que não for número
            let v = el.value.replace(/\D/g, '');
            
            // Limita a 11 dígitos no máximo
            v = v.substring(0, 11);
            
            let formatado = '';
            
            if (v.length === 0) {
                formatado = '';
            } else if (v.length <= 2) {
                formatado = '(' + v;
            } else if (v.length <= 6) {
                // Formato (XX) XXXX
                formatado = '(' + v.substring(0, 2) + ') ' + v.substring(2);
            } else if (v.length <= 10) {
                // Formato (XX) XXXX-XXXX (Fixo)
                formatado = '(' + v.substring(0, 2) + ') ' + v.substring(2, 6) + '-' + v.substring(6);
            } else {
                // Formato (XX) XXXXX-XXXX (Celular)
                formatado = '(' + v.substring(0, 2) + ') ' + v.substring(2, 7) + '-' + v.substring(7);
            }
            
            el.value = formatado;
        }

        // Função: adicionar "Sem ponto de referência" ao campo endRef
        function adicionarSemPontoReferencia() {
            const inp = document.getElementById('endRef');
            if(!inp) return;
            const suffix = 'SEM PONTO DE REFERÊNCIA';
            if(!inp.value || inp.value.trim() === '') {
                inp.value = suffix;
            } else {
                // Evita duplicar o mesmo sufixo
                if(inp.value.includes(suffix)) return;
                inp.value = inp.value + ' - ' + suffix;
            }
        }

        function abrirMapaAtendimento() {
            const logradouro = document.getElementById('endLog').value.trim();
            const numero = document.getElementById('endNum').value.trim();
            const bairro = document.getElementById('endBairro').value.trim();
            const cidade = document.getElementById('endCidade').value.trim();
            
            if(!logradouro && !cidade) {
                alert('Preencha ao menos o logradouro ou a cidade para abrir o mapa.');
                return;
            }
            
            // Monta o endereço de forma inteligente ignorando campos vazios
            const partes = [];
            if(logradouro) partes.push(logradouro);
            if(numero) partes.push(numero);
            if(bairro) partes.push('- ' + bairro);
            if(cidade) partes.push(cidade);
            
            const enderecoFormatado = partes.join(', ');
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoFormatado)}`, '_blank');
        }

        let timeoutLog; 
        function sugerirLogradouro(txt) { 
            clearTimeout(timeoutLog); 
            const box = document.getElementById('sugestoesLog'); 
            const cid = document.getElementById('endCidade').value; 
            if(txt.length < 3 || !cid) { 
                box.classList.add('hidden'); 
                return; 
            } 
            timeoutLog = setTimeout(async () => { 
                try {
                    const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(txt + ", " + cid + ", Parana")}&osm_tag=highway&limit=5`);
                    const d = await r.json();
                    box.innerHTML = '';
                    if(d.features && d.features.length) {
                        const added = new Set();
                        d.features.forEach(f => {
                            const streetName = f.properties.name || f.properties.street;
                            if(!streetName || added.has(streetName)) return;
                            added.add(streetName);
                            const div = document.createElement('div');
                            div.className = 'sugg-item';
                            div.innerText = streetName;
                            div.onclick = () => {
                                document.getElementById('endLog').value = div.innerText;
                                box.classList.add('hidden');
                                const numEl = document.getElementById('endNum');
                                if(numEl) numEl.focus();
                                if(typeof renderizarRadarLateral === 'function') renderizarRadarLateral();
                            };
                            box.appendChild(div);
                        });
                        if(added.size > 0) box.classList.remove('hidden');
                        else box.classList.add('hidden');
                    } else {
                        box.classList.add('hidden');
                    }
                } catch(e) { box.classList.add('hidden'); } 
            }, 300); 
        }

        function _sugNorm(str) { return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase() : ''; }

        let timeoutCid; 
        function sugerirCidade(txt) { 
            clearTimeout(timeoutCid); 
            const box = document.getElementById('sugestoesCidade'); 
            if(!box) return;
            const termo = _sugNorm(txt);
            if(termo.length < 2) { box.classList.add('hidden'); return; } 
            
            timeoutCid = setTimeout(() => { 
                try {
                    const matches = cidadesPR.filter(c => _sugNorm(c).includes(termo)).slice(0, 10);
                    box.innerHTML = ''; 
                    if(matches.length){
                        box.classList.remove('hidden');
                        matches.forEach(c => {
                            const div = document.createElement('div');
                            div.className = 'sugg-item';
                            div.innerText = c;
                            div.onclick = () => { 
                                document.getElementById('endCidade').value = div.innerText; 
                                box.classList.add('hidden'); 
                                const endBairro = document.getElementById('endBairro');
                                if(endBairro) endBairro.focus();
                                if(typeof renderizarRadarLateral === 'function') renderizarRadarLateral();
                            };
                            box.appendChild(div);
                        });
                    } else { box.classList.add('hidden'); }
                } catch(e) { box.classList.add('hidden'); }
            }, 300); 
        }

        let timeoutBairro; 
        function sugerirBairro(txt) { 
            clearTimeout(timeoutBairro); 
            const box = document.getElementById('sugestoesBairro'); 
            if(!box) return;
            const termo = _sugNorm(txt);
            const cid = document.getElementById('endCidade').value;
            
            if(termo.length < 1 || !cid) { box.classList.add('hidden'); return; } 
            
            const cidNorm = _sugNorm(cid);
            const bairrosDaCidade = localidadesPR[cidNorm];
            if(!bairrosDaCidade) { box.classList.add('hidden'); return; }
            
            timeoutBairro = setTimeout(() => { 
                try {
                    const matches = bairrosDaCidade.filter(b => _sugNorm(b).includes(termo)).slice(0, 15);
                    box.innerHTML = ''; 
                    if(matches.length){
                        box.classList.remove('hidden');
                        matches.forEach(b => {
                            const div = document.createElement('div');
                            div.className = 'sugg-item';
                            div.innerText = b;
                            div.onclick = () => { 
                                document.getElementById('endBairro').value = div.innerText; 
                                box.classList.add('hidden'); 
                                if(typeof renderizarRadarLateral === 'function') renderizarRadarLateral();
                            };
                            box.appendChild(div);
                        });
                    } else { box.classList.add('hidden'); }
                } catch(e) { box.classList.add('hidden'); }
            }, 300); 
        }
        // lista de naturezas estática para autocomplete
        const naturezasList = [
            "ABORDAGEM DE SUSPEITOS",
            "ACIDENTE DE TRÂNSITO",
            "AMEAÇA",
            "APOIO AO SAMU",
            "APOIO A OUTROS ORGÃOS",
            "APOIO A OUTRA OPM",
            "CONSUMO DE ENTORPECENTES",
            "DANO",
            "DESAPARECIMENTO DE PESSOA",
            "DESCUMPRIMENTO DE MEDIDA PROTETIVA",
            "DISPARO DE ALARME",
            "ESTELIONATO",
            "FURTO",
            "FURTO OU ROUBO DE VEÍCULOS",
            "INFRAÇÃO DE TRÂNSITO",
            "PERTURBAÇÃO DO TRABALHO OU SOSSEGO ALHEIO",
            "POLICIAMENTO PRESENÇA",
            "ROUBO",
            "SUICÍDIO",
            "TRÁFICO DE ENTORPECENTES",
            "VIOLÊNCIA DOMÉSTICA E FAMILIAR"
        ];
        
        // controle de navegação por teclado
        let naturezaNavIndex = -1;
        let naturezaCurrentMatches = [];
        
        function renderNaturezaMatches(matches) {
            const box = document.getElementById('sugestoesNatureza');
            naturezaCurrentMatches = matches;
            naturezaNavIndex = -1;
            box.innerHTML = '';
            matches.forEach((n,i) => {
                const div = document.createElement('div');
                div.className = 'sugg-item';
                div.innerText = n;
                div.dataset.index = i;
                div.onclick = () => selectNatureza(n);
                box.appendChild(div);
            });
        }
        
        function selectNatureza(val) {
            document.getElementById('ocNatureza').value = val;
            const box = document.getElementById('sugestoesNatureza');
            box.classList.add('hidden');
        }
        
        function updateNaturezaHighlight() {
            const box = document.getElementById('sugestoesNatureza');
            const items = box.querySelectorAll('.sugg-item');
            items.forEach((el,i) => {
                if(i === naturezaNavIndex) el.style.background = 'var(--bg-hover)';
                else el.style.background = '';
            });
        }
        
        document.getElementById('ocNatureza').addEventListener('keydown', function(e) {
            const box = document.getElementById('sugestoesNatureza');
            if(box.classList.contains('hidden')) return;
            if(e.key === 'ArrowDown') {
                e.preventDefault();
                if(naturezaNavIndex < naturezaCurrentMatches.length - 1) {
                    naturezaNavIndex++;
                    updateNaturezaHighlight();
                }
            } else if(e.key === 'ArrowUp') {
                e.preventDefault();
                if(naturezaNavIndex > 0) {
                    naturezaNavIndex--;
                    updateNaturezaHighlight();
                }
            } else if(e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if(naturezaNavIndex >= 0) selectNatureza(naturezaCurrentMatches[naturezaNavIndex]);
                else if(naturezaCurrentMatches.length > 0) selectNatureza(naturezaCurrentMatches[0]);
                document.getElementById('ocRelato').focus();
            }
        });
        
        function sugerirNatureza(txt) {
            const box = document.getElementById('sugestoesNatureza');
            if (!txt || txt.length < 1) {
                box.classList.add('hidden');
                return;
            }
            const filtro = txt.toUpperCase();
            const matches = naturezasList.filter(n => n.includes(filtro));
            if (matches.length) {
                box.classList.remove('hidden');
                renderNaturezaMatches(matches);
            } else {
                box.classList.add('hidden');
            }
        }
        
        // esconder sugestões quando clicar fora
        document.addEventListener('click', function(e){
            if(!e.target.closest('#ocNatureza') && !e.target.closest('#sugestoesNatureza')){
                const b = document.getElementById('sugestoesNatureza');
                if(b) b.classList.add('hidden');
            }
        });
        async function consultarPlacaApi() {
            const el = document.getElementById('vPlaca');
            const p = el.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
            if(!p || p.length < 7) { 
                el.style.backgroundColor = 'var(--input-bg)'; 
                document.getElementById('vDesc').value = '';
                return; 
            }
            
            try {
                // Utiliza o proxy nativo do Netlify
                const res = await fetch(`/api-placa/${p}`);
                
                if(res.ok) {
                    const data = await res.json();
                    document.getElementById('vDesc').value = `${data.marca} ${data.modelo} - ${data.cor} - ${data.ano}`;
                    el.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                } else {
                    el.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    document.getElementById('vDesc').value = '';
                }
            } catch(e) {
                el.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                document.getElementById('vDesc').value = '';
                console.error('Erro na API de Placas:', e);
            }
        }

        function addVeiculo() {
            const p = document.getElementById('vPlaca').value.toUpperCase();
            const d = document.getElementById('vDesc').value.toUpperCase();
            if(p || d) {
                veiculosArray.push({placa: p || 'S/P', desc: d || 'SEM DESCRIÇÃO'});
                renderList('listaVeiculos', veiculosArray);
                document.getElementById('vPlaca').value = '';
                document.getElementById('vDesc').value = '';
                document.getElementById('vPlaca').style.backgroundColor = 'var(--input-bg)';
            }
        }
        function fecharModal(id) { 
            document.getElementById(id).style.display='none'; 
            // Limpar timers ativos
            if(id === 'modalOcorrencia' && timerIntervalOcorrencia) {
                clearInterval(timerIntervalOcorrencia);
                timerIntervalOcorrencia = null;
            }
        }
        function addSuspeito() { 
            const v = document.getElementById('sNome').value.toUpperCase(); 
            if(v) { 
                suspeitosArray.push(v); 
                renderList('listaSuspeitos', suspeitosArray); 
                document.getElementById('sNome').value=''; 
            } 
        }
        function renderList(id, arr) { document.getElementById(id).innerHTML=arr.map((x,i)=>`<div class="list-entry"><span>${x.placa?`[${x.placa}] ${x.desc}`:x}</span><i class="fas fa-times remove-btn" onclick="removeItem('${id}',${i})"></i></div>`).join(''); }
        function removeItem(id,i) { if(id==='listaVeiculos')veiculosArray.splice(i,1); else suspeitosArray.splice(i,1); renderList(id,id==='listaVeiculos'?veiculosArray:suspeitosArray); }
        function toggleAnonimoBtn() { 
            const el = document.getElementById('solNome'); 
            el.value = (el.value === 'ANÔNIMO') ? '' : 'ANÔNIMO'; 
        }
        function limparAtendimento() { document.forms[1].reset(); veiculosArray=[]; suspeitosArray=[]; renderList('listaVeiculos',[]); renderList('listaSuspeitos',[]); idEmEdicao=null; ocoAtual=null; }
        
        function calcularRisco(tags) {
            const critic = ['ARMA DE FOGO', 'ARMA BRANCA', 'EXPLOSIVO', 'EM ANDAMENTO', 'FERIDOS (SIM)', 'ARMADO (SIM)'];
            return tags.some(t => critic.includes(t)) ? 'CRITICA' : 'NORMAL';
        }

        async function salvar(destino) {
            const btn = destino==='TRIAGEM'?document.getElementById('btnTriagem'):document.getElementById('btnGerar'); btn.innerText='...'; btn.disabled=true;
            if(document.getElementById('vPlaca').value || document.getElementById('vDesc').value) addVeiculo();
            if(document.getElementById('sNome').value) addSuspeito();
            const checks = Array.from(document.querySelectorAll('.tag-check:checked')).map(c=>c.value);
            const radios = Array.from(document.querySelectorAll('.tag-radio:checked, .sade-radio:checked')).map(c=>c.value);
            const tags = [...checks, ...radios];
            
            const dados = {
                solicitante: {
                    nome: document.getElementById('solNome').value.toUpperCase(),
                    telefone: document.getElementById('solTel').value
                },
                endereco: {
                    cep: document.getElementById('endCep').value,
                    cidade: document.getElementById('endCidade').value.toUpperCase(),
                    logradouro: document.getElementById('endLog').value.toUpperCase(),
                    numero: document.getElementById('endNum').value.toUpperCase(),
                    bairro: document.getElementById('endBairro').value.toUpperCase(),
                    referencia: document.getElementById('endRef').value.toUpperCase(),
                    formatado: `${document.getElementById('endLog').value.toUpperCase()}, ${document.getElementById('endNum').value.toUpperCase()} - ${document.getElementById('endBairro').value.toUpperCase()}, ${document.getElementById('endCidade').value.toUpperCase()}`
                },
                classificacoes: tags,
                veiculos: veiculosArray.map(v => ({ placa: v.placa ? v.placa.toUpperCase() : v.placa, desc: v.desc ? v.desc.toUpperCase() : v.desc })),
                suspeitos: suspeitosArray.map(s => s ? s.toUpperCase() : s),
                natureza: document.getElementById('ocNatureza').value.toUpperCase(),
                prioridade: calcularRisco(tags)
            };
            // Verificar se ocorrência está fora da área de atuação
            if(!_confirmarForaDeArea()) {
                btn.innerText = destino==='TRIAGEM' ? 'TRIAGEM' : 'GERAR OCORRÊNCIA';
                btn.disabled = false;
                return;
            }

            const payload = {
                atendente_origem_id: usuarioAtual.id,
                agencia_origem: _agenciaOrigem(),
                status: destino === 'TRIAGEM' ? 'EM_TRIAGEM' : 'AGUARDANDO',
                resumo_texto: document.getElementById('ocRelato').value.toUpperCase(),
                dados_preenchidos: dados
            };

            if (idEmEdicao && ocoAtual && ocoAtual.status === 'EM_TRIAGEM' && destino === 'DESPACHO') {
                payload.criado_em = new Date().toISOString();
            }

            try {
                if(idEmEdicao) await api('tb_triagem', `id=eq.${idEmEdicao}`, 'PATCH', payload);
                else await api('tb_triagem', '', 'POST', payload);
                alert('Salvo!'); limparAtendimento(); navegar('atendimento');
            } catch(e){ alert(e.message); } finally { btn.innerText = destino==='TRIAGEM' ? 'TRIAGEM' : 'GERAR OCORRÊNCIA'; btn.disabled=false; }
        }

        // Armazenar ID da última ocorrência gerada para complementação
        let ultimaOcorrenciaGerada = null;

        async function salvarComplementar() {
            const btn = document.getElementById('btnGerarComplementar'); btn.innerText='...'; btn.disabled=true;
            if(document.getElementById('vPlaca').value || document.getElementById('vDesc').value) addVeiculo();
            if(document.getElementById('sNome').value) addSuspeito();
            const checks = Array.from(document.querySelectorAll('.tag-check:checked')).map(c=>c.value);
            const radios = Array.from(document.querySelectorAll('.tag-radio:checked, .sade-radio:checked')).map(c=>c.value);
            const tags = [...checks, ...radios];
            
            const dados = {
                solicitante: {
                    nome: document.getElementById('solNome').value.toUpperCase(),
                    telefone: document.getElementById('solTel').value
                },
                endereco: {
                    cep: document.getElementById('endCep').value,
                    cidade: document.getElementById('endCidade').value.toUpperCase(),
                    logradouro: document.getElementById('endLog').value.toUpperCase(),
                    numero: document.getElementById('endNum').value.toUpperCase(),
                    bairro: document.getElementById('endBairro').value.toUpperCase(),
                    referencia: document.getElementById('endRef').value.toUpperCase(),
                    formatado: `${document.getElementById('endLog').value.toUpperCase()}, ${document.getElementById('endNum').value.toUpperCase()} - ${document.getElementById('endBairro').value.toUpperCase()}, ${document.getElementById('endCidade').value.toUpperCase()}`
                },
                classificacoes: tags,
                veiculos: veiculosArray.map(v => ({ placa: v.placa ? v.placa.toUpperCase() : v.placa, desc: v.desc ? v.desc.toUpperCase() : v.desc })),
                suspeitos: suspeitosArray.map(s => s ? s.toUpperCase() : s),
                natureza: document.getElementById('ocNatureza').value.toUpperCase(),
                prioridade: calcularRisco(tags)
            };
            // Verificar se ocorrência está fora da área de atuação
            if(!_confirmarForaDeArea()) {
                btn.innerText = 'GERAR E COMPLEMENTAR';
                btn.disabled = false;
                return;
            }

            const payload = {
                atendente_origem_id: usuarioAtual.id,
                agencia_origem: _agenciaOrigem(),
                status: 'AGUARDANDO',
                resumo_texto: document.getElementById('ocRelato').value.toUpperCase(),
                dados_preenchidos: dados
            };

            if (idEmEdicao && ocoAtual && ocoAtual.status === 'EM_TRIAGEM') {
                payload.criado_em = new Date().toISOString();
            }

            try {
                let resp;
                if(idEmEdicao) {
                    resp = await api('tb_triagem', `id=eq.${idEmEdicao}`, 'PATCH', payload);
                    ultimaOcorrenciaGerada = idEmEdicao;
                } else {
                    resp = await api('tb_triagem', '', 'POST', payload);
                    ultimaOcorrenciaGerada = resp[0]?.id || null;
                }
                
                if(ultimaOcorrenciaGerada) {
                    // Limpar campo de complemento
                    document.getElementById('comp_relato').value = '';
                    
                    // Limpar formulário de atendimento
                    limparAtendimento();
                    
                    // Abrir modal de complementação
                    document.getElementById('modalComplementacao').style.display = 'flex';
                } else {
                    alert('Ocorrência gerada, mas não foi possível abrir modal de complementação.');
                }
            } catch(e){ alert('Erro: '+e.message); } finally { btn.innerText='GERAR E COMPLEMENTAR'; btn.disabled=false; }
        }

        function abrirComplementoMonitoramento() {
            // Funciona para alertas e ocorrências (em monitoramento)
            const id = idAlertaAberto || idOcorrenciaAberta;
            if(!id) {
                alert('Nenhuma ocorrência aberta para complementar.');
                return;
            }
            ultimaOcorrenciaGerada = id;
            document.getElementById('comp_relato').value = '';
            document.getElementById('modalComplementacao').style.display = 'flex';
        }

        async function salvarComplementacaoFinal() {
            if(!ultimaOcorrenciaGerada) {
                alert('Erro: ID da ocorrência não encontrado.');
                return;
            }

            const relato = document.getElementById('comp_relato').value.toUpperCase();

            try {
                // Buscar ocorrência atual
                const ocorrencias = await api('tb_triagem', `id=eq.${ultimaOcorrenciaGerada}&select=*`);
                if(!ocorrencias || !ocorrencias.length) {
                    alert('Ocorrência não encontrada.');
                    return;
                }

                const oc = ocorrencias[0];
                const dados = oc.dados_preenchidos;

                // Atualizar com complementação (inclui horário)
                const horaAtual = new Date();
                const horaFormatada = horaAtual.getHours().toString().padStart(2, '0') + ':' + horaAtual.getMinutes().toString().padStart(2, '0');
                const novoResumo = oc.resumo_texto + (relato ? `\n\n[COMPLEMENTO - ${horaFormatada}]: ${relato}` : '');
                
                // TODO: Quando tb_ocorrencias_complementos existir, inserir registro lá também:
                // await api('tb_ocorrencias_complementos', '', 'POST', {
                //     ocorrencia_id: ultimaOcorrenciaGerada,
                //     tipo: 'COMPLEMENTO',
                //     texto: relato,
                //     criado_em: horaAtual
                // });
                
                await api('tb_triagem', `id=eq.${ultimaOcorrenciaGerada}`, 'PATCH', {
                    resumo_texto: novoResumo,
                    dados_preenchidos: dados
                });

                alert('Complementação salva!');
                fecharModal('modalComplementacao');
                if(document.getElementById('modalOcorrencia').style.display === 'flex') { abrirModalOcorrencia(ultimaOcorrenciaGerada); carregarMonitoramento(); }
                ultimaOcorrenciaGerada = null;
            } catch(e) {
                console.error('Erro ao salvar complementação:', e);
                alert('Erro ao salvar: '+e.message);
            }
        }

        async function salvarComoAlerta() {
            if(document.getElementById('vPlaca').value || document.getElementById('vDesc').value) addVeiculo();
            if(document.getElementById('sNome').value) addSuspeito();
            const checks = Array.from(document.querySelectorAll('.tag-check:checked')).map(c=>c.value);
            const radios = Array.from(document.querySelectorAll('.tag-radio:checked, .sade-radio:checked')).map(c=>c.value);
            const tags = [...checks, ...radios];
            
            const dados = {
                solicitante: {
                    nome: document.getElementById('solNome').value.toUpperCase(),
                    telefone: document.getElementById('solTel').value
                },
                endereco: {
                    cep: document.getElementById('endCep').value,
                    cidade: document.getElementById('endCidade').value.toUpperCase(),
                    logradouro: document.getElementById('endLog').value.toUpperCase(),
                    numero: document.getElementById('endNum').value.toUpperCase(),
                    bairro: document.getElementById('endBairro').value.toUpperCase(),
                    referencia: document.getElementById('endRef').value.toUpperCase(),
                    formatado: `${document.getElementById('endLog').value.toUpperCase()}, ${document.getElementById('endNum').value.toUpperCase()} - ${document.getElementById('endBairro').value.toUpperCase()}, ${document.getElementById('endCidade').value.toUpperCase()}`
                },
                classificacoes: tags,
                veiculos: veiculosArray.map(v => ({ placa: v.placa ? v.placa.toUpperCase() : v.placa, desc: v.desc ? v.desc.toUpperCase() : v.desc })),
                suspeitos: suspeitosArray.map(s => s ? s.toUpperCase() : s),
                natureza: document.getElementById('ocNatureza').value.toUpperCase(),
                prioridade: calcularRisco(tags)
            };
            // Verificar se ocorrência está fora da área de atuação
            if(!_confirmarForaDeArea()) return;

            const payload = {
                atendente_origem_id: usuarioAtual.id,
                agencia_origem: _agenciaOrigem(),
                status: 'ALERTA',
                resumo_texto: document.getElementById('ocRelato').value.toUpperCase(),
                dados_preenchidos: dados
            };
            try {
                if(idEmEdicao) await api('tb_triagem', `id=eq.${idEmEdicao}`, 'PATCH', payload);
                else await api('tb_triagem', '', 'POST', payload);
                alert('Alerta salvo!'); limparAtendimento(); navegar('atendimento');
            } catch(e){ alert(e.message); }
        }

        async function carregarAlertas() {
            const tbAlertas = document.getElementById('tableAlertas');
            const mobAlertas = document.getElementById('mobAletasBody');
            
            if(!tbAlertas || !mobAlertas) return;
            tbAlertas.innerHTML=''; mobAlertas.innerHTML='';
            
            try {
                const data = await api('tb_triagem', `status=eq.ALERTA&order=criado_em.desc${_filtroAgencia()}`);
                let ca=0;

                data.forEach(d => {
                    const info = d.dados_preenchidos;
                    const isCrit = info.prioridade==='CRITICA';
                    const icon = isCrit ? '🚨' : '⚠️';
                    
                    // Monta string de busca para filtro
                    const textoBusca = [
                        info.natureza, 
                        info.endereco.logradouro, 
                        info.endereco.bairro, 
                        info.solicitante.nome, 
                        info.solicitante.telefone
                    ].join(' ').toLowerCase().replace(/"/g, '');

                    const atributoBusca = `data-busca="${textoBusca}"`;

                    // ===== TABELA DESKTOP (ALERTAS) =====
                    const enderecoDicaCurtaAddress = `${info.endereco.logradouro}, ${info.endereco.numero}`;
                    
                    const tr = `<tr onclick="abrirModalAlerta('${d.id}')" style="cursor:pointer; ${isCrit?'color:#ff6b6b':''}" ${atributoBusca}>
        <td style="width:10%;">${icon}</td>
        <td style="width:25%;">${info.natureza}</td>
        <td style="width:15%;">${info.endereco.cidade}</td>
        <td style="width:20%;">${enderecoDicaCurtaAddress}</td>
        <td style="width:15%;">${info.endereco.bairro}</td>
        <td style="width:15%; font-weight:600; color:#8b5cf6;">${calcularTimerTatico(d)}</td>
    </tr>`;
                    
                    const card = `<div class="card-mobile" style="border-left-color:#8b5cf6" onclick="abrirModalAlerta('${d.id}')" ${atributoBusca}>
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-bottom:5px;"><span>${info.natureza}</span><span>${calcularTimerTatico(d)}</span></div>
        <div style="font-size:11px;color:#aaa;margin-bottom:5px;">${info.endereco.formatado}</div>
        <div style="display:flex;gap:5px;">
            ${isCrit ? `<span class="card-tag" style="background:var(--danger);color:white">CRÍTICO</span>` : ''}
            <a href="tel:+55${info.solicitante.telefone}" title="Ligar" style="color: var(--text-muted); font-size: 16px; margin-left: 10px; transition: 0.2s;"><i class="fas fa-phone"></i></a>
        </div>
    </div>`;
                    
                    tbAlertas.innerHTML+=tr; 
                    mobAlertas.innerHTML+=card; 
                    ca++;
                });
                
                document.getElementById('deskCountAlertas').innerText = ca;

            } catch(e) { console.log(e); }
        }

        function filtrarAlertas(termo) {
            const termo_lower = termo.toLowerCase();
            const linhas = document.querySelectorAll('#tableAlertas tr, #mobAletasBody .card-mobile');
            linhas.forEach(linha => {
                const busca = linha.getAttribute('data-busca') || '';
                linha.style.display = busca.includes(termo_lower) ? '' : 'none';
            });
        }

        async function promoverAlerta(id) {
            if(!confirm('Tem a certeza que deseja promover este Alerta a Ocorrência?')) return;
            try {
                // Atualiza o status para pendente e renova o horário para o momento da promoção
                await api('tb_triagem', `id=eq.${id}`, 'PATCH', { 
                    status: 'pendente',
                    data: new Date().toISOString() // Faz a ocorrência "nascer" agora no monitoramento
                });
                fecharModal('modalOcorrencia');
                navegar('monitoramento');
            } catch(e) {
                alert('Erro ao promover o alerta.');
            }
        }

        async function retomarAtendimento(id) {
            try {
                const d = await api('tb_triagem', `id=eq.${id}&select=*`); const oc=d[0]; const info=oc.dados_preenchidos;
                ocoAtual = oc;
                document.getElementById('solTel').value=info.solicitante.telefone||''; document.getElementById('solNome').value=info.solicitante.nome||'';
                document.getElementById('endCep').value=info.endereco.cep||''; document.getElementById('endCidade').value=info.endereco.cidade||''; document.getElementById('endLog').value=info.endereco.logradouro||''; document.getElementById('endNum').value=info.endereco.numero||''; document.getElementById('endBairro').value=info.endereco.bairro||''; document.getElementById('endRef').value=info.endereco.referencia||'';
                document.getElementById('ocNatureza').value=info.natureza||''; document.getElementById('ocRelato').value=oc.resumo_texto||'';
                
                if(info.classificacoes) info.classificacoes.forEach(val => { const el = document.querySelector(`input[value="${val}"]`); if(el) el.checked = true; });
                veiculosArray=info.veiculos||[]; suspeitosArray=info.suspeitos||[]; renderList('listaVeiculos',veiculosArray); renderList('listaSuspeitos',suspeitosArray);
                idEmEdicao=id; navegar('atendimento');
            } catch(e){ alert('Erro ao abrir.'); }
        }

        async function carregarTriagem() {
            const tb = document.getElementById('tabelaTriagemBody');
            const mb = document.getElementById('mobTriagemBody');
            const countTriagem = document.getElementById('deskCountTriagem');
            
            tb.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted);">Carregando...</td></tr>';
            mb.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Carregando...</div>';
            
            try {
                const d = await api('tb_triagem', `status=eq.EM_TRIAGEM&order=criado_em.desc${_filtroAgencia()}`);
                tb.innerHTML = ''; mb.innerHTML = '';
                if(countTriagem) countTriagem.innerText = d.length;
                
                if (!d.length) {
                    tb.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted);">Nenhuma triagem pendente</td></tr>';
                    mb.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Nenhuma triagem pendente</div>';
                    return;
                }
                
                d.forEach(item => {
                    const info = item.dados_preenchidos;
                    const telefone = info.solicitante?.telefone || '-';
                    const nome = info.solicitante?.nome || 'ANÔNIMO';
                    const cidade = info.endereco?.cidade || '-';
                    const bairro = info.endereco?.bairro || '-';
                    const natureza = info.natureza || '-';
                    
                    const textoBusca = [telefone, nome, cidade, bairro, natureza].join(' ').toLowerCase();
                    const atributoBusca = `data-busca="${textoBusca}"`;
                    
                    // Linha Desktop
                    const tr = `<tr style="cursor: pointer; border-bottom: 1px solid var(--border);" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=''" onclick="retomarAtendimento('${item.id}')" ${atributoBusca}>
                        <td style="padding: 12px; width:15%;">${telefone}</td>
                        <td style="padding: 12px; width:25%;">${nome}</td>
                        <td style="padding: 12px; width:20%;">${cidade}</td>
                        <td style="padding: 12px; width:20%;">${bairro}</td>
                        <td style="padding: 12px; width:20%; font-weight:700;">${natureza}</td>
                    </tr>`;
                    
                    // Cartão Mobile (Borda Azul Escuro)
                    const dCriacao = new Date(item.criado_em);
                    const timerTxt = `${dCriacao.getDate().toString().padStart(2,'0')}/${(dCriacao.getMonth()+1).toString().padStart(2,'0')} ${dCriacao.getHours().toString().padStart(2,'0')}:${dCriacao.getMinutes().toString().padStart(2,'0')}`;
                    
                    const card = `<div class="card-mobile" style="border-left-color: var(--secondary); margin: 0;" onclick="retomarAtendimento('${item.id}')" ${atributoBusca}>
                        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px; margin-bottom:8px;">
                            <span style="color:var(--text-light);">${natureza}</span>
                            <span style="font-size:11px; color:var(--text-muted);">${timerTxt}</span>
                        </div>
                        <div style="font-size:12px; color:var(--text-light); margin-bottom:4px;">
                            <i class="fas fa-user" style="color:var(--text-muted); width:16px;"></i> ${nome}
                        </div>
                        <div style="font-size:12px; color:var(--text-light); margin-bottom:8px;">
                            <i class="fas fa-phone" style="color:var(--text-muted); width:16px;"></i> ${telefone}
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">
                            <i class="fas fa-map-marker-alt" style="width:16px;"></i> ${bairro}, ${cidade}
                        </div>
                        <div style="display:flex;">
                            <span class="card-tag" style="background:var(--secondary); color:white;">TRIAGEM PENDENTE</span>
                        </div>
                    </div>`;
                    
                    tb.innerHTML += tr;
                    mb.innerHTML += card;
                });
            } catch (e) {
                tb.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #ff6b6b;">Erro ao carregar triagem</td></tr>';
                console.error(e);
            }
        }

        function filtrarTriagem(texto) {
            const filterText = texto.toLowerCase();
            const tb = document.getElementById('tabelaTriagemBody');
            if(tb) {
                tb.querySelectorAll('tr').forEach(linha => {
                    linha.style.display = (linha.getAttribute('data-busca') || '').includes(filterText) ? '' : 'none';
                });
            }
            const mb = document.getElementById('mobTriagemBody');
            if(mb) {
                mb.querySelectorAll('.card-mobile').forEach(card => {
                    card.style.display = (card.getAttribute('data-busca') || '').includes(filterText) ? '' : 'none';
                });
            }
        }

        function atualizarTimersMonitoramento() {
            // Atualiza APENAS os timers visualmente (sem redesenhar tabela/recarregar dados)
            // Procura por todas as células de timer e recalcula baseado no timestamp armazenado
            
            document.querySelectorAll('[data-timestamp]').forEach(cell => {
                const baseTimeStr = cell.getAttribute('data-timestamp');
                if (!baseTimeStr) return;
                
                const baseTime = new Date(baseTimeStr);
                const agora = new Date();
                const diffMs = agora - baseTime;
                const diffMinutes = Math.floor(diffMs / 60000);
                
                const dia = String(baseTime.getDate()).padStart(2, '0');
                const mes = String(baseTime.getMonth() + 1).padStart(2, '0');
                const hora = String(baseTime.getHours()).padStart(2, '0');
                const min = String(baseTime.getMinutes()).padStart(2, '0');
                const dataHoraFmt = `${dia}/${mes} ${hora}:${min}`;
                
                let duracaoFmt = `${diffMinutes}m`;
                if (diffMinutes >= 60) {
                    const h = Math.floor(diffMinutes / 60);
                    const m = diffMinutes % 60;
                    duracaoFmt = `${h}h ${m}m`;
                }
                
                cell.innerText = `${dataHoraFmt} (${duracaoFmt})`;
            });
        }

        // --- MONITORAMENTO ---
        async function carregarMonitoramento() {
            const tbWait = document.getElementById('tableWait');
            const tbAct = document.getElementById('tableActive');
            const mobWait = document.getElementById('mobWaitBody');
            const mobAct = document.getElementById('mobActiveBody');
            
            tbWait.innerHTML=''; tbAct.innerHTML=''; mobWait.innerHTML=''; mobAct.innerHTML='';
            
            try {
                const data = await api('tb_triagem', `status=in.(AGUARDANDO,EM_ANDAMENTO)&order=criado_em.desc${_filtroAgencia()}`);
                let cw=0, ca=0;

                data.forEach(d => {
                    const info = d.dados_preenchidos;
                    const isCrit = info.prioridade==='CRITICA';
                    const icon = isCrit ? '🚨' : '🟢';
                    const hora = new Date(d.criado_em).toLocaleTimeString().substr(0,5);
                    const enderecoDica = `${info.endereco.logradouro}, ${info.endereco.numero}, ${info.endereco.bairro}, ${info.endereco.cidade}`;
                    
                    // CORREÇÃO DE BUG (Deep Search):
                    // Em vez de JSON.stringify (que gera aspas duplas e quebra o HTML), 
                    // montamos uma string segura apenas com os valores.
                    const textoBusca = [
                        info.natureza, 
                        info.endereco.logradouro, 
                        info.endereco.bairro, 
                        info.solicitante.nome, 
                        info.solicitante.telefone, 
                        d.resumo_texto || '', 
                        (d.viaturas_empenhadas || []).map(v => v.prefixo).join(' ')
                    ].join(' ').toLowerCase().replace(/"/g, ''); // Remove aspas para não quebrar o HTML

                    const atributoBusca = `data-busca="${textoBusca}"`;

                    // ===== FILA DE ESPERA (AGUARDANDO) =====
                    if(d.status==='AGUARDANDO') {
                        const hDataW = new Date(d.criado_em);
                        const diffMW = Math.floor((new Date() - hDataW) / 60000);
                        const timerTxtW = diffMW >= 0 ? `(${diffMW.toString().padStart(2,'0')}m)` : '(00m)';
                        const dhTxtW = `${hDataW.getDate().toString().padStart(2,'0')}/${(hDataW.getMonth()+1).toString().padStart(2,'0')} ${hDataW.getHours().toString().padStart(2,'0')}:${hDataW.getMinutes().toString().padStart(2,'0')}`;

                        const enderecoDicaCurtaAddress = `${info.endereco.logradouro}, ${info.endereco.numero}`;
                        
                        const tr = `<tr onclick="abrirModalOcorrencia('${d.id}')" style="cursor:pointer; ${isCrit?'color:#ff6b6b':''}" ${atributoBusca}>
        <td style="width:10%;">${icon}</td>
        <td style="width:30%;">${info.natureza}</td>
        <td style="width:15%;" title="${enderecoDicaCurtaAddress}">${info.endereco.cidade}</td>
        <td style="width:20%;" title="${enderecoDicaCurtaAddress}">${info.endereco.bairro}</td>
        <td style="width:25%; font-weight:600; color:var(--warning);">${calcularTimerTatico(d)}</td>
    </tr>`;
                        
                        const card = `<div class="card-mobile" style="border-left-color:${isCrit?'var(--danger)':'var(--warning)'}" onclick="abrirModalOcorrencia('${d.id}')" ${atributoBusca}>
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-bottom:5px;"><span>${info.natureza}</span><span>${calcularTimerTatico(d)}</span></div>
        <div style="font-size:11px;color:#aaa;margin-bottom:5px;">${info.endereco.formatado}</div>
        <div style="display:flex;gap:5px;">
            ${isCrit ? `<span class="card-tag" style="background:var(--danger);color:white">CRÍTICO</span>` : ''}
            <a href="tel:+55${info.solicitante.telefone}" title="Ligar" style="color: var(--text-muted); font-size: 16px; margin-left: 10px; transition: 0.2s;"><i class="fas fa-phone"></i></a>
        </div>
    </div>`;
                        
                        tbWait.innerHTML+=tr; 
                        mobWait.innerHTML+=card; 
                        cw++;
                    }
                    
                    // ===== EM ANDAMENTO (COM LÓGICA DE MULTI-LINHAS) =====
                    else if(d.status==='EM_ANDAMENTO') {
                        const viaturas = d.viaturas_empenhadas || [];
                        
                        // Linha Principal (viatura PRINCIPAL)
                        const principal = viaturas.find(v => v.funcao==='PRINCIPAL');
                        const prefixoPrincipal = principal ? principal.prefixo : '-';
                        const enderecoDicaCurtaAddress = `${info.endereco.logradouro}, ${info.endereco.numero}`;
                        
                        const statusTatico = principal ? (principal.status_deslocamento || 'DESPACHADA') : 'DESPACHADA';
                        // Determinar baseTimeRef para EM_ANDAMENTO (última atualização)
                        let baseTimeRef = d.criado_em;
                        if (d.hora_saida) baseTimeRef = d.hora_saida;
                        else if (d.hora_local) baseTimeRef = d.hora_local;
                        else if (d.hora_despacho) baseTimeRef = d.hora_despacho;
                        
                        const hData = new Date(baseTimeRef);
                        const diffM = Math.floor((new Date() - hData)/60000);
                        const timerTxt = diffM >= 0 ? `(${diffM.toString().padStart(2,'0')}m)` : '(00m)';
                        const dhTxt = `${hData.getDate().toString().padStart(2,'0')}/${(hData.getMonth()+1).toString().padStart(2,'0')} ${hData.getHours().toString().padStart(2,'0')}:${hData.getMinutes().toString().padStart(2,'0')}`;

                        const trPrincipal = `<tr onclick="abrirModalOcorrencia('${d.id}')" style="cursor:pointer; ${isCrit?'color:#ff6b6b':''}" ${atributoBusca}>
                            <td style="width:12%;">${prefixoPrincipal}</td>
                            <td style="width:20%;">${info.natureza}</td>
                            <td style="width:15%;" title="${enderecoDicaCurtaAddress}">${info.endereco.cidade}</td>
                            <td style="width:15%;" title="${enderecoDicaCurtaAddress}">${info.endereco.bairro}</td>
                            <td style="width:23%; font-weight:600; color:var(--info);" data-timestamp="${baseTimeRef}">${calcularTimerTatico(d)}</td>
                            <td style="width:15%; font-weight:bold;">${statusTatico}</td>
                        </tr>`;
                        tbAct.innerHTML+=trPrincipal;
                        
                        // Linhas de Apoio
                        viaturas.filter(v => v.funcao==='APOIO').forEach(apoio => {
                            const trApoio = `<tr onclick="abrirModalOcorrencia('${d.id}')" style="cursor:pointer; color:#888; font-size:12px;" ${atributoBusca}>
                                <td style="width:12%;">📍 APOIO ${apoio.prefixo}</td>
                                <td style="width:20%; color:#666;">↳</td><td style="width:15%; color:#666;">↳</td>
                                <td style="width:15%; color:#666;">↳</td><td style="width:23%; color:#666;">↳</td><td style="width:15%; color:#666;">↳</td>
                            </tr>`;
                            tbAct.innerHTML+=trApoio;
                        });
                        ca++;
                        
                        // Card Mobile (só principal)
                        const card = `<div class="card-mobile" style="border-left-color:var(--success)" onclick="abrirModalOcorrencia('${d.id}')" ${atributoBusca}>
                            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-bottom:5px;"><span>${info.natureza}</span><span>${obterHoraCriacao(d)}</span></div>
                            <div style="font-size:11px;color:#aaa;margin-bottom:5px;">${info.endereco.formatado}</div>
                            <div style="display:flex;gap:5px; flex-wrap:wrap;">
                                <span class="card-tag" style="background:var(--success);color:black">🚔 ${prefixoPrincipal}</span>
                                <span class="card-tag" style="background:var(--bg-hover);color:var(--info)">⏱ ${obterDuracaoUltimaAtualizacao(d)} ${statusTatico}</span>
                                ${viaturas.filter(v=>v.funcao==='APOIO').length > 0 ? `<span class="card-tag" style="background:#ff9500;color:black">+${viaturas.filter(v=>v.funcao==='APOIO').length} APOIO</span>` : ''}
                            </div>
                        </div>`;
                        mobAct.innerHTML+=card;
                    }
                });
                
                document.getElementById('deskCountW').innerText = cw;
                document.getElementById('deskCountA').innerText = ca;

            } catch(e) { console.log(e); }
        }

        
        // --- ADMIN ---
        function adminSwitch(module) {
            ['usuarios','chaves','viaturas','naturezas','areas'].forEach(m=>{
                const el=document.getElementById('admin-'+m);
                if(el) el.classList.toggle('hidden', m!==module);
                const tab=document.getElementById('admin-tab-'+m);
                if(tab) tab.classList.toggle('active', m===module);
            });
            if(module==='usuarios') carregarUsuarios();
            if(module==='chaves') carregarChaves();
            if(module==='viaturas') carregarViaturas();
        }

        async function exportTable(table) {
            try{
                const data = await api(table, 'select=*');
                const filename = `${table}_${new Date().toISOString().slice(0,19)}.json`;
                const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            }catch(e){ alert('Erro exportando: '+e.message); }
        }

        function triggerImport(){ document.getElementById('adminImportFile').click(); }

        async function handleImportFile(e){
            const f = e.target.files && e.target.files[0]; if(!f) return; try{
                const text = await f.text(); const json = JSON.parse(text);
                const table = prompt('Nome da tabela de destino (ex: tb_usuarios):', document.getElementById('adminExportTable').value);
                if(!table) return alert('Importação cancelada');
                if(!confirm(`Confirmar import para ${table}?`)) return;
                
                if(!Array.isArray(json)) throw new Error('JSON deve ser array');
                for(const item of json){ try{ await api(table,'', 'POST', item); }catch(err){ console.warn(err); } }
                
                alert('Concluído');
                if(table==='tb_usuarios') carregarUsuarios();
            }catch(err){ alert('Arquivo inválido: '+err.message); }
            e.target.value='';
        }

        async function carregarUsuarios(){
            const tb = document.getElementById('adminTabelaUsuarios'); tb.innerHTML='<tr><td colspan="5" style="padding:12px;color:gray">Buscando...</td></tr>';
            try{
                const users = await api('tb_usuarios','select=*&order=criado_em.desc');
                tb.innerHTML='';
                users.forEach(u=>{
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td style="padding:10px">${u.nome_guerra||''}</td><td style="padding:10px">${u.cpf_login||''}</td><td style="padding:10px">${u.perfil||u.perfil_acesso||''}</td><td style="padding:10px">${u.status_conta||''}</td><td style="padding:10px"><div style="display:flex;gap:6px"><button class="btn btn-sm btn-success" onclick="aprovarUsuario('${u.id}')" title="Aprovar">✅</button><button class="btn btn-sm btn-outline" onclick="bloquearUsuario('${u.id}')" title="Bloquear">🚫</button><button class="btn btn-sm btn-outline" onclick="resetSenha('${u.id}')" title="Reset Senha">🔄</button><button class="btn btn-sm btn-outline" onclick="abrirEdicaoUsuario('${u.id}')" title="Editar">✏️</button><button class="btn btn-sm btn-outline" onclick="excluirUsuario('${u.id}')" title="Excluir">🗑️</button></div></td>`;
                    tr.style.borderBottom = '1px solid var(--border)';
                    if(u.status_conta === 'EXCLUIDO') tr.style.opacity = '0.5';
                    tb.appendChild(tr);
                });
            }catch(e){ tb.innerHTML='<tr><td colspan="5">Erro.</td></tr>'; }
        }

        function openNewUserModal(){ document.getElementById('modalNewUser').style.display='flex'; }
        async function criarUsuario(){
            const nome=document.getElementById('nu_nome').value; const cpf=document.getElementById('nu_cpf').value; const perfil=document.getElementById('nu_perfil').value; const senha=document.getElementById('nu_senha').value||'123456';
            try{ await api('tb_usuarios','', 'POST', { nome_guerra:nome, cpf_login:cpf, senha:senha, perfil_acesso:perfil, status_conta:'VALIDADO' }); fecharModal('modalNewUser'); alert('Criado'); carregarUsuarios(); }catch(e){ alert('Erro: '+e.message); }
        }

        async function aprovarUsuario(id){ if(!confirm('Aprovar?')) return; await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { status_conta: 'VALIDADO' }); carregarUsuarios(); }
        async function bloquearUsuario(id){ if(!confirm('Bloquear?')) return; await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { status_conta: 'BLOQUEADO' }); carregarUsuarios(); }
        async function resetSenha(id){ if(!confirm('Resetar senha?')) return; await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { senha: '123' }); alert('Senha: 123'); }
        async function excluirUsuario(id){ if(!confirm('Excluir este usuário?')) return; await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { status_conta: 'EXCLUIDO' }); carregarUsuarios(); }
        
        async function abrirEdicaoUsuario(id) {
            try {
                const res = await api('tb_usuarios', `id=eq.${id}&select=*`);
                if(!res.length) return;
                const u = res[0];
                document.getElementById('edu_id').value = u.id;
                document.getElementById('edu_nome').value = u.nome_guerra || '';
                document.getElementById('edu_cpf').value = u.cpf_login || '';
                document.getElementById('edu_perfil').value = u.perfil_acesso || u.perfil || 'Atendente';
                document.getElementById('edu_senha').value = u.senha || '';
                document.getElementById('modalEditarUsuario').style.display='flex';
            } catch(e) { alert('Erro ao buscar usuário: ' + e.message); }
        }
        
        async function salvarEdicaoUsuario() {
            const id = document.getElementById('edu_id').value;
            const nome = document.getElementById('edu_nome').value;
            const perfil = document.getElementById('edu_perfil').value;
            const senha = document.getElementById('edu_senha').value;
            try {
                await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { nome_guerra: nome, perfil_acesso: perfil, senha: senha });
                fecharModal('modalEditarUsuario');
                alert('Salvo com sucesso!');
                carregarUsuarios();
            } catch(e) { alert('Erro ao salvar: ' + e.message); }
        }

        // --- Chaves ---
        function openNewKeyModal(){
            const select = document.getElementById('nk_perfil');
            select.innerHTML = '';
            const opcoes = usuarioAtual.perfil_acesso === 'MODERADOR'
                ? ['Atendente', 'Despachante', 'Admin']
                : ['Atendente', 'Despachante'];
            opcoes.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p; opt.text = p;
                select.appendChild(opt);
            });
            // Limpar campo de cidade
            const nkCidade = document.getElementById('nk_cidade');
            if(nkCidade) nkCidade.value = '';
            document.getElementById('modalNewKey').style.display = 'flex';
        }
        async function criarChave(){
            const codigo = document.getElementById('nk_codigo').value || ('KEY-'+Math.random().toString(36).slice(2,8).toUpperCase());
            const val = document.getElementById('nk_validade').value;
            const perfil = document.getElementById('nk_perfil').value;
            const cidadeRestricao = (document.getElementById('nk_cidade')?.value || '').trim().toUpperCase() || null;
            
            const payload = {
                codigo: codigo,
                validade_horas: val,
                perfil_padrao: perfil,
                ativa: true,
                criado_por_id: usuarioAtual.id,
                criado_por_nome: usuarioAtual.nome_guerra || usuarioAtual.nome_completo || 'Sistema',
                cidade_restricao: cidadeRestricao
            };
            
            try{
                await api('tb_chaves_acesso','', 'POST', payload);
                fecharModal('modalNewKey');
                alert('Chave criada');
                if(usuarioAtual.perfil_acesso === 'MODERADOR') carregarChavesModerador();
                else carregarChaves();
            } catch(e){ alert('Erro ao criar chave: '+e.message); }
        }

        async function carregarChaves(){
            const tb = document.getElementById('adminTabelaChaves'); tb.innerHTML='<tr><td>...</td></tr>';
            try{
                const list = await api('tb_chaves_acesso','select=*&order=criado_em.desc');
                tb.innerHTML='';
                list.forEach(k=>{
                    tb.innerHTML += `<tr style="border-bottom:1px solid var(--border);"><td style="padding:10px">${k.codigo}</td><td style="padding:10px">${k.perfil_padrao||'-'}</td><td style="padding:10px">${k.validade_horas}h</td><td style="padding:10px">${k.ativa?'Sim':'Não'}</td><td style="padding:10px"><div style="display:flex;gap:6px"><button class="btn btn-sm btn-outline" onclick="deleteChave('${k.id}')">Excluir</button></div></td></tr>`;
                });
            }catch(e){}
        }
        async function deleteChave(id){ if(!confirm('Excluir?')) return; await api('tb_chaves_acesso', `id=eq.${id}`, 'DELETE'); carregarChaves(); }

        // --- Viaturas ---
        function openNewViaturaModal(){ document.getElementById('modalNovaViatura').style.display='flex'; }
        async function criarViatura(){
            const prefixo=document.getElementById('nv_prefixo').value; 
            const tipo=document.getElementById('nv_tipo').value; 
            const placa=document.getElementById('nv_placa').value.toUpperCase();
            const telefone=document.getElementById('nv_telefone').value.replace(/\D/g, '');
            
            if(!prefixo || !placa) return alert('Preencha prefixo e placa');
            
            try{ 
                await api('tb_viaturas','', 'POST', { prefixo: prefixo, tipo: tipo, placa: placa, guarnicao: 'LIVRE', status_viatura: 'Disponível', telefone_vtr: telefone }); 
                fecharModal('modalNovaViatura'); 
                document.getElementById('nv_prefixo').value = '';
                document.getElementById('nv_tipo').value = 'Rádio Patrulha';
                document.getElementById('nv_placa').value = '';
                document.getElementById('nv_telefone').value = '';
                alert('Viatura criada'); 
                carregarViaturas(); 
                carregarFrota();
            }catch(e){ alert('Erro: '+e.message); }
        }

        async function carregarViaturas(){
            const tb = document.getElementById('adminTabelaViaturas'); tb.innerHTML='<tr><td colspan="6" style="padding:12px;color:gray">Buscando...</td></tr>';
            try{
                const viaturas = await api('tb_viaturas','select=*&order=prefixo.asc');
                tb.innerHTML='';
                viaturas.forEach(v=>{
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td style="padding:10px">${v.prefixo||''}</td><td style="padding:10px">${v.tipo||''}</td><td style="padding:10px">${v.placa||''}</td><td style="padding:10px">${v.guarnicao||'LIVRE'}</td><td style="padding:10px">${v.status_viatura||'DISPONIVEL'}</td><td style="padding:10px"><div style="display:flex;gap:6px"><button class="btn btn-sm btn-outline" onclick="excluirViatura('${v.id}')">Excluir</button></div></td>`;
                    tr.style.borderBottom = '1px solid var(--border)';
                    tb.appendChild(tr);
                });
            }catch(e){ tb.innerHTML='<tr><td colspan="6" style="padding:12px;color:orange">Erro.</td></tr>'; }
        }
        async function excluirViatura(id){ if(!confirm('Excluir viatura?')) return; await api('tb_viaturas', `id=eq.${id}`, 'DELETE'); carregarViaturas(); carregarFrota(); }

        // --- FROTA ---
        let frotaEmEdicao = null;

        async function carregarFrota(){
            const container = document.getElementById('listaFrota');
            container.innerHTML = '<div style="padding:20px; color:gray;">Carregando...</div>';
            try{
                const viaturas = await api('tb_viaturas','select=*&order=prefixo.asc');
                container.innerHTML = '';
                
                viaturas.forEach(v => {
                    // Estados que indicam viatura empenhada/despachada (bloqueia edição de status)
                    const dispatchedStates = ['Despachada', 'DESLOCANDO', 'Em Atendimento', 'NO_LOCAL', 'SAIDA'];
                    const isDispatched = dispatchedStates.includes(v.status_viatura);

                    const linhaDiv = document.createElement('div');
                    linhaDiv.style.cssText = 'background:var(--bg-header); border:1px solid var(--border); border-radius:6px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:10px;';
                    
                    // ESQUERDA - Prefixo, Tipo, Guarnição
                    const esquerda = document.createElement('div');
                    esquerda.style.cssText = 'flex:2; font-size:13px;';
                    esquerda.innerHTML = `<div style="font-weight:700; font-size:14px;">${v.prefixo}</div><div style="color:var(--text-muted); font-size:11px;">${v.tipo} | ${v.guarnicao || 'LIVRE'}</div>`;
                    
                    // CENTRO - Dropdown de Status
                    const centro = document.createElement('div');
                    centro.style.cssText = 'flex:2; display:flex; flex-direction:column; gap:4px;';
                    const selectStatus = document.createElement('select');
                    selectStatus.style.cssText = 'padding:6px; background:var(--input-bg); border:1px solid var(--border); border-radius:4px; color:var(--text-light); font-size:12px; width:100%;';
                    // Se viatura estiver despachada/em uso, mostrar select com única opção 'Despachada' (travado)
                    if(isDispatched) {
                        const option = document.createElement('option');
                        option.value = 'Despachada';
                        option.text = 'Despachada';
                        option.selected = true;
                        selectStatus.appendChild(option);
                        selectStatus.disabled = true;
                        selectStatus.style.opacity = '0.6';
                        selectStatus.title = 'Viatura despachada - edição de status bloqueada';
                    } else {
                        const opcoes = ['Fora de serviço', 'Disponível', 'Administrativo', 'Refeição', 'Manutenção', 'Abastecimento'];
                        opcoes.forEach(op => {
                            const option = document.createElement('option');
                            option.value = op;
                            option.text = op;
                            if(op === v.status_viatura) option.selected = true;
                            selectStatus.appendChild(option);
                        });
                        selectStatus.onchange = () => atualizarStatusViatura(v.id, selectStatus.value);
                    }
                    
                    centro.appendChild(selectStatus);
                    if(isDispatched) {
                        const aviso = document.createElement('div');
                        aviso.style.cssText = 'font-size:10px; color:var(--warning);';
                        aviso.innerHTML = '🔒 Bloqueado - viatura despachada';
                        centro.appendChild(aviso);
                    }
                    
                    // DIREITA - Botão Editar
                    const direita = document.createElement('div');
                    direita.style.cssText = 'flex:0.5; display:flex; gap:6px;';
                    const btnEditar = document.createElement('button');
                    btnEditar.className = 'btn btn-sm';
                    btnEditar.innerHTML = '<i class="fas fa-pen"></i>';
                    btnEditar.onclick = () => abrirEdicaoViatura(v);
                    direita.appendChild(btnEditar);
                    
                    linhaDiv.appendChild(esquerda);
                    linhaDiv.appendChild(centro);
                    linhaDiv.appendChild(direita);
                    
                    container.appendChild(linhaDiv);
                });
            }catch(e){
                container.innerHTML = '<div style="padding:20px; color:orange;">Erro ao carregar frota.</div>';
            }
        }

        async function atualizarStatusViatura(id, novoStatus){
            try{
                await api('tb_viaturas', `id=eq.${id}`, 'PATCH', { status_viatura: novoStatus });
                alert('Status atualizado');
                carregarFrota();
            }catch(e){
                alert('Erro: '+e.message);
                carregarFrota();
            }
        }

        function abrirEdicaoViatura(viatura){
            frotaEmEdicao = viatura;
            document.getElementById('me_guarnicao').value = viatura.guarnicao || '';
            document.getElementById('me_telefone').value = viatura.telefone_vtr || '';
            document.getElementById('modalFrotaEditar').style.display = 'flex';
        }

        function abrirWhatsapp(){
            const numero = document.getElementById('me_telefone').value.replace(/\D/g, '');
            if(!numero) {
                alert('Digite um telefone primeiro');
                return;
            }
            const url = `https://wa.me/55${numero}`;
            window.open(url, '_blank');
        }

        async function salvarEdicaoViatura(){
            if(!frotaEmEdicao) return;
            const guarnicao = document.getElementById('me_guarnicao').value;
            const telefone = document.getElementById('me_telefone').value.replace(/\D/g, '');
            
            try{
                await api('tb_viaturas', `id=eq.${frotaEmEdicao.id}`, 'PATCH', { guarnicao: guarnicao, telefone_vtr: telefone });
                alert('Viatura atualizada');
                fecharModal('modalFrotaEditar');
                carregarFrota();
            }catch(e){
                alert('Erro: '+e.message);
            }
        }

        // --- Funções Genéricas de Cadastro (Natureza/Área) ---
        async function salvarNatureza() {
            const nome = prompt("Nome da Natureza (Ex: ROUBO):");
            if(nome) {
                await api('tb_naturezas', '', 'POST', { nome: nome, risco_padrao: 'NORMAL' });
                alert('Natureza salva!');
            }
        }
        async function salvarArea() {
            const nome = prompt("Nome da Área/Bairro:");
            if(nome) {
                await api('tb_areas', '', 'POST', { nome: nome });
                alert('Área salva!');
            }
        }

        // Funções dos Drawers
        // VARIÁVEIS GLOBAIS MODAIS - já declaradas no topo

        // ========== NOVO SISTEMA DE MODAL DE ALERTAS ==========
        let idAlertaAberto = null;

        async function abrirModalAlerta(id) {
            // Garantir que id é string
            if (!id) {
                alert('ID de alerta inválido');
                return;
            }
            id = String(id).trim();
            
            idAlertaAberto = id;
            try {
                const dados = await api('tb_triagem', `id=eq.${id}&select=*`);
                if(!dados || !dados.length) {
                    console.error('Nenhum dado encontrado para alerta:', id);
                    return;
                }
                
                const d = dados[0];
                const info = d.dados_preenchidos;
                
                // Verificar se info existe
                if(!info) {
                    console.error('dados_preenchidos não existe:', d);
                    return;
                }
                
                document.getElementById('ma-natureza').innerText = info.natureza || 'Sem informação';
                document.getElementById('ma-id').innerText = `ID: ${String(id).substring(0,8)}...`;
                
                // Preencher data/hora de criação
                const dataAleCreacao = new Date(d.criado_em);
                const diaAle = String(dataAleCreacao.getDate()).padStart(2, '0');
                const mesAle = String(dataAleCreacao.getMonth() + 1).padStart(2, '0');
                const horaAle = String(dataAleCreacao.getHours()).padStart(2, '0');
                const minAle = String(dataAleCreacao.getMinutes()).padStart(2, '0');
                document.getElementById('ma-criado-em').innerText = `Gerado em: ${diaAle}/${mesAle} ${horaAle}:${minAle}`;
                
                // Timer (utilizando timer tático se existir, senão fallback básico)
                if (typeof calcularTimerTatico === 'function') {
                    document.getElementById('ma-timer').innerText = calcularTimerTatico(d);
                } else {
                    const createdTime = new Date(d.criado_em || d.data);
                    const nowTime = new Date();
                    const diffMinutes = Math.floor((nowTime - createdTime) / 60000);
                    document.getElementById('ma-timer').innerText = `${Math.floor(diffMinutes / 60).toString().padStart(2,'0')}:${(diffMinutes % 60).toString().padStart(2,'0')}`;
                }
                
                // Tags
                const tagsDiv = document.getElementById('ma-tags');
                tagsDiv.innerHTML = '';
                (info.classificacoes || []).forEach(tg => {
                    let bg = 'var(--border)'; let tc = 'var(--text-muted)';
                    if(["ARMA DE FOGO", "ARMA BRANCA", "EXPLOSIVO", "FERIDOS (SIM)", "ARMADO (SIM)"].includes(tg)) { bg = 'var(--danger)'; tc = 'white'; }
                    else if(["EM ANDAMENTO", "ARMADO (SUSPEITA)", "TUMULTO (SIM)"].includes(tg)) { bg = 'var(--warning)'; tc = 'black'; }
                    else { bg = 'var(--bg-hover)'; tc = 'var(--text-light)'; }
                    const el = document.createElement('span');
                    el.style.cssText = `font-size:9px; padding:3px 6px; background:${bg}; color:${tc}; border-radius:3px; font-weight:700;`;
                    el.innerText = tg; tagsDiv.appendChild(el);
                });
                
                // Endereço
                if(info.endereco) {
                    const refText = info.endereco.referencia ? `<br><span style="color:var(--warning);">Ref: ${info.endereco.referencia}</span>` : '';
                    document.getElementById('ma-endereco').innerHTML = `<strong>${info.endereco.logradouro}, ${info.endereco.numero}</strong><br>${info.endereco.bairro}, ${info.endereco.cidade}${refText}`;
                    document.getElementById('ma-btn-mapa').onclick = () => window.open(`https://maps.google.com/?q=${encodeURIComponent(info.endereco.formatado)}`, '_blank');
                }

                // Ações Auxiliares
                document.getElementById('ma-iconeCopiarSade').onclick = () => copiarParaSade(id);
                if(info.solicitante && info.solicitante.telefone) {
                    document.getElementById('ma-btn-ligar').href = `tel:+55${info.solicitante.telefone}`;
                }

                // Solicitante
                document.getElementById('ma-nome').innerText = `Nome: ${info.solicitante?.nome || 'Anônimo'}`;
                document.getElementById('ma-telefone').innerText = `Tel: ${info.solicitante?.telefone || 'Não informado'}`;

                // Descrição e Envolvidos
                let histHTML = d.resumo_texto ? d.resumo_texto.replace(/\n/g, '<br>') : '<span style="color:var(--text-muted);">Nenhuma informação principal</span>';
                if (info.veiculos && info.veiculos.length > 0) {
                    histHTML += '<br><br><strong>Veículo(s):</strong><br>' + info.veiculos.map(v => `[${v.placa || 'S/P'}] ${v.desc}`).join('<br>');
                }
                if (info.suspeitos && info.suspeitos.length > 0) {
                    histHTML += '<br><br><strong>Suspeito/Autor:</strong><br>' + info.suspeitos.join('<br>');
                }
                document.getElementById('ma-historico').innerHTML = histHTML;
                
                // Exibir modal com force do CSS
                const modal = document.getElementById('modalAlerta');
                modal.style.display = 'flex';
                modal.style.zIndex = '250';
                console.log('Modal aberto com sucesso!', modal);
            } catch(e) { 
                console.error('Erro ao abrir modal alerta:', e);
                alert('Erro ao abrir alerta: ' + e.message);
            }
        }

        async function promoverAlertaFromModal(id) {
            if(!id) {
                alert('ID de alerta inválido');
                return;
            }
            
            if(!confirm('Tem a certeza que deseja promover este Alerta a Ocorrência? Ele passará a aguardar despacho.')) return;
            
            try {
                // Garantir que id é string
                id = String(id).trim();
                console.log('Promovendo alerta:', id);
                
                // Fazer update no banco - APENAS status
                const result = await api('tb_triagem', `id=eq.${id}`, 'PATCH', { 
                    status: 'AGUARDANDO'
                });
                
                console.log('Resposta da promoção:', result);
                
                alert('Alerta promovido com sucesso! Agora aguarda despacho.');
                fecharModal('modalAlerta');
                
                // Recarregar dados
                if (typeof carregarAlertas === 'function') {
                    await carregarAlertas();
                }
                
                // Navegar para monitoramento
                navegar('monitoramento');
                
                // Recarregar monitoramento para mostrar a nova ocorrência
                if (typeof carregarMonitoramento === 'function') {
                    await carregarMonitoramento();
                }
            } catch(e) {
                console.error('Erro ao promover alerta:', e);
                console.error('Detalhes do erro:', e.message, e.stack);
                alert('Erro ao promover o alerta: ' + e.message);
            }
        }
// ========== FIM DO SISTEMA DE MODAL DE ALERTAS ==========
        // Função para abrir Modal de Ocorrência
        let timerIntervalOcorrencia = null; // Armazenar interval para limpar depois
        
        async function abrirModalOcorrencia(id, origem = 'monitoramento') {
            idOcorrenciaAberta = id;
            
            // Recolher a barra da direita (Radar) caso esteja ativa no mobile
            const radar = document.getElementById('coluna-radar');
            const fab = document.getElementById('fab-radar');
            if (radar && radar.classList.contains('offcanvas-active')) {
                radar.classList.remove('offcanvas-active');
                if (fab) fab.classList.remove('fab-active');
            }
            
            try {
                // Limpar timer anterior se existir
                if (timerIntervalOcorrencia) {
                    clearInterval(timerIntervalOcorrencia);
                }
                
                const dados = await api('tb_triagem', `id=eq.${id}&select=*`);
                if(!dados || !dados.length) return;
                
                const d = dados[0];
                const info = d.dados_preenchidos;
                
                // Preencher modal
                document.getElementById('mo-natureza').innerText = info.natureza || 'Sem informação';
                document.getElementById('mo-id').innerText = `ID: ${id.substring(0,8)}...`;
                document.getElementById('mo-timer').innerText = calcularTimerTatico(d);
                
                // Preencher data/hora de criação
                const dataCriacao = new Date(d.criado_em);
                const diaC = String(dataCriacao.getDate()).padStart(2, '0');
                const mesC = String(dataCriacao.getMonth() + 1).padStart(2, '0');
                const horaC = String(dataCriacao.getHours()).padStart(2, '0');
                const minC = String(dataCriacao.getMinutes()).padStart(2, '0');
                document.getElementById('mo-criado-em').innerText = `Gerado em: ${diaC}/${mesC} ${horaC}:${minC}`;
                
                // Atualizar timer a cada segundo
                timerIntervalOcorrencia = setInterval(async () => {
                    const dadosAtualizados = await api('tb_triagem', `id=eq.${id}&select=*`);
                    if(dadosAtualizados && dadosAtualizados.length) {
                        const dAtualizado = dadosAtualizados[0];
                        document.getElementById('mo-timer').innerText = calcularTimerTatico(dAtualizado);
                    }
                }, 1000);
                
                // Tags
                const tagsDiv = document.getElementById('mo-tags');
                tagsDiv.innerHTML = '';
                (info.classificacoes || []).forEach(tg => {
                    let bg = 'var(--border)'; let tc = 'var(--text-muted)';
                    if(["ARMA DE FOGO", "ARMA BRANCA", "EXPLOSIVO", "FERIDOS (SIM)", "ARMADO (SIM)"].includes(tg)) { bg = 'var(--danger)'; tc = 'white'; }
                    else if(["EM ANDAMENTO", "ARMADO (SUSPEITA)", "TUMULTO (SIM)"].includes(tg)) { bg = 'var(--warning)'; tc = 'black'; }
                    else { bg = 'var(--bg-hover)'; tc = 'var(--text-light)'; }
                    const el = document.createElement('span');
                    el.style.cssText = `font-size:9px; padding:3px 6px; background:${bg}; color:${tc}; border-radius:3px; font-weight:700;`;
                    el.innerText = tg; tagsDiv.appendChild(el);
                });
                
                // Endereço com Referência
                const refText = info.endereco.referencia ? `<br><span style="color:var(--warning);">Ref: ${info.endereco.referencia}</span>` : '';
                document.getElementById('mo-endereco').innerHTML = `<strong>${info.endereco.logradouro}, ${info.endereco.numero}</strong><br>${info.endereco.bairro}, ${info.endereco.cidade}${refText}`;

                // Ações dos novos botões (Mapa e Ligar)
                document.getElementById('mo-btn-mapa').onclick = () => window.open(`https://maps.google.com/?q=${encodeURIComponent(info.endereco.formatado)}`, '_blank');

                // Solicitante
                document.getElementById('mo-nome').innerText = `Nome: ${info.solicitante.nome || 'Anônimo'}`;
                document.getElementById('mo-telefone').innerText = `Tel: ${info.solicitante.telefone || 'Não informado'}`;

                // Descrição + Veículos + Suspeitos
                let histHTML = d.resumo_texto ? d.resumo_texto.replace(/\n/g, '<br>') : '<span style="color:var(--text-muted);">Nenhuma informação principal</span>';

                if (info.veiculos && info.veiculos.length > 0) {
                    histHTML += '<br><br><strong>Veículo(s):</strong><br>' + info.veiculos.map(v => `[${v.placa || 'S/P'}] ${v.desc}`).join('<br>');
                }
                if (info.suspeitos && info.suspeitos.length > 0) {
                    histHTML += '<br><br><strong>Suspeito/Autor:</strong><br>' + info.suspeitos.join('<br>');
                }
                document.getElementById('mo-historico').innerHTML = histHTML;
                
                // Renderizar recursos e botão da ação
                if(d.status === 'AGUARDANDO' || d.status === 'pendente') {
                    document.getElementById('mo-recursos-container').style.display = 'none';
                    document.getElementById('mo-btn-acao').innerText = 'Despachar';
                    document.getElementById('mo-btn-acao').onclick = () => abrirSelecaoFrotaModal(id, 'PRINCIPAL');
                } else if(d.status === 'EM_ANDAMENTO') {
                    // Renderizar recursos
                    const recursosDiv = document.getElementById('mo-recursos');
                    recursosDiv.innerHTML = '';
                    const viaturas = d.viaturas_empenhadas || [];
                    if(viaturas.length === 0) {
                        recursosDiv.innerHTML = '<div style="color:#666;">Nenhum recurso</div>';
                    } else {
                            viaturas.forEach((vtr, idx) => {
                                const itemDiv = document.createElement('div');
                                itemDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.02); border-radius:4px; margin-bottom:6px;';
                                // Status tático de deslocamento
                                const st = vtr.status_deslocamento || 'DESPACHADA';
                                let actions = '';
                                if (origem === 'atendimento') {
                                    let corBadge = 'var(--text-muted)';
                                    if(st === 'DESPACHADA') corBadge = 'var(--warning)';
                                    else if(st === 'NO LOCAL') corBadge = '#8b5cf6';
                                    else if(st === 'SAIU') corBadge = 'var(--success)';
                                    actions = `<span style="font-size:10px; font-weight:bold; padding:4px 8px; border-radius:4px; border:1px solid ${corBadge}; color:${corBadge};">${st}</span>`;
                                } else {
                                    let btnEstagio = '';
                                    if(st === 'DESPACHADA') btnEstagio = `<button class="btn btn-sm" style="background:var(--warning); color:black;" onclick="atualizarStatusTatico('${id}', ${idx}, 'NO LOCAL')">📍 NO LOCAL</button>`;
                                    else if(st === 'NO LOCAL') btnEstagio = `<button class="btn btn-sm" style="background:#8b5cf6; color:white;" onclick="atualizarStatusTatico('${id}', ${idx}, 'SAIU')">💨 SAIU</button>`;
                                    else if(st === 'SAIU') btnEstagio = `<button class="btn btn-sm btn-outline" style="cursor:not-allowed;" disabled>FINALIZANDO O ATENDIMENTO</button>`;

                                    actions = `<button class="btn btn-sm btn-danger" onclick="retirarViatura('${id}', ${idx})">Retirar</button>`;
                                    if(vtr.funcao !== 'PRINCIPAL') {
                                        actions = `<button class="btn btn-sm btn-outline" onclick="promoverViatura('${id}', ${idx})">Promover</button>` + actions;
                                    }
                                    actions = btnEstagio + actions;
                                }
                                itemDiv.innerHTML = `<span>${vtr.funcao==='PRINCIPAL' ? '⭐' : '📍'} ${vtr.prefixo}</span><div style="display:flex;gap:4px;align-items:center;">${actions}</div>`;
                                recursosDiv.appendChild(itemDiv);
                            });
                    }
                    document.getElementById('mo-recursos-container').style.display = 'block';
                    document.getElementById('mo-btn-acao').innerText = 'Adicionar Apoio';
                    document.getElementById('mo-btn-acao').onclick = () => abrirSelecaoFrotaModal(id, 'APOIO');
                }
                
                if (origem === 'atendimento') {
                    document.getElementById('mo-btn-editar').style.display = 'none';
                    document.getElementById('mo-btn-acao').style.display = 'none';
                    document.getElementById('mo-btn-finalizar').style.display = 'none';
                } else {
                    document.getElementById('mo-btn-editar').style.display = '';
                    document.getElementById('mo-btn-acao').style.display = '';
                    document.getElementById('mo-btn-finalizar').style.display = '';
                }
                
                document.getElementById('modalOcorrencia').style.display = 'flex';
            } catch(e) { 
                console.error('Erro ao abrir modal ocorrência:', e);
            }
        }

        // Função para finalizar (abre modal de finalização)
        async function finalizarOcorrenciaModal(id) {
            idParaFinalizar = id;
            
            // Detectar se é alerta ou ocorrência
            const esAlerta = id === idAlertaAberto;
            
            document.getElementById('mf-bo').value = '';
            document.getElementById('mf-observacoes').value = '';
            
            try {
                const dados = await api('tb_triagem', `id=eq.${id}&select=status`);
                
                if(esAlerta) {
                    // Alertas não precisam de BO
                    document.getElementById('wrapper-mf-bo').style.display = 'none';
                } else if(dados && dados.length > 0 && dados[0].status === 'AGUARDANDO') {
                    // Ocorrências em espera não precisam de BO
                    document.getElementById('wrapper-mf-bo').style.display = 'none';
                } else {
                    // Ocorrências despachadas precisam de BO
                    document.getElementById('wrapper-mf-bo').style.display = 'block';
                }
            } catch(e) {
                console.error('Erro ao verificar status:', e);
                document.getElementById('wrapper-mf-bo').style.display = 'block';
            }
            
            document.getElementById('modalFinalizacao').style.display = 'flex';
        }

        async function confirmarFinalizacao() {
            const bo = document.getElementById('mf-bo').value.trim();
            const obs = document.getElementById('mf-observacoes').value.trim();
            const isAguardando = document.getElementById('wrapper-mf-bo').style.display === 'none';
            const esAlerta = idParaFinalizar === idAlertaAberto;
            
            if(!isAguardando && (!bo || !obs)) return alert('Preencha o Nº BO e as Observações.');
            
            try {
                const ocoDados = await api('tb_triagem', `id=eq.${idParaFinalizar}&select=*`);
                if(!ocoDados.length) return;
                const ocoAtual = ocoDados[0];
                
                let novaObs = ocoAtual.resumo_texto || '';
                if(isAguardando) {
                    if(obs) novaObs += `\n[FINALIZADA SEM DESPACHO - ${new Date().toLocaleString()}] Obs: ${obs}`;
                    else novaObs += `\n[FINALIZADA SEM DESPACHO - ${new Date().toLocaleString()}]`;
                } else {
                    novaObs += `\n[FINALIZAÇÃO - ${new Date().toLocaleString()}] BO: ${bo} | Obs: ${obs}`;
                }
                
                // Atualizar status das viaturas se for ocorrência
                if(!esAlerta) {
                    const viaturas = ocoAtual.viaturas_empenhadas || [];
                    for(const vtr of viaturas) {
                        await api('tb_viaturas', `prefixo=eq.${vtr.prefixo}`, 'PATCH', { status_viatura: 'Disponível' });
                    }
                }
                
                await api('tb_triagem', `id=eq.${idParaFinalizar}`, 'PATCH', { status: 'FINALIZADA', resumo_texto: novaObs });
                
                alert(esAlerta ? 'Alerta finalizado!' : 'Ocorrência finalizada!');
                fecharModal('modalFinalizacao');
                fecharModal(esAlerta ? 'modalAlerta' : 'modalOcorrencia');
                
                if(esAlerta) {
                    carregarAlertas();
                    idAlertaAberto = null;
                } else {
                    carregarMonitoramento();
                    idOcorrenciaAberta = null;
                }
            } catch(e) {
                console.error('Erro ao finalizar:', e);
                alert('Erro ao finalizar: ' + e.message);
            }
        }

        // Abrir seleção de frota em modal
        async function abrirSelecaoFrotaModal(idOco, tipo) {
            tipoFuncaoSelecao = tipo;
            try {
                const viaturas = await api('tb_viaturas', "status_viatura=eq.Disponível&select=*");
                const lista = document.getElementById('msfLista');
                lista.innerHTML = '';
                
                viaturas.forEach(v => {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-info' ;
                    btn.style.cssText = 'margin-bottom:10px; text-align:left; padding:12px;';
                    btn.innerHTML = `<strong>${v.prefixo}</strong> - ${v.tipo} (${v.placa})`;
                    btn.onclick = () => empenharViatura(idOco, v.prefixo, tipo);
                    lista.appendChild(btn);
                });
                
                document.getElementById('modalSelecaoFrota').style.display = 'flex';
            } catch(e) {
                console.error('Erro ao carregar viaturas:', e);
            }
        }

        // Empenhar viatura
        async function empenharViatura(idOco, prefixo, tipo) {
            try {
                const ocoDados = await api('tb_triagem', `id=eq.${idOco}&select=*`);
                if(!ocoDados.length) return;
                const ocoAtual = ocoDados[0];
                
                let viaturas = ocoAtual.viaturas_empenhadas || [];
                const agora = new Date().toISOString();
                const novaViatura = { prefixo: prefixo, funcao: tipo, status_deslocamento: 'DESPACHADA', hora_status: agora };
                
                // Se é PRINCIPAL e já existe um, converte o antigo para APOIO
                if(tipo === 'PRINCIPAL' && viaturas.length > 0) {
                    const principal = viaturas.find(v => v.funcao === 'PRINCIPAL');
                    if(principal) principal.funcao = 'APOIO';
                }
                
                viaturas.push(novaViatura);
                
                await api('tb_triagem', `id=eq.${idOco}`, 'PATCH', {
                    viaturas_empenhadas: viaturas,
                    status: tipo === 'PRINCIPAL' ? 'EM_ANDAMENTO' : ocoAtual.status,
                    hora_despacho: agora
                });
                
                // Marcar viatura como em uso (padronizado para 'Despachada')
                await api('tb_viaturas', `prefixo=eq.${prefixo}`, 'PATCH', {
                    status_viatura: 'Despachada'
                });
                
                fecharModal('modalSelecaoFrota');
                abrirModalOcorrencia(idOco);
                carregarMonitoramento();
            } catch(e) {
                console.error('Erro ao empenhar viatura:', e);
            }
        }

        // ===== FUNÇÕES DE AÇÃO - FROTA =====
        async function despacharViatura(idOcorrencia, prefixo, funcao) {
            // funcao pode ser 'PRINCIPAL' ou 'APOIO'
            if(!confirm(`Despachar ${prefixo} como ${funcao}?`)) return;
            
            try {
                // 1. Buscar ocorrência atual
                const ocoDados = await api('tb_triagem', `id=eq.${idOcorrencia}&select=*`);
                if(!ocoDados.length) return alert('Ocorrência não encontrada');
                const ocoAtual = ocoDados[0];
                const viaturas = ocoAtual.viaturas_empenhadas || [];
                
                // 2. Se é PRINCIPAL, demover a atual principal para APOIO
                if(funcao==='PRINCIPAL') {
                    const principalIdx = viaturas.findIndex(v => v.funcao==='PRINCIPAL');
                    if(principalIdx >= 0) {
                        viaturas[principalIdx].funcao = 'APOIO';
                    }
                }
                
                // 3. Adicionar nova viatura ao array
                const agora = new Date().toISOString();
                viaturas.push({ prefixo: prefixo, funcao: funcao, status_deslocamento: 'DESPACHADA', hora_status: agora });
                
                // 4. Atualizar tb_triagem com viaturas_empenhadas, status e hora_despacho
                await api('tb_triagem', `id=eq.${idOcorrencia}`, 'PATCH', {
                    viaturas_empenhadas: viaturas,
                    status: 'EM_ANDAMENTO',
                    hora_despacho: agora
                });
                
                // 5. Atualizar status da viatura para 'Despachada'
                await api('tb_viaturas', `prefixo=eq.${prefixo}`, 'PATCH', {
                    status_viatura: 'Despachada'
                });
                
                alert(`${prefixo} despachado como ${funcao}`);
                fecharModal('modalSelecaoFrota');
                carregarMonitoramento();
                abrirModalOcorrencia(idOcorrencia);
                
            } catch(e) {
                console.log('Erro ao despachar viatura:', e);
                alert('Erro ao despachar');
            }
        }

        async function promoverViatura(idOcorrencia, indexApoio) {
            // Promover viatura de APOIO para PRINCIPAL
            try {
                const ocoDados = await api('tb_triagem', `id=eq.${idOcorrencia}&select=*`);
                if(!ocoDados.length) return;
                const ocoAtual = ocoDados[0];
                const viaturas = ocoAtual.viaturas_empenhadas || [];
                
                if(!viaturas[indexApoio]) return;
                
                // Demover principal para apoio
                const principalIdx = viaturas.findIndex(v => v.funcao==='PRINCIPAL');
                if(principalIdx >= 0) {
                    viaturas[principalIdx].funcao = 'APOIO';
                }
                
                // Promover apoio para principal
                viaturas[indexApoio].funcao = 'PRINCIPAL';
                
                // Atualizar
                await api('tb_triagem', `id=eq.${idOcorrencia}`, 'PATCH', {
                    viaturas_empenhadas: viaturas
                });
                
                alert(`${viaturas[indexApoio].prefixo} promovido a PRINCIPAL`);
                abrirModalOcorrencia(idOcorrencia);
                
            } catch(e) {
                console.log('Erro ao promover viatura:', e);
            }
        }

        async function retirarViatura(idOcorrencia, indexVtr) {
            // Retirar viatura de uma ocorrência
            try {
                const ocoDados = await api('tb_triagem', `id=eq.${idOcorrencia}&select=*`);
                if(!ocoDados.length) return;
                const ocoAtual = ocoDados[0];
                let viaturas = ocoAtual.viaturas_empenhadas || [];
                
                if(!viaturas[indexVtr]) return;
                const vtrRemovida = viaturas[indexVtr];
                
                // Remover do array
                viaturas.splice(indexVtr, 1);
                
                // Se removeu a PRINCIPAL e há apoios, o primeiro apoio vira principal
                const principalIdx = viaturas.findIndex(v => v.funcao==='PRINCIPAL');
                if(principalIdx < 0 && viaturas.length > 0) {
                    viaturas[0].funcao = 'PRINCIPAL';
                }
                
                // Se não há mais viaturas, volta para AGUARDANDO
                if(viaturas.length === 0) {
                    await api('tb_triagem', `id=eq.${idOcorrencia}`, 'PATCH', {
                        viaturas_empenhadas: [],
                        status: 'AGUARDANDO'
                    });
                } else {
                    await api('tb_triagem', `id=eq.${idOcorrencia}`, 'PATCH', {
                        viaturas_empenhadas: viaturas
                    });
                }
                
                // Liberar viatura para Disponível
                await api('tb_viaturas', `prefixo=eq.${vtrRemovida.prefixo}`, 'PATCH', {
                    status_viatura: 'Disponível'
                });
                
                alert(`${vtrRemovida.prefixo} retirado`);
                carregarMonitoramento();
                if(viaturas.length > 0) {
                    abrirModalOcorrencia(idOcorrencia);
                } else {
                    fecharModal('modalOcorrencia');
                }
                
            } catch(e) {
                console.log('Erro ao retirar viatura:', e);
            }
        }

        async function atualizarStatusTatico(idOcorrencia, indexVtr, novoStatus) {
            if(!idOcorrencia) {
                alert('ID de ocorrência inválido');
                console.error('ID inválido:', idOcorrencia);
                return;
            }
            
            try {
                console.log('Atualizando status tático:', idOcorrencia, indexVtr, novoStatus);
                
                idOcorrencia = String(idOcorrencia).trim();
                
                const ocoDados = await api('tb_triagem', `id=eq.${idOcorrencia}&select=*`);
                if(!ocoDados || !ocoDados.length) {
                    alert('Ocorrência não encontrada');
                    console.error('Ocorrência não encontrada:', idOcorrencia);
                    return;
                }
                
                const ocoAtual = ocoDados[0];
                let viaturas = ocoAtual.viaturas_empenhadas || [];
                
                if(!viaturas[indexVtr]) {
                    alert('Viatura não encontrada');
                    console.error('Viatura não encontrada no índice:', indexVtr);
                    return;
                }
                
                // Atualizar status da viatura
                viaturas[indexVtr].status_deslocamento = novoStatus;
                
                // Preparar payload com viaturas e timestamp na ocorrência
                const payload = { viaturas_empenhadas: viaturas };
                const agora = new Date().toISOString();
                
                // Adicionar timestamp no objeto da viatura E na ocorrência (para timer tático)
                if (novoStatus === 'NO LOCAL') {
                    viaturas[indexVtr].hora_chegada = agora;
                    payload.hora_local = agora; // Atualizar ocorrência para timer mostrar "L"
                    console.log('Status atualizado para NO LOCAL (L):', viaturas[indexVtr]);
                } else if (novoStatus === 'SAIU') {
                    viaturas[indexVtr].hora_saida_local = agora;
                    payload.hora_saida = agora; // Atualizar ocorrência para timer mostrar "S"
                    console.log('Status atualizado para SAIU (S):', viaturas[indexVtr]);
                }
                
                payload.viaturas_empenhadas = viaturas;
                console.log('Payload enviado:', payload);
                
                const result = await api('tb_triagem', `id=eq.${idOcorrencia}`, 'PATCH', payload);
                console.log('Resposta da API:', result);
                
                // Recarregar dados
                await carregarMonitoramento();
                await abrirModalOcorrencia(idOcorrencia);
                
            } catch(e) { 
                console.error('Erro ao atualizar status tático:', e);
                console.error('Detalhes:', e.message);
                alert('Erro ao atualizar status: ' + e.message);
            }
        }

        async function adicionarApoio() {
            if(!idOcorrenciaSelecao) return alert('Abra um drawer primeiro');
            abrirSelecaoFrota(idOcorrenciaSelecao, 'APOIO');
        }

        async function finalizarOcorrencia(id) {
            if(!confirm('Finalizar esta ocorrência?')) return;
            
            try {
                // 1. Buscar ocorrência
                const ocoDados = await api('tb_triagem', `id=eq.${id}&select=*`);
                if(!ocoDados.length) return;
                const ocoAtual = ocoDados[0];
                
                // 2. Atualizar status da ocorrência para FINALIZADA
                await api('tb_triagem', `id=eq.${id}`, 'PATCH', {
                    status: 'FINALIZADA'
                });
                
                // 3. Liberar todas as viaturas
                const viaturas = ocoAtual.viaturas_empenhadas || [];
                for(const vtr of viaturas) {
                    await api('tb_viaturas', `prefixo=eq.${vtr.prefixo}`, 'PATCH', {
                        status_viatura: 'Disponível'
                    });
                }
                
                alert('Ocorrência finalizada');
                fecharDrawer('dir');
                fecharDrawer('esq');
                carregarMonitoramento();
                
            } catch(e) {
                console.log('Erro ao finalizar ocorrência:', e);
                alert('Erro ao finalizar');
            }
        }

        // ===== FILTRO GLOBAL (DEEP SEARCH) =====
        function filtrarMonitoramento(texto) {
            const filterText = texto.toLowerCase();
            
            // Filtrar Desktop (Tabelas)
            const tbWait = document.getElementById('tableWait');
            if(tbWait) {
                tbWait.querySelectorAll('tr').forEach(linha => {
                    const buscaDados = linha.getAttribute('data-busca') || '';
                    linha.style.display = buscaDados.includes(filterText) ? '' : 'none';
                });
            }
            
            const tbAct = document.getElementById('tableActive');
            if(tbAct) {
                tbAct.querySelectorAll('tr').forEach(linha => {
                    const buscaDados = linha.getAttribute('data-busca') || '';
                    linha.style.display = buscaDados.includes(filterText) ? '' : 'none';
                });
            }

            // Filtrar Mobile (Cartões)
            const mobWait = document.getElementById('mobWaitBody');
            if(mobWait) {
                mobWait.querySelectorAll('.card-mobile').forEach(card => {
                    const buscaDados = card.getAttribute('data-busca') || '';
                    card.style.display = buscaDados.includes(filterText) ? '' : 'none';
                });
            }

            const mobAct = document.getElementById('mobActiveBody');
            if(mobAct) {
                mobAct.querySelectorAll('.card-mobile').forEach(card => {
                    const buscaDados = card.getAttribute('data-busca') || '';
                    card.style.display = buscaDados.includes(filterText) ? '' : 'none';
                });
            }
        }

        // ===== SELEÇÃO DE FROTA =====
        async function abrirSelecaoFrota(id, tipo) {
            idOcorrenciaSelecao = id;
            tipoFuncaoSelecao = tipo;
            
            const drawer = document.getElementById('drawer-selecao');
            const listDiv = document.getElementById('listaSelecaoFrota');
            
            // Limpar classes de visibilidade
            drawer.classList.remove('left-hidden', 'left-visible', 'right-hidden', 'right-visible');
            
            // Carregar viaturas
            listDiv.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">Carregando...</div>';
            
            try {
                const viaturas = await api('tb_viaturas', 'status_viatura=in.(DISPONIVEL,Disponível)&order=prefixo.asc');
                listDiv.innerHTML = '';
                
                if(viaturas.length === 0) {
                    listDiv.innerHTML = `
                        <div style="padding:30px; text-align:center;">
                            <div style="border: 2px dashed #444; border-radius:8px; padding:20px; margin-bottom:15px;">
                                <i class="fas fa-inbox" style="font-size:32px; color:#666; margin-bottom:10px; display:block;"></i>
                                <div style="color:#999; font-size:13px;">Nenhuma viatura disponível no momento</div>
                            </div>
                            <button class="btn btn-sm btn-outline" onclick="abrirSelecaoFrota('${id}', '${tipo}')" style="width:100%;">
                                <i class="fas fa-sync"></i> Atualizar
                            </button>
                        </div>
                    `;
                } else {
                    viaturas.forEach(v => {
                        const itemDiv = document.createElement('div');
                        itemDiv.style.cssText = 'background:#1a1a1a; border:1px solid #333; border-radius:6px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;';
                        
                        const infoDiv = document.createElement('div');
                        infoDiv.style.cssText = 'flex:1;';
                        infoDiv.innerHTML = `<div style="font-weight:700; font-size:13px; color:#fff;">${v.prefixo}</div><div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${v.tipo} | ${v.guarnicao || 'LIVRE'}</div>`;
                        
                        const btnDiv = document.createElement('div');
                        const btnSelect = document.createElement('button');
                        btnSelect.className = 'btn btn-sm btn-success';
                        btnSelect.innerText = 'Confirmar';
                        btnSelect.style.cssText = 'min-width:80px;';
                        btnSelect.onclick = async () => {
                            await despacharViatura(idOcorrenciaSelecao, v.prefixo, tipoFuncaoSelecao);
                            fecharSelecaoFrota();
                        };
                        btnDiv.appendChild(btnSelect);
                        
                        itemDiv.appendChild(infoDiv);
                        itemDiv.appendChild(btnDiv);
                        listDiv.appendChild(itemDiv);
                    });
                }
                
                // Animar entrada
                if(tipo === 'PRINCIPAL') {
                    drawer.classList.add('left-hidden');
                    // Force reflow
                    void drawer.offsetHeight;
                    drawer.classList.remove('left-hidden');
                    drawer.classList.add('left-visible');
                } else {
                    drawer.classList.add('right-hidden');
                    // Force reflow
                    void drawer.offsetHeight;
                    drawer.classList.remove('right-hidden');
                    drawer.classList.add('right-visible');
                }
                
            } catch(e) {
                console.log('Erro ao carregar viaturas:', e);
                listDiv.innerHTML = '<div style="padding:20px; color:#ff6b6b; text-align:center;">Erro ao carregar viaturas</div>';
            }
        }

async function copiarParaSade(id) {
    try {
        const d = await api('tb_triagem', `id=eq.${id}&select=*`);
        const info = d[0].dados_preenchidos;
        const icn = document.getElementById('iconeCopiarSade');
        
        const isAnon = (info.solicitante.nome||'').toUpperCase().includes('ANÔNIMO');
        const isSemRef = (info.endereco.referencia||'').toUpperCase().includes('SEM PONTO DE REFERÊNCIA');
        
        let textoDescricao = `${d[0].resumo_texto || ''}\n\n`;
        textoDescricao += `${info.endereco.cidade || ''}\n`;
        textoDescricao += `${info.endereco.logradouro || ''}\n`;
        textoDescricao += `${info.endereco.numero || ''}\n`;
        textoDescricao += `${info.endereco.bairro || ''}\n`;
        textoDescricao += `${info.endereco.referencia || 'SEM PONTO DE REFERÊNCIA'}`;

        if (info.veiculos && info.veiculos.length > 0) {
            textoDescricao += `\n\nVEÍCULOS:\n${info.veiculos.map(v => `[${v.placa||'S/P'}] ${v.desc}`).join('\n')}`;
        }
        if (info.suspeitos && info.suspeitos.length > 0) {
            textoDescricao += `\n\nSUSPEITOS:\n${info.suspeitos.join('\n')}`;
        }

        const jSade = {
            "NOME": info.solicitante.nome||"", "TELEFONE": info.solicitante.telefone||"", 
            "municipio_endereco": info.endereco.cidade||"", "pesquisa_endereco": info.endereco.logradouro||"", 
            "NUMERO": info.endereco.numero||"", "pesquisa_bairro": info.endereco.bairro||"", 
            "COMPLEMENTO": info.endereco.referencia||"", "CLASSIFICACAO_ATENDIMENTO": info.natureza||"", 
            "DESCRICAO": textoDescricao, 
            "extensao_anonimo": isAnon, "extensao_sem_ref": isSemRef
        };

        const tags = info.classificacoes || [];
        if(tags.includes('FERIDOS (NÃO)')) jSade["RESPOSTA_NIVEL_CRIME_0_0"] = true;
        if(tags.includes('FERIDOS (SIM)')) jSade["RESPOSTA_NIVEL_CRIME_0_1"] = true;
        if(tags.includes('FERIDOS (SUSPEITA)')) jSade["RESPOSTA_NIVEL_CRIME_0_2"] = true;

        if(tags.includes('AUTOR (NÃO)')) jSade["RESPOSTA_NIVEL_CRIME_1_0"] = true;
        if(tags.includes('AUTOR (SIM)')) jSade["RESPOSTA_NIVEL_CRIME_1_1"] = true;
        if(tags.includes('AUTOR (SUSPEITA)')) jSade["RESPOSTA_NIVEL_CRIME_1_2"] = true;

        if(tags.includes('ARMADO (NÃO)')) jSade["RESPOSTA_NIVEL_CRIME_2_0"] = true;
        if(tags.includes('ARMADO (SIM)')) jSade["RESPOSTA_NIVEL_CRIME_2_1"] = true;
        if(tags.includes('ARMADO (SUSPEITA)')) jSade["RESPOSTA_NIVEL_CRIME_2_2"] = true;

        if(tags.includes('TUMULTO (NÃO)')) jSade["RESPOSTA_NIVEL_CRIME_3_0"] = true;
        if(tags.includes('TUMULTO (SIM)')) jSade["RESPOSTA_NIVEL_CRIME_3_1"] = true;
        if(tags.includes('TUMULTO (SUSPEITA)')) jSade["RESPOSTA_NIVEL_CRIME_3_2"] = true;

        await navigator.clipboard.writeText(JSON.stringify(jSade));
        icn.className = 'fas fa-check'; icn.style.color = 'var(--success)';
        setTimeout(() => { icn.className = 'fas fa-copy'; icn.style.color = 'var(--text-muted)'; }, 2000);
    } catch(e) { alert('Erro: ' + e.message); }
}

async function compartilharWhatsApp(id) {
    try {
        const d = await api('tb_triagem', `id=eq.${id}&select=*`); 
        const i = d[0].dados_preenchidos;
        
        const relatoSujo = d[0].resumo_texto || 'Sem relato';
        const relatoLimpo = relatoSujo.replace(/\n\s*\n/g, '\n');
        
        const tags = i.classificacoes && i.classificacoes.length > 0 ? `\n\n⚠️ *CLASSIFICAÇÃO:* ${i.classificacoes.join(' | ')}` : '';
        
        // Formata o endereço por extenso para leitura
        const enderecoFormatado = `${i.endereco.logradouro}, ${i.endereco.numero} - ${i.endereco.bairro}, ${i.endereco.cidade}`;
        
        // Gera o link oficial de busca do Google Maps baseado no endereço
        const linkMapa = `https://maps.google.com/?q=${encodeURIComponent(enderecoFormatado)}`;
        
        // Constrói o texto separando o LOCAL e o MAPA em linhas diferentes
        const txt = `🚨 *OCORRÊNCIA:* ${i.natureza}\n📍 *LOCAL:* ${enderecoFormatado}\n🗺️ *MAPA:* ${linkMapa}\n📌 *REFERÊNCIA:* ${i.endereco.referencia || 'Sem ponto de referência'}\n👤 *SOLICITANTE:* ${i.solicitante.nome} - ${i.solicitante.telefone}\n📝 *RELATO:* ${relatoLimpo}${tags}`;
        
        await navigator.clipboard.writeText(txt);
        window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
    } catch(e) { 
        alert('Erro ao partilhar no WhatsApp.'); 
    }
}

async function editarEndereco() {
    try {
        // Detectar qual ID está ativo (Alerta ou Ocorrência)
        const id = idAlertaAberto || idOcorrenciaAberta;
        if(!id) return alert('Nenhum registro aberto para editar.');
        
        const tabela = 'tb_triagem'; // Será 'tb_alertas' ou 'tb_ocorrencias_ativas' quando separadas
        const d = await api(tabela, `id=eq.${id}&select=*`);
        const e = d[0].dados_preenchidos.endereco;
        
        document.getElementById('ed_cep').value = e.cep || ''; document.getElementById('ed_cidade').value = e.cidade || '';
        document.getElementById('ed_log').value = e.logradouro || ''; document.getElementById('ed_num').value = e.numero || '';
        document.getElementById('ed_bairro').value = e.bairro || ''; document.getElementById('ed_ref').value = e.referencia || '';
        document.getElementById('modalEditarEndereco').style.display = 'flex';
    } catch(e) {
        console.error('Erro ao abrir edição de endereço:', e);
        alert('Erro ao carregar endereço: ' + e.message);
    }
}

async function salvarEdicaoEndereco() {
    try {
        // Detectar qual ID está ativo e qual modal reabrir
        const id = idAlertaAberto || idOcorrenciaAberta;
        const esAlerta = !!idAlertaAberto;
        if(!id) return alert('Nenhum registro aberto para editar.');
        
        const tabela = 'tb_triagem'; // Será 'tb_alertas' ou 'tb_ocorrencias_ativas' quando separadas
        const d = await api(tabela, `id=eq.${id}&select=*`);
        const info = d[0].dados_preenchidos;
        
        info.endereco.cep = document.getElementById('ed_cep').value;
        info.endereco.cidade = document.getElementById('ed_cidade').value.toUpperCase();
        info.endereco.logradouro = document.getElementById('ed_log').value.toUpperCase();
        info.endereco.numero = document.getElementById('ed_num').value.toUpperCase();
        info.endereco.bairro = document.getElementById('ed_bairro').value.toUpperCase();
        info.endereco.referencia = document.getElementById('ed_ref').value.toUpperCase();
        info.endereco.formatado = `${info.endereco.logradouro}, ${info.endereco.numero} - ${info.endereco.bairro}, ${info.endereco.cidade}`;
        
        await api(tabela, `id=eq.${id}`, 'PATCH', { dados_preenchidos: info });
        
        fecharModal('modalEditarEndereco');
        
        // Recarregar e reabrirmodal correto
        if(esAlerta) {
            carregarAlertas();
            abrirModalAlerta(id);
        } else {
            carregarMonitoramento();
            abrirModalOcorrencia(id);
        }
    } catch(e) {
        console.error('Erro ao salvar endereço:', e);
        alert('Erro ao salvar endereço: ' + e.message);
    }
}

// --- RADAR LATERAL (SADE EMULATOR) ---
let radarOcorrenciasMemoria = [];

async function carregarOcorrenciasParaRadar() {
    const radarConteudo = document.getElementById('radar-conteudo');
    if (!radarConteudo) return;
    
    if(radarOcorrenciasMemoria.length === 0) {
        radarConteudo.innerHTML = '<div style="padding:15px;text-align:center;color:var(--text-muted);font-size:12px;"><i class="fas fa-spinner fa-spin"></i> Atualizando...</div>';
    }
    
    try {
        const data = await api('tb_triagem', `status=in.("AGUARDANDO","EM_ANDAMENTO")&order=criado_em.desc${_filtroAgencia()}`);
        radarOcorrenciasMemoria = data || [];
        renderizarRadarLateral();
    } catch(e) {
        console.error("Erro ao carregar radar:", e);
        radarConteudo.innerHTML = '<div style="padding:15px;text-align:center;color:var(--danger);font-size:12px;">Erro de conexão radar.</div>';
    }
}

function _normStr(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function renderizarRadarLateral() {
    const radarConteudo = document.getElementById('radar-conteudo');
    if (!radarConteudo) return;
    
    if (radarOcorrenciasMemoria.length === 0) {
        radarConteudo.innerHTML = '<div style="padding:15px;text-align:center;color:var(--text-muted);font-size:12px;">Nenhuma ocorrência operante.</div>';
        return;
    }

    const filtroCidade = _normStr(document.getElementById('endCidade')?.value || '');
    const filtroBairro = _normStr(document.getElementById('endBairro')?.value || '');
    const filtroRua = _normStr(document.getElementById('endLog')?.value || '');

    let filtradas = radarOcorrenciasMemoria.map(oc => {
        const info = oc.dados_preenchidos;
        
        const ocCidade = _normStr(info.endereco?.cidade || '');
        const ocBairro = _normStr(info.endereco?.bairro || '');
        const ocRua = _normStr(info.endereco?.logradouro || '');
        const relato = _normStr(oc.resumo_texto || '');

        let score = 0;
        if (filtroRua && filtroRua.length > 2 && (ocRua.includes(filtroRua) || relato.includes(filtroRua))) {
            score += 2;
        }
        if (filtroBairro && filtroBairro.length > 2 && (ocBairro.includes(filtroBairro) || relato.includes(filtroBairro))) {
            score += 1;
        }

        const matchRua = (filtroRua && filtroRua.length > 2 && ocRua.includes(filtroRua));
        const matchCidade = (filtroCidade && ocCidade.includes(filtroCidade));
        const isDupl = matchRua && matchCidade;

        return { ...oc, score, isDuplicidade: isDupl };
    });

    filtradas.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.criado_em) - new Date(a.criado_em);
    });

    let html = '';
    filtradas.forEach(oc => {
        const info = oc.dados_preenchidos || {};
        const isDesp = oc.status === 'EM_ANDAMENTO';
        const strBadge = isDesp ? 'DESPACHADA' : 'AGUARDA';
        const cssBadge = isDesp ? 'badge-despachada' : 'badge-aguardando';
        const tempoTop = obterHoraCriacao(oc);
        const tempoDur = obterDuracaoUltimaAtualizacao(oc);

        let descText = oc.resumo_texto || "Sem descrição.";
        descText = descText.replace(/"/g, '&quot;');

        const estiloFundo = oc.isDuplicidade ? 'background: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.5);' : '';

        html += `
            <div class="sade-card" data-descricao="${descText}" onclick="abrirModalOcorrencia('${oc.id}', 'atendimento')" style="cursor:pointer; ${estiloFundo}">
                <div class="card-topo">
                    <span class="card-natureza" title="${info.natureza || 'N/I'}">${info.natureza || 'N/A'}</span>
                    <span class="card-badge ${cssBadge}">${strBadge}</span>
                </div>
                <div class="card-meio">
                    <span class="card-endereco">${info.endereco?.formatado || 'Sem endereço'}</span>
                </div>
                <div class="card-rodape">
                    <span class="card-tempo"><i class="fas fa-calendar-alt"></i> ${tempoTop}</span>
                    <span class="card-timer"><i class="fas fa-hourglass-half"></i> ${tempoDur}</span>
                </div>
            </div>
        `;
    });
    radarConteudo.innerHTML = html;
}

setTimeout(() => {
    ['endCidade', 'endBairro', 'endLog'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', renderizarRadarLateral);
    });

    const camposAuto = [
        { in: 'endCidade', sug: 'sugestoesCidade', prox: 'endLog' },
        { in: 'endLog', sug: 'sugestoesLog', prox: 'endNum' },
        { in: 'endBairro', sug: 'sugestoesBairro', prox: 'endRef' },
        { in: 'ocNatureza', sug: 'sugestoesNatureza', prox: 'ocRelato' }
    ];
    camposAuto.forEach(c => {
        const el = document.getElementById(c.in);
        if (!el) return;
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const box = document.getElementById(c.sug);
                if (box && !box.classList.contains('hidden') && box.firstChild) {
                    e.preventDefault();
                    box.firstChild.click();
                    const p = document.getElementById(c.prox);
                    if (p) p.focus();
                }
            }
        });
    });

    const ocRelato = document.getElementById('ocRelato');
    if (ocRelato) {
        ocRelato.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const btn = document.getElementById('btnGerar');
                if (btn) btn.focus();
            }
        });
    }

    const btnGerar = document.getElementById('btnGerar');
    if (btnGerar) {
        btnGerar.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const tel = document.getElementById('solTel');
                if (tel) tel.focus();
            }
        });
    }

    // Ao iniciar o app, carregar o radar (somente se usuário já está logado)
    if(usuarioAtual) {
        carregarOcorrenciasParaRadar();
    }
    // Refresh dos dados no banco a cada 1 minuto (com guard de sessão)
    setInterval(() => { if(usuarioAtual) carregarOcorrenciasParaRadar(); }, 60000);
}, 1000);
// --- Função FAB Mobile ---
function toggleRadarMobile() {
    const radar = document.getElementById('coluna-radar');
    const fab = document.getElementById('fab-radar');
    if(radar && fab) {
        radar.classList.toggle('offcanvas-active');
        fab.classList.toggle('fab-active');
    }
}

// ===================================================================
// ===== FUNÇÕES DO MODERADOR ========================================
// ===================================================================

let _todosUsuariosModerador = [];

async function carregarUsuariosModerador() {
    const tb = document.getElementById('modTabelaUsuarios');
    if(!tb) return;
    tb.innerHTML = '<tr><td colspan="7" style="padding:20px;color:var(--text-muted);text-align:center;"><i class="fas fa-spinner fa-spin"></i> Buscando...</td></tr>';

    try {
        const users = await api('tb_usuarios', 'select=*&order=criado_em.desc');
        _todosUsuariosModerador = users;

        // Calcular stats
        const ativos   = users.filter(u => u.status_conta !== 'EXCLUIDO');
        const total    = ativos.length;
        const pend     = ativos.filter(u => u.status_conta === 'PENDENTE').length;
        const admins   = ativos.filter(u => u.perfil_acesso === 'Admin' && u.status_conta === 'VALIDADO').length;
        const bloq     = ativos.filter(u => u.status_conta === 'BLOQUEADO').length;

        const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
        setEl('mod-stat-total', total);
        setEl('mod-stat-pendentes', pend);
        setEl('mod-stat-admins', admins);
        setEl('mod-stat-bloqueados', bloq);

        renderTabelaUsuariosModerador(users);
        carregarChavesModerador();

    } catch(e) {
        tb.innerHTML = '<tr><td colspan="7" style="padding:20px;color:var(--danger);text-align:center;">Erro ao carregar usuários.</td></tr>';
        console.error(e);
    }
}

function renderTabelaUsuariosModerador(users) {
    const tb = document.getElementById('modTabelaUsuarios');
    if(!tb) return;
    tb.innerHTML = '';

    const lista = users.filter(u => u.status_conta !== 'EXCLUIDO');

    if(!lista.length) {
        tb.innerHTML = '<tr><td colspan="7" style="padding:20px;color:var(--text-muted);text-align:center;">Nenhum usuário encontrado.</td></tr>';
        return;
    }

    lista.forEach(u => {
        const corStatus = { 'VALIDADO': 'var(--success)', 'PENDENTE': 'var(--warning)', 'BLOQUEADO': 'var(--danger)' }[u.status_conta] || 'var(--text-muted)';
        const nomeSeguro = (u.nome_guerra || '-').replace(/'/g, "\\'");
        const perfilSeguro = (u.perfil_acesso || '').replace(/'/g, "\\'");

        const btnAprovar  = u.status_conta !== 'VALIDADO'  ? `<button class="btn btn-sm btn-success" onclick="moderadorAprovarUsuario('${u.id}')" title="Aprovar">✅</button>` : '';
        const btnBloquear = u.status_conta !== 'BLOQUEADO' ? `<button class="btn btn-sm btn-outline" onclick="moderadorBloquearUsuario('${u.id}')" title="Bloquear">🚫</button>` : '';

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = `
            <td style="padding:10px;font-weight:600;">${u.nome_guerra || '-'}</td>
            <td style="padding:10px;font-size:12px;">${u.agencia || '-'}</td>
            <td style="padding:10px;font-size:12px;">${u.uf_origem || '-'}</td>
            <td style="padding:10px;">${u.perfil_acesso || '-'}</td>
            <td style="padding:10px;"><span style="color:${corStatus};font-weight:700;">${u.status_conta || '-'}</span></td>
            <td style="padding:10px;font-size:12px;color:var(--text-muted);">${u.cpf_login || '-'}</td>
            <td style="padding:10px;">
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                    ${btnAprovar}
                    ${btnBloquear}
                    <button class="btn btn-sm btn-outline" onclick="moderadorAbrirAlterarPerfil('${u.id}','${perfilSeguro}','${nomeSeguro}')" title="Alterar Perfil">✏️</button>
                    <button class="btn btn-sm btn-outline" onclick="moderadorExcluirUsuario('${u.id}')" title="Excluir">🗑️</button>
                </div>
            </td>`;
        tb.appendChild(tr);
    });
}

function filtrarUsuariosModerador() {
    const status = document.getElementById('mod-filtro-status')?.value || 'TODOS';
    const busca  = (document.getElementById('mod-filtro-busca')?.value || '').toLowerCase();

    let lista = _todosUsuariosModerador;

    if(status !== 'TODOS') {
        lista = lista.filter(u => {
            if(status === 'Admin') return u.perfil_acesso === 'Admin' && u.status_conta !== 'EXCLUIDO';
            return u.status_conta === status;
        });
    }

    if(busca) {
        lista = lista.filter(u => {
            const campos = [u.nome_guerra, u.nome_completo, u.agencia, u.cpf_login, u.perfil_acesso, u.uf_origem, u.cidade_origem].join(' ').toLowerCase();
            return campos.includes(busca);
        });
    }

    renderTabelaUsuariosModerador(lista);
}

async function moderadorAprovarUsuario(id) {
    if(!confirm('Aprovar este usuário?')) return;
    try {
        await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { status_conta: 'VALIDADO' });
        carregarUsuariosModerador();
    } catch(e) { alert('Erro: ' + e.message); }
}

async function moderadorBloquearUsuario(id) {
    if(!confirm('Bloquear este usuário?')) return;
    try {
        await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { status_conta: 'BLOQUEADO' });
        carregarUsuariosModerador();
    } catch(e) { alert('Erro: ' + e.message); }
}

async function moderadorExcluirUsuario(id) {
    if(!confirm('Excluir este usuário? Esta ação não pode ser desfeita.')) return;
    try {
        await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { status_conta: 'EXCLUIDO' });
        carregarUsuariosModerador();
    } catch(e) { alert('Erro: ' + e.message); }
}

function moderadorAbrirAlterarPerfil(id, perfilAtual, nomeGuerra) {
    document.getElementById('ap_id').value    = id;
    document.getElementById('ap_nome').value  = nomeGuerra;
    document.getElementById('ap_perfil').value = perfilAtual;
    document.getElementById('modalAlterarPerfil').style.display = 'flex';
}

async function moderadorSalvarAlterarPerfil() {
    const id     = document.getElementById('ap_id').value;
    const perfil = document.getElementById('ap_perfil').value;
    if(!id || !perfil) return alert('Dados inválidos.');
    try {
        await api('tb_usuarios', `id=eq.${id}`, 'PATCH', { perfil_acesso: perfil });
        fecharModal('modalAlterarPerfil');
        alert('Perfil alterado com sucesso!');
        carregarUsuariosModerador();
    } catch(e) { alert('Erro: ' + e.message); }
}

async function carregarChavesModerador() {
    const tb = document.getElementById('modTabelaChaves');
    if(!tb) return;
    tb.innerHTML = '<tr><td colspan="6" style="padding:12px;color:var(--text-muted);text-align:center;"><i class="fas fa-spinner fa-spin"></i></td></tr>';
    try {
        const list = await api('tb_chaves_acesso', 'select=*&order=criado_em.desc');
        tb.innerHTML = '';
        if(!list.length) {
            tb.innerHTML = '<tr><td colspan="6" style="padding:20px;color:var(--text-muted);text-align:center;">Nenhuma chave cadastrada.</td></tr>';
            return;
        }
        list.forEach(k => {
            const ativaLabel   = k.ativa ? '<span style="color:var(--success);">✅ Ativa</span>' : '<span style="color:var(--danger);">❌ Inativa</span>';
            const val = Number(k.validade_horas);
            const validadeLabel = val === 0 ? 'Permanente' : val >= 604800 ? '7 dias' : val >= 86400 ? '24 horas' : '1 hora';
            tb.innerHTML += `<tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px;font-weight:600;">${k.codigo || '-'}</td>
                <td style="padding:10px;">${k.perfil_padrao || '-'}</td>
                <td style="padding:10px;font-size:12px;">${validadeLabel}</td>
                <td style="padding:10px;font-size:12px;color:var(--text-muted);">${k.criado_por_nome || 'Sistema'}</td>
                <td style="padding:10px;">${ativaLabel}</td>
                <td style="padding:10px;">
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-sm btn-outline" onclick="moderadorAbrirEditarChave('${k.id}')" title="Editar">✏️</button>
                        <button class="btn btn-sm btn-outline" onclick="moderadorExcluirChave('${k.id}')" title="Excluir">🗑️</button>
                    </div>
                </td>
            </tr>`;
        });
    } catch(e) {
        tb.innerHTML = '<tr><td colspan="6" style="padding:12px;color:var(--danger);text-align:center;">Erro ao carregar chaves.</td></tr>';
        console.error(e);
    }
}

async function moderadorAbrirEditarChave(id) {
    try {
        const res = await api('tb_chaves_acesso', `id=eq.${id}&select=*`);
        if(!res.length) return;
        const k = res[0];
        document.getElementById('ek_id').value       = k.id;
        document.getElementById('ek_codigo').value   = k.codigo || '';
        document.getElementById('ek_perfil').value   = k.perfil_padrao || 'Atendente';
        document.getElementById('ek_validade').value = String(k.validade_horas ?? 0);
        document.getElementById('ek_ativa').checked  = k.ativa !== false;
        document.getElementById('ek_cidade').value   = k.cidade_restricao || '';
        document.getElementById('modalEditarChave').style.display = 'flex';
    } catch(e) { alert('Erro ao buscar chave: ' + e.message); }
}

async function moderadorSalvarEdicaoChave() {
    const id             = document.getElementById('ek_id').value;
    const codigo         = document.getElementById('ek_codigo').value.trim().toUpperCase();
    const perfil         = document.getElementById('ek_perfil').value;
    const validade       = document.getElementById('ek_validade').value;
    const ativa          = document.getElementById('ek_ativa').checked;
    const cidadeRestricao = (document.getElementById('ek_cidade')?.value || '').trim().toUpperCase() || null;
    if(!id || !codigo) return alert('Preencha o código da chave.');
    try {
        await api('tb_chaves_acesso', `id=eq.${id}`, 'PATCH', {
            codigo,
            perfil_padrao: perfil,
            validade_horas: validade,
            ativa,
            cidade_restricao: cidadeRestricao
        });
        fecharModal('modalEditarChave');
        alert('Chave atualizada!');
        carregarChavesModerador();
    } catch(e) { alert('Erro: ' + e.message); }
}

async function moderadorExcluirChave(id) {
    if(!confirm('Excluir esta chave de acesso?')) return;
    try {
        await api('tb_chaves_acesso', `id=eq.${id}`, 'DELETE');
        carregarChavesModerador();
    } catch(e) { alert('Erro: ' + e.message); }
}

