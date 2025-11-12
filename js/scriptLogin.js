document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const professorBtn = document.getElementById('professorBtn');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    const API_BASE_URL = 'http://localhost:3000';
    
    // Função para mostrar mensagem de erro
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message';
        
        // Esconder a mensagem após 5 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Função para mostrar mensagem de sucesso
    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'success-message';
        
        // Esconder a mensagem após 3 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
    
    // Função para mostrar/ocultar loading
    function setLoading(isLoading) {
        const btnText = loginBtn.querySelector('.btn-text');
        const spinner = loginBtn.querySelector('.loading-spinner');
        
        if (isLoading) {
            btnText.style.display = 'none';
            spinner.style.display = 'block';
            loginBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            loginBtn.disabled = false;
        }
    }
    
    // Função para validar login no JSON Server
    async function validateLogin(email, password) {
        try {
            setLoading(true);
            
            // Buscar todos os usuários
            const response = await fetch(`${API_BASE_URL}/usuario`);
            
            if (!response.ok) {
                throw new Error('Erro ao conectar com o servidor');
            }
            
            const usuarios = await response.json();
            
            // Verificar se existe um usuário com o email e senha fornecidos
            const usuarioValido = usuarios.find(usuario => 
                usuario.email === email && usuario.senha === password
            );
            
            if (usuarioValido) {
                // Verificar se o usuário é coordenador
                if (usuarioValido.cargo === 'Coordenador') {
                    showSuccess('Login realizado com sucesso!');
                    
                    // Salvar dados do usuário no localStorage
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioValido));
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // Redirecionar para o dashboard após 1 segundo
                    setTimeout(() => {
                        window.location.href = 'dashboardCoordenador.html';
                    }, 1000);
                    
                } else {
                    showError('Acesso permitido apenas para coordenadores');
                }
            } else {
                showError('E-mail ou senha incorretos');
            }
            
        } catch (error) {
            console.error('Erro na validação:', error);
            
            if (error.message.includes('Failed to fetch')) {
                showError('Erro de conexão. Verifique se o JSON Server está rodando.');
            } else {
                showError('Erro ao validar credenciais. Tente novamente.');
            }
            
            // Fallback para desenvolvimento (remova em produção)
            console.log('Usando fallback para desenvolvimento...');
            fallbackValidation(email, password);
            
        } finally {
            setLoading(false);
        }
    }
    
    // Fallback para desenvolvimento (quando JSON Server não está disponível)
    function fallbackValidation(email, password) {
        const usuariosFallback = [
            {
                id: 1,
                nome: "Miguel",
                senha: "1234Miguel!",
                email: "miguelmartoni@gmail.com",
                status: "Ativo",
                cargo: "Coordenador",
                tipousuario: "COORD001",
                telefone: 11999999999
            },
            {
                id: 2,
                nome: "Ana Silva",
                senha: "123456",
                email: "coordenador@escola.com",
                status: "Ativo",
                cargo: "Coordenador",
                tipousuario: "COORD002",
                telefone: 11988888888
            }
        ];
        
        const usuarioValido = usuariosFallback.find(usuario => 
            usuario.email === email && usuario.senha === password
        );
        
        if (usuarioValido) {
            showSuccess('Login realizado com sucesso!');
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioValido));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirecionar para o dashboard após 1 segundo
            setTimeout(() => {
                window.location.href = 'dashboardCoordenador.html';
            }, 1000);
        } else {
            showError('E-mail ou senha incorretos');
        }
    }
    
    // Evento de submit do formulário de login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Validações básicas
        if (!email || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }
        
        if (!email.includes('@')) {
            showError('Por favor, insira um e-mail válido.');
            return;
        }
        
        // Verificar reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse();
        
        if (!recaptchaResponse) {
            showError('Por favor, confirme que você não é um robô.');
            return;
        }
        
        // Validar login
        await validateLogin(email, password);
        
        // Limpar reCAPTCHA
        grecaptcha.reset();
    });
    
    // Evento de clique no botão Professor
    professorBtn.addEventListener('click', function() {
        // Redireciona para a tela de login do professor
        window.location.href = 'loginProfessor.html';
    });
    
    // Preencher automaticamente para teste (remova em produção)
    function preencherDadosTeste() {
        const urlParams = new URLSearchParams(window.location.search);
        const teste = urlParams.get('teste');
        
        if (teste === 'dev') {
            document.getElementById('email').value = 'coordenador@escola.com';
            document.getElementById('password').value = '123456';
            console.log('Dados de teste preenchidos automaticamente.');
        }
    }
    
    preencherDadosTeste();
});