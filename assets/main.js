/* Pathora コーポレートサイト（雛形）の動き */
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

  /* ---------- メインビジュアル：画像の上を光の粒がゆっくり漂う ---------- */
  var canvas = document.getElementById("mvCanvas");
  var ctx = canvas && canvas.getContext("2d");
  var W = 0, H = 0, DPR = 1, dots = [], rafId = 0, running = true;

  function makeDot(fresh) {
    // 左下から右上へ、道の流れにそって漂う
    return {
      x: fresh ? Math.random() * W : Math.random() * W * 0.6,
      y: fresh ? Math.random() * H : H * (0.6 + Math.random() * 0.45),
      r: 0.8 + Math.random() * 2.2,
      vx: 0.12 + Math.random() * 0.35,
      vy: -(0.05 + Math.random() * 0.22),
      life: 0, max: 400 + Math.random() * 500
    };
  }
  function sizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    dots = [];
    for (var i = 0; i < (W < 768 ? 28 : 56); i++) dots.push(makeDot(true));
  }
  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    dots.forEach(function (d, i) {
      d.x += d.vx; d.y += d.vy; d.life++;
      if (d.life > d.max || d.x > W + 10 || d.y < -10) { dots[i] = makeDot(false); return; }
      var fade = Math.min(1, d.life / 60, (d.max - d.life) / 80);
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(31,209,165," + 0.12 * fade + ")"; ctx.fill();
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(190,255,236," + 0.9 * fade + ")"; ctx.fill();
    });
  }
  function frame() {
    if (!running) { rafId = 0; return; }
    draw();
    rafId = requestAnimationFrame(frame);
  }
  if (ctx && !reduce) {
    sizeCanvas();
    rafId = requestAnimationFrame(frame);
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running && !rafId) rafId = requestAnimationFrame(frame);
    }).observe(canvas);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(sizeCanvas, 150); });
  }

  /* ---------- ここから下はGSAPの動き ---------- */
  var svcs = document.querySelectorAll(".svc");
  if (!hasGsap || reduce) {
    svcs.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* 読み込み時：文字が下からせり上がる */
  var introTl = gsap.timeline({ delay: 0.3 })
    .from(".mv-kicker .k-in", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out" }, 0)
    .from(".mv-title .w", { yPercent: 60, opacity: 0, duration: 1.2, stagger: 0.1, ease: "power4.out" }, 0.15);
  gsap.fromTo(".mv-img img", { scale: 1.12 }, { scale: 1, duration: 2.6, ease: "power2.out" });
  // 描画が止まりがちな環境でも、見出しが消えたままにならないようにする
  setTimeout(function () { if (introTl.progress() < 1) introTl.progress(1); }, 2500);

  /* メインビジュアル：スクロールで「O」の穴に吸い込まれて次のセクションへ */
  var title = document.getElementById("mvTitle");
  var oEl = document.getElementById("mvO");
  function setOrigin() {
    var x = 0, y = 0, el = oEl;
    while (el && el !== title) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    gsap.set(title, { transformOrigin: (x + oEl.offsetWidth / 2) + "px " + (y + oEl.offsetHeight * 0.53) + "px" });
  }
  setOrigin();
  ScrollTrigger.addEventListener("refreshInit", function () { gsap.set(title, { scale: 1 }); setOrigin(); });

  gsap.timeline({
    scrollTrigger: {
      trigger: ".mv", start: "top top", end: "+=110%", scrub: 0.6, pin: true, anticipatePin: 1,
      onUpdate: function (self) { document.body.classList.toggle("on-dark", self.progress > 0.6); }
    }
  })
    .to(".mv-kicker, .mv-scroll", { opacity: 0, duration: 0.12 }, 0)
    .to(title, { scale: 130, ease: "power3.in", duration: 1 }, 0)
    .to(".mv-bg", { opacity: 0, duration: 0.3, ease: "none" }, 0.35)
    .to(".mv-grad", { opacity: 1, duration: 0.3, ease: "none" }, 0.45)
    .to(title, { opacity: 0, duration: 0.2, ease: "none" }, 0.72);

  /* COMPANY：数字のカウントアップ */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var to = +el.dataset.count, obj = { v: 0 };
    el.textContent = "0";
    gsap.to(obj, {
      v: to, duration: 1.6, ease: "power2.out",
      onUpdate: function () { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* 大きな英語見出し：せり上がる */
  gsap.utils.toArray(".en-xl, .company-body h2").forEach(function (el) {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* SERVICE：スクロールに合わせて灰色→黒に変わる */
  svcs.forEach(function (el) {
    ScrollTrigger.create({
      trigger: el, start: "top 72%",
      onEnter: function () { el.classList.add("is-in"); },
      onLeaveBack: function () { el.classList.remove("is-in"); }
    });
  });

  /* STRATEGY：背景がゆっくり動く */
  gsap.to("#strategyBg", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".strategy", start: "top bottom", end: "bottom top", scrub: true } });

  /* PLAN：カードが少しずつ違う速さで動いて奥行きを出す（パソコンのみ） */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", function () {
    gsap.utils.toArray(".card").forEach(function (card) {
      gsap.fromTo(card, { y: 60 - card.dataset.speed * 6 }, {
        y: card.dataset.speed * 4, ease: "none",
        scrollTrigger: { trigger: ".plans", start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  });

  /* FLOW：線が伸びていく */
  mm.add("(min-width: 1101px)", function () {
    gsap.fromTo("#flowProgress", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "#flowTrack", start: "top 80%", end: "bottom 45%", scrub: true } });
  });
  mm.add("(max-width: 1100px)", function () {
    gsap.fromTo("#flowProgress", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#flowTrack", start: "top 70%", end: "bottom 60%", scrub: true } });
  });

  /* 右端の縦メニュー：今いるセクションを示す／暗い背景では白にする */
  var navLinks = document.querySelectorAll(".side a");
  document.querySelectorAll("[data-sec]").forEach(function (sec) {
    ScrollTrigger.create({
      trigger: sec, start: "top 50%", end: "bottom 50%",
      onToggle: function (self) {
        if (!self.isActive) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.dataset.nav === sec.dataset.sec); });
        document.body.classList.toggle("on-dark", sec.hasAttribute("data-dark"));
      }
    });
  });

  /* ページ内リンク：固定ヘッダーの分だけずらしてスクロール */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1), target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var y = id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
