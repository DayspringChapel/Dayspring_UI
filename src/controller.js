import { ASPECT_RATIO } from "./config.js";

// !!IMPORTANT: PLS DO NOT TAMPER WITH, THIS OPERATION HELPS RESIZE THE HOME PAGE BACKGROUND VIDEO CONTAINER AUTOMATICALLY BASED ON SCREEN-SIZE. ITS NEEDED BECAUSE OF VIDEO'S ASPECT RATIO(IT'LL GET EXTRACTED APPROPRIATELY WHEN JS IMPLEMENTATION STARTS)

const heroEl = document.querySelector(".hero-home");
const viedoEl = document.querySelector(".video-bg");

function calcVideoHeight() {
  //   const windowWidth = window.innerWidth;
  const clientWidth = document.documentElement.clientWidth;
  const height = `${
    (ASPECT_RATIO.height * clientWidth) / ASPECT_RATIO.width
  }px`;

  return height;
}

(function InitializeVideoHeight() {
  viedoEl.classList.remove("hide");
  heroEl.style.height = calcVideoHeight();
  heroEl.style.backgroundImage = "none";
})();

window.addEventListener("resize", () => {
  heroEl.style.height = calcVideoHeight();
});
