/**
 * Access gate — drag the dove out of the cage; it then flies free.
 * Skip link also unlocks. Placeholder until the themed payment system replaces this.
 */
(function () {
  var gate = document.getElementById("payment-gate");
  var siteApp = document.getElementById("site-app");
  if (!gate) return;

  var unlocked = false;
  var freed = false;
  var flying = false;
  var isDragging = false;
  var doveEl = null;
  var cageEl = null;
  var sceneEl = null;
  var dragOffset = { x: 0, y: 0 };
  var pos = null;
  var vel = { x: 0, y: 0 };
  var flyStartedAt = 0;
  var rafId = 0;
  var doveSize = { w: 96, h: 144 };

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (rafId) cancelAnimationFrame(rafId);
    var msg = gate.querySelector("[data-pay-success]");
    if (msg) msg.hidden = false;
    setTimeout(function () {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
      document.body.classList.remove("payment-open");
      if (siteApp) {
        siteApp.hidden = false;
        siteApp.removeAttribute("aria-hidden");
      }
      window.scrollTo(0, 0);
    }, 1100);
  }

  function cageRect() {
    return cageEl ? cageEl.getBoundingClientRect() : null;
  }

  function doveCenter() {
    if (!doveEl) return null;
    var r = doveEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function isOutsideCage() {
    var cage = cageRect();
    var c = doveCenter();
    if (!cage || !c) return false;
    var pad = 18;
    return (
      c.x < cage.left + pad ||
      c.x > cage.right - pad ||
      c.y < cage.top + pad ||
      c.y > cage.bottom - pad
    );
  }

  function placeDoveHome() {
    if (!doveEl || !sceneEl) return;
    doveEl.classList.remove("is-free", "is-dragging", "is-flying");
    doveEl.style.left = "50%";
    doveEl.style.top = "52%";
    doveEl.style.transform = "translate(-50%, -50%)";
    doveEl.style.zIndex = "1";
    pos = null;
  }

  function placeDoveAt(x, y) {
    if (!doveEl) return;
    doveEl.style.left = x + "px";
    doveEl.style.top = y + "px";
    doveEl.style.transform = "none";
  }

  function startFlying() {
    if (flying || unlocked) return;
    freed = true;
    flying = true;
    doveEl.classList.add("is-free", "is-flying");
    doveEl.classList.remove("is-dragging");
    doveEl.style.zIndex = "20";

    var r = doveEl.getBoundingClientRect();
    pos = { x: r.left, y: r.top };
    placeDoveAt(pos.x, pos.y);

    var angle = Math.random() * Math.PI * 2;
    var speed = 11 + Math.random() * 7;
    vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    flyStartedAt = performance.now();

    var hint = gate.querySelector("[data-pay-hint]");
    if (hint) hint.textContent = "The dove is free — flying…";

    function tick(now) {
      if (!flying || unlocked) return;

      if (Math.random() < 0.08) {
        var turn = (Math.random() - 0.5) * 1.4;
        var cos = Math.cos(turn);
        var sin = Math.sin(turn);
        var nx = vel.x * cos - vel.y * sin;
        var ny = vel.x * sin + vel.y * cos;
        vel.x = nx;
        vel.y = ny;
      }

      vel.x += (Math.random() - 0.5) * 1.6;
      vel.y += (Math.random() - 0.5) * 1.6;

      var sp = Math.hypot(vel.x, vel.y) || 1;
      var minSp = 9;
      var maxSp = 22;
      if (sp < minSp) {
        vel.x = (vel.x / sp) * minSp;
        vel.y = (vel.y / sp) * minSp;
      } else if (sp > maxSp) {
        vel.x = (vel.x / sp) * maxSp;
        vel.y = (vel.y / sp) * maxSp;
      }

      pos.x += vel.x;
      pos.y += vel.y;

      var maxX = window.innerWidth - doveSize.w;
      var maxY = window.innerHeight - doveSize.h;
      if (pos.x < 0) {
        pos.x = 0;
        vel.x = Math.abs(vel.x) * (0.9 + Math.random() * 0.3);
      } else if (pos.x > maxX) {
        pos.x = maxX;
        vel.x = -Math.abs(vel.x) * (0.9 + Math.random() * 0.3);
      }
      if (pos.y < 0) {
        pos.y = 0;
        vel.y = Math.abs(vel.y) * (0.9 + Math.random() * 0.3);
      } else if (pos.y > maxY) {
        pos.y = maxY;
        vel.y = -Math.abs(vel.y) * (0.9 + Math.random() * 0.3);
      }

      var flip = vel.x < 0 ? -1 : 1;
      doveEl.style.left = pos.x + "px";
      doveEl.style.top = pos.y + "px";
      doveEl.style.transform = "scaleX(" + flip + ") rotate(" + vel.x * 0.6 + "deg)";

      if (now - flyStartedAt > 2600) {
        unlock();
        return;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  function render() {
    if (rafId) cancelAnimationFrame(rafId);
    flying = false;
    freed = false;
    isDragging = false;
    pos = null;

    gate.innerHTML =
      '<div class="gate-screen payment-screen cage-screen" role="dialog" aria-labelledby="gate-title" aria-describedby="gate-desc">' +
      '<h2 id="gate-title">Delegate access</h2>' +
      '<p id="gate-desc" class="payment-desc">Free the dove of peace — drag it out of the cage.</p>' +
      '<p class="payment-placeholder-note">Placeholder access gate — will be replaced with the themed payment system later.</p>' +
      '<div class="cage-scene" data-scene>' +
      '<div class="cage-dove" data-dove role="img" aria-label="Dove of peace — drag out of the cage">' +
      '<img src="assets/gate/dove.png" alt="" draggable="false">' +
      "</div>" +
      '<img class="cage-bars" data-cage src="assets/gate/cage.png" alt="Birdcage" draggable="false">' +
      "</div>" +
      '<p class="payment-hint" data-pay-hint>Drag the dove out of the cage to continue</p>' +
      '<p class="payment-success" data-pay-success hidden>The dove is free. Welcome.</p>' +
      '<button type="button" class="payment-skip" data-skip>Skip — enter without freeing the dove</button>' +
      "</div>";

    doveEl = gate.querySelector("[data-dove]");
    cageEl = gate.querySelector("[data-cage]");
    sceneEl = gate.querySelector("[data-scene]");
    placeDoveHome();

    var img = doveEl.querySelector("img");
    function measure() {
      var r = doveEl.getBoundingClientRect();
      doveSize = { w: r.width || 96, h: r.height || 144 };
    }
    if (img.complete) measure();
    else img.addEventListener("load", measure);

    gate.querySelector("[data-skip]").addEventListener("click", function () {
      if (rafId) cancelAnimationFrame(rafId);
      unlock();
    });

    doveEl.addEventListener("pointerdown", function (e) {
      if (flying || unlocked) return;
      e.preventDefault();
      isDragging = true;
      doveEl.classList.add("is-dragging", "is-free");
      doveEl.style.zIndex = "20";
      var r = doveEl.getBoundingClientRect();
      dragOffset = { x: e.clientX - r.left, y: e.clientY - r.top };
      pos = { x: r.left, y: r.top };
      placeDoveAt(pos.x, pos.y);
      try {
        doveEl.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    doveEl.addEventListener("pointermove", function (e) {
      if (!isDragging || flying) return;
      pos = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
      placeDoveAt(pos.x, pos.y);
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      doveEl.classList.remove("is-dragging");
      if (isOutsideCage()) {
        startFlying();
      } else {
        placeDoveHome();
      }
    }

    doveEl.addEventListener("pointerup", endDrag);
    doveEl.addEventListener("pointercancel", endDrag);
  }

  window.addEventListener("seamun:show-payment", function () {
    if (!unlocked) render();
  });
})();
