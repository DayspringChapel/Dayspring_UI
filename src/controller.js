import { ASPECT_RATIO } from "./config.js";

// !!IMPORTANT: PLS DO NOT TAMPER WITH, THIS OPERATION HELPS RESIZE THE HOME PAGE BACKGROUND VIDEO CONTAINER AUTOMATICALLY BASED ON SCREEN-SIZE. ITS NEEDED BECAUSE OF VIDEO'S ASPECT RATIO(IT'LL GET EXTRACTED APPROPRIATELY WHEN JS IMPLEMENTATION STARTS)

const heroEl = document.querySelector(".hero-home");
const viedoEl = document.querySelector(".video-bg");

const hamburger = document.querySelector(".hamburger-menu");
const mobileNav = document.querySelector(".mobile-nav");
const mobileNavCloseBtn = document.querySelector(".close-mobile-nav-btn");

// Temporary
if (heroEl) {
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
}

// Prevent browser reload when clicked link is same as the currently viewed page
mobileNav.addEventListener("click", (e) => {
  // e.preventDefault();
  const page = e.target.closest(".page");
  const href = e.target.getAttribute("href");
  const windowhref = window.location.pathname.slice(1);

  console.log(e.target);

  if (
    (href === "index.html" && windowhref === "") ||
    href === windowhref ||
    !page
  )
    return e.preventDefault();

  window.location.pathname = href;
});

// Toggle mobile nav visibilty
hamburger.addEventListener("click", () => {
  mobileNav.classList.remove("hide-mobile-nav");

  // prevent document scroll when mobile nav is open
  setTimeout(() => {
    document.body.classList.add("body-fixed");
  }, 500);
});

mobileNavCloseBtn.addEventListener("click", () => {
  // reset document scroll when mobile nav is closed
  document.body.classList.remove("body-fixed");
  mobileNav.classList.add("hide-mobile-nav");
});
