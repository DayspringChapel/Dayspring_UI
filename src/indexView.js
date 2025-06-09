import View from "./view.js";
import { ASPECT_RATIO } from "./config.js";

class IndexView extends View {
  heroEl = document.querySelector(".hero-home");
  viedoEl = document.querySelector(".video-bg");

  constructor() {
    super();

    const resizeHeroVideo = this.#resizeHeroVideo.bind(this);

    this.#InitializeVideoHeight();
    window.addEventListener("resize", resizeHeroVideo);
  }

  #calcVideoHeight() {
    const clientWidth = document.documentElement.clientWidth;
    const height = `${
      (ASPECT_RATIO.height * clientWidth) / ASPECT_RATIO.width
    }px`;

    return height;
  }

  #InitializeVideoHeight() {
    this.viedoEl.classList.remove("hide");
    this.heroEl.style.height = this.#calcVideoHeight();
    this.heroEl.style.backgroundImage = "none";
  }

  #resizeHeroVideo() {
    this.heroEl.style.height = this.#calcVideoHeight();
  }
}

// const carousel = document.querySelector(".carousel");
// const slides = [...document.querySelectorAll(".gallery-image")];
// let index = 1;
// const width = 400;

// slides.forEach((el) => console.log(el.dataset.index));

// function moveCarousel() {
//   carousel.style.transition = "transform 0.5s ease-in-out";
//   carousel.style.transform = `translateX(${-width * index}px)`;
// }

// function handleTransitionEnd() {
//   // console.log(index);
//   if (slides[index].dataset.index === slides[0].dataset.index) {
//     carousel.style.transition = "none";
//     index = 1;
//     carousel.style.transform = `translateX(${-width * index}px)`;
//   }
//   console.log(
//     slides[index].dataset.index === slides[slides.length - 3].dataset.index,
//     slides[index].dataset.index,
//     slides[slides.length - 3].dataset.index,
//     index
//   );

//   if (slides[index].dataset.index === slides[slides.length - 3].dataset.index) {
//     console.log("okay");
//     carousel.style.transition = "none";
//     index = slides.length - 2;
//     console.log(index);
//     carousel.style.transform = `translateX(${-width * index}px)`;
//   }
// }

// carousel.addEventListener("transitionend", handleTransitionEnd);

// function startCarousel() {
//   setInterval(() => {
//     index++;
//     moveCarousel();
//   }, 1000);
// }

// startCarousel();

new IndexView();
