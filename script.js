// Mobile navigation, theme switcher, active navigation, and footer year.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  themeToggle.textContent = isLight ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Interactivity ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Remember theme choice (storage may be unavailable, so it is wrapped in try/catch).
try {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme");
    themeToggle.textContent = "☾";
    themeToggle.setAttribute("aria-label", "Switch to dark theme");
  }
} catch (e) {}
themeToggle.addEventListener("click", () => {
  try { localStorage.setItem("theme", document.body.classList.contains("light-theme") ? "light" : "dark"); } catch (e) {}
});

// Typing effect in the hero.
const typedEl = document.getElementById("typedText");
const phrases = ["web development", "databases & MySQL", "clean, responsive design", "learning by building"];
if (reduceMotion) {
  typedEl.textContent = phrases[0];
} else {
  let p = 0, c = 0, deleting = false;
  (function tick() {
    const word = phrases[p];
    typedEl.textContent = word.slice(0, c);
    let delay = deleting ? 40 : 85;
    if (!deleting && c === word.length) { deleting = true; delay = 1400; }
    else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 350; }
    c += deleting ? -1 : 1;
    setTimeout(tick, delay);
  })();
}

// Reveal-on-scroll.
const revealTargets = document.querySelectorAll(".section-heading, .about-card, .fact-card, .skill-card, .project-card, .timeline, .contact-card");
revealTargets.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.setProperty("--d", ((i % 3) * 0.08) + "s");
});
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("visible"));
}

// Skill-card spotlight follows the cursor.
document.querySelectorAll(".skill-card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  });
});

// Project filter.
const chips = document.querySelectorAll(".filter-chip");
const cards = document.querySelectorAll(".project-card");
const emptyMsg = document.getElementById("filterEmpty");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => { const on = c === chip; c.classList.toggle("active", on); c.setAttribute("aria-pressed", String(on)); });
    let shown = 0;
    cards.forEach((card) => {
      const match = f === "all" || card.dataset.tags.split(" ").includes(f);
      card.classList.toggle("hide", !match);
      if (match) { shown++; card.classList.add("visible"); }
    });
    emptyMsg.hidden = shown > 0;
  });
});

// Project details modal.
const projectData = {
  school: { meta: "01 / ACADEMIC PROJECT", title: "School Management System", desc: "A student enrollment and records project focused on organizing student information, sections, sessions, and learning modalities.", tags: ["C++", "MySQL", "Database"] },
  portfolio: { meta: "02 / PERSONAL PROJECT", title: "Personal Portfolio", desc: "A responsive website that introduces me, presents my skills and projects, and provides a way to get in touch.", tags: ["HTML", "CSS", "JavaScript"] },
  gaming: { meta: "03 / CREATIVE PROJECT", title: "Gaming Portfolio", desc: "A themed web portfolio inspired by gaming, created to practice page layout, visual design, and front-end development.", tags: ["HTML", "CSS", "UI Design"] }
};
const modal = document.getElementById("projectModal");
let lastFocus = null;
function openModal(key) {
  const d = projectData[key];
  if (!d) return;
  lastFocus = document.activeElement;
  document.getElementById("modalMeta").textContent = d.meta;
  document.getElementById("modalTitle").textContent = d.title;
  document.getElementById("modalDesc").textContent = d.desc;
  const tagBox = document.getElementById("modalTags");
  tagBox.replaceChildren(...d.tags.map((t) => { const s = document.createElement("span"); s.textContent = t; return s; }));
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close").focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  if (lastFocus) lastFocus.focus();
}
document.querySelectorAll("[data-open]").forEach((btn) => btn.addEventListener("click", () => openModal(btn.dataset.open)));
modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

// Expandable education cards.
document.querySelectorAll(".timeline-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".timeline");
    const open = card.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
});

// Contact form: validation, character counter, then opens the visitor's email app.
const form = document.getElementById("contactForm");
const fields = { name: document.getElementById("cName"), email: document.getElementById("cEmail"), msg: document.getElementById("cMsg") };
const errs = { name: document.getElementById("cNameErr"), email: document.getElementById("cEmailErr"), msg: document.getElementById("cMsgErr") };
const status = document.getElementById("formStatus");
document.getElementById("cMsg").addEventListener("input", (e) => {
  document.getElementById("cCount").textContent = e.target.value.length + " / 500";
});
function setError(key, text) {
  errs[key].textContent = text;
  fields[key].closest(".field").classList.toggle("invalid", Boolean(text));
  fields[key].setAttribute("aria-invalid", text ? "true" : "false");
}
function validate() {
  const name = fields.name.value.trim(), email = fields.email.value.trim(), msg = fields.msg.value.trim();
  setError("name", name.length < 2 ? "Please enter your name." : "");
  setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Please enter a valid email address.");
  setError("msg", msg.length < 10 ? "Message should be at least 10 characters." : "");
  return !errs.name.textContent && !errs.email.textContent && !errs.msg.textContent;
}
Object.keys(fields).forEach((k) => fields[k].addEventListener("blur", validate));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  status.textContent = "";
  if (!validate()) { status.textContent = "Please fix the highlighted fields."; return; }
  const subject = encodeURIComponent("Portfolio message from " + fields.name.value.trim());
  const body = encodeURIComponent(fields.msg.value.trim() + "\n\nFrom: " + fields.name.value.trim() + " (" + fields.email.value.trim() + ")");
  window.location.href = "mailto:calibuyotjeanyrose@gmail.com?subject=" + subject + "&body=" + body;
  status.textContent = "Opening your email app… if nothing opens, use the copy button below.";
  form.reset();
  document.getElementById("cCount").textContent = "0 / 500";
});

// Copy email.
const copyBtn = document.getElementById("copyEmail");
copyBtn.addEventListener("click", async () => {
  const email = document.getElementById("emailText").textContent;
  try { await navigator.clipboard.writeText(email); copyBtn.textContent = "Copied ✓"; }
  catch (e) { copyBtn.textContent = "Press Ctrl+C to copy"; }
  setTimeout(() => { copyBtn.textContent = "Copy email"; }, 2000);
});

// ---------- Tab-style navigation: one section at a time, no scrolling between sections ----------
const pages = document.querySelectorAll("main section[id]");
const navButtons = document.querySelectorAll(".nav-link");
function showPage(id, updateHash = true) {
  if (!document.getElementById(id) || !Array.from(pages).some((p) => p.id === id)) id = "home";
  pages.forEach((p) => p.classList.toggle("active", p.id === id));
  navButtons.forEach((n) => {
    const on = n.getAttribute("href") === "#" + id;
    n.classList.toggle("active", on);
    if (on) n.setAttribute("aria-current", "page"); else n.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);
  if (updateHash) history.replaceState(null, "", "#" + id);
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(a.getAttribute("href").slice(1));
  });
});
window.addEventListener("hashchange", () => showPage(location.hash.slice(1), false));
showPage(location.hash.slice(1) || "home", false);
