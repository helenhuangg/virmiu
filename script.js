var lottieAnim = null;

function initLottie() {
  var bm = document.getElementById("bm");
  if (!bm || typeof bodymovin === "undefined") {
    if (lottieAnim) {
      lottieAnim.destroy();
      lottieAnim = null;
    }
    return;
  }

  if (lottieAnim) {
    lottieAnim.destroy();
    lottieAnim = null;
  }

  lottieAnim = bodymovin.loadAnimation({
    container: bm,
    path: "data.json",
    renderer: "svg",
    loop: true,
    autoplay: true,
  });
}

function initMainBgMorph() {
  if (typeof gsap === "undefined" || typeof MorphSVGPlugin === "undefined") {
    return;
  }

  var path = document.querySelector(".main-bg .path");
  if (!path) return;

  gsap.registerPlugin(MorphSVGPlugin);

  var start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
  var end = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

  gsap
    .timeline()
    .to(path, { morphSVG: start, ease: "power2.in", duration: 0.4 })
    .to(path, { morphSVG: end, ease: "power2.out", duration: 0.6 });
}

function initFlairCursor() {
  if (typeof gsap === "undefined") return;
  if (window.__eliseFlairCursorInit) return;

  var flair = gsap.utils.toArray(".flair");
  if (!flair.length) return;

  window.__eliseFlairCursorInit = true;

  var gap = 100;
  var index = 0;
  var wrap = gsap.utils.wrap(0, flair.length);
  var mousePos = { x: 0, y: 0 };
  var lastMousePos = { x: 0, y: 0 };

  function playFlairAnimation(shape) {
    gsap
      .timeline()
      .from(shape, {
        opacity: 0,
        scale: 0,
        ease: "elastic.out(1, 0.3)",
      })
      .to(shape, { rotation: "random(-360, 360)" }, "<")
      .to(shape, { y: "120vh", ease: "back.in(0.4)", duration: 1 }, 0);
  }

  function spawnFlair() {
    var img = flair[wrap(index++)];
    gsap.killTweensOf(img);
    gsap.set(img, { clearProps: "all" });
    gsap.set(img, {
      opacity: 1,
      left: mousePos.x,
      top: mousePos.y,
      xPercent: -50,
      yPercent: -50,
    });
    playFlairAnimation(img);
  }

  function imageTrail() {
    var dist = Math.hypot(
      lastMousePos.x - mousePos.x,
      lastMousePos.y - mousePos.y
    );
    if (dist > gap) {
      spawnFlair();
      lastMousePos.x = mousePos.x;
      lastMousePos.y = mousePos.y;
    }
  }

  window.addEventListener("mousemove", function (e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });

  gsap.ticker.add(imageTrail);
}

function getScale(element) {
  var rect = element.getBoundingClientRect();
  return rect.width / element.offsetWidth;
}

function initElementDrag() {
  var heroScale = document.querySelector(".hero-scale");
  var elements = document.querySelectorAll(".main-tagline .element");
  if (!heroScale || !elements.length) return;

  elements.forEach(function (element) {
    element.addEventListener("mousedown", function (e) {
      e.preventDefault();

      var parent = element.offsetParent;
      if (!parent) return;

      var scale = getScale(heroScale);
      var parentRect = parent.getBoundingClientRect();
      var elementRect = element.getBoundingClientRect();
      var parentW = parent.offsetWidth;
      var parentH = parent.offsetHeight;
      var offsetX = ((e.clientX - elementRect.left) / scale / parentW) * 100;
      var offsetY = ((e.clientY - elementRect.top) / scale / parentH) * 100;

      function onMouseMove(e) {
        parentRect = parent.getBoundingClientRect();
        var x =
          ((e.clientX - parentRect.left) / scale / parentW) * 100 - offsetX;
        var y =
          ((e.clientY - parentRect.top) / scale / parentH) * 100 - offsetY;
        element.style.left = x + "%";
        element.style.top = y + "%";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

function initIconLinkCursor() {
  document
    .querySelectorAll(".icon-link__label[data-floater]")
    .forEach(function (label) {
      label.remove();
    });

  var links = document.querySelectorAll(".icon-link");
  if (!links.length) return;

  links.forEach(function (link) {
    if (link.dataset.cursorReady) return;
    link.dataset.cursorReady = "1";

    var label = link.querySelector(".icon-link__label");
    if (!label) return;

    label.dataset.floater = "1";
    document.body.appendChild(label);

    function moveLabel(e) {
      label.style.transform = "translate(-50%, -50%)";
      label.style.left = e.clientX + "px";
      label.style.top = e.clientY + "px";
    }

    function showLabel(e) {
      label.classList.add("is-visible");
      moveLabel(e);
    }

    function hideLabel() {
      label.classList.remove("is-visible");
    }

    link.addEventListener("mouseenter", showLabel);
    link.addEventListener("mousemove", moveLabel);
    link.addEventListener("mouseleave", hideLabel);

    link.addEventListener("focus", function () {
      var rect = link.getBoundingClientRect();
      label.style.left = rect.left + rect.width / 2 + "px";
      label.style.top = rect.top + "px";
      label.style.transform = "translate(-50%, calc(-100% - 0.35rem))";
      label.classList.add("is-visible");
    });

    link.addEventListener("blur", hideLabel);
  });
}

function initSplitTextReveal() {
  if (typeof gsap === "undefined" || typeof SplitText === "undefined") return;

  var splitEls = document.querySelectorAll(".split");
  if (!splitEls.length) return;

  gsap.registerPlugin(SplitText);
  gsap.set(".split", { opacity: 1 });

  document.fonts.ready.then(function () {
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    gsap.utils.toArray(".split").forEach(function (text) {
      var split = SplitText.create(text, {
        type: "words,lines",
        mask: "lines",
        linesClass: "line",
      });

      tl.from(
        split.lines,
        {
          yPercent: 120,
          stagger: 0.1,
          duration: 0.7,
        },
        "-=0.4",
      );
    });
  });
}

function initTaglineSplitText() {
  if (typeof gsap === "undefined" || typeof SplitText === "undefined") return;

  var elements = document.querySelectorAll(".main-tagline .element");
  if (!elements.length) return;

  gsap.registerPlugin(SplitText);

  document.fonts.ready.then(function () {
    var tl = gsap.timeline({
      defaults: { duration: 0.75, ease: "back.out(2.4)" },
    });

    elements.forEach(function (el, i) {
      gsap.set(el, { opacity: 1 });
      var label = el.textContent.trim();
      var fromVars = {
        y: -40,
        opacity: 0,
        rotation: "random(-40, 40)",
        clipPath: "inset(0 100% 0 0)",
      };
      var position = i === 0 ? 0 : "-=0.30";

      if (/\s/.test(label)) {
        el.classList.add("element--whole");
        tl.from(el, fromVars, position);
        return;
      }

      var split = SplitText.create(el, {
        type: "words",
        wordsClass: "word++",
      });

      tl.from(
        split.words,
        Object.assign({ stagger: 0.06 }, fromVars),
        position,
      );
    });
  });
}

function initAboutReveal() {
  if (typeof gsap === "undefined") return;

  var rows = document.querySelectorAll(".about-row");
  if (!rows.length) return;

  var labels = gsap.utils.toArray(".about-row .about-label");
  var copies = gsap.utils.toArray(".about-row .about-copy");
  var ps = document.querySelector(".about-ps");
  var links = document.querySelector(".links--about");

  gsap.set(labels, { opacity: 0, y: 28 });
  gsap.set(copies, { opacity: 0, y: 28 });
  if (ps) gsap.set(ps, { opacity: 0, y: 20 });
  if (links) gsap.set(links, { opacity: 0, y: 16 });

  function playAboutReveal() {
    var tl = gsap.timeline({
      defaults: { duration: 0.85, ease: "power3.out" },
    });

    rows.forEach(function (row, i) {
      var label = row.querySelector(".about-label");
      var copy = row.querySelector(".about-copy");
      if (!label || !copy) return;

      var rowStart = i === 0 ? 0 : "-=0.5";

      tl.to(label, { y: 0, opacity: 1 }, rowStart).to(
        copy,
        { y: 0, opacity: 1 },
        "<0.1",
      );
    });

    if (ps) tl.to(ps, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4");
    if (links) tl.to(links, { y: 0, opacity: 1, duration: 0.5 }, "<0.08");
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(playAboutReveal).catch(playAboutReveal);
  } else {
    playAboutReveal();
  }
}

window.initElisePage = function () {
  initLottie();
  initMainBgMorph();
  initFlairCursor();
  initElementDrag();
  initIconLinkCursor();
  initSplitTextReveal();
  initTaglineSplitText();
  initAboutReveal();
};

window.initElisePage();
