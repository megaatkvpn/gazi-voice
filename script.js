/* ================= GAZI VOICE ================= */
const WHATSAPP_NUMBER = "8801875884557"; // অর্ডার এই নাম্বারে যাবে

/* ---------- Year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Header shadow on scroll ---------- */
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("open");
  nav.classList.toggle("open");
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  menuBtn.classList.remove("open");
  nav.classList.remove("open");
}));

/* ---------- Sliders ----------
   প্রতিটা .slider নিজে নিজে চলে।
   কোনো ব্যানার ছবি না পাওয়া গেলে সেটা স্লাইডার থেকে বাদ পড়ে যায়। */
document.querySelectorAll(".slider").forEach(slider => {
  const track = slider.querySelector(".slides");
  const dotsBox = slider.querySelector(".sl-dots");
  const interval = Number(slider.dataset.interval) || 5000;
  let index = 0, timer = null;

  const slides = () => [...track.querySelectorAll(".slide")];

  function buildDots() {
    dotsBox.innerHTML = "";
    slides().forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Slide " + (i + 1));
      b.addEventListener("click", () => { go(i); restart(); });
      dotsBox.appendChild(b);
    });
    const many = slides().length > 1;
    dotsBox.style.display = many ? "" : "none";
    slider.querySelectorAll(".sl-arrow").forEach(a => a.style.display = many ? "" : "none");
    if (!slides().length) slider.style.display = "none";
  }

  function go(i) {
    const n = slides().length;
    if (!n) return;
    index = (i + n) % n;
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dotsBox.children].forEach((d, k) => d.classList.toggle("active", k === index));
  }

  function start() { if (slides().length > 1) timer = setInterval(() => go(index + 1), interval); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  // Broken image → remove it
  slides().forEach(slide => {
    const img = slide.querySelector(".fg");
    img.addEventListener("error", () => { slide.remove(); buildDots(); go(0); });
  });

  slider.querySelector(".prev").addEventListener("click", () => { go(index - 1); restart(); });
  slider.querySelector(".next").addEventListener("click", () => { go(index + 1); restart(); });
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  // Touch swipe
  let x0 = null;
  slider.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  slider.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    x0 = null; start();
  });

  buildDots(); go(0); start();
});

/* ---------- Counter (শুধু স্ক্রিনে আসলে চলবে) ---------- */
function runCounter(el) {
  const target = Number(el.dataset.to);
  const dur = 1600, t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".sec-head, .stat, .app, .pkg, .order-wrap, details, .cta");
revealEls.forEach(el => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll(".count").forEach(runCounter);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("in"));
  document.querySelectorAll(".count").forEach(runCounter);
}

/* ---------- WhatsApp helper ---------- */
function openWhatsApp(text) {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
}

/* ---------- Package "Order Now" buttons ---------- */
document.querySelectorAll(".order-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // ফর্মে প্যাকেজ সিলেক্ট করে ফর্মে নিয়ে যাবে
    document.getElementById("package").value = btn.dataset.pkg;
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.getElementById("name").focus({ preventScroll: true }), 700);
  });
});

/* ---------- Order form ---------- */
document.getElementById("orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  const err = document.getElementById("formError");
  name.classList.toggle("err", !name.value.trim());
  phone.classList.toggle("err", phone.value.trim().length < 6);

  if (!name.value.trim() || phone.value.trim().length < 6) {
    err.textContent = "দয়া করে নাম ও সঠিক ফোন নম্বর লিখুন।";
    return;
  }
  err.textContent = "";

  const msg =
`New Order Request - Gazi Voice

Name: ${name.value.trim()}
Phone: ${phone.value.trim()}
Country: ${document.getElementById("country").value}
Package: ${document.getElementById("package").value}

Please confirm my order.`;
  openWhatsApp(msg);
});
