document.addEventListener('DOMContentLoaded', () => {
  // Animación de cards en la página principal
  const cards = document.querySelectorAll('.card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 150);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));

  // Funcionalidad del Modal Portfolio
  const modal = document.getElementById('portfolio-modal');
  const openBtn = document.getElementById('open-portfolio');
  const closeBtn = document.querySelector('.close');

  openBtn.onclick = () => {
    modal.style.display = 'flex';

    // Animar las cards del portfolio al abrir el modal
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    portfolioCards.forEach((card, index) => {
      card.style.opacity = 0;
      card.style.transform = 'translateY(30px)';
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = 1;
        card.style.transform = 'translateY(0)';
        card.classList.add('visible');
      }, index * 200);
    });
  };

  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  // Cerrar al hacer click fuera del contenido
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
});