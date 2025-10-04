document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const materiasList = document.getElementById('materiasList');
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const addMateriaBtn = document.getElementById('addMateriaBtn');
    const materiaModal = document.getElementById('materiaModal');
    const confirmModal = document.getElementById('confirmModal');
    const materiaForm = document.getElementById('materiaForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Variáveis de estado
    let materias = [];
    let currentMateriaId = null;
    let currentAction = null;

    // Dados de exemplo
    const sampleMaterias = [
        {
            id: 1,
            nome: 'Matemática',
            descricao: 'Álgebra, geometria e cálculo',
            status: 'active',
            professores: 5
        },
        {
            id: 2,
            nome: 'Português',
            descricao: 'Gramática, literatura e redação',
            status: 'active',
            professores: 4
        },
        {
            id: 3,
            nome: 'História',
            descricao: 'História geral e do Brasil',
            status: 'active',
            professores: 3
        },
        {
            id: 4,
            nome: 'Geografia',
            descricao: 'Geografia física e humana',
            status: 'active',
            professores: 2
        },
        {
            id: 5,
            nome: 'Ciências',
            descricao: 'Biologia, física e química',
            status: 'active',
            professores: 4
        },
        {
            id: 6,
            nome: 'Inglês',
            descricao: 'Língua inglesa',
            status: 'active',
            professores: 3
        },
        {
            id: 7,
            nome: 'Artes',
            descricao: 'Artes visuais e música',
            status: 'inactive',
            professores: 1
        },
        {
            id: 8,
            nome: 'Educação Física',
            descricao: 'Atividades físicas e esportes',
            status: 'inactive',
            professores: 2
        }
    ];

    // Inicialização
    function init() {
        materias = [...sampleMaterias];
        renderMaterias();
        setupEventListeners();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Pesquisa e filtros
        searchInput.addEventListener('input', filterMaterias);
        filterStatus.addEventListener('change', filterMaterias);

        // Modal de matéria
        addMateriaBtn.addEventListener('click', openAddModal);
        document.getElementById('closeModal').addEventListener('click', closeMateriaModal);
        document.getElementById('cancelBtn').addEventListener('click', closeMateriaModal);

        // Formulário
        materiaForm.addEventListener('submit', handleMateriaSubmit);

        // Modal de confirmação
        document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
        document.getElementById('cancelConfirm').addEventListener('click', closeConfirmModal);
        document.getElementById('confirmAction').addEventListener('click', handleConfirmAction);

        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (e.target === materiaModal) closeMateriaModal();
            if (e.target === confirmModal) closeConfirmModal();
        });
    }

    // Renderizar lista de matérias
    function renderMaterias(filteredMaterias = materias) {
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

        materiasList.innerHTML = filteredMaterias.map(materia => `
            <div class="materia-card" data-materia-id="${materia.id}">
                <div class="materia-info">
                    <div class="materia-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="materia-details">
                        <h3>${materia.nome}</h3>
                        ${materia.descricao ? `<div class="materia-descricao">${materia.descricao}</div>` : ''}
                        <div class="materia-meta">
                            <span class="materia-status ${materia.status}">
                                ${materia.status === 'active' ? 'Ativa' : 'Inativa'}
                            </span>
                            <span>${materia.professores} professor(es)</span>
                        </div>
                    </div>
                </div>
                <div class="materia-actions">
                    <button class="btn-edit" onclick="editMateria(${materia.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn-inactivate ${materia.status === 'inactive' ? 'inactive' : ''}" 
                            onclick="toggleMateriaStatus(${materia.id})">
                        <i class="fas ${materia.status === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                        ${materia.status === 'active' ? 'Inativar' : 'Ativar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Filtrar matérias
    function filterMaterias() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatus.value;

        const filteredMaterias = materias.filter(materia => {
            const matchesSearch = materia.nome.toLowerCase().includes(searchTerm) || 
                                (materia.descricao && materia.descricao.toLowerCase().includes(searchTerm));
            const matchesStatus = statusFilter === 'all' || materia.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        renderMaterias(filteredMaterias);
    }

    // Abrir modal para adicionar matéria
    function openAddModal() {
        modalTitle.textContent = 'Cadastrar Matéria';
        materiaForm.reset();
        document.getElementById('materiaId').value = '';
        document.getElementById('materiaStatus').value = 'active';
        currentMateriaId = null;
        materiaModal.classList.add('show');
    }

    // Editar matéria
    window.editMateria = function(materiaId) {
        const materia = materias.find(m => m.id === materiaId);
        if (!materia) return;

        modalTitle.textContent = 'Editar Matéria';
        document.getElementById('materiaId').value = materia.id;
        document.getElementById('materiaNome').value = materia.nome;
        document.getElementById('materiaDescricao').value = materia.descricao || '';
        document.getElementById('materiaStatus').value = materia.status;

        currentMateriaId = materiaId;
        materiaModal.classList.add('show');
    }

    // Fechar modal de matéria
    function closeMateriaModal() {
        materiaModal.classList.remove('show');
        materiaForm.reset();
    }

    // Alternar status da matéria
    window.toggleMateriaStatus = function(materiaId) {
        const materia = materias.find(m => m.id === materiaId);
        if (!materia) return;

        currentMateriaId = materiaId;
        currentAction = 'toggleStatus';

        const message = materia.status === 'active' 
            ? `Tem certeza que deseja inativar a matéria "${materia.nome}"?` 
            : `Tem certeza que deseja ativar a matéria "${materia.nome}"?`;

        document.getElementById('confirmMessage').textContent = message;
        confirmModal.classList.add('show');
    }

    // Fechar modal de confirmação
    function closeConfirmModal() {
        confirmModal.classList.remove('show');
        currentMateriaId = null;
        currentAction = null;
    }

    // Manipular ação de confirmação
    function handleConfirmAction() {
        if (currentAction === 'toggleStatus' && currentMateriaId) {
            const materiaIndex = materias.findIndex(m => m.id === currentMateriaId);
            if (materiaIndex !== -1) {
                materias[materiaIndex].status = materias[materiaIndex].status === 'active' ? 'inactive' : 'active';
                renderMaterias();
                showNotification('Status da matéria atualizado com sucesso!', 'success');
            }
        }

        closeConfirmModal();
    }

    // Manipular envio do formulário
    function handleMateriaSubmit(e) {
        e.preventDefault();

        const formData = {
            nome: document.getElementById('materiaNome').value,
            descricao: document.getElementById('materiaDescricao').value,
            status: document.getElementById('materiaStatus').value
        };

        if (currentMateriaId) {
            // Editar matéria existente
            const materiaIndex = materias.findIndex(m => m.id === currentMateriaId);
            if (materiaIndex !== -1) {
                materias[materiaIndex] = {
                    ...materias[materiaIndex],
                    ...formData
                };
                showNotification('Matéria atualizada com sucesso!', 'success');
            }
        } else {
            // Adicionar nova matéria
            const newMateria = {
                id: Date.now(),
                ...formData,
                professores: 0
            };
            materias.push(newMateria);
            showNotification('Matéria cadastrada com sucesso!', 'success');
        }

        renderMaterias();
        closeMateriaModal();
        filterMaterias();
    }

    // Mostrar notificação
    function showNotification(message, type) {
        // Em uma aplicação real, você usaria uma biblioteca de notificações
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }

    // Inicializar a aplicação
    init();
});