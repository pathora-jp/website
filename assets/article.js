/* 下層ページ（業務委託人材の採用代行）の動き */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- ヘッダー：スクロールしたら白い帯にする ---------- */
  var hdr = document.getElementById("hdr");
  function onScroll() { hdr.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- スマホのメニュー ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var spmenu = document.getElementById("spmenu");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    spmenu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", function () { setMenu(spmenu.hidden); });
  spmenu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  /* ---------- ページ内リンク：固定ヘッダーの分だけずらす ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      if (target.tagName === "DETAILS") target.open = true;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: reduce ? "auto" : "smooth" });
    });
  });

  var pains = document.querySelectorAll(".pain");
  var sts = document.querySelectorAll(".st");
  if (!hasGsap || reduce) {
    pains.forEach(function (el) { el.classList.add("is-in"); });
    sts.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* 冒頭：文字が下からせり上がる */
  var intro = gsap.timeline({ delay: 0.2 })
    .from(".a-hero .crumb, .a-hero .sec-label", { y: 16, opacity: 0, duration: 0.7, ease: "power3.out" }, 0)
    .from(".a-hero h1", { y: 40, opacity: 0, duration: 1.1, ease: "power4.out" }, 0.1)
    .from(".a-lead, .a-date", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.35)
    .from(".a-en", { xPercent: 6, opacity: 0, duration: 1.6, ease: "power3.out" }, 0)
    .from(".a-stat", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, 0.5);
  // 描画が止まりがちな環境でも、見出しが消えたままにならないようにする
  setTimeout(function () { if (intro.progress() < 1) intro.progress(1); }, 2500);

  /* 冒頭の大きな英字：スクロールでゆっくり流れる */
  gsap.to(".a-en", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".a-hero", start: "top top", end: "bottom top", scrub: true } });

  /* 数字のカウントアップ */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var to = +el.dataset.count, obj = { v: 0 };
    el.textContent = "0";
    gsap.to(obj, {
      v: to, duration: 1.6, delay: 0.6, ease: "power2.out",
      onUpdate: function () { el.textContent = Math.round(obj.v); },
      onComplete: function () { el.textContent = to; }
    });
  });

  /* 悩み：スクロールに合わせて灰色→黒に変わる */
  pains.forEach(function (el) {
    ScrollTrigger.create({
      trigger: el, start: "top 75%",
      onEnter: function () { el.classList.add("is-in"); },
      onLeaveBack: function () { el.classList.remove("is-in"); }
    });
  });

  /* 強み：写真がズームアウトし、文章がせり上がる */
  sts.forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: "top 78%", once: true, onEnter: function () { el.classList.add("is-in"); } });
    gsap.from(el.querySelectorAll(".st-num, .st-body h3, .st-body p"), {
      y: 36, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 78%" }
    });
  });

  /* 見出し・表・質問：せり上がる */
  gsap.utils.toArray(".en-xl, .pains-head h2, .q-title").forEach(function (el) {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  gsap.from(".cmp tbody tr", { x: -24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: ".cmp", start: "top 80%" } });
  gsap.from(".qa", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".faq-list", start: "top 82%" } });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
