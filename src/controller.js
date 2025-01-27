// import "./IndexView.js";

// const x = new index();
// console.log(x);

// const heroEl = document.querySelector(".hero-home");
// const viedoEl = document.querySelector(".video-bg");

// const navbar = document.querySelector(".navbar");
// const hamburger = document.querySelector(".hamburger-menu");
// const mobileNav = document.querySelector(".mobile-nav");
// const mobileNavCloseBtn = document.querySelector(".close-mobile-nav-btn");
// const pageLinks = [...document.querySelectorAll("a")];

// // Temporary
// function calcVideoHeight() {
//   const clientWidth = document.documentElement.clientWidth;
//   const height = `${
//     (ASPECT_RATIO.height * clientWidth) / ASPECT_RATIO.width
//   }px`;

//   return height;
// }

// // !!IMPORTANT: PLS DO NOT TAMPER WITH, THIS OPERATION HELPS RESIZE THE HOME PAGE BACKGROUND VIDEO CONTAINER AUTOMATICALLY BASED ON SCREEN-SIZE. ITS NEEDED BECAUSE OF VIDEO'S ASPECT RATIO(IT'LL GET EXTRACTED APPROPRIATELY WHEN JS IMPLEMENTATION STARTS FULLY)
// if (heroEl) {
//   (function InitializeVideoHeight() {
//     viedoEl.classList.remove("hide");
//     heroEl.style.height = calcVideoHeight();
//     heroEl.style.backgroundImage = "none";
//   })();
// }

// window.addEventListener("resize", () => {
//   if (heroEl) heroEl.style.height = calcVideoHeight();

//   if (document.body.classList.contains("body-fixed"))
//     document.body.classList.remove("body-fixed");
// });

// // function to set active link
// window.addEventListener("DOMContentLoaded", () => {
//   const href = window.location.pathname.slice(1);

//   pageLinks.forEach((link) => {
//     const hrefAttr = link.getAttribute("href").replaceAll("/", "");

//     // clean-up to remove the active class from any link with it, before adding to the current link in view.
//     if (link.classList.contains("link-active"))
//       link.classList.remove("link-active");

//     if (hrefAttr === href || (hrefAttr === "index.html" && href === ""))
//       link.classList.add("link-active");
//   });
// });

// // Prevent browser reload when clicked link is same as the currently viewed page
// function navLinkHandler(e) {
//   e.preventDefault();
//   const page = e.target.closest(".page");

//   if (!page) return;

//   let href;
//   if (page.getAttribute("href")) href = page.getAttribute("href");
//   else href = e.target.getAttribute("href");

//   const windowhref = window.location.pathname.slice(1);

//   if (
//     (href.replaceAll("/", "") === "index.html" && windowhref === "") ||
//     href.replaceAll("/", "") === windowhref
//   )
//     return;

//   window.location.pathname = href;
// }

// navbar.addEventListener("click", navLinkHandler);
// mobileNav.addEventListener("click", navLinkHandler);

// // Toggle mobile nav visibilty
// hamburger.addEventListener("click", () => {
//   mobileNav.classList.remove("hide-mobile-nav");

//   // prevent document scroll when mobile nav is open
//   setTimeout(() => {
//     document.body.classList.add("body-fixed");
//   }, 500);
// });

// mobileNavCloseBtn.addEventListener("click", () => {
//   // reset document scroll when mobile nav is closed
//   document.body.classList.remove("body-fixed");
//   mobileNav.classList.add("hide-mobile-nav");
// });
