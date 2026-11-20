document.addEventListener("DOMContentLoaded", () => {
  // 1. Ініціалізація Swiper.js (v11) для слайдера відгуків
  const reviewsSwiper = new Swiper(".reviews-swiper", {
    loop: true,
    spaceBetween: 24,
    speed: 600,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });

  // 2. Ініціалізація Fancybox (v5) для модальної галереї
  Fancybox.bind("[data-fancybox='coaching-gallery']", {
    Carousel: {
      Transition: "fade",
    },
    Images: {
      Panzoom: {
        maxScale: 3,
      },
    },
  });

  // 3. Ініціалізація Typed.js для ефекту друку в Hero-секції
  const typedTarget = document.querySelector("#typed-slogan");
  if (typedTarget) {
    new Typed("#typed-slogan", {
      strings: [
        "Наукова періодизація навантажень.",
        "Точний розрахунок макронутрієнтів.",
        "Натуральний прогрес без плато.",
      ],
      typeSpeed: 45,
      backSpeed: 25,
      backDelay: 1800,
      loop: true,
    });
  }
});
