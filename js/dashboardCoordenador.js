document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const closeModal = document.getElementById('closeModal');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');
    const navItems = document.querySelectorAll('.nav-item');

    // URLs da API
    const API_BASE_URL = 'http://localhost:3000';

    // Estado da aplicação
    let dadosUsuario = null;

    // Inicialização
    init();

    async function init() {
        await carregarDadosUsuario();
        await carregarEstatisticas();
        await carregarProfessores();
        await carregarTurmas();
        setupEventListeners();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Toggle Sidebar com animação
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
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

        // Toggle Profile Dropdown
        if (profileBtn && profileDropdown) {
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
        }

        // Navegação entre itens do menu
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Abrir modal de logout
        if (logoutBtn && logoutModal) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutModal.classList.add('show');
                if (profileDropdown) profileDropdown.classList.remove('show');
            });
        }

        // Fechar modal de logout
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                if (logoutModal) logoutModal.classList.remove('show');
            });
        }

        if (cancelLogout) {
            cancelLogout.addEventListener('click', function() {
                if (logoutModal) logoutModal.classList.remove('show');
            });
        }

        // Confirmar logout
        if (confirmLogout) {
            confirmLogout.addEventListener('click', function() {
                fazerLogout();
            });
        }

        // Fechar modal ao clicar fora
        window.addEventListener('click', function(e) {
            if (logoutModal && e.target === logoutModal) {
                logoutModal.classList.remove('show');
            }
        });

        // Menu mobile
        setupMobileMenu();
    }

    // Carregar dados do usuário logado
    async function carregarDadosUsuario() {
        try {
            const usuarioLogado = localStorage.getItem('usuarioLogado');
            
            if (usuarioLogado) {
                dadosUsuario = JSON.parse(usuarioLogado);
                atualizarInterfaceUsuario();
            } else {
                // Redirecionar para login se não estiver logado
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            mostrarErro('Erro ao carregar dados do usuário');
        }
    }

    // Atualizar interface com dados do usuário
    function atualizarInterfaceUsuario() {
        if (dadosUsuario) {
            const userNameElement = document.getElementById('userName');
            const welcomeNameElement = document.getElementById('welcomeName');
            
            if (userNameElement) {
                userNameElement.textContent = dadosUsuario.nome;
            }
            
            if (welcomeNameElement) {
                welcomeNameElement.textContent = dadosUsuario.nome.split(' ')[0];
            }
            
            // Gerar avatar com iniciais
            const userPhoto = document.getElementById('userPhoto');
            if (userPhoto) {
                userPhoto.alt = `Foto de ${dadosUsuario.nome}`;
            }
        }
    }

    // Carregar estatísticas do sistema
    async function carregarEstatisticas() {
        try {
            const [usuariosRes, turmasRes, materiasRes] = await Promise.all([
                fetch(`${API_BASE_URL}/usuario`),
                fetch(`${API_BASE_URL}/turma`),
                fetch(`${API_BASE_URL}/materia`)
            ]);

            if (!usuariosRes.ok) throw new Error('Erro ao carregar usuários');
            if (!turmasRes.ok) throw new Error('Erro ao carregar turmas');
            if (!materiasRes.ok) throw new Error('Erro ao carregar matérias');

            const usuarios = await usuariosRes.json();
            const turmas = await turmasRes.json();
            const materias = await materiasRes.json();

            // Calcular estatísticas baseadas nos SEUS dados
            const professores = usuarios.filter(u => u.cargo === 'Professor');
            const turmasAtivas = turmas.filter(t => t.status === 'Ativo');
            const materiasAtivas = materias.filter(m => m.status === 'Ativo');
            
            // Calcular total de alunos (usando qtdalunos do seu JSON)
            const totalAlunos = turmasAtivas.reduce((total, turma) => total + (turma.qtdalunos || 0), 0);

            // Atualizar interface com SEUS dados
            const totalProfessoresElement = document.getElementById('totalProfessores');
            const statusProfessoresElement = document.getElementById('statusProfessores');
            const totalTurmasElement = document.getElementById('totalTurmas');
            const statusTurmasElement = document.getElementById('statusTurmas');
            const totalAlunosElement = document.getElementById('totalAlunos');
            const statusAlunosElement = document.getElementById('statusAlunos');
            const totalMateriasElement = document.getElementById('totalMaterias');
            const statusMateriasElement = document.getElementById('statusMaterias');

            if (totalProfessoresElement) totalProfessoresElement.textContent = professores.length;
            if (statusProfessoresElement) statusProfessoresElement.textContent = `${professores.filter(p => p.status === 'Ativo').length} ativos`;

            if (totalTurmasElement) totalTurmasElement.textContent = turmasAtivas.length;
            if (statusTurmasElement) statusTurmasElement.textContent = `${turmasAtivas.length} ativas`;

            if (totalAlunosElement) totalAlunosElement.textContent = totalAlunos;
            if (statusAlunosElement) statusAlunosElement.textContent = `Em ${turmasAtivas.length} turmas`;

            if (totalMateriasElement) totalMateriasElement.textContent = materiasAtivas.length;
            if (statusMateriasElement) statusMateriasElement.textContent = `${materiasAtivas.length} ativas`;

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            mostrarErroEstatisticas();
        }
    }

    // Carregar lista de professores
    async function carregarProfessores() {
        const container = document.getElementById('professoresList');
        if (!container) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/usuario`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar professores');
            }

            const usuarios = await response.json();
            const professores = usuarios.filter(u => u.cargo === 'Professor').slice(0, 4);

            if (professores.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-tie"></i>
                        <h4>Nenhum professor encontrado</h4>
                        <p>Adicione professores para começar</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = professores.map(professor => {
                const iniciais = professor.nome.split(' ').map(n => n[0]).join('').toUpperCase();
                return `
                    <div class="list-item">
                        <div class="list-avatar">${iniciais}</div>
                        <div class="list-info">
                            <h4>${professor.nome}</h4>
                            <p>${professor.tipousuario || 'Professor'}</p>
                        </div>
                        <span class="status ${professor.status === 'Ativo' ? 'active' : 'inactive'}">
                            ${professor.status === 'Ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            mostrarErroProfessores();
        }
    }


    // Funções de exibição de erro
    function mostrarErroEstatisticas() {
        const totalProfessoresElement = document.getElementById('totalProfessores');
        const statusProfessoresElement = document.getElementById('statusProfessores');
        const totalTurmasElement = document.getElementById('totalTurmas');
        const statusTurmasElement = document.getElementById('statusTurmas');
        const totalAlunosElement = document.getElementById('totalAlunos');
        const statusAlunosElement = document.getElementById('statusAlunos');
        const totalMateriasElement = document.getElementById('totalMaterias');
        const statusMateriasElement = document.getElementById('statusMaterias');

        if (totalProfessoresElement) totalProfessoresElement.textContent = '0';
        if (statusProfessoresElement) statusProfessoresElement.textContent = 'Erro ao carregar';
        if (totalTurmasElement) totalTurmasElement.textContent = '0';
        if (statusTurmasElement) statusTurmasElement.textContent = 'Erro ao carregar';
        if (totalAlunosElement) totalAlunosElement.textContent = '0';
        if (statusAlunosElement) statusAlunosElement.textContent = 'Erro ao carregar';
        if (totalMateriasElement) totalMateriasElement.textContent = '0';
        if (statusMateriasElement) statusMateriasElement.textContent = 'Erro ao carregar';
    }

    function mostrarErroProfessores() {
        const container = document.getElementById('professoresList');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar professores</p>
                <small>Verifique se o JSON Server está rodando</small>
            </div>
        `;
    }

    function mostrarErroTurmas() {
        const container = document.getElementById('turmasList');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar turmas</p>
                <small>Verifique se o JSON Server está rodando</small>
            </div>
        `;
    }

    function mostrarErro(mensagem) {
        console.error(mensagem);
    }

    // Função para gerar relatório
    window.gerarRelatorio = function() {
        alert('Esta funcionalidade será implementada em breve.');
    }

    // Função de logout
    function fazerLogout() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
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
});