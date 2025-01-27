class View {
  navbar = document.querySelector(".navbar");
  hamburger = document.querySelector(".hamburger-menu");
  mobileNav = document.querySelector(".mobile-nav");
  mobileNavCloseBtn = document.querySelector(".close-mobile-nav-btn");
  pageLinks = [...document.querySelectorAll("a")];
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

    window.addEventListener("DOMContentLoaded", setActiveLink);
    this.hamburger.addEventListener("click", openMobileNav);
    this.mobileNavCloseBtn.addEventListener("click", closeMobileNav);
    this.navbar.addEventListener("click", preventReload);
    this.mobileNav.addEventListener("click", preventReload);
    this.mobileNav.addEventListener("touchstart", handleTouchStart);
    this.mobileNav.addEventListener("touchmove", handleTouchMove);
    this.mobileNav.addEventListener("touchend", handleTouchEnd);
  }

  showMobileNav() {
    this.mobileNav.classList.remove("hide-mobile-nav");

    // prevent document scroll when mobile nav is open
    setTimeout(() => {
      document.body.classList.add("body-fixed");
    }, 500);
  }

  closeMobileNav(delay) {
    // reset document scroll when mobile nav is closed
    console.log(delay);

    setTimeout(() => document.body.classList.remove("body-fixed"), delay || 0);
    this.mobileNav.classList.add("hide-mobile-nav");
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
    if (
      this.touchYStart - this.touchYEnd >
      Math.abs(this.touchXStart - this.touchXEnd)
    )
      this.closeMobileNav(160);
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
}

export default View;

// document.querySelector("a").addEventListener("touch")
