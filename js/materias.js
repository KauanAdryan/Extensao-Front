document.addEventListener('DOMContentLoaded', function() {
    // ========== ELEMENTOS DO DROPDOWN E SIDEBAR ==========
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');

    // ========== ELEMENTOS DAS MATÉRIAS ==========
    const materiasList = document.getElementById('materiasList');
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const addMateriaBtn = document.getElementById('addMateriaBtn');
    const materiaModal = document.getElementById('materiaModal');
    const confirmModal = document.getElementById('confirmModal');
    const materiaForm = document.getElementById('materiaForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // URLs da API
    const API_BASE_URL = 'http://localhost:3000';
    
    // Variáveis de estado
    let materias = [];
    let currentMateriaId = null;
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
                // Adiciona delay para melhor experiência da animação
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
            
            if (usuarioLogado) {
                const dadosUsuario = JSON.parse(usuarioLogado);
                
                // Atualizar nome do usuário
                const userNameElement = document.getElementById('userName');
                const welcomeNameElement = document.getElementById('welcomeName');
                
                if (userNameElement) {
                    userNameElement.textContent = dadosUsuario.nome;
                }
                
                if (welcomeNameElement) {
                    welcomeNameElement.textContent = dadosUsuario.nome.split(' ')[0];
                }
            } else {
                // Redirecionar para login se não estiver logado
                if (!window.location.href.includes('index.html')) {
                    window.location.href = 'index.html';
                }
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
        
        // Carregar dados das matérias
        await loadMaterias();
        setupMateriasEventListeners();
    }

    // Configurar event listeners específicos das matérias
    function setupMateriasEventListeners() {
        // Pesquisa e filtros
        if (searchInput) searchInput.addEventListener('input', filterMaterias);
        if (filterStatus) filterStatus.addEventListener('change', filterMaterias);

        // Modal de matéria
        if (addMateriaBtn) addMateriaBtn.addEventListener('click', openAddModal);
        
        const closeModalBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeMateriaModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeMateriaModal);

        // Formulário
        if (materiaForm) materiaForm.addEventListener('submit', handleMateriaSubmit);

        // Modal de confirmação
        const closeConfirmModalBtn = document.getElementById('closeConfirmModal');
        const cancelConfirmBtn = document.getElementById('cancelConfirm');
        const confirmActionBtn = document.getElementById('confirmAction');
        
        if (closeConfirmModalBtn) closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
        if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', closeConfirmModal);
        if (confirmActionBtn) confirmActionBtn.addEventListener('click', handleConfirmAction);

        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (materiaModal && e.target === materiaModal) closeMateriaModal();
            if (confirmModal && e.target === confirmModal) closeConfirmModal();
        });
    }

    // Carregar matérias do JSON Server
    async function loadMaterias() {
        try {
            showLoadingState();
            
            const response = await fetch(`${API_BASE_URL}/materia`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar matérias');
            }

            materias = await response.json();
            renderMaterias();
            
        } catch (error) {
            console.error('Erro ao carregar matérias:', error);
            showErrorState('Erro ao carregar matérias. Verifique se o JSON Server está rodando.');
        }
    }

    // Estado de carregamento
    function showLoadingState() {
        if (!materiasList) return;
        
        materiasList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner-large"></div>
                <p>Carregando matérias...</p>
            </div>
        `;
    }

    // Estado de erro
    function showErrorState(message) {
        if (!materiasList) return;
        
        materiasList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Renderizar lista de matérias
    function renderMaterias(filteredMaterias = materias) {
        if (!materiasList) return;

        if (filteredMaterias.length === 0) {
            materiasList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>Nenhuma matéria encontrada</h3>
                    <p>Tente ajustar os filtros de pesquisa</p>
                </div>
            `;
            return;
        }

        materiasList.innerHTML = filteredMaterias.map(materia => {
            // Contar professores associados a esta matéria
            const professoresCount = countProfessoresPorMateria(materia.id);
            
            return `
            <div class="materia-card" data-materia-id="${materia.id}">
                <div class="materia-info">
                    <div class="materia-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="materia-details">
                        <h3>${materia.nome}</h3>
                        ${materia.descricao && materia.descricao !== 'exemplo' ? 
                            `<div class="materia-descricao">${materia.descricao}</div>` : ''}
                        <div class="materia-meta">
                            <span class="materia-status ${materia.status === 'Ativo' ? 'active' : 'inactive'}">
                                ${materia.status}
                            </span>
                            <span>${professoresCount} professor(es)</span>
                        </div>
                    </div>
                </div>
                <div class="materia-actions">
                    <button class="btn-edit" data-materia-id="${materia.id}">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn-inactivate ${materia.status === 'Inativo' ? 'inactive' : ''}" 
                            data-materia-id="${materia.id}">
                        <i class="fas ${materia.status === 'Ativo' ? 'fa-ban' : 'fa-check'}"></i>
                        ${materia.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                    </button>
                </div>
            </div>
            `;
        }).join('');

        // Adicionar event listeners aos botões
        addButtonEventListeners();
    }

    // Adicionar event listeners aos botões
    function addButtonEventListeners() {
        // Botões de editar
        const editButtons = materiasList.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const materiaId = this.getAttribute('data-materia-id');
                editMateria(materiaId);
            });
        });

        // Botões de inativar/ativar
        const toggleButtons = materiasList.querySelectorAll('.btn-inactivate');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const materiaId = this.getAttribute('data-materia-id');
                toggleMateriaStatus(materiaId);
            });
        });
    }

    // Contar professores associados a uma matéria
    async function countProfessoresPorMateria(materiaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/usuario`);
            if (!response.ok) return 0;
            
            const usuarios = await response.json();
            const professores = usuarios.filter(usuario => 
                usuario.cargo === 'Professor' && 
                usuario.materias && 
                usuario.materias.includes(parseInt(materiaId))
            );
            
            return professores.length;
        } catch (error) {
            console.error('Erro ao contar professores:', error);
            return 0;
        }
    }

    // Filtrar matérias
    function filterMaterias() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilter = filterStatus ? filterStatus.value : 'all';

        const filteredMaterias = materias.filter(materia => {
            const matchesSearch = materia.nome.toLowerCase().includes(searchTerm) || 
                                (materia.descricao && materia.descricao.toLowerCase().includes(searchTerm));
            
            // Converter status para o formato do filtro
            const materiaStatus = materia.status === 'Ativo' ? 'active' : 'inactive';
            const matchesStatus = statusFilter === 'all' || materiaStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });

        renderMaterias(filteredMaterias);
    }

    // Abrir modal para adicionar matéria
    function openAddModal() {
        if (!modalTitle || !materiaForm || !materiaModal) return;

        modalTitle.textContent = 'Cadastrar Matéria';
        materiaForm.reset();
        
        const materiaIdField = document.getElementById('materiaId');
        if (materiaIdField) materiaIdField.value = '';
        
        const materiaStatusField = document.getElementById('materiaStatus');
        if (materiaStatusField) materiaStatusField.value = 'Ativo';
        
        currentMateriaId = null;
        materiaModal.classList.add('show');
    }

    // Editar matéria
    async function editMateria(materiaId) {
        try {
            const materia = materias.find(m => m.id == materiaId);
            if (!materia) {
                showNotification('Matéria não encontrada', 'error');
                return;
            }

            if (!modalTitle || !materiaModal) return;

            modalTitle.textContent = 'Editar Matéria';
            
            const materiaIdField = document.getElementById('materiaId');
            const materiaNomeField = document.getElementById('materiaNome');
            const materiaDescricaoField = document.getElementById('materiaDescricao');
            const materiaStatusField = document.getElementById('materiaStatus');

            if (materiaIdField) materiaIdField.value = materia.id;
            if (materiaNomeField) materiaNomeField.value = materia.nome;
            if (materiaDescricaoField) materiaDescricaoField.value = materia.descricao || '';
            if (materiaStatusField) materiaStatusField.value = materia.status;

            currentMateriaId = materiaId;
            materiaModal.classList.add('show');
            
        } catch (error) {
            console.error('Erro ao carregar matéria para edição:', error);
            showNotification('Erro ao carregar dados da matéria', 'error');
        }
    }

    // Alternar status da matéria
    function toggleMateriaStatus(materiaId) {
        const materia = materias.find(m => m.id == materiaId);
        if (!materia) {
            showNotification('Matéria não encontrada', 'error');
            return;
        }

        if (!confirmModal) return;

        currentMateriaId = materiaId;
        currentAction = 'toggleStatus';

        const message = materia.status === 'Ativo' 
            ? `Tem certeza que deseja inativar a matéria "${materia.nome}"?` 
            : `Tem certeza que deseja ativar a matéria "${materia.nome}"?`;

        const confirmMessage = document.getElementById('confirmMessage');
        if (confirmMessage) {
            confirmMessage.textContent = message;
        }
        
        confirmModal.classList.add('show');
    }

    // Fechar modal de matéria
    function closeMateriaModal() {
        if (materiaModal) {
            materiaModal.classList.remove('show');
        }
        
        if (materiaForm) {
            materiaForm.reset();
        }
    }

    // Fechar modal de confirmação
    function closeConfirmModal() {
        if (confirmModal) {
            confirmModal.classList.remove('show');
        }
        currentMateriaId = null;
        currentAction = null;
    }

    // Manipular ação de confirmação
    async function handleConfirmAction() {
        if (currentAction === 'toggleStatus' && currentMateriaId) {
            try {
                const materia = materias.find(m => m.id == currentMateriaId);
                if (!materia) {
                    showNotification('Matéria não encontrada', 'error');
                    return;
                }

                const novoStatus = materia.status === 'Ativo' ? 'Inativo' : 'Ativo';
                
                const response = await fetch(`${API_BASE_URL}/materia/${currentMateriaId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: novoStatus
                    })
                });

                if (!response.ok) {
                    throw new Error('Erro ao alterar status da matéria');
                }

                // Atualizar lista local
                await loadMaterias();
                showNotification(`Status da matéria atualizado para ${novoStatus}!`, 'success');
                
            } catch (error) {
                console.error('Erro ao alterar status:', error);
                showNotification('Erro ao alterar status da matéria', 'error');
            }
        }

        closeConfirmModal();
    }

    // Manipular envio do formulário
    async function handleMateriaSubmit(e) {
        e.preventDefault();

        try {
            const formData = {
                nome: document.getElementById('materiaNome')?.value || '',
                descricao: document.getElementById('materiaDescricao')?.value || '',
                status: document.getElementById('materiaStatus')?.value || 'Ativo'
            };

            // Validação
            if (!formData.nome.trim()) {
                showNotification('O nome da matéria é obrigatório!', 'error');
                return;
            }

            let response;

            if (currentMateriaId) {
                // Editar matéria existente
                response = await fetch(`${API_BASE_URL}/materia/${currentMateriaId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Adicionar nova matéria
                response = await fetch(`${API_BASE_URL}/materia`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                throw new Error('Erro ao salvar matéria');
            }

            // Recarregar lista de matérias
            await loadMaterias();
            showNotification(`Matéria ${currentMateriaId ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
            closeMateriaModal();
            filterMaterias();
            
        } catch (error) {
            console.error('Erro ao salvar matéria:', error);
            showNotification('Erro ao salvar matéria. Tente novamente.', 'error');
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