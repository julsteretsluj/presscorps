const announcement = document.getElementById("announcement");
const closeAnnouncement = document.querySelector("[data-close-announcement]");
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");

if (closeAnnouncement && announcement) {
  if (sessionStorage.getItem("press-announcement-dismissed") === "1") {
    announcement.hidden = true;
  }
  closeAnnouncement.addEventListener("click", () => {
    announcement.hidden = true;
    sessionStorage.setItem("press-announcement-dismissed", "1");
  });
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    });
  });
}
