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

    // ========== ELEMENTOS DO PERFIL ==========
    const editPersonalInfoBtn = document.getElementById('editPersonalInfo');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const editProfileForm = document.getElementById('editProfileForm');
    const changePasswordForm = document.getElementById('changePasswordForm');

    // URLs da API
    const API_BASE_URL = 'http://localhost:3000';
    
    // Variáveis de estado
    let usuarioLogado = null;

    // ========== FUNÇÕES DO DROPDOWN E SIDEBAR ==========

    // Configurar dropdown do perfil
    function setupProfileDropdown() {
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });

            document.addEventListener('click', function() {
                profileDropdown.classList.remove('show');
            });

            profileDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            if (logoutBtn && logoutModal) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logoutModal.classList.add('show');
                    profileDropdown.classList.remove('show');
                });

                if (closeModal) {
                    closeModal.addEventListener('click', function() {
                        logoutModal.classList.remove('show');
                    });
                }

                if (cancelLogout) {
                    cancelLogout.addEventListener('click', function() {
                        logoutModal.classList.remove('show');
                    });
                }

                if (confirmLogout) {
                    confirmLogout.addEventListener('click', function() {
                        fazerLogout();
                    });
                }

                window.addEventListener('click', function(e) {
                    if (e.target === logoutModal) {
                        logoutModal.classList.remove('show');
                    }
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
                
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.remove('show');
                }
            });
        });
    }

    // Função de logout
    function fazerLogout() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }

    // ========== FUNÇÕES DO PERFIL ==========

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

    // Inicialização
    async function init() {
        await carregarDadosUsuario();
        await carregarEstatisticas();
        setupProfileDropdown();
        setupSidebarToggle();
        setupMenuNavigation();
        setupMobileMenu();
        setupPerfilEventListeners();
    }

    // Configurar event listeners do perfil
    function setupPerfilEventListeners() {
        // Botão editar informações pessoais
        if (editPersonalInfoBtn) {
            editPersonalInfoBtn.addEventListener('click', abrirModalEdicao);
        }

        // Botão alterar senha
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', abrirModalSenha);
        }

        // Botão alterar foto
        if (changePhotoBtn) {
            changePhotoBtn.addEventListener('click', alterarFoto);
        }

        // Modais de edição
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelEdit = document.getElementById('cancelEdit');
        const closePasswordModal = document.getElementById('closePasswordModal');
        const cancelPassword = document.getElementById('cancelPassword');

        if (closeEditModal) closeEditModal.addEventListener('click', fecharModalEdicao);
        if (cancelEdit) cancelEdit.addEventListener('click', fecharModalEdicao);
        if (closePasswordModal) closePasswordModal.addEventListener('click', fecharModalSenha);
        if (cancelPassword) cancelPassword.addEventListener('click', fecharModalSenha);

        // Formulários
        if (editProfileForm) editProfileForm.addEventListener('submit', handleEditarPerfil);
        if (changePasswordForm) changePasswordForm.addEventListener('submit', handleAlterarSenha);

        // Fechar modais ao clicar fora
        window.addEventListener('click', function(e) {
            if (editProfileModal && e.target === editProfileModal) fecharModalEdicao();
            if (changePasswordModal && e.target === changePasswordModal) fecharModalSenha();
        });
    }

    // Carregar dados do usuário
    async function carregarDadosUsuario() {
        try {
            const usuarioStorage = localStorage.getItem('usuarioLogado');
            
            if (usuarioStorage) {
                usuarioLogado = JSON.parse(usuarioStorage);
                atualizarInterfaceUsuario();
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            mostrarNotificacao('Erro ao carregar dados do usuário', 'error');
        }
    }

    // Atualizar interface com dados do usuário
    function atualizarInterfaceUsuario() {
        if (usuarioLogado) {
            // Atualizar sidebar
            document.getElementById('userName').textContent = usuarioLogado.nome;
            document.getElementById('userRole').textContent = usuarioLogado.cargo;

            // Atualizar avatar
            const avatar = document.getElementById('userAvatar');
            if (avatar) {
                const iniciais = usuarioLogado.nome.split(' ').map(n => n[0]).join('').toUpperCase();
                avatar.textContent = iniciais;
            }

            // Atualizar informações pessoais
            document.getElementById('infoNome').textContent = usuarioLogado.nome;
            document.getElementById('infoEmail').textContent = usuarioLogado.email;
            document.getElementById('infoTelefone').textContent = usuarioLogado.telefone || 'Não informado';
            document.getElementById('infoCargo').textContent = usuarioLogado.cargo;
            document.getElementById('infoMatricula').textContent = usuarioLogado.tipousuario;
            
            const statusElement = document.getElementById('infoStatus');
            if (statusElement) {
                statusElement.textContent = usuarioLogado.status;
                statusElement.className = `status-badge ${usuarioLogado.status === 'Ativo' ? 'active' : 'inactive'}`;
            }
        }
    }

    // Carregar estatísticas
    async function carregarEstatisticas() {
        try {
            const [usuariosRes, turmasRes, materiasRes] = await Promise.all([
                fetch(`${API_BASE_URL}/usuario`),
                fetch(`${API_BASE_URL}/turma`),
                fetch(`${API_BASE_URL}/materia`)
            ]);

            if (usuariosRes.ok && turmasRes.ok && materiasRes.ok) {
                const usuarios = await usuariosRes.json();
                const turmas = await turmasRes.json();
                const materias = await materiasRes.json();

                const professores = usuarios.filter(u => u.cargo === 'Professor');
                const turmasAtivas = turmas.filter(t => t.status === 'Ativo');
                const materiasAtivas = materias.filter(m => m.status === 'Ativo');
                const totalAlunos = turmasAtivas.reduce((total, turma) => total + (turma.qtdalunos || 0), 0);

                document.getElementById('statProfessores').textContent = professores.length;
                document.getElementById('statTurmas').textContent = turmasAtivas.length;
                document.getElementById('statMaterias').textContent = materiasAtivas.length;
                document.getElementById('statAlunos').textContent = totalAlunos;
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    // Abrir modal de edição
    function abrirModalEdicao() {
        if (!editProfileModal || !usuarioLogado) return;

        document.getElementById('editUserId').value = usuarioLogado.id;
        document.getElementById('editNome').value = usuarioLogado.nome;
        document.getElementById('editEmail').value = usuarioLogado.email;
        document.getElementById('editTelefone').value = usuarioLogado.telefone || '';

        editProfileModal.classList.add('show');
    }

    // Fechar modal de edição
    function fecharModalEdicao() {
        if (editProfileModal) {
            editProfileModal.classList.remove('show');
        }
    }

    // Abrir modal de senha
    function abrirModalSenha() {
        if (changePasswordModal) {
            changePasswordModal.classList.add('show');
        }
    }

    // Fechar modal de senha
    function fecharModalSenha() {
        if (changePasswordModal) {
            changePasswordModal.classList.remove('show');
            if (changePasswordForm) changePasswordForm.reset();
        }
    }

    // Alterar foto (placeholder)
    function alterarFoto() {
        mostrarNotificacao('Funcionalidade de alteração de foto será implementada em breve.', 'info');
    }

    // Manipular edição do perfil
    async function handleEditarPerfil(e) {
        e.preventDefault();

        try {
            const formData = {
                nome: document.getElementById('editNome').value,
                email: document.getElementById('editEmail').value,
                telefone: document.getElementById('editTelefone').value
            };

            // Validação
            if (!formData.nome.trim()) {
                mostrarNotificacao('O nome é obrigatório!', 'error');
                return;
            }

            if (!formData.email.trim()) {
                mostrarNotificacao('O email é obrigatório!', 'error');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/usuario/${usuarioLogado.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar perfil');
            }

            const usuarioAtualizado = await response.json();
            
            // Atualizar localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
            usuarioLogado = usuarioAtualizado;
            
            // Atualizar interface
            atualizarInterfaceUsuario();
            
            mostrarNotificacao('Perfil atualizado com sucesso!', 'success');
            fecharModalEdicao();

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            mostrarNotificacao('Erro ao atualizar perfil. Tente novamente.', 'error');
        }
    }

    // Manipular alteração de senha
    async function handleAlterarSenha(e) {
        e.preventDefault();

        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validações
            if (!currentPassword) {
                mostrarNotificacao('Digite a senha atual!', 'error');
                return;
            }

            if (newPassword.length < 6) {
                mostrarNotificacao('A nova senha deve ter pelo menos 6 caracteres!', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                mostrarNotificacao('As senhas não coincidem!', 'error');
                return;
            }

            // Verificar senha atual (em uma aplicação real, isso seria feito no backend)
            if (currentPassword !== usuarioLogado.senha) {
                mostrarNotificacao('Senha atual incorreta!', 'error');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/usuario/${usuarioLogado.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senha: newPassword
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao alterar senha');
            }

            const usuarioAtualizado = await response.json();
            
            // Atualizar localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
            usuarioLogado = usuarioAtualizado;
            
            mostrarNotificacao('Senha alterada com sucesso!', 'success');
            fecharModalSenha();

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            mostrarNotificacao('Erro ao alterar senha. Tente novamente.', 'error');
        }
    }

    // Mostrar notificação
    function mostrarNotificacao(mensagem, tipo) {
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        alert(`${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'} ${mensagem}`);
    }

    // Inicializar aplicação
    init();
});