document.documentElement.classList.remove("no-js");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

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
const emailCopyButtons = Array.from(document.querySelectorAll(".email-copy"));

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  return copied ? Promise.resolve() : Promise.reject(new Error("Copy failed"));
}

emailCopyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const email = button.dataset.email;
    if (!email) {
      return;
    }

    copyText(email)
      .then(() => {
        button.setAttribute("aria-label", `已复制邮箱 ${email}`);
      })
      .catch(() => {
        button.setAttribute("aria-label", `复制邮箱 ${email}`);
      });
  });
});

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

function getHeaderOffset() {
  const header = document.querySelector(".site-header");
  return (header ? header.offsetHeight : 0) + 14;
}

function scrollToSection(id, updateHash = true) {
  const section = document.getElementById(id);
  if (!section) {
    return;
  }

  const top = section.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth"
  });

  if (updateHash) {
    history.pushState(null, "", `#${id}`);
  }

  setActiveNav(id);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const id = link.getAttribute("href").replace("#", "");
    scrollToSection(id);
  });
});

window.addEventListener("hashchange", () => {
  const id = window.location.hash.replace("#", "");
  if (id) {
    scrollToSection(id, false);
  } else {
    setActiveNavFromHash();
  }
});

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

window.addEventListener("load", () => {
  const id = window.location.hash.replace("#", "");
  if (id) {
    requestAnimationFrame(() => scrollToSection(id, false));
  } else {
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }
});
