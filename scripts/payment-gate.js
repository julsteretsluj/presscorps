/**
 * Access gate — click the camera (flash), then a newspaper appears after 2s.
 * Skip also unlocks. Placeholder until the themed payment system replaces this.
 */
(function () {
  var gate = document.getElementById("payment-gate");
  var siteApp = document.getElementById("site-app");
  if (!gate) return;

  var unlocked = false;
  var clicked = false;
  var timers = [];

  function clearTimers() {
    timers.forEach(function (id) {
      clearTimeout(id);
    });
    timers = [];
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    clearTimers();
    var msg = gate.querySelector("[data-pay-success]");
    if (msg) msg.hidden = false;
    timers.push(
      setTimeout(function () {
        gate.hidden = true;
        gate.setAttribute("aria-hidden", "true");
        document.body.classList.remove("payment-open");
        if (siteApp) {
          siteApp.hidden = false;
          siteApp.removeAttribute("aria-hidden");
        }
        window.scrollTo(0, 0);
      }, 1100)
    );
  }

  function onCameraClick() {
    if (clicked || unlocked) return;
    clicked = true;

    var btn = gate.querySelector("[data-camera]");
    var paper = gate.querySelector("[data-newspaper]");
    var hint = gate.querySelector("[data-pay-hint]");

    if (btn) {
      btn.classList.add("is-flashed");
      btn.setAttribute("aria-pressed", "true");
      btn.disabled = true;
    }
    if (hint) hint.textContent = "Flash! Holding for the paper…";

    timers.push(
      setTimeout(function () {
        if (unlocked) return;
        if (paper) {
          paper.hidden = false;
          paper.removeAttribute("aria-hidden");
          requestAnimationFrame(function () {
            paper.classList.add("is-visible");
          });
        }
        if (hint) hint.textContent = "Press Corps copy incoming…";
        timers.push(
          setTimeout(function () {
            unlock();
          }, 1200)
        );
      }, 2000)
    );
  }

  function render() {
    clearTimers();
    clicked = false;

    gate.innerHTML =
      '<div class="gate-screen payment-screen camera-screen" role="dialog" aria-labelledby="gate-title" aria-describedby="gate-desc">' +
      '<h2 id="gate-title">Delegate access</h2>' +
      '<p id="gate-desc" class="payment-desc">Tap the camera to take the shot.</p>' +
      '<p class="payment-placeholder-note">Placeholder access gate — will be replaced with the themed payment system later.</p>' +
      '<div class="camera-scene" data-scene>' +
      '<button type="button" class="camera-btn" data-camera aria-label="Take a photo" aria-pressed="false">' +
      '<span class="camera-stack" aria-hidden="true">' +
      '<img class="camera-frame camera-frame--idle" src="assets/gate/camera.png?v=orig" alt="" draggable="false">' +
      '<img class="camera-frame camera-frame--flash" src="assets/gate/camera-flash.png?v=orig" alt="" draggable="false">' +
      "</span>" +
      "</button>" +
      '<div class="newspaper-emoji" data-newspaper hidden aria-hidden="true">' +
      '<img class="newspaper-img" src="assets/gate/newspaper.png?v=orig" alt="Newspaper" draggable="false">' +
      "</div>" +
      "</div>" +
      '<p class="payment-hint" data-pay-hint>Click the camera to continue</p>' +
      '<p class="payment-success" data-pay-success hidden>Got the shot. Welcome.</p>' +
      '<button type="button" class="payment-skip" data-skip>Skip — enter without taking a photo</button>' +
      "</div>";

    var cameraBtn = gate.querySelector("[data-camera]");
    cameraBtn.addEventListener("click", onCameraClick);

    gate.querySelector("[data-skip]").addEventListener("click", function () {
      clearTimers();
      unlock();
    });
  }

  window.addEventListener("seamun:show-payment", function () {
    if (!unlocked) render();
  });
})();
