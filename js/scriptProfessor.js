document.addEventListener('DOMContentLoaded', function() {
    const professorLoginForm = document.getElementById('professorLoginForm');
    const backBtn = document.getElementById('backBtn');
    const API_BASE_URL = 'http://localhost:3000';

    function isRecaptchaValid() {
        if (!window.grecaptcha || typeof grecaptcha.getResponse !== 'function') {
            console.warn('reCAPTCHA não carregado. Pulando validação (modo desenvolvimento).');
            return true;
        }

        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            alert('Por favor, confirme que você não é um robô.');
            return false;
        }

        return true;
    }

    function resetRecaptcha() {
        if (window.grecaptcha && typeof grecaptcha.reset === 'function') {
            grecaptcha.reset();
        }
    }

    async function autenticarProfessor(email, senha, matricula) {
        const params = new URLSearchParams({
            email,
            cargo: 'Professor',
            status: 'Ativo',
            tipousuario: matricula
        });

        const resp = await fetch(`${API_BASE_URL}/usuario?${params.toString()}`);
        if (!resp.ok) {
            throw new Error('Falha ao consultar usuário no servidor.');
        }
        const usuarios = await resp.json();
        const user = usuarios.find(u => u.senha === senha);
        if (!user) {
            throw new Error('Credenciais inválidas ou usuário não encontrado/ativo.');
        }
        return user;
    }
    
    // Evento de submit do formulário de login do professor
    professorLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!isRecaptchaValid()) {
            return;
        }
        
        const email = document.getElementById('professorEmail')?.value.trim();
        const senha = document.getElementById('professorPassword')?.value;
        const matricula = document.getElementById('matricula').value;
        if (!email || !senha) {
            alert('Preencha e-mail e senha.');
            return;
        }

        // Validação adicional para campos específicos do professor
        if (!matricula || matricula.length < 3) {
            alert('Por favor, informe uma matrícula válida.');
            return;
        }
        
        try {
            const user = await autenticarProfessor(email, senha, matricula);
            localStorage.setItem('usuarioLogado', JSON.stringify(user));
            localStorage.setItem('isProfessor', 'true');
            alert('Login de professor realizado com sucesso!');
            window.location.href = 'disponibilidadeProfessor.html';
        } catch (err) {
            console.error(err);
            alert(err.message || 'Não foi possível entrar. Verifique as credenciais.');
            resetRecaptcha();
        }
    });
    
    // Evento de clique no botão Voltar
    backBtn.addEventListener('click', function() {
        // Redireciona de volta para a tela de login principal
        window.location.href = 'index.html';
    });
});
