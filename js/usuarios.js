document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
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
    
    // Variáveis de estado
    let users = [];
    let materias = [];
    let currentUserId = null;
    let currentAction = null;

    // Dados de exemplo
    const sampleUsers = [
        {
            id: 1,
            name: 'Ana Maria Silva',
            email: 'ana.silva@escola.com',
            type: 'professor',
            matricula: 'PROF001',
            phone: '(11) 99999-9999',
            status: 'active',
            avatar: 'AM',
            materias: [1, 2]
        },
        {
            id: 2,
            name: 'Carlos Eduardo Santos',
            email: 'carlos.santos@escola.com',
            type: 'coordenador',
            matricula: 'COORD001',
            phone: '(11) 98888-8888',
            status: 'active',
            avatar: 'CS',
            materias: []
        },
        {
            id: 3,
            name: 'Mariana Oliveira',
            email: 'mariana.oliveira@escola.com',
            type: 'professor',
            matricula: 'PROF002',
            phone: '(11) 97777-7777',
            status: 'inactive',
            avatar: 'MO',
            materias: [3]
        },
        {
            id: 4,
            name: 'Roberto Almeida',
            email: 'roberto.almeida@escola.com',
            type: 'professor',
            matricula: 'PROF003',
            phone: '(11) 96666-6666',
            status: 'active',
            avatar: 'RA',
            materias: [1, 4]
        }
    ];

    // Matérias de exemplo
    const sampleMaterias = [
        { id: 1, nome: 'Matemática', status: 'active' },
        { id: 2, nome: 'Português', status: 'active' },
        { id: 3, nome: 'História', status: 'active' },
        { id: 4, nome: 'Geografia', status: 'active' },
        { id: 5, nome: 'Ciências', status: 'active' },
        { id: 6, nome: 'Inglês', status: 'active' },
        { id: 7, nome: 'Artes', status: 'active' },
        { id: 8, nome: 'Educação Física', status: 'active' }
    ];

    // Inicialização
    function init() {
        users = [...sampleUsers];
        materias = [...sampleMaterias];
        renderUsers();
        setupEventListeners();
        loadMaterias();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Pesquisa e filtros
        searchInput.addEventListener('input', filterUsers);
        filterType.addEventListener('change', filterUsers);
        filterStatus.addEventListener('change', filterUsers);

        // Modal de usuário
        addUserBtn.addEventListener('click', openAddModal);
        document.getElementById('closeModal').addEventListener('click', closeUserModal);
        document.getElementById('cancelBtn').addEventListener('click', closeUserModal);

        // Tipo de usuário (para mostrar/ocultar matérias)
        userTypeSelect.addEventListener('change', toggleMateriasSection);

        // Formulário
        userForm.addEventListener('submit', handleUserSubmit);

        // Modal de confirmação
        document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
        document.getElementById('cancelConfirm').addEventListener('click', closeConfirmModal);
        document.getElementById('confirmAction').addEventListener('click', handleConfirmAction);

        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (e.target === userModal) closeUserModal();
            if (e.target === confirmModal) closeConfirmModal();
        });
    }

    // Carregar matérias no grid
    function loadMaterias() {
        const activeMaterias = materias.filter(m => m.status === 'active');
        
        materiasGrid.innerHTML = activeMaterias.map(materia => `
            <div class="materia-checkbox">
                <input type="checkbox" id="materia-${materia.id}" value="${materia.id}">
                <label for="materia-${materia.id}">${materia.nome}</label>
            </div>
        `).join('');
    }

    // Mostrar/ocultar seção de matérias baseado no tipo de usuário
    function toggleMateriasSection() {
        const isProfessor = userTypeSelect.value === 'professor';
        materiasSection.style.display = isProfessor ? 'block' : 'none';
    }

    // Renderizar lista de usuários
    function renderUsers(filteredUsers = users) {
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
            const userMaterias = user.materias.map(materiaId => {
                const materia = materias.find(m => m.id === materiaId);
                return materia ? materia.nome : '';
            }).filter(nome => nome).join(', ');

            return `
                <div class="user-card" data-user-id="${user.id}">
                    <div class="user-info">
                        <div class="user-avatar">${user.avatar}</div>
                        <div class="user-details">
                            <h3>${user.name}</h3>
                            <div class="user-meta">
                                <span class="user-type ${user.type}">
                                    ${user.type === 'professor' ? 'Professor' : 'Coordenador'}
                                </span>
                                <span class="user-status ${user.status}">
                                    ${user.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                                <span>${user.email}</span>
                                <span>${user.matricula}</span>
                                ${userMaterias ? `<span title="Matérias: ${userMaterias}">${userMaterias}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn-edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn-inactivate ${user.status === 'inactive' ? 'inactive' : ''}" 
                                onclick="toggleUserStatus(${user.id})">
                            <i class="fas ${user.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}"></i>
                            ${user.status === 'active' ? 'Inativar' : 'Ativar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Filtrar usuários
    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        const typeFilter = filterType.value;
        const statusFilter = filterStatus.value;

        const filteredUsers = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                                user.email.toLowerCase().includes(searchTerm) ||
                                user.matricula.toLowerCase().includes(searchTerm);
            const matchesType = typeFilter === 'all' || user.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });

        renderUsers(filteredUsers);
    }

    // Abrir modal para adicionar usuário
    function openAddModal() {
        modalTitle.textContent = 'Cadastrar Usuário';
        userForm.reset();
        document.getElementById('userId').value = '';
        document.getElementById('userStatus').value = 'active';
        document.getElementById('passwordFields').style.display = 'grid';
        document.getElementById('userPassword').required = true;
        document.getElementById('confirmPassword').required = true;
        materiasSection.style.display = 'none';
        currentUserId = null;
        userModal.classList.add('show');
    }

    // Editar usuário
    window.editUser = function(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        modalTitle.textContent = 'Editar Usuário';
        document.getElementById('userId').value = user.id;
        document.getElementById('userNameInput').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userType').value = user.type;
        document.getElementById('userMatricula').value = user.matricula;
        document.getElementById('userPhone').value = user.phone || '';
        document.getElementById('userStatus').value = user.status;
        
        // Mostrar/ocultar matérias baseado no tipo
        toggleMateriasSection();
        
        // Marcar matérias do usuário
        user.materias.forEach(materiaId => {
            const checkbox = document.getElementById(`materia-${materiaId}`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Ocultar campos de senha para edição
        document.getElementById('passwordFields').style.display = 'none';
        document.getElementById('userPassword').required = false;
        document.getElementById('confirmPassword').required = false;

        currentUserId = userId;
        userModal.classList.add('show');
    }

    // Alternar status do usuário
    window.toggleUserStatus = function(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        currentUserId = userId;
        currentAction = 'toggleStatus';

        const message = user.status === 'active' 
            ? `Tem certeza que deseja inativar o usuário ${user.name}?` 
            : `Tem certeza que deseja ativar o usuário ${user.name}?`;

        document.getElementById('confirmMessage').textContent = message;
        confirmModal.classList.add('show');
    }

    // Fechar modal de usuário
    function closeUserModal() {
        userModal.classList.remove('show');
        userForm.reset();
        document.getElementById('passwordFields').style.display = 'grid';
        document.getElementById('userPassword').required = true;
        document.getElementById('confirmPassword').required = true;
        
        // Desmarcar todas as matérias
        const checkboxes = materiasGrid.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }

    // Fechar modal de confirmação
    function closeConfirmModal() {
        confirmModal.classList.remove('show');
        currentUserId = null;
        currentAction = null;
    }

    // Manipular ação de confirmação
    function handleConfirmAction() {
        if (currentAction === 'toggleStatus' && currentUserId) {
            const userIndex = users.findIndex(u => u.id === currentUserId);
            if (userIndex !== -1) {
                users[userIndex].status = users[userIndex].status === 'active' ? 'inactive' : 'active';
                renderUsers();
                showNotification('Status do usuário atualizado com sucesso!', 'success');
            }
        }

        closeConfirmModal();
    }

    // Manipular envio do formulário
    function handleUserSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('userNameInput').value,
            email: document.getElementById('userEmail').value,
            type: document.getElementById('userType').value,
            matricula: document.getElementById('userMatricula').value,
            phone: document.getElementById('userPhone').value,
            status: document.getElementById('userStatus').value
        };

        // Obter matérias selecionadas (apenas para professores)
        if (formData.type === 'professor') {
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
            if (document.getElementById('userPassword').value !== document.getElementById('confirmPassword').value) {
                showNotification('As senhas não coincidem!', 'error');
                return;
            }
            formData.password = document.getElementById('userPassword').value;
        }

        if (currentUserId) {
            // Editar usuário existente
            const userIndex = users.findIndex(u => u.id === currentUserId);
            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    ...formData,
                    avatar: generateAvatar(formData.name)
                };
                showNotification('Usuário atualizado com sucesso!', 'success');
            }
        } else {
            // Adicionar novo usuário
            const newUser = {
                id: Date.now(),
                ...formData,
                avatar: generateAvatar(formData.name)
            };
            users.push(newUser);
            showNotification('Usuário cadastrado com sucesso!', 'success');
        }

        renderUsers();
        closeUserModal();
        filterUsers();
    }

    // Gerar avatar a partir do nome
    function generateAvatar(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    // Mostrar notificação
    function showNotification(message, type) {
        // Em uma aplicação real, você usaria uma biblioteca de notificações
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }

    // Inicializar a aplicação
    init();
});