class View {
  navbar = document.querySelector(".navbar");
  hamburger = document.querySelector(".hamburger-menu");
  mobileNav = document.querySelector(".mobile-nav");
  mobileNavCloseBtn = document.querySelector(".close-mobile-nav-btn");
  sections = [...document.querySelectorAll(".scroll-animate")];
  pageLinks = [...this.navbar.querySelectorAll("a")];
  copyright = document.querySelector(".copyright");
  touchYStart;
  touchYEnd;
  touchXStart;
  touchXEnd;

  constructor() {
    const setActiveLink = this.setActiveLink.bind(this);
    const closeMobileNav = this.closeMobileNav.bind(this);
    const openMobileNav = this.showMobileNav.bind(this);
    const preventReload = this.preventReload.bind(this);
    const handleTouchStart = this.handleTouchStart.bind(this);
    const handleTouchMove = this.handleTouchMove.bind(this);
    const handleTouchEnd = this.handleTouchEnd.bind(this);

    this.fixNavBar();
    this.setVisibilityState(false);
    window.addEventListener("DOMContentLoaded", setActiveLink);
    this.hamburger.addEventListener("click", openMobileNav);
    this.mobileNavCloseBtn.addEventListener("click", closeMobileNav);
    this.navbar.addEventListener("click", preventReload);
    this.mobileNav.addEventListener("click", preventReload);
    this.mobileNav.addEventListener("touchstart", handleTouchStart);
    this.mobileNav.addEventListener("touchmove", handleTouchMove);
    this.mobileNav.addEventListener("touchend", handleTouchEnd);

    this.copyright.textContent = this.copyright.textContent.replace(
      "{YEAR}",
      `${new Date().getFullYear()}`
    );

    this.#revealsection();
  }

  fixNavBar() {
    function observerHandler(entries) {
      const [entry] = entries;

      if (!entry.isIntersecting) {
        this.navbar.classList.add("fixed");
      } else this.navbar.classList.remove("fixed");
    }
    const observer = new IntersectionObserver(observerHandler.bind(this), {
      root: null,
      threshold: 0,
      rootMargin: `-${getComputedStyle(this.navbar).height}`,
    });

    const observee =
      document.querySelector(".hero-home") ||
      document.querySelector(".hero-full") ||
      document.querySelector(".hero");

    observer.observe(observee);
  }

  showMobileNav() {
    this.mobileNav.classList.remove("hide-mobile-nav");

    this.setVisibilityState(true);
    // prevent document scroll when mobile nav is open
    setTimeout(() => {
      document.body.classList.add("body-fixed");
    }, 500);
  }

  setVisibilityState(isVisible) {
    let state = isVisible ? "visible" : "hidden";

    this.mobileNav
      .querySelectorAll("*")
      .forEach((el) => (el.style.visibility = state));
  }

  closeMobileNav() {
    const callback = this.setVisibilityState.bind(this);

    // reset document scroll when mobile nav is closed
    document.body.classList.remove("body-fixed");
    this.mobileNav.classList.add("hide-mobile-nav");
    setTimeout(callback, 500, false);
  }

  handleTouchStart(e) {
    this.touchYStart = e.touches[0].screenY;
    this.touchXStart = e.touches[0].screenX;
  }

  handleTouchMove(e) {
    this.touchYEnd = e.touches[0].screenY;
    this.touchXEnd = e.touches[0].screenX;
  }

  handleTouchEnd() {
    if (this.touchYEnd === 0) return;

    if (
      this.touchYStart - this.touchYEnd >
        Math.abs(this.touchXStart - this.touchXEnd) &&
      this.touchYStart - this.touchYEnd > 40
    )
      this.closeMobileNav();

    this.touchYStart = 0;
    this.touchYEnd = 0;
    this.touchXStart = 0;
    this.touchXEnd = 0;
  }

  preventReload(e) {
    e.preventDefault();
    const page = e.target.closest(".page");

    if (!page) return;

    let href;
    if (page.getAttribute("href")) href = page.getAttribute("href");
    else href = e.target.getAttribute("href");

    const windowhref = window.location.pathname.slice(1);

    if (
      (href.replaceAll("/", "") === "index.html" && windowhref === "") ||
      href.replaceAll("/", "") === windowhref
    )
      return;

    window.location.pathname = href;
  }

  setActiveLink() {
    const href = window.location.pathname.slice(1);
    this.pageLinks.forEach((link) => {
      const hrefAttr = link.getAttribute("href").replaceAll("/", "");

      // clean-up to remove the active class from any link with it, before adding to the current link in view.
      if (link.classList.contains("link-active"))
        link.classList.remove("link-active");

      if (hrefAttr === href || (hrefAttr === "index.html" && href === ""))
        link.classList.add("link-active");
    });
  }

  #revealsection() {
    const observer = new IntersectionObserver(handler, {
      root: null,
      threshold: 0.1,
    });

    function handler(entries) {
      const entry = entries[0];

      if (entry.isIntersecting) {
        entry.target.classList.remove("scroll-animate");
        observer.unobserve(entry.target);
      }
    }

    this.sections.forEach((curSec) => {
      observer.observe(curSec);
    });
  }
}

// https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13
// const carousel = document.querySelector(".gallery");
// const slide = document.querySelector(".gallery-image");
// const next = document.querySelector(".next");
// const prev = document.querySelector(".prev");

// let x = 0;

// next.addEventListener("click", () => {
//   console.log(getComputedStyle(slide).width, carousel);
//   // carousel.style.gap = "4rem";

//   // window.scrollTo(0, 0);
//   x += 1;
//   carousel.scrollTo(400 * x, 0);
// });

// const carousel = document.querySelector(".carousel");
// // const backgroundImage = document.querySelector(".bg-image");

// const leftArrow = document.querySelector(".prev");
// const rightArrow = document.querySelector(".next");

// let currentIndex = 0;
// let prevIndex;
// const images = document.querySelectorAll(".gallery-image");

// const totalImages = Object.keys(images).length;

// // Use this in your project, if you're doing it locally
// // const imageWidth = images[1].getBoundingClientRect().x;

// const imageWidth = 400;
// // console.log("getbounding1", images[1].getBoundingClientRect());

// leftArrow.addEventListener("click", () => {
//   prevIndex = currentIndex;
//   currentIndex = (currentIndex - 1 + totalImages) % totalImages;
//   carousel.style.transform = `translateX(-${imageWidth}px)`;
//   carousel.insertBefore(images[currentIndex], carousel.firstChild);

//   setTimeout(() => {
//     // carousel.style.transform = "";
//     carousel.classList.add("sliding-transition");
//     // backgroundImage.src = images[currentIndex].src.slice(0, -3) + "1000";
//   }, 10);

//   setTimeout(() => {
//     // carousel.classList.remove("sliding-transition");
//   }, 490);
// });

// rightArrow.addEventListener("click", () => {
//   // carousel.classList.add("sliding-transition");

//   prevIndex = currentIndex;
//   currentIndex = (currentIndex + 1) % totalImages;

//   carousel.style.transform = `translateX(-${imageWidth}px)`;
//   // backgroundImage.src = images[currentIndex].src.slice(0, -3) + "1000";

//   setTimeout(() => {
//     carousel.appendChild(images[prevIndex]);
//     // carousel.classList.remove("sliding-transition");
//     carousel.style.transform = "";
//   }, 500);
// });

export default View;
