document.addEventListener('DOMContentLoaded', function() {
    const professorLoginForm = document.getElementById('professorLoginForm');
    const backBtn = document.getElementById('backBtn');
    
    // Evento de submit do formulário de login do professor
    professorLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const recaptchaResponse = grecaptcha.getResponse();
        
        if (!recaptchaResponse) {
            alert('Por favor, confirme que você não é um robô.');
            return;
        }
        
        // Validação adicional para campos específicos do professor
        const matricula = document.getElementById('matricula').value;
        if (!matricula || matricula.length < 3) {
            alert('Por favor, informe uma matrícula válida.');
            return;
        }
        
        // Aqui você pode adicionar a lógica para enviar os dados do formulário
        // para o servidor, incluindo o recaptchaResponse para validação
        
        alert('Login de professor realizado com sucesso!');
        // Limpar o formulário após o envio
        this.reset();
        grecaptcha.reset();
    });
    
    // Evento de clique no botão Voltar
    backBtn.addEventListener('click', function() {
        // Redireciona de volta para a tela de login principal
        window.location.href = 'index.html';
    });
});