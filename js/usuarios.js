document.addEventListener('DOMContentLoaded', function() {
    // ========== ELEMENTOS DO DROPDOWN E SIDEBAR ==========
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const closeModal = document.getElementById('closeModal');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');
    const navItems = document.querySelectorAll('.nav-item');
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');

    // ========== ELEMENTOS DOS USUÁRIOS ==========
    const usersList = document.getElementById('usersList');
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterStatus = document.getElementById('filterStatus');
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('userModal');
    const confirmModal = document.getElementById('confirmModal');
    const userForm = document.getElementById('userForm');
    const modalTitle = document.getElementById('modalTitle');
    const userTypeSelect = document.getElementById('userType');
    const materiasSection = document.getElementById('materiasSection');
    const materiasGrid = document.getElementById('materiasGrid');

    // Verificar se elementos críticos existem
    if (!usersList || !userForm || !userModal) {
        console.error('Elementos críticos do DOM não encontrados:', {
            usersList: !!usersList,
            userForm: !!userForm,
            userModal: !!userModal,
            confirmModal: !!confirmModal
        });
        return;
    }

    // URLs da API
    const API_BASE_URL = 'http://localhost:3000';
    
    // Variáveis de estado
    let users = [];
    let materias = [];
    let currentUserId = null;
    let currentAction = null;

    // Inicialização

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

    async function init() {
        try {
            console.log('Inicializando gerenciador de usuários...');
            // Configurar funcionalidades da sidebar
            setupProfileDropdown();
            setupSidebarToggle();
            setupMenuNavigation();
            atualizarUsuarioLogado();
            setupMobileMenu();
            
            // Carregar dados dos usuários
            await loadUsers();
            await loadMaterias();
            setupEventListeners();
            console.log('Gerenciador de usuários inicializado com sucesso');
        } catch (error) {
            console.error('Erro na inicialização:', error);
        }
    }

    // Configurar event listeners COM VERIFICAÇÕES
    function setupEventListeners() {
        console.log('Configurando event listeners...');

        // Pesquisa e filtros
        if (searchInput) searchInput.addEventListener('input', filterUsers);
        if (filterType) filterType.addEventListener('change', filterUsers);
        if (filterStatus) filterStatus.addEventListener('change', filterUsers);

        // Modal de usuário
        if (addUserBtn) {
            addUserBtn.addEventListener('click', openAddModal);
            console.log('Botão adicionar usuário configurado');
        } else {
            console.error('Botão addUserBtn não encontrado');
        }

        const closeModalBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeUserModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeUserModal);

        // Tipo de usuário (para mostrar/ocultar matérias)
        if (userTypeSelect) {
            userTypeSelect.addEventListener('change', toggleMateriasSection);
        }

        // Formulário
        if (userForm) {
            userForm.addEventListener('submit', handleUserSubmit);
        }

        // Modal de confirmação
        const closeConfirmModalBtn = document.getElementById('closeConfirmModal');
        const cancelConfirmBtn = document.getElementById('cancelConfirm');
        const confirmActionBtn = document.getElementById('confirmAction');
        
        if (closeConfirmModalBtn) closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
        if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', closeConfirmModal);
        if (confirmActionBtn) confirmActionBtn.addEventListener('click', handleConfirmAction);

        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (userModal && e.target === userModal) closeUserModal();
            if (confirmModal && e.target === confirmModal) closeConfirmModal();
        });

        console.log('Event listeners configurados');
    }

    // Carregar usuários do JSON Server - CORRIGIDO
    async function loadUsers() {
        try {
            showLoadingState();
            console.log('Carregando usuários...');
            
            const response = await fetch(`${API_BASE_URL}/usuario`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            users = await response.json();
            console.log(`Usuários carregados: ${users.length}`, users);
            
            renderUsers();
            
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            showErrorState('Erro ao carregar usuários. Verifique se o JSON Server está rodando.');
        }
    }

    // Carregar matérias do JSON Server
    async function loadMaterias() {
        try {
            console.log('Carregando matérias...');
            const response = await fetch(`${API_BASE_URL}/materia`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            materias = await response.json();
            console.log(`Matérias carregadas: ${materias.length}`);
            renderMateriasGrid();
            
        } catch (error) {
            console.error('Erro ao carregar matérias:', error);
        }
    }

    // Carregar matérias no grid
    function renderMateriasGrid() {
        if (!materiasGrid) {
            console.error('materiasGrid não encontrado');
            return;
        }

        const activeMaterias = materias.filter(m => m.status === 'Ativo');
        
        materiasGrid.innerHTML = activeMaterias.map(materia => `
            <div class="materia-checkbox">
                <input type="checkbox" id="materia-${materia.id}" value="${materia.id}">
                <label for="materia-${materia.id}">${materia.nome}</label>
            </div>
        `).join('');
    }

    // Mostrar/ocultar seção de matérias baseado no tipo de usuário
    function toggleMateriasSection() {
        if (!materiasSection || !userTypeSelect) return;
        
        const isProfessor = userTypeSelect.value === 'professor';
        materiasSection.style.display = isProfessor ? 'block' : 'none';
    }

    // Estado de carregamento
    function showLoadingState() {
        if (!usersList) return;
        
        usersList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner-large"></div>
                <p>Carregando usuários...</p>
            </div>
        `;
    }

    // Estado de erro
    function showErrorState(message) {
        if (!usersList) return;
        
        usersList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Renderizar lista de usuários - CORRIGIDO
    function renderUsers(filteredUsers = users) {
        if (!usersList) {
            console.error('usersList não encontrado');
            return;
        }

        if (filteredUsers.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Nenhum usuário encontrado</h3>
                    <p>Tente ajustar os filtros de pesquisa</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = filteredUsers.map(user => {
            const userMaterias = user.materias ? user.materias.map(materiaId => {
                const materia = materias.find(m => m.id === materiaId);
                return materia ? materia.nome : '';
            }).filter(nome => nome).join(', ') : '';

            const userType = user.cargo === 'Coordenador' || user.cargo === 'Coordenadora' ? 'coordenador' : 'professor';
            const userStatus = user.status === 'Ativo' ? 'active' : 'inactive';

            // DEBUG: Verificar ID do usuário durante o render
            console.log(`Renderizando usuário: ${user.nome} (ID: ${user.id}, Tipo: ${typeof user.id})`);

            return `
                <div class="user-card" data-user-id="${user.id}">
                    <div class="user-info">
                        <div class="user-avatar">${generateAvatar(user.nome)}</div>
                        <div class="user-details">
                            <h3>${user.nome}</h3>
                            <div class="user-meta">
                                <span class="user-type ${userType}">
                                    ${user.cargo}
                                </span>
                                <span class="user-status ${userStatus}">
                                    ${user.status}
                                </span>
                                <span>${user.email}</span>
                                <span>${user.tipousuario}</span>
                                ${userMaterias ? `<span title="Matérias: ${userMaterias}">${userMaterias}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn-edit" data-user-id="${user.id}">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn-inactivate ${userStatus === 'inactive' ? 'inactive' : ''}" 
                                data-user-id="${user.id}">
                            <i class="fas ${userStatus === 'active' ? 'fa-user-slash' : 'fa-user-check'}"></i>
                            ${userStatus === 'active' ? 'Inativar' : 'Ativar'}
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
        const editButtons = usersList.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                console.log('Clicou em editar, userId:', userId, 'Tipo:', typeof userId);
                editUser(userId);
            });
        });

        // Botões de inativar/ativar
        const toggleButtons = usersList.querySelectorAll('.btn-inactivate');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                console.log('Clicou em toggle status, userId:', userId, 'Tipo:', typeof userId);
                toggleUserStatus(userId);
            });
        });
    }

    // Filtrar usuários
    function filterUsers() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const typeFilter = filterType ? filterType.value : 'all';
        const statusFilter = filterStatus ? filterStatus.value : 'all';

        const filteredUsers = users.filter(user => {
            const userType = user.cargo === 'Coordenador' || user.cargo === 'Coordenadora' ? 'coordenador' : 'professor';
            const userStatus = user.status === 'Ativo' ? 'active' : 'inactive';

            const matchesSearch = user.nome.toLowerCase().includes(searchTerm) || 
                                user.email.toLowerCase().includes(searchTerm) ||
                                user.tipousuario.toLowerCase().includes(searchTerm);
            const matchesType = typeFilter === 'all' || userType === typeFilter;
            const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });

        renderUsers(filteredUsers);
    }

    // Abrir modal para adicionar usuário
    function openAddModal() {
        if (!modalTitle || !userForm || !userModal) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        modalTitle.textContent = 'Cadastrar Usuário';
        userForm.reset();
        
        const userIdField = document.getElementById('userId');
        const userStatusField = document.getElementById('userStatus');
        const passwordFields = document.getElementById('passwordFields');
        const userPassword = document.getElementById('userPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (userIdField) userIdField.value = '';
        if (userStatusField) userStatusField.value = 'active';
        
        if (passwordFields) passwordFields.style.display = 'grid';
        if (userPassword) userPassword.required = true;
        if (confirmPassword) confirmPassword.required = true;
        
        if (materiasSection) materiasSection.style.display = 'none';
        
        currentUserId = null;
        userModal.classList.add('show');
    }

    // Editar usuário - CORRIGIDO PARA LIDAR COM DIFERENTES TIPOS DE ID
    async function editUser(userId) {
        try {
            console.log('Editando usuário ID:', userId, 'Tipo:', typeof userId);
            console.log('Todos os usuários:', users);
            
            // Converter userId para número se necessário
            const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
            
            // Buscar usuário - CORREÇÃO IMPORTANTE
            const user = users.find(u => {
                const userID = typeof u.id === 'string' ? parseInt(u.id) : u.id;
                return userID === userIdNum;
            });
            
            if (!user) {
                console.error('Usuário não encontrado para edição. Procurando:', userIdNum);
                console.log('IDs disponíveis:', users.map(u => u.id));
                showNotification('Usuário não encontrado', 'error');
                return;
            }

            if (!modalTitle || !userForm || !userModal) {
                console.error('Elementos do modal não encontrados para edição');
                return;
            }

            modalTitle.textContent = 'Editar Usuário';
            
            // Preencher campos do formulário
            const userIdField = document.getElementById('userId');
            const userNameInput = document.getElementById('userNameInput');
            const userEmail = document.getElementById('userEmail');
            const userType = document.getElementById('userType');
            const userMatricula = document.getElementById('userMatricula');
            const userPhone = document.getElementById('userPhone');
            const userStatus = document.getElementById('userStatus');

            if (userIdField) userIdField.value = user.id;
            if (userNameInput) userNameInput.value = user.nome;
            if (userEmail) userEmail.value = user.email;
            if (userType) userType.value = user.cargo === 'Coordenador' || user.cargo === 'Coordenadora' ? 'coordenador' : 'professor';
            if (userMatricula) userMatricula.value = user.tipousuario;
            if (userPhone) userPhone.value = user.telefone || '';
            if (userStatus) userStatus.value = user.status === 'Ativo' ? 'active' : 'inactive';
            
            // Ocultar campos de senha para edição
            const passwordFields = document.getElementById('passwordFields');
            const userPassword = document.getElementById('userPassword');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (passwordFields) passwordFields.style.display = 'none';
            if (userPassword) userPassword.required = false;
            if (confirmPassword) confirmPassword.required = false;
            
            // Mostrar/ocultar matérias baseado no tipo
            toggleMateriasSection();
            
            // Marcar matérias do usuário (se existirem)
            if (user.materias && materiasGrid) {
                setTimeout(() => {
                    user.materias.forEach(materiaId => {
                        const checkbox = document.getElementById(`materia-${materiaId}`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }, 100);
            }

            currentUserId = user.id; // Usar o ID original do usuário
            userModal.classList.add('show');
            
            console.log('Modal de edição aberto para:', user.nome);
            
        } catch (error) {
            console.error('Erro ao carregar usuário para edição:', error);
            showNotification('Erro ao carregar dados do usuário', 'error');
        }
    }

    // Alternar status do usuário - CORRIGIDO PARA LIDAR COM DIFERENTES TIPOS DE ID
    function toggleUserStatus(userId) {
        console.log('Alternando status do usuário ID:', userId, 'Tipo:', typeof userId);
        console.log('Todos os usuários:', users);
        
        // Converter userId para número se necessário
        const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
        
        // Buscar usuário - CORREÇÃO IMPORTANTE
        const user = users.find(u => {
            const userID = typeof u.id === 'string' ? parseInt(u.id) : u.id;
            return userID === userIdNum;
        });
        
        if (!user) {
            console.error('Usuário não encontrado para alterar status. Procurando:', userIdNum);
            console.log('IDs disponíveis:', users.map(u => u.id));
            showNotification('Usuário não encontrado', 'error');
            return;
        }

        if (!confirmModal) {
            console.error('Modal de confirmação não encontrado');
            return;
        }

        currentUserId = user.id; // Usar o ID original do usuário
        currentAction = 'toggleStatus';

        const message = user.status === 'Ativo' 
            ? `Tem certeza que deseja inativar o usuário ${user.nome}?` 
            : `Tem certeza que deseja ativar o usuário ${user.nome}?`;

        const confirmMessage = document.getElementById('confirmMessage');
        if (confirmMessage) {
            confirmMessage.textContent = message;
        }
        
        confirmModal.classList.add('show');
        console.log('Modal de confirmação aberto para:', user.nome);
    }

    // Fechar modal de usuário
    function closeUserModal() {
        if (userModal) {
            userModal.classList.remove('show');
        }
        
        if (userForm) {
            userForm.reset();
        }
        
        const passwordFields = document.getElementById('passwordFields');
        const userPassword = document.getElementById('userPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (passwordFields) passwordFields.style.display = 'grid';
        if (userPassword) userPassword.required = true;
        if (confirmPassword) confirmPassword.required = true;
        
        // Desmarcar todas as matérias
        if (materiasGrid) {
            const checkboxes = materiasGrid.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
        }
    }

    // Fechar modal de confirmação
    function closeConfirmModal() {
        if (confirmModal) {
            confirmModal.classList.remove('show');
        }
        currentUserId = null;
        currentAction = null;
    }

    // Manipular ação de confirmação - CORRIGIDO
    async function handleConfirmAction() {
        if (currentAction === 'toggleStatus' && currentUserId) {
            try {
                // Buscar usuário usando o ID armazenado
                const user = users.find(u => u.id === currentUserId);
                if (!user) {
                    showNotification('Usuário não encontrado', 'error');
                    return;
                }

                const novoStatus = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
                
                console.log(`Alterando status do usuário ${user.id} (${user.nome}) para: ${novoStatus}`);
                
                const response = await fetch(`${API_BASE_URL}/usuario/${currentUserId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: novoStatus
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const updatedUser = await response.json();
                console.log('Usuário atualizado:', updatedUser);

                // Atualizar lista local recarregando do servidor
                await loadUsers();
                showNotification(`Status do usuário ${user.nome} atualizado para ${novoStatus}!`, 'success');
                
            } catch (error) {
                console.error('Erro ao alterar status:', error);
                showNotification('Erro ao alterar status do usuário. Verifique o console.', 'error');
            }
        }

        closeConfirmModal();
    }

    // Manipular envio do formulário
    async function handleUserSubmit(e) {
        e.preventDefault();

        try {
            const formData = {
                nome: document.getElementById('userNameInput')?.value || '',
                email: document.getElementById('userEmail')?.value || '',
                cargo: document.getElementById('userType')?.value === 'coordenador' ? 'Coordenador' : 'Professor',
                tipousuario: document.getElementById('userMatricula')?.value || '',
                telefone: document.getElementById('userPhone')?.value || '',
                status: document.getElementById('userStatus')?.value === 'active' ? 'Ativo' : 'Inativo'
            };

            // Validação básica
            if (!formData.nome || !formData.email || !formData.tipousuario) {
                showNotification('Preencha todos os campos obrigatórios!', 'error');
                return;
            }

            // Obter matérias selecionadas (apenas para professores)
            if (formData.cargo === 'Professor' && materiasGrid) {
                const materiasSelecionadas = [];
                const checkboxes = materiasGrid.querySelectorAll('input[type="checkbox"]:checked');
                checkboxes.forEach(checkbox => {
                    materiasSelecionadas.push(parseInt(checkbox.value));
                });
                formData.materias = materiasSelecionadas;
            } else {
                formData.materias = [];
            }

            // Validação de senha apenas para novos usuários
            if (!currentUserId) {
                const password = document.getElementById('userPassword')?.value || '';
                const confirmPassword = document.getElementById('confirmPassword')?.value || '';
                
                if (password !== confirmPassword) {
                    showNotification('As senhas não coincidem!', 'error');
                    return;
                }
                if (password.length < 6) {
                    showNotification('A senha deve ter pelo menos 6 caracteres!', 'error');
                    return;
                }
                formData.senha = password;
            }

            let response;

            if (currentUserId) {
                // Editar usuário existente
                response = await fetch(`${API_BASE_URL}/usuario/${currentUserId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Adicionar novo usuário
                response = await fetch(`${API_BASE_URL}/usuario`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Recarregar lista de usuários
            await loadUsers();
            showNotification(`Usuário ${currentUserId ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
            closeUserModal();
            filterUsers();
            
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            showNotification('Erro ao salvar usuário. Tente novamente.', 'error');
        }
    }

    // Gerar avatar a partir do nome
    function generateAvatar(name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    // Mostrar notificação
    function showNotification(message, type) {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }

    // Inicializar a aplicação
    init();
});