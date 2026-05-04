document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.floating-logout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isProfessor');
    window.location.href = 'index.html';
  });
});
