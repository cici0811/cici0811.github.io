document.documentElement.classList.remove("no-js");

const currentYearNodes = document.querySelectorAll("[data-current-year]");
currentYearNodes.forEach((node) => {
  node.textContent = new Date().getFullYear().toString();
});

const revealNodes = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const observedSections = Array.from(document.querySelectorAll(".section-observed"));

function setActiveNav(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setActiveNavFromHash() {
  const id = window.location.hash.replace("#", "");
  if (id) {
    setActiveNav(id);
  } else if (observedSections[0]) {
    setActiveNav(observedSections[0].id);
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href").replace("#", "");
    setActiveNav(id);
  });
});

window.addEventListener("hashchange", setActiveNavFromHash);

if ("IntersectionObserver" in window && observedSections.length > 0) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveNav(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-24% 0px -58% 0px",
      threshold: [0.12, 0.28, 0.46]
    }
  );

  observedSections.forEach((section) => navObserver.observe(section));
} else if (observedSections[0]) {
  setActiveNav(observedSections[0].id);
}

setActiveNavFromHash();
