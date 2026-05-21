document.addEventListener('DOMContentLoaded', () => {
  // Animación de cards página principal
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

  // Modal Portfolio
  const modal = document.getElementById('portfolio-modal');
  const openBtn = document.getElementById('open-portfolio');
  const closeBtn = document.querySelector('.close');

  openBtn.onclick = () => {
    modal.style.display = 'flex';

    // Animación de entrada de las cards del portfolio
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

  // Auto-avance opcional (descomentá si querés que cambie solo)
  // setInterval(() => goToSlide(currentIndex + 1), 5000);
});

// Theme Switcher - CORREGIDO para móviles
document.addEventListener('DOMContentLoaded', () => {
  const themeLinks = {
    kawaii: document.getElementById('theme-kawaii'),
    formal: document.getElementById('theme-formal'),
    cyberpunk: document.getElementById('theme-cyberpunk'),
    dark: document.getElementById('theme-dark')
  };

  const themeButton = document.getElementById('theme-button');
  const themeMenu = document.getElementById('theme-menu');
  const themeSwitcher = document.getElementById('theme-switcher');
  const menuButtons = themeMenu.querySelectorAll('button');

  // Cargar tema guardado
  const savedTheme = localStorage.getItem('selectedTheme') || 'cyberpunk';
  activateTheme(savedTheme);

  // Abrir/cerrar menú al tocar el botón
  themeButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita propagación inmediata
    themeSwitcher.classList.toggle('open');
  });

  // Seleccionar tema
  menuButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita que se cierre al tocar una opción
      const theme = btn.getAttribute('data-theme');
      activateTheme(theme);
      themeSwitcher.classList.remove('open');
    });
  });

  // Cerrar menú solo si se toca fuera del switcher
  document.addEventListener('click', (e) => {
    if (!themeSwitcher.contains(e.target)) {
      themeSwitcher.classList.remove('open');
    }
  });

  // Función para activar el tema seleccionado
  function activateTheme(theme) {
    // Desactivar todos los temas
    Object.values(themeLinks).forEach(link => link.disabled = true);
    // Activar el seleccionado
    themeLinks[theme].disabled = false;

    // Actualizar botón activo visualmente
    menuButtons.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');

    // Guardar en localStorage
    localStorage.setItem('selectedTheme', theme);
  }
});