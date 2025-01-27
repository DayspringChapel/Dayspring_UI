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

new IndexView();
