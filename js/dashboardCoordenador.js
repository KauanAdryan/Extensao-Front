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

    // Toggle Sidebar
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Atualizar ícone do botão toggle
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    });

    // Toggle Profile Dropdown
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function() {
        profileDropdown.classList.remove('show');
    });

    // Prevenir fechamento ao clicar no dropdown
    profileDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Navegação entre itens do menu
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover classe active de todos os itens
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adicionar classe active ao item clicado
            this.classList.add('active');
        });
    });

    // Abrir modal de logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logoutModal.classList.add('show');
        profileDropdown.classList.remove('show');
    });

    // Fechar modal de logout
    closeModal.addEventListener('click', function() {
        logoutModal.classList.remove('show');
    });

    cancelLogout.addEventListener('click', function() {
        logoutModal.classList.remove('show');
    });

    // Confirmar logout
    confirmLogout.addEventListener('click', function() {
        // Aqui você pode adicionar a lógica de logout
        alert('Saindo do sistema...');
        // Redirecionar para a página de login
        window.location.href = 'index.html';
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target === logoutModal) {
            logoutModal.classList.remove('show');
        }
    });

    // Simular dados do coordenador
    const coordenadorData = {
        name: 'Carlos Oliveira',
        role: 'Coordenador',
        photo: 'https://via.placeholder.com/80'
    };

    // Atualizar informações do coordenador
    document.getElementById('userName').textContent = coordenadorData.name;
    document.getElementById('userRole').textContent = coordenadorData.role;
    document.getElementById('welcomeName').textContent = coordenadorData.name.split(' ')[0];
    document.getElementById('userPhoto').src = coordenadorData.photo;

    // Adicionar funcionalidade de menu mobile
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
    `;

    document.body.appendChild(mobileMenuBtn);

    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('show');
    });

    // Esconder/mostrar botão mobile baseado na largura da tela
    function handleResponsive() {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'flex';
            sidebar.classList.remove('collapsed');
        } else {
            mobileMenuBtn.style.display = 'none';
            sidebar.classList.remove('show');
        }
    }

    window.addEventListener('resize', handleResponsive);
    handleResponsive();

    // Adicionar funcionalidade aos botões de ação rápida
    const quickButtons = document.querySelectorAll('.quick-btn');
    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            alert(`Ação: ${action} - Esta funcionalidade será implementada em breve.`);
        });
    });
});