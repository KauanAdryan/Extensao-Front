document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const professorBtn = document.getElementById('professorBtn');
    
    // Evento de submit do formulário de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const recaptchaResponse = grecaptcha.getResponse();
        
        if (!recaptchaResponse) {
            alert('Por favor, confirme que você não é um robô.');
            return;
        }
        
        // Aqui você pode adicionar a lógica para enviar os dados do formulário
        // para o servidor, incluindo o recaptchaResponse para validação
        
        alert('Login realizado com sucesso!');
        // Limpar o formulário após o envio
        this.reset();
        grecaptcha.reset();
    });
    
    // Evento de clique no botão Professor
    professorBtn.addEventListener('click', function() {
        // Redireciona para a tela de login do professor
        window.location.href = 'loginProfessor.html';
    });
});