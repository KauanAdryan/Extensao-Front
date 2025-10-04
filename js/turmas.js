document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const turmasList = document.getElementById('turmasList');
    const searchInput = document.getElementById('searchInput');
    const filterSerie = document.getElementById('filterSerie');
    const filterStatus = document.getElementById('filterStatus');
    const addTurmaBtn = document.getElementById('addTurmaBtn');
    const turmaModal = document.getElementById('turmaModal');
    const confirmModal = document.getElementById('confirmModal');
    const turmaForm = document.getElementById('turmaForm');
    const modalTitle = document.getElementById('modalTitle');
    const materiasGrid = document.getElementById('materiasGrid');
    
    // Variáveis de estado
    let turmas = [];
    let materias = [];
    let currentTurmaId = null;
    let currentAction = null;

    // Dados de exemplo
    const sampleTurmas = [
        {
            id: 1,
            nome: 'Turma A',
            serie: '1',
            quantidade: 30,
            periodo: 'manha',
            sala: 'Sala 101',
            status: 'active',
            materias: [1, 2, 3]
        },
        {
            id: 2,
            nome: 'Turma B',
            serie: '2',
            quantidade: 28,
            periodo: 'tarde',
            sala: 'Sala 102',
            status: 'active',
            materias: [1, 4, 5]
        },
        {
            id: 3,
            nome: 'Turma C',
            serie: '3',
            quantidade: 25,
            periodo: 'noite',
            sala: 'Sala 103',
            status: 'inactive',
            materias: [2, 3, 6]
        },
        {
            id: 4,
            nome: 'Turma D',
            serie: '1',
            quantidade: 32,
            periodo: 'manha',
            sala: 'Sala 104',
            status: 'active',
            materias: [1, 5, 7]
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
        turmas = [...sampleTurmas];
        materias = [...sampleMaterias];
        renderTurmas();
        setupEventListeners();
        loadMaterias();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Pesquisa e filtros
        searchInput.addEventListener('input', filterTurmas);
        filterSerie.addEventListener('change', filterTurmas);
        filterStatus.addEventListener('change', filterTurmas);

        // Modal de turma
        addTurmaBtn.addEventListener('click', openAddModal);
        document.getElementById('closeModal').addEventListener('click', closeTurmaModal);
        document.getElementById('cancelBtn').addEventListener('click', closeTurmaModal);

        // Formulário
        turmaForm.addEventListener('submit', handleTurmaSubmit);

        // Modal de confirmação
        document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
        document.getElementById('cancelConfirm').addEventListener('click', closeConfirmModal);
        document.getElementById('confirmAction').addEventListener('click', handleConfirmAction);

        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (e.target === turmaModal) closeTurmaModal();
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

    // Renderizar lista de turmas
    function renderTurmas(filteredTurmas = turmas) {
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
            const turmaMaterias = turma.materias.map(materiaId => {
                const materia = materias.find(m => m.id === materiaId);
                return materia ? materia.nome : '';
            }).filter(nome => nome).join(', ');

            return `
                <div class="turma-card" data-turma-id="${turma.id}">
                    <div class="turma-info">
                        <div class="turma-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="turma-details">
                            <h3>${turma.nome}</h3>
                            <div class="turma-meta">
                                <span class="turma-serie ${getSerieClass(turma.serie)}">
                                    ${turma.serie}º Ano
                                </span>
                                <span class="turma-periodo ${turma.periodo}">
                                    ${getPeriodoText(turma.periodo)}
                                </span>
                                <span class="turma-status ${turma.status}">
                                    ${turma.status === 'active' ? 'Ativa' : 'Inativa'}
                                </span>
                                <span>${turma.quantidade} alunos</span>
                                <span>${turma.sala}</span>
                                ${turmaMaterias ? `<span title="Matérias: ${turmaMaterias}">${turmaMaterias}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="turma-actions">
                        <button class="btn-edit" onclick="editTurma(${turma.id})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn-inactivate ${turma.status === 'inactive' ? 'inactive' : ''}" 
                                onclick="toggleTurmaStatus(${turma.id})">
                            <i class="fas ${turma.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}"></i>
                            ${turma.status === 'active' ? 'Inativar' : 'Ativar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Funções auxiliares para formatação
    function getSerieClass(serie) {
        const series = {
            '1': 'primeiro',
            '2': 'segundo', 
            '3': 'terceiro'
        };
        return series[serie] || 'primeiro';
    }

    function getPeriodoText(periodo) {
        const periodos = {
            'manha': 'Manhã',
            'tarde': 'Tarde',
            'noite': 'Noite'
        };
        return periodos[periodo] || 'Manhã';
    }

    // Filtrar turmas
    function filterTurmas() {
        const searchTerm = searchInput.value.toLowerCase();
        const serieFilter = filterSerie.value;
        const statusFilter = filterStatus.value;

        const filteredTurmas = turmas.filter(turma => {
            const matchesSearch = turma.nome.toLowerCase().includes(searchTerm) || 
                                turma.sala.toLowerCase().includes(searchTerm);
            const matchesSerie = serieFilter === 'all' || turma.serie === serieFilter;
            const matchesStatus = statusFilter === 'all' || turma.status === statusFilter;

            return matchesSearch && matchesSerie && matchesStatus;
        });

        renderTurmas(filteredTurmas);
    }

    // Abrir modal para adicionar turma
    function openAddModal() {
        modalTitle.textContent = 'Cadastrar Turma';
        turmaForm.reset();
        document.getElementById('turmaId').value = '';
        document.getElementById('turmaStatus').value = 'active';
        currentTurmaId = null;
        turmaModal.classList.add('show');
    }

    // Editar turma
    window.editTurma = function(turmaId) {
        const turma = turmas.find(t => t.id === turmaId);
        if (!turma) return;

        modalTitle.textContent = 'Editar Turma';
        document.getElementById('turmaId').value = turma.id;
        document.getElementById('turmaNome').value = turma.nome;
        document.getElementById('turmaSerie').value = turma.serie;
        document.getElementById('turmaQuantidade').value = turma.quantidade;
        document.getElementById('turmaPeriodo').value = turma.periodo;
        document.getElementById('turmaSala').value = turma.sala || '';
        document.getElementById('turmaStatus').value = turma.status;
        
        // Marcar matérias da turma
        turma.materias.forEach(materiaId => {
            const checkbox = document.getElementById(`materia-${materiaId}`);
            if (checkbox) checkbox.checked = true;
        });

        currentTurmaId = turmaId;
        turmaModal.classList.add('show');
    }

    // Alternar status da turma
    window.toggleTurmaStatus = function(turmaId) {
        const turma = turmas.find(t => t.id === turmaId);
        if (!turma) return;

        currentTurmaId = turmaId;
        currentAction = 'toggleStatus';

        const message = turma.status === 'active' 
            ? `Tem certeza que deseja inativar a turma ${turma.nome}?` 
            : `Tem certeza que deseja ativar a turma ${turma.nome}?`;

        document.getElementById('confirmMessage').textContent = message;
        confirmModal.classList.add('show');
    }

    // Fechar modal de turma
    function closeTurmaModal() {
        turmaModal.classList.remove('show');
        turmaForm.reset();
        
        // Desmarcar todas as matérias
        const checkboxes = materiasGrid.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }

    // Fechar modal de confirmação
    function closeConfirmModal() {
        confirmModal.classList.remove('show');
        currentTurmaId = null;
        currentAction = null;
    }

    // Manipular ação de confirmação
    function handleConfirmAction() {
        if (currentAction === 'toggleStatus' && currentTurmaId) {
            const turmaIndex = turmas.findIndex(t => t.id === currentTurmaId);
            if (turmaIndex !== -1) {
                turmas[turmaIndex].status = turmas[turmaIndex].status === 'active' ? 'inactive' : 'active';
                renderTurmas();
                showNotification('Status da turma atualizado com sucesso!', 'success');
            }
        }

        closeConfirmModal();
    }

    // Manipular envio do formulário
    function handleTurmaSubmit(e) {
        e.preventDefault();

        const formData = {
            nome: document.getElementById('turmaNome').value,
            serie: document.getElementById('turmaSerie').value,
            quantidade: parseInt(document.getElementById('turmaQuantidade').value),
            periodo: document.getElementById('turmaPeriodo').value,
            sala: document.getElementById('turmaSala').value,
            status: document.getElementById('turmaStatus').value
        };

        // Obter matérias selecionadas
        const materiasSelecionadas = [];
        const checkboxes = materiasGrid.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            materiasSelecionadas.push(parseInt(checkbox.value));
        });
        formData.materias = materiasSelecionadas;

        if (currentTurmaId) {
            // Editar turma existente
            const turmaIndex = turmas.findIndex(t => t.id === currentTurmaId);
            if (turmaIndex !== -1) {
                turmas[turmaIndex] = { ...turmas[turmaIndex], ...formData };
                showNotification('Turma atualizada com sucesso!', 'success');
            }
        } else {
            // Adicionar nova turma
            const newTurma = {
                id: Date.now(),
                ...formData
            };
            turmas.push(newTurma);
            showNotification('Turma cadastrada com sucesso!', 'success');
        }

        renderTurmas();
        closeTurmaModal();
        filterTurmas();
    }

    // Mostrar notificação
    function showNotification(message, type) {
        // Em uma aplicação real, você usaria uma biblioteca de notificações
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }

    // Inicializar a aplicação
    init();
});