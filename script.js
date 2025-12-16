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

// Carrusel simple para cada card del portfolio
document.querySelectorAll('.image-carousel').forEach(carousel => {
  const imagesContainer = carousel.querySelector('.carousel-images');
  const images = imagesContainer.querySelectorAll('img');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  
  let currentIndex = 0;
  const totalImages = images.length;

  if (totalImages <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    return;
  }

  // Crear dots
  for (let i = 0; i < totalImages; i++) {
    const dot = document.createElement('span');
    dot.classList.toggle('active', i === 0);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  const dots = dotsContainer.querySelectorAll('span');

  function updateCarousel() {
    imagesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  function goToSlide(index) {
    currentIndex = (index + totalImages) % totalImages;
    updateCarousel();
  }

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Opcional: auto-play lento
  // setInterval(() => goToSlide(currentIndex + 1), 5000);
});