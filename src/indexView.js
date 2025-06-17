import View from "./view.js";
import { ASPECT_RATIO, ASPECT_RATIO_PORTRAIT } from "./config.js";

class IndexView extends View {
  heroEl = document.querySelector(".hero-home");
  viedoEl = document.querySelector(".video-bg");
  carousel = document.querySelector(".carousel");
  slides = [...document.querySelectorAll(".gallery-image")];
  slideCount = this.slides.length;
  carouselFlexGap = +getComputedStyle(this.carousel).gap.split("p").at(0);
  slideWidth = this.slides.at(0).getBoundingClientRect().width;
  scrollPos = 0;
  scrollSpeed = 2;
  maxScrollWidth =
    this.slideWidth * this.slideCount + this.carouselFlexGap * this.slideCount;
  isPaused = true;
  gallery = document.querySelector(".gallery");

  constructor() {
    super();

    const resizeHeroVideo = this.#resizeHeroVideo.bind(this);

    this.#InitializeVideoHeight();
    window.addEventListener("resize", resizeHeroVideo);

    this.slides.forEach((curEl) => {
      this.carousel.insertAdjacentElement("beforeend", curEl.cloneNode(true));
    });

    this.#handleCarouselPlayState();
    this.gallery.addEventListener("mouseover", () => {
      this.isPaused = true;
    });

    this.gallery.addEventListener("mouseleave", () => {
      this.isPaused = false;
      this.startCarousel();
    });

    console.log(
      this.maxScrollWidth,
      this.slideCount,
      this.carouselFlexGap,
      this.slideWidth
    );
  }

  #calcVideoHeight() {
    const clientWidth = document.documentElement.clientWidth;

    const finalAspectRatio =
      clientWidth >= 820 ? ASPECT_RATIO : ASPECT_RATIO_PORTRAIT;

    const height = `${
      (finalAspectRatio.height * clientWidth) / finalAspectRatio.width
    }px`;

    return height;
  }

  #InitializeVideoHeight() {
    this.viedoEl.classList.remove("hide");
    this.heroEl.style.height = this.#calcVideoHeight();
    this.heroEl.style.backgroundImage = "none";
  }

  #resizeHeroVideo() {
    // const clientWidth = document.documentElement.clientWidth;
    // const curVidEl = this.heroEl.firstElementChild;
    // const isPortrait = clientWidth <= 819;

    // console.log(curVidEl);

    // const bgVideoPortrait = `
    //   <video autoplay muted loop class="video-bg">
    //       <source
    //         src="./public/home-hero-vid-portrait.mp4"
    //         type="video/mp4"
    //         media="(max-width: 819px)"
    //         data-is-portrait="true"
    //       />
    //   </video>
    //     `;

    // const bgVideoLandscape = `
    //   <video autoplay muted loop class="video-bg">
    //       <source
    //         src="./public/home-hero-vid.mp4"
    //         type="video/mp4"
    //         media="(min-width: 820px)"
    //       />
    //   </video>
    //     `;

    // console.log(document.documentElement.clientWidth, "test");

    this.heroEl.style.height = this.#calcVideoHeight();

    // if (
    //   (isPortrait && curVidEl.firstElementChild.dataset.isPortrait) ||
    //   (!isPortrait && !curVidEl.firstElementChild.dataset.isPortrait)
    // ) {
    //   console.log({
    //     isPort: isPortrait && curVidEl.firstElementChild.dataset.isPortrait,
    //   });
    //   return;
    // }

    // if (isPortrait) {
    //   curVidEl.remove();
    //   this.heroEl.insertAdjacentHTML("afterbegin", bgVideoPortrait);
    // } else {
    //   curVidEl.remove();
    //   this.heroEl.insertAdjacentHTML("afterbegin", bgVideoLandscape);
    // }
    // if (isPortrait) {
    //   curVidEl.firstElementChild.setAttribute(
    //     "src",
    //     "./public/home-hero-vid-portrait.mp4"
    //   );
    // } else {
    //   curVidEl.firstElementChild.setAttribute(
    //     "src",
    //     "./public/home-hero-vid.mp4"
    //   );
    // }
  }

  #handleCarouselPlayState() {
    function handler(entries) {
      const entry = entries[0];

      if (entry.isIntersecting) {
        this.isPaused = false;
        this.startCarousel();
      } else {
        this.isPaused = true;
      }
    }

    const observer = new IntersectionObserver(handler.bind(this), {
      threshold: 0.1,
      root: null,
    });

    observer.observe(this.gallery);
  }

  startCarousel() {
    if (this.isPaused) return;

    this.scrollPos = this.scrollPos + this.scrollSpeed;

    if (this.scrollPos >= this.maxScrollWidth) {
      this.carousel.style.transition = "none";
      this.scrollPos = 0;
      this.carousel.style.transform = `translateX(-${this.scrollPos})`;

      void this.carousel.offsetWidth;

      this.carousel.style.transition = "transform 0.02s linear";
    } else {
      this.carousel.style.transition = "transform 0.02s linear";
      this.carousel.style.transform = `translateX(-${this.scrollPos}px)`;
    }

    requestAnimationFrame(this.startCarousel.bind(this));
  }
}

new IndexView();
