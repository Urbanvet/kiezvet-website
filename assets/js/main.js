/**
 * KiezVet – shared behaviour for every page.
 *  - mobile navigation
 *  - phone numbers and links filled from config.js
 *  - live "open now" status (Berlin time) and opening-hours tables
 *  - emergency page: show the right action for the current time
 *  - contact form validation
 */
(function () {
  "use strict";

  var CFG = window.KIEZVET;
  var DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

  /* ---------- Time helpers (always Berlin time, whatever the visitor's zone) ---------- */

  /** Returns { day: 0-6, minutes: minutes since midnight } for "now" in Berlin. */
  function berlinNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: CFG.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) { return parts.find(function (p) { return p.type === type; }).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: day, minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10) };
  }

  function toMinutes(hhmm) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  /** Finds the next opening after "now": { day, time } or null if no hours are configured. */
  function nextOpening(now) {
    for (var i = 0; i < 8; i++) {
      var d = (now.day + i) % 7;
      var h = CFG.hours[d];
      if (!h) continue;
      if (i === 0 && now.minutes >= toMinutes(h[0])) continue;
      return { offset: i, day: d, time: h[0] };
    }
    return null;
  }

  function practiceStatus() {
    var now = berlinNow();
    var today = CFG.hours[now.day];
    var open = !!today && now.minutes >= toMinutes(today[0]) && now.minutes < toMinutes(today[1]);
    var text;
    if (open) {
      text = "Jetzt geöffnet · heute bis " + today[1] + " Uhr";
    } else {
      var next = nextOpening(now);
      if (!next) text = "Derzeit geschlossen";
      else if (next.offset === 0) text = "Geschlossen · öffnet heute um " + next.time + " Uhr";
      else if (next.offset === 1) text = "Geschlossen · öffnet morgen um " + next.time + " Uhr";
      else text = "Geschlossen · öffnet " + DAY_NAMES[next.day] + " um " + next.time + " Uhr";
    }
    return { open: open, text: text, day: now.day };
  }

  /* ---------- Fill contact data from config ---------- */

  function fillContactData() {
    document.querySelectorAll("[data-fill]").forEach(function (el) {
      var key = el.getAttribute("data-fill");
      if (key === "phone") el.textContent = CFG.phone.display;
      if (key === "urbanvet-phone") el.textContent = CFG.urbanvet.display;
      if (key === "email") el.textContent = CFG.email;
      if (key === "address") el.textContent = CFG.address;
    });
    document.querySelectorAll("a[data-tel]").forEach(function (a) {
      var which = a.getAttribute("data-tel");
      a.href = "tel:" + (which === "urbanvet" ? CFG.urbanvet.tel : CFG.phone.tel);
    });
    document.querySelectorAll("a[data-mail]").forEach(function (a) { a.href = "mailto:" + CFG.email; });
  }

  /* ---------- Opening status and hours tables ---------- */

  function renderStatus() {
    var s = practiceStatus();
    document.querySelectorAll("[data-open-status]").forEach(function (el) {
      el.textContent = s.text;
      var wrap = el.closest(".status");
      if (wrap) wrap.classList.toggle("is-closed", !s.open);
    });
    document.querySelectorAll("[data-open-chip]").forEach(function (el) {
      el.className = "chip " + (s.open ? "chip--open" : "chip--closed");
      el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + (s.open ? "Jetzt geöffnet" : "Geschlossen");
    });
    // Emergency page: show the block that matches the current time
    document.querySelectorAll("[data-when-open]").forEach(function (el) { el.hidden = !s.open; });
    document.querySelectorAll("[data-when-closed]").forEach(function (el) { el.hidden = s.open; });
    return s;
  }

  function renderHoursTables(today) {
    document.querySelectorAll("[data-hours-table]").forEach(function (table) {
      table.innerHTML = "";
      DAY_ORDER.forEach(function (d) {
        var h = CFG.hours[d];
        var row = document.createElement("div");
        row.className = "hours-row" + (d === today ? " is-today" : "");
        var name = document.createElement("span");
        name.textContent = DAY_NAMES[d] + (d === today ? " (heute)" : "");
        var time = document.createElement("span");
        time.textContent = h ? h[0] + " – " + h[1] + " Uhr" : "geschlossen";
        row.append(name, time);
        table.appendChild(row);
      });
    });
    document.querySelectorAll("[data-cat-hours]").forEach(function (el) {
      var list = Object.keys(CFG.catHours).map(function (d) {
        return DAY_NAMES[d] + " " + CFG.catHours[d][0] + "–" + CFG.catHours[d][1] + " Uhr";
      });
      el.textContent = list.join(" · ");
    });
  }

  /* ---------- Mobile navigation ---------- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    }
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    // Close when tapping anywhere outside the header
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) setOpen(false);
    });
    // Close when the window grows past the tablet breakpoint
    window.matchMedia("(min-width: 1001px)").addEventListener("change", function (mq) { if (mq.matches) setOpen(false); });

    // Mark the current page in the mobile quick-action bar
    var page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".mobile-bar a").forEach(function (a) {
      if (a.getAttribute("href") === page) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- Form validation (shared by contact + booking) ---------- */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /** Validates required inputs inside `scope`. Returns true when valid; shows inline errors. */
  function validateFields(scope) {
    var firstInvalid = null;
    scope.querySelectorAll("input, textarea").forEach(function (input) {
      var field = input.closest(".field") || input.closest(".check");
      if (!field) return;
      var msg = "";
      var value = input.type === "checkbox" ? input.checked : input.value.trim();
      if (input.required && !value) {
        msg = input.type === "checkbox" ? "Bitte bestätigen Sie die Datenschutzhinweise." : "Bitte füllen Sie dieses Feld aus.";
      } else if (input.type === "email" && value && !EMAIL_RE.test(value)) {
        msg = "Bitte eine vollständige E-Mail-Adresse eingeben, z. B. name@beispiel.de";
      } else if (input.type === "tel" && value && value.replace(/\D/g, "").length < 6) {
        msg = "Bitte eine gültige Telefonnummer eingeben.";
      }
      var err = field.querySelector(".field-error");
      if (msg) {
        if (!err) {
          err = document.createElement("span");
          err.className = "field-error";
          err.id = (input.id || input.name) + "-error";
          field.appendChild(err);
        }
        err.textContent = msg;
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", err.id);
        field.classList.add("has-error");
        if (!firstInvalid) firstInvalid = input;
      } else {
        if (err) err.remove();
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
        field.classList.remove("has-error");
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /**
   * Sends form data. There is no backend in this static site:
   * replace this function with a call to your form service or booking API.
   */
  function sendForm(type, data) {
    console.info("[KiezVet] " + type + " – data ready to send:", data);
    return new Promise(function (resolve) { setTimeout(resolve, 400); });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateFields(form)) return;
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Wird gesendet …";
      sendForm("contact", Object.fromEntries(new FormData(form))).then(function () {
        form.hidden = true;
        var ok = document.getElementById("contact-success");
        ok.hidden = false;
        ok.focus();
      });
    });
  }

  /* ---------- Boot ---------- */

  // Expose helpers for booking.js
  window.KiezVetUtils = { berlinNow: berlinNow, toMinutes: toMinutes, DAY_NAMES: DAY_NAMES, validateFields: validateFields, sendForm: sendForm };

  document.addEventListener("DOMContentLoaded", function () {
    fillContactData();
    var s = renderStatus();
    renderHoursTables(s.day);
    initNav();
    initContactForm();
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    setInterval(renderStatus, 60 * 1000); // keep the status current while the page is open
  });
})();
