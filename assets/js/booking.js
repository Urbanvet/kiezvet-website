/**
 * KiezVet – online booking flow (termin.html)
 * Step 1: animal + reason · Step 2: day + time · Step 3: contact details · Done.
 *
 * Available times are generated from the opening hours in config.js.
 * In production, replace getSlots() with the free slots from your booking system
 * and KiezVetUtils.sendForm() with the real booking request.
 */
(function () {
  "use strict";

  var CFG = window.KIEZVET;
  var U = window.KiezVetUtils;
  var SHORT_DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var MONTHS = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];

  var form = document.getElementById("booking-form");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll("[data-step]"));
  var progress = Array.prototype.slice.call(document.querySelectorAll(".progress span"));
  var stepLabel = document.getElementById("step-label");
  var backBtn = document.getElementById("booking-back");
  var nextBtn = document.getElementById("booking-next");
  var daysEl = document.getElementById("days");
  var slotsEl = document.getElementById("slots");
  var current = 1;

  /* ---------- Days and slots ---------- */

  /** The next 7 open days, starting today if there is still time left today. */
  function getDays() {
    var now = U.berlinNow();
    var base = new Date();
    var days = [];
    for (var i = 0; days.length < 7 && i < 21; i++) {
      var date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      var dow = (now.day + i) % 7;
      var h = CFG.hours[dow];
      if (!h) continue;
      if (i === 0 && now.minutes > U.toMinutes(h[1]) - CFG.slotMinutes - 30) continue;
      days.push({ offset: i, dow: dow, date: date });
    }
    return days;
  }

  /** Slots for one day. Today: only slots at least 30 minutes from now. */
  function getSlots(day) {
    var h = CFG.hours[day.dow];
    var cat = CFG.catHours[day.dow];
    var start = U.toMinutes(h[0]);
    var end = U.toMinutes(h[1]);
    var earliest = day.offset === 0 ? U.berlinNow().minutes + 30 : 0;
    var slots = [];
    for (var m = start; m + CFG.slotMinutes <= end; m += CFG.slotMinutes) {
      if (m < earliest) continue;
      var isCat = !!cat && m >= U.toMinutes(cat[0]) && m < U.toMinutes(cat[1]);
      slots.push({ time: pad(Math.floor(m / 60)) + ":" + pad(m % 60), isCat: isCat });
    }
    return slots;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function dayLabel(day) {
    if (day.offset === 0) return "Heute";
    if (day.offset === 1) return "Morgen";
    return U.DAY_NAMES[day.dow];
  }

  function renderDays() {
    var days = getDays();
    daysEl.innerHTML = "";
    days.forEach(function (day, i) {
      var label = document.createElement("label");
      label.className = "option";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "day";
      input.value = String(i);
      input.checked = i === 0;
      var span = document.createElement("span");
      span.innerHTML = "<small>" + (day.offset < 2 ? dayLabel(day) : SHORT_DAYS[day.dow]) + "</small>" +
        day.date.getDate() + ". " + MONTHS[day.date.getMonth()];
      label.append(input, span);
      daysEl.appendChild(label);
      input.addEventListener("change", function () { renderSlots(days[i]); });
    });
    form._days = days;
    if (days.length) renderSlots(days[0]);
  }

  function renderSlots(day) {
    var isCatOwner = (form.elements.pet.value === "Katze");
    slotsEl.innerHTML = "";
    var slots = getSlots(day);
    if (!slots.length) {
      slotsEl.innerHTML = '<p class="muted">An diesem Tag ist online nichts mehr frei. Bitte wählen Sie einen anderen Tag.</p>';
      return;
    }
    slots.forEach(function (slot) {
      var label = document.createElement("label");
      label.className = "option" + (isCatOwner && slot.isCat ? " is-cat" : "");
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "time";
      input.value = slot.time;
      var span = document.createElement("span");
      span.textContent = slot.time;
      if (isCatOwner && slot.isCat) span.title = "Katzen-Sprechstunde";
      label.append(input, span);
      slotsEl.appendChild(label);
    });
    document.getElementById("cat-hint").hidden = !isCatOwner || !slots.some(function (s) { return s.isCat; });
  }

  /* ---------- Step navigation ---------- */

  function showStep(n, initial) {
    current = n;
    steps.forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== n; });
    progress.forEach(function (bar, i) { bar.classList.toggle("is-done", i < n); });
    stepLabel.textContent = "Schritt " + n + " von 3";
    backBtn.hidden = n === 1;
    nextBtn.textContent = n === 3 ? "Termin verbindlich anfragen" : "Weiter";
    if (n === 2) renderDays();
    if (initial) return; // don't move focus or scroll on page load
    var heading = steps[n - 1].querySelector("legend, h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stepIsValid(n) {
    var step = steps[n - 1];
    var errorBox = step.querySelector("[data-step-error]");
    var ok = true;
    if (n === 1) ok = !!form.elements.pet.value && !!form.elements.reason.value;
    if (n === 2) ok = !!form.elements.time && !!form.elements.time.value;
    if (n === 3) return U.validateFields(step);
    if (errorBox) errorBox.hidden = ok;
    return ok;
  }

  nextBtn.addEventListener("click", function () {
    if (!stepIsValid(current)) return;
    if (current < 3) { showStep(current + 1); return; }
    submit();
  });
  backBtn.addEventListener("click", function () { if (current > 1) showStep(current - 1); });
  form.addEventListener("submit", function (e) { e.preventDefault(); nextBtn.click(); });
  form.elements.pet.forEach(function (r) {
    r.addEventListener("change", function () { if (current === 2) renderDays(); });
  });

  /* ---------- Submit ---------- */

  function submit() {
    var day = form._days[Number(form.elements.day.value)];
    var data = Object.fromEntries(new FormData(form));
    data.date = day.date.toISOString().slice(0, 10);
    nextBtn.disabled = true;
    nextBtn.textContent = "Wird gesendet …";
    U.sendForm("booking", data).then(function () {
      form.hidden = true;
      var done = document.getElementById("booking-done");
      document.getElementById("sum-what").textContent = data.petName + " (" + data.pet + ") · " + data.reason;
      document.getElementById("sum-when").textContent =
        dayLabel(day) + ", " + day.date.getDate() + ". " + MONTHS[day.date.getMonth()] + " · " + data.time + " Uhr";
      document.getElementById("sum-mail").textContent = data.email;
      document.getElementById("new-patient-hint").hidden = data.newPatient !== "ja";
      done.hidden = false;
      done.querySelector("h2").focus();
    });
  }

  showStep(1, true);
})();
