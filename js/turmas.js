document.addEventListener('DOMContentLoaded', function() {
    const DIAS = ["segunda", "terca", "quarta", "quinta", "sexta"];
    // ========== ELEMENTOS DO DROPDOWN E SIDEBAR ==========
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');

    // ========== ELEMENTOS DAS TURMAS ==========
    const turmasList = document.getElementById('turmasList');
    const searchInput = document.getElementById('searchInput');
    const filterSerie = document.getElementById('filterSerie');
    const filterStatus = document.getElementById('filterStatus');
    const addTurmaBtn = document.getElementById('addTurmaBtn');
    const turmaModal = document.getElementById('turmaModal');
    const confirmModal = document.getElementById('confirmModal');
    const turmaForm = document.getElementById('turmaForm');
    const modalTitle = document.getElementById('modalTitle');
    const horarioModal = document.getElementById('horarioModal');
    const closeHorarioModalBtn = document.getElementById('closeHorarioModal');
    const horarioModalTitle = document.getElementById('horarioModalTitle');
    const horarioModalAno = document.getElementById('horarioModalAno');
    const horarioModalObs = document.getElementById('horarioModalObs');
    const horarioModalTableWrapper = document.getElementById('horarioModalTableWrapper');
    const horarioModalTableBody = document.querySelector('#horarioModalTable tbody');
    const horarioModalEmpty = document.getElementById('horarioModalEmpty');
    
    // URLs da API
    const API_BASE_URL = 'http://localhost:3000';
    
    // Variáveis de estado
    let turmas = [];
    let currentTurmaId = null;
    let currentAction = null;

    // ========== FUNÇÕES DO DROPDOWN E SIDEBAR ==========

    // Configurar dropdown do perfil
    function setupProfileDropdown() {
        if (profileBtn && profileDropdown) {
            // Toggle do dropdown
            profileBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });

            // Fechar dropdown ao clicar fora
            document.addEventListener('click', function() {
                if (profileDropdown) {
                    profileDropdown.classList.remove('show');
                }
            });

            // Prevenir fechamento ao clicar no dropdown
            profileDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            // Configurar logout (redireciona diretamente se não houver modal)
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (profileDropdown) profileDropdown.classList.remove('show');
                    fazerLogout();
                });
            }
        }
    }

    // Configurar toggle da sidebar
    function setupSidebarToggle() {
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', function() {
                // Adiciona delay para melhor experi?ncia da animação
                this.style.pointerEvents = 'none';
                
                sidebar.classList.toggle('collapsed');
                atualizarIconeToggle();
                
                // Reativa os cliques após a animação
                setTimeout(() => {
                    this.style.pointerEvents = 'auto';
                }, 300);
            });
        }
    }

    // Atualizar ícone do toggle com animação
    function atualizarIconeToggle() {
        if (!toggleBtn || !sidebar) return;
        
        const icon = toggleBtn.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            // Sidebar recolhida - gira para a direita
            icon.style.transform = 'rotate(180deg)';
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            // Sidebar expandida - gira para a esquerda
            icon.style.transform = 'rotate(0deg)';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    }

    // Configurar navegação do menu
    function setupMenuNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Fechar sidebar no mobile
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.remove('show');
                }
            });
        });
    }

    // Atualizar dados do usuário logado
    function atualizarUsuarioLogado() {
        try {
            const usuarioLogado = localStorage.getItem('usuarioLogado');
            const fallbackUsuario = {
                nome: 'Coordenador',
                cargo: 'Coordenador'
            };

            const dadosUsuario = usuarioLogado ? JSON.parse(usuarioLogado) : fallbackUsuario;

            // Atualizar nome do usuário na UI (sem redirecionar ao dar F5)
            const userNameElement = document.getElementById('userName');
            const welcomeNameElement = document.getElementById('welcomeName');
            
            if (userNameElement) {
                userNameElement.textContent = dadosUsuario.nome;
            }
            
            if (welcomeNameElement) {
                welcomeNameElement.textContent = dadosUsuario.nome.split(' ')[0];
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    // Função de logout
    function fazerLogout() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }

    // Setup do menu mobile
    function setupMobileMenu() {
        // Criar botão de menu mobile apenas se não existir
        if (document.querySelector('.mobile-menu-btn')) return;

        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 999;
            background: #0D6EFD;
            color: white;
            border: none;
            border-radius: 6px;
            width: 40px;
            height: 40px;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(mobileMenuBtn);

        mobileMenuBtn.addEventListener('click', function() {
            if (sidebar) sidebar.classList.toggle('show');
        });

        function handleResponsive() {
            if (window.innerWidth <= 768) {
                mobileMenuBtn.style.display = 'flex';
                if (sidebar) sidebar.classList.remove('collapsed');
            } else {
                mobileMenuBtn.style.display = 'none';
                if (sidebar) sidebar.classList.remove('show');
            }
        }

        window.addEventListener('resize', handleResponsive);
        handleResponsive();
    }

    // ========== FUNÇÕES DAS MATÉRIAS ==========

    // Inicialização
    async function init() {
        // Configurar funcionalidades da sidebar
        setupProfileDropdown();
        setupSidebarToggle();
        setupMenuNavigation();
        atualizarUsuarioLogado();
        setupMobileMenu();
        
        // Carregar dados das turmas
        await loadTurmas();
        setupTurmasEventListeners();
    }

    // Configurar event listeners específicos das turmas
    function setupTurmasEventListeners() {
        // Pesquisa e filtros
        if (searchInput) searchInput.addEventListener('input', filterTurmas);
        if (filterSerie) filterSerie.addEventListener('change', filterTurmas);
        if (filterStatus) filterStatus.addEventListener('change', filterTurmas);

        // Modal de turma
        if (addTurmaBtn) addTurmaBtn.addEventListener('click', openAddModal);
        
        const closeModalBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeTurmaModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeTurmaModal);

        // Formulário
        if (turmaForm) turmaForm.addEventListener('submit', handleTurmaSubmit);
        if (closeHorarioModalBtn) closeHorarioModalBtn.addEventListener('click', closeHorarioModal);

        // Modal de confirmação
        const closeConfirmModalBtn = document.getElementById('closeConfirmModal');
        const cancelConfirmBtn = document.getElementById('cancelConfirm');
        const confirmActionBtn = document.getElementById('confirmAction');
        
        if (closeConfirmModalBtn) closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
        if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', closeConfirmModal);
        if (confirmActionBtn) confirmActionBtn.addEventListener('click', handleConfirmAction);

        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (turmaModal && e.target === turmaModal) closeTurmaModal();
            if (confirmModal && e.target === confirmModal) closeConfirmModal();
            if (horarioModal && e.target === horarioModal) closeHorarioModal();
        });
    }

    // Carregar turmas do JSON Server
    async function loadTurmas() {
        try {
            showLoadingState();
            
            const response = await fetch(`${API_BASE_URL}/turma`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar turmas');
            }

            turmas = deduplicarTurmas(await response.json());

            // Reaplica horário salvo localmente quando existir backup
            for (const key of Object.keys(localStorage)) {
                if (!key.startsWith('horario_turma_')) continue;
                const id = key.replace('horario_turma_', '');
                try {
                    const payload = JSON.parse(localStorage.getItem(key) || '{}');
                    const turmaLocal = turmas.find(t => `${t.id}` === id);
                    if (turmaLocal && payload) {
                        turmaLocal.horario = payload.horario ?? turmaLocal.horario;
                        turmaLocal.horarioAnoLetivo = payload.horarioAnoLetivo ?? turmaLocal.horarioAnoLetivo;
                        turmaLocal.horarioObservacoes = payload.horarioObservacoes ?? turmaLocal.horarioObservacoes;
                        turmaLocal.horarioAtualizadoEm = payload.horarioAtualizadoEm ?? turmaLocal.horarioAtualizadoEm;
                    }
                } catch (err) {
                    console.warn('Não foi possível aplicar backup local do horário', err);
                }
            }

            renderTurmas();
            
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            showErrorState('Erro ao carregar turmas. Verifique se o JSON Server está rodando.');
        }
    }

    // Estado de carregamento
    function showLoadingState() {
        if (!turmasList) return;
        
        turmasList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner-large"></div>
                <p>Carregando turmas...</p>
            </div>
        `;
    }

    // Estado de erro
    function showErrorState(message) {
        if (!turmasList) return;
        
        turmasList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Renderizar lista de turmas
    function renderTurmas(filteredTurmas = turmas) {
        if (!turmasList) return;

        if (filteredTurmas.length === 0) {
            turmasList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Nenhuma turma encontrada</h3>
                    <p>Tente ajustar os filtros de pesquisa</p>
                </div>
            `;
            return;
        }

        turmasList.innerHTML = filteredTurmas.map(turma => {
            return `
                <div class="turma-card" data-turma-id="${turma.id}">
                    <div class="turma-main">
                        <div class="turma-info">
                            <div class="turma-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="turma-details">
                                <h3>${turma.nome}</h3>
                                <div class="turma-meta">
                                    <span class="turma-serie ${getSerieClass(turma.serie)}">${turma.serie}</span>
                                    <span class="turma-status ${turma.status === 'Ativo' ? 'active' : 'inactive'}">
                                        ${turma.status}
                                    </span>
                                    <span>${turma.qtdalunos || 0} alunos</span>
                                    ${turma.sala ? `<span>${formatSala(turma.sala)}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="turma-actions">
                            <span class="alunos-badge">${turma.qtdalunos || 0} alunos</span>
                            <button class="btn-view-horario" data-turma-id="${turma.id}">
                                <i class="fas fa-calendar-day"></i>
                                Ver horário
                            </button>
                            <button class="btn-edit" data-turma-id="${turma.id}">
                                <i class="fas fa-edit"></i>
                                Editar
                            </button>
                            <button class="btn-inactivate ${turma.status === 'Inativo' ? 'inactive' : ''}" 
                                    data-turma-id="${turma.id}">
                                <i class="fas ${turma.status === 'Ativo' ? 'fa-user-slash' : 'fa-user-check'}"></i>
                                ${turma.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                            </button>
                        </div>
                    </div>
                    <div class="turma-horario-preview">
                        ${renderHorarioPreview(turma.horario)}
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar event listeners aos botões
        addButtonEventListeners();
    }

    function renderHorarioPreview(horario) {
        if (!horario || Object.keys(horario).length === 0) {
            return `<p class="horario-empty"><i class="fas fa-clock"></i> Horário ainda não gerado.</p>`;
        }

        const horas = obterHorasOrdenadas(horario).slice(0, 3);
        const linhas = horas.map(hora => {
            const colunas = DIAS.map(dia => {
                const aula = horario[dia]?.[hora];
                return `<td>${aula ? aula.materiaNome : "-"}</td>`;
            }).join("");
            return `<tr><th>${hora}</th>${colunas}</tr>`;
        }).join("");

        return `
            <div class="horario-preview-wrapper">
                <p><i class="fas fa-calendar-check"></i> Horário salvo</p>
                <table class="horario-preview-table">
                    <thead>
                        <tr>
                            <th>Horário</th>
                            <th>Seg</th>
                            <th>Ter</th>
                            <th>Qua</th>
                            <th>Qui</th>
                            <th>Sex</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhas}
                    </tbody>
                </table>
            </div>
        `;
    }

    function obterHorasOrdenadas(horario) {
        const conjunto = new Set();
        for (const dia of DIAS) {
            const horasDia = Object.keys(horario?.[dia] || {});
            horasDia.forEach((hora) => conjunto.add(hora));
        }
        return [...conjunto].sort((a, b) => {
            const [ha, ma] = a.split(":").map(Number);
            const [hb, mb] = b.split(":").map(Number);
            return ha === hb ? ma - mb : ha - hb;
        });
    }

    async function showHorarioModal(turmaId) {
        if (!horarioModal) return;
        try {
            const response = await fetch(`${API_BASE_URL}/turma/${turmaId}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar horário da turma');
            }
            const turma = await response.json();
            preencherHorarioModal(turma);
            horarioModal.classList.add('show');
        } catch (error) {
            console.error('Erro ao abrir horário da turma:', error);
            showNotification('Não foi possível carregar o horário desta turma.', 'error');
        }
    }

    function preencherHorarioModal(turma) {
        if (!horarioModalTitle || !horarioModalTableBody) return;
        const horario = turma.horario ?? {};
        const horas = obterHorasOrdenadas(horario);

        horarioModalTitle.textContent = `Horário • ${turma.nome ?? ''}`;
        if (horarioModalAno) horarioModalAno.textContent = turma.horarioAnoLetivo ?? '-';
        if (horarioModalObs) {
            horarioModalObs.textContent = turma.horarioObservacoes
                ? `Observações: ${turma.horarioObservacoes}`
                : 'Sem observações registradas.';
        }

        if (!horas.length) {
            if (horarioModalTableWrapper) horarioModalTableWrapper.style.display = 'none';
            if (horarioModalEmpty) horarioModalEmpty.style.display = 'block';
            horarioModalTableBody.innerHTML = '';
            return;
        }

        if (horarioModalTableWrapper) horarioModalTableWrapper.style.display = 'block';
        if (horarioModalEmpty) horarioModalEmpty.style.display = 'none';

        horarioModalTableBody.innerHTML = horas.map(hora => {
            const colunas = DIAS.map(dia => {
                const aula = horario[dia]?.[hora];
                return `<td>${aula ? aula.materiaNome : '-'}</td>`;
            }).join('');
            return `<tr><th>${hora}</th>${colunas}</tr>`;
        }).join('');
    }

    function closeHorarioModal() {
        if (horarioModal) horarioModal.classList.remove('show');
        if (horarioModalTableBody) horarioModalTableBody.innerHTML = '';
        if (horarioModalTableWrapper) horarioModalTableWrapper.style.display = 'none';
        if (horarioModalEmpty) horarioModalEmpty.style.display = 'block';
    }

    // Adicionar event listeners aos botões
    function addButtonEventListeners() {
        const viewButtons = turmasList.querySelectorAll('.btn-view-horario');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const turmaId = this.getAttribute('data-turma-id');
                showHorarioModal(turmaId);
            });
        });

        // Clique no card inteiro abre o horário (exceto quando clicar nos botões)
        const cards = turmasList.querySelectorAll('.turma-card');
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                const isButton = e.target.closest('button');
                if (isButton) return;
                const turmaId = this.getAttribute('data-turma-id');
                showHorarioModal(turmaId);
            });
        });

        // Botões de editar
        const editButtons = turmasList.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const turmaId = this.getAttribute('data-turma-id');
                editTurma(turmaId);
            });
        });

        // Botões de inativar/ativar
        const toggleButtons = turmasList.querySelectorAll('.btn-inactivate');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const turmaId = this.getAttribute('data-turma-id');
                toggleTurmaStatus(turmaId);
            });
        });
    }

    // Funções auxiliares para formatação
    function getSerieClass(serie) {
        const series = {
            'Fase I': 'primeiro',
            'Fase II': 'segundo',
            'Fase III': 'terceiro'
        };
        return series[serie] || 'primeiro';
    }

    function formatSala(sala) {
        if (!sala) return '';
        const cleaned = sala.trim().replace(/^Sala\s+/i, '').trim();
        return cleaned ? `Sala ${cleaned}` : '';
    }

    function deduplicarTurmas(lista) {
        const mapa = new Map();

        const score = (turma) => {
            const horario = turma?.horario || {};
            const totalSlots = Object.values(horario).reduce((acc, dia) => acc + Object.keys(dia || {}).length, 0);
            const atualizadoEm = turma?.horarioAtualizadoEm ? Date.parse(turma.horarioAtualizadoEm) || 0 : 0;
            return (totalSlots > 0 ? 1000 : 0) + atualizadoEm;
        };

        for (const turma of lista || []) {
            const nomeKey = (turma.nome || '').toLowerCase().trim();
            const serieKey = (turma.serie || '').toLowerCase().trim();
            const chave = nomeKey ? `${nomeKey}|${serieKey || 'serie'}` : (turma.id ? `${turma.id}` : '');
            const existente = mapa.get(chave);

            if (!existente || score(turma) > score(existente)) {
                mapa.set(chave, turma);
            }
        }

        return Array.from(mapa.values());
    }

    // Filtrar turmas
    function filterTurmas() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const serieFilter = filterSerie ? filterSerie.value : 'all';
        const statusFilter = filterStatus ? filterStatus.value : 'all';

        const filteredTurmas = turmas.filter(turma => {
            const matchesSearch = turma.nome.toLowerCase().includes(searchTerm) || 
                                turma.sala.toLowerCase().includes(searchTerm);
            const matchesSerie = serieFilter === 'all' || turma.serie === serieFilter;
            
            // Converter status para o formato do filtro
            const turmaStatus = turma.status === 'Ativo' ? 'active' : 'inactive';
            const matchesStatus = statusFilter === 'all' || turmaStatus === statusFilter;

            return matchesSearch && matchesSerie && matchesStatus;
        });

        renderTurmas(filteredTurmas);
    }

    // Abrir modal para adicionar turma
    function openAddModal() {
        if (!modalTitle || !turmaForm || !turmaModal) return;

        modalTitle.textContent = 'Cadastrar Turma';
        turmaForm.reset();
        
        const turmaIdField = document.getElementById('turmaId');
        if (turmaIdField) turmaIdField.value = '';
        
        const turmaStatusField = document.getElementById('turmaStatus');
        if (turmaStatusField) turmaStatusField.value = 'Ativo';
        
        currentTurmaId = null;
        turmaModal.classList.add('show');
    }

    // Editar turma
    async function editTurma(turmaId) {
        try {
            const turma = turmas.find(t => t.id == turmaId);
            if (!turma) {
                showNotification('Turma não encontrada', 'error');
                return;
            }

            if (!modalTitle || !turmaModal) return;

            modalTitle.textContent = 'Editar Turma';
            
            const turmaIdField = document.getElementById('turmaId');
            const turmaNomeField = document.getElementById('turmaNome');
            const turmaSerieField = document.getElementById('turmaSerie');
            const turmaQuantidadeField = document.getElementById('turmaQuantidade');
            const turmaSalaField = document.getElementById('turmaSala');
            const turmaStatusField = document.getElementById('turmaStatus');

            if (turmaIdField) turmaIdField.value = turma.id;
            if (turmaNomeField) turmaNomeField.value = turma.nome;
            if (turmaSerieField) turmaSerieField.value = turma.serie;
            if (turmaQuantidadeField) turmaQuantidadeField.value = turma.qtdalunos || 0;
            if (turmaSalaField) turmaSalaField.value = turma.sala || '';
            if (turmaStatusField) turmaStatusField.value = turma.status;

            currentTurmaId = turmaId;
            turmaModal.classList.add('show');
            
        } catch (error) {
            console.error('Erro ao carregar turma para edição:', error);
            showNotification('Erro ao carregar dados da turma', 'error');
        }
    }

    // Alternar status da turma
    function toggleTurmaStatus(turmaId) {
        const turma = turmas.find(t => t.id == turmaId);
        if (!turma) {
            showNotification('Turma não encontrada', 'error');
            return;
        }

        if (!confirmModal) return;

        currentTurmaId = turmaId;
        currentAction = 'toggleStatus';

        const message = turma.status === 'Ativo' 
            ? `Tem certeza que deseja inativar a turma ${turma.nome}?` 
            : `Tem certeza que deseja ativar a turma ${turma.nome}?`;

        const confirmMessage = document.getElementById('confirmMessage');
        if (confirmMessage) {
            confirmMessage.textContent = message;
        }
        
        confirmModal.classList.add('show');
    }

    // Fechar modal de turma
    function closeTurmaModal() {
        if (turmaModal) {
            turmaModal.classList.remove('show');
        }
        
        if (turmaForm) {
            turmaForm.reset();
        }
    }

    // Fechar modal de confirmação
    function closeConfirmModal() {
        if (confirmModal) {
            confirmModal.classList.remove('show');
        }
        currentTurmaId = null;
        currentAction = null;
    }

    // Manipular ação de confirmação
    async function handleConfirmAction() {
        if (currentAction === 'toggleStatus' && currentTurmaId) {
            try {
                const turma = turmas.find(t => t.id == currentTurmaId);
                if (!turma) {
                    showNotification('Turma não encontrada', 'error');
                    return;
                }

                const novoStatus = turma.status === 'Ativo' ? 'Inativo' : 'Ativo';
                
                const response = await fetch(`${API_BASE_URL}/turma/${currentTurmaId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: novoStatus
                    })
                });

                if (!response.ok) {
                    throw new Error('Erro ao alterar status da turma');
                }

                // Atualizar lista local
                await loadTurmas();
                showNotification(`Status da turma atualizado para ${novoStatus}!`, 'success');
                
            } catch (error) {
                console.error('Erro ao alterar status:', error);
                showNotification('Erro ao alterar status da turma', 'error');
            }
        }

        closeConfirmModal();
    }

    // Manipular envio do formulário
    async function handleTurmaSubmit(e) {
        e.preventDefault();

        try {
            const formData = {
                nome: document.getElementById('turmaNome')?.value || '',
                serie: document.getElementById('turmaSerie')?.value || '',
                qtdalunos: parseInt(document.getElementById('turmaQuantidade')?.value || 0),
                sala: document.getElementById('turmaSala')?.value || '',
                status: document.getElementById('turmaStatus')?.value || 'Ativo'
            };

            // Validação
            if (!formData.nome.trim()) {
                showNotification('O nome da turma é obrigatório!', 'error');
                return;
            }

            if (!formData.serie) {
                showNotification('A série da turma é obrigatória!', 'error');
                return;
            }

            if (!formData.qtdalunos || formData.qtdalunos <= 0) {
                showNotification('A quantidade de alunos deve ser maior que zero!', 'error');
                return;
            }

            const salaKey = (formData.sala || '').trim().toLowerCase();
            if (salaKey) {
                const salaEmUso = turmas.some(t => {
                    const salaTurma = (t.sala || '').trim().toLowerCase();
                    return t.id !== currentTurmaId && salaTurma && salaTurma === salaKey;
                });
                if (salaEmUso) {
                    showNotification('Já existe outra turma cadastrada com esta sala. Escolha outra sala.', 'error');
                    return;
                }
            }

            let response;

            if (currentTurmaId) {
                // Editar turma existente
                response = await fetch(`${API_BASE_URL}/turma/${currentTurmaId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Adicionar nova turma
                response = await fetch(`${API_BASE_URL}/turma`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                throw new Error('Erro ao salvar turma');
            }

            // Recarregar lista de turmas
            await loadTurmas();
            showNotification(`Turma ${currentTurmaId ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
            closeTurmaModal();
            filterTurmas();
            
        } catch (error) {
            console.error('Erro ao salvar turma:', error);
            showNotification('Erro ao salvar turma. Tente novamente.', 'error');
        }
    }

    // Mostrar notificação
    function showNotification(message, type) {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }

    // Inicializar a aplicação
    init();
});
