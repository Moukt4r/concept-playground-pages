(() => {
  "use strict";

  const DATA = window.CASE_DATA;
  const STORAGE_KEY = "case-files-lady-vanishes-v07";
  const TRAVEL_COST = 3;
  const REFERENCE_TRAVEL_UNITS = 6;
  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;

  if (!DATA?.episode || !Array.isArray(DATA.directory)) return;

  DATA.meta.version = "0.10-delayed-japan";
  DATA.episode.referenceTravelUnits = REFERENCE_TRAVEL_UNITS;

  const COUNTRIES = {
    au: { label: "Australia", short: "AUSTRALIA", always: true },
    uk: { label: "Storbritannia", short: "STORBRITANNIA", minAct: 1, unlockDocuments: ["doc04", "doc05"] },
    jp: { label: "Japan", short: "JAPAN", minAct: 1, unlockDocuments: ["doc04"] },
    kr: { label: "Sør-Korea", short: "SØR-KOREA", minAct: 1, unlockDocuments: ["doc03"] },
    lu: { label: "Luxembourg", short: "LUXEMBOURG", minAct: 2, unlockDocuments: ["doc03", "doc06", "doc22"] }
  };
  const COUNTRY_ORDER = ["au", "uk", "jp", "kr", "lu"];
  const UK_LOCATIONS = new Set(["loc-london", "loc-tunbridge", "loc-rye", "loc-hastings"]);
  const LEAD_UNLOCK_DOCUMENTS = {
    xr01: ["doc18", "doc20"]
  };
  const EXPLICIT_ACCESS = {
    xr01: { mode: "local", country: "jp" },
    xr02: { mode: "local", country: "uk" },
    xr03: { mode: "local", country: "uk" },
    xr04: { mode: "local", country: "uk" },
    xr05: { mode: "local", country: "uk" },
    xr06: { mode: "local", country: "uk" },
    xr07: { mode: "remote", country: null },
    xr08: { mode: "remote", country: null },
    xr09: { mode: "local", country: "jp" },
    xr10: { mode: "local", country: "au" },
    xr11: { mode: "local", country: "lu" },
    xr12: { mode: "remote", country: null },
    xr13: { mode: "local", country: "jp" },
    xr14: { mode: "local", country: "kr" },
    xr15: { mode: "local", country: "kr" }
  };

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
  const leadById = (id) => DATA.directory.find((item) => item.id === id);

  function defaultTravelState() {
    return { currentCountry: "au", travelHistory: [] };
  }

  function normalizeState(value) {
    const state = value && typeof value === "object" ? value : {};
    if (!COUNTRIES[state.currentCountry]) state.currentCountry = "au";
    if (!Array.isArray(state.travelHistory)) state.travelHistory = [];
    state.travelHistory = state.travelHistory.filter((item) => item && COUNTRIES[item.from] && COUNTRIES[item.to])
      .map((item) => ({ ...item, cost: Number(item.cost) || TRAVEL_COST }));
    return state;
  }

  function readState() {
    try {
      return normalizeState(JSON.parse(nativeGet.call(localStorage, STORAGE_KEY)) || defaultTravelState());
    } catch {
      return normalizeState(defaultTravelState());
    }
  }

  function writeState(state) {
    nativeSet.call(localStorage, STORAGE_KEY, JSON.stringify(normalizeState(state)));
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    if (key !== STORAGE_KEY) return nativeSet.call(this, key, value);
    try {
      const next = JSON.parse(value);
      const previous = readState();
      if (!COUNTRIES[next.currentCountry]) next.currentCountry = previous.currentCountry;
      if (!Array.isArray(next.travelHistory)) next.travelHistory = previous.travelHistory;
      value = JSON.stringify(normalizeState(next));
    } catch {
      // Preserve the application’s normal storage behavior for malformed non-game values.
    }
    return nativeSet.call(this, key, value);
  };

  function travelUnits(state = readState()) {
    return state.travelHistory.reduce((total, item) => total + Number(item.cost || TRAVEL_COST), 0);
  }

  function leadUnits(state = readState()) {
    return (state.visited || []).reduce((total, id) => total + Number(leadById(id)?.cost || 0), 0);
  }

  function usedUnits(state = readState()) {
    return leadUnits(state) + travelUnits(state);
  }

  function knownCountries(state = readState()) {
    const found = new Set(state.foundDocuments || []);
    const act = Number(state.currentAct || 1);
    return new Set(COUNTRY_ORDER.filter((id) => {
      const country = COUNTRIES[id];
      if (country.always) return true;
      if (act < Number(country.minAct || 1)) return false;
      return (country.unlockDocuments || []).some((docId) => found.has(docId));
    }));
  }

  function accessForLead(item) {
    if (EXPLICIT_ACCESS[item.id]) return EXPLICIT_ACCESS[item.id];
    if (UK_LOCATIONS.has(item.locationId)) return { mode: "local", country: "uk" };
    if (item.locationId === "loc-narita") return { mode: "local", country: "jp" };
    if (item.locationId === "loc-seoul") return { mode: "local", country: "kr" };
    if (item.locationId === "loc-overseas") return { mode: "remote", country: null };
    return { mode: "local", country: "au" };
  }

  function leadVisible(item, state = readState()) {
    if (!item || Number(item.act || 1) > Number(state.currentAct || 1)) return false;
    const requiredDocuments = LEAD_UNLOCK_DOCUMENTS[item.id] || [];
    if (requiredDocuments.length && !requiredDocuments.some((id) => (state.foundDocuments || []).includes(id))) return false;
    const access = accessForLead(item);
    return !access.country || knownCountries(state).has(access.country);
  }

  function leadAccessible(item, state = readState()) {
    if (!leadVisible(item, state)) return false;
    if ((state.visited || []).includes(item.id)) return true;
    const access = accessForLead(item);
    return access.mode === "remote" || access.country === state.currentCountry;
  }

  function accessLabel(item, state = readState()) {
    const access = accessForLead(item);
    if (access.mode === "remote") return "Fjernoppslag";
    if (access.country === state.currentCountry) return `Lokalt · ${COUNTRIES[access.country].label}`;
    return `Krever reise til ${COUNTRIES[access.country]?.label || "landet"}`;
  }

  function toast(message) {
    let node = document.querySelector("#travel-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "travel-toast";
      node.className = "status-toast travel-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2800);
  }

  function renderTravelConsole() {
    const consoleNode = document.querySelector("#travel-console");
    if (!consoleNode) return;
    const state = readState();
    const known = knownCountries(state);
    const current = COUNTRIES[state.currentCountry];
    const destinations = COUNTRY_ORDER.filter((id) => known.has(id) && id !== state.currentCountry);
    const buttons = state.investigationEnded
      ? '<span class="travel-no-destination">Etterforskningen er avsluttet. Reiseloggen er låst.</span>'
      : destinations.length
        ? destinations.map((id) => `<button type="button" class="btn btn-small travel-button" data-travel-country="${id}">Reis til ${esc(COUNTRIES[id].label)} <span>+${TRAVEL_COST}</span></button>`).join("")
        : '<span class="travel-no-destination">Ingen andre reisemål er dokumentert ennå.</span>';
    const history = state.travelHistory.length
      ? `<details class="travel-history"><summary>Reiselogg · ${state.travelHistory.length} ${state.travelHistory.length === 1 ? "etappe" : "etapper"}</summary><ol>${state.travelHistory.map((trip) => `<li>${esc(COUNTRIES[trip.from].label)} → ${esc(COUNTRIES[trip.to].label)} <strong>+${trip.cost}</strong></li>`).join("")}</ol></details>`
      : "";
    const html = `<div class="travel-current"><span class="travel-kicker">NÅVÆRENDE POSISJON</span><strong>${esc(current.label)}</strong><small>${travelUnits(state)} reiseenheter brukt</small></div>
      <div class="travel-destinations">${buttons}</div>
      <p class="travel-rule"><strong>Lokale oppslag</strong> krever at du befinner deg i landet. <strong>Fjernoppslag</strong> kan åpnes overalt. En internasjonal reise koster ${TRAVEL_COST} etterforskningsenheter; funne dokumenter og besøkte oppslag forblir tilgjengelige.</p>${history}`;
    if (consoleNode.innerHTML !== html) consoleNode.innerHTML = html;
  }

  function patchBudget() {
    const node = document.querySelector("#lead-budget-display");
    if (!node) return;
    const state = readState();
    const total = usedUnits(state);
    const text = `${total} enh. · ${COUNTRIES[state.currentCountry].short}`;
    if (node.textContent !== text) node.textContent = text;
    node.title = `${leadUnits(state)} oppslagsenheter + ${travelUnits(state)} reiseenheter = ${total}. Referansen bruker 16 oppslag og ${REFERENCE_TRAVEL_UNITS} reiseenheter.`;
  }

  function patchDirectory() {
    const grid = document.querySelector("#leads-grid");
    const countNode = document.querySelector("#directory-count");
    if (!grid || !countNode) return;
    const state = readState();
    const cards = Array.from(grid.querySelectorAll(".lead-card[data-lead-id]"));
    grid.querySelector(".travel-directory-empty")?.remove();
    let shown = 0;
    cards.forEach((card) => {
      const item = leadById(card.dataset.leadId);
      const accessible = item && leadAccessible(item, state);
      card.classList.toggle("travel-hidden", !accessible);
      card.setAttribute("aria-hidden", String(!accessible));
      if (accessible) {
        shown += 1;
        const status = card.querySelector(".lead-status");
        if (status && !(state.visited || []).includes(item.id)) {
          const label = accessLabel(item, state).toUpperCase();
          if (status.textContent !== label) status.textContent = label;
        }
      }
    });
    const accessibleTotal = DATA.directory.filter((item) => leadAccessible(item, state)).length;
    const knownTotal = DATA.directory.filter((item) => leadVisible(item, state)).length;
    const hiddenLocal = Math.max(0, knownTotal - accessibleTotal);
    const countText = `${shown} av ${accessibleTotal} tilgjengelige oppføringer${hiddenLocal ? ` · ${hiddenLocal} lokale oppslag krever reise` : ""}`;
    if (countNode.textContent !== countText) countNode.textContent = countText;
    if (!shown && cards.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state travel-directory-empty";
      empty.textContent = "Ingen av treffene er tilgjengelige fra landet du befinner deg i.";
      grid.append(empty);
    }
  }

  function patchMap() {
    const state = readState();
    const known = knownCountries(state);
    document.querySelectorAll("[data-map-location]").forEach((node) => {
      const locationId = node.dataset.mapLocation;
      const entries = DATA.directory.filter((item) => item.locationId === locationId && Number(item.act || 1) <= Number(state.currentAct || 1));
      const visible = entries.filter((item) => leadVisible(item, state));
      const accessible = visible.filter((item) => leadAccessible(item, state));
      const done = visible.filter((item) => (state.visited || []).includes(item.id)).length;
      const undiscovered = visible.length === 0;
      const locked = !undiscovered && accessible.length === 0;
      node.classList.toggle("travel-undiscovered", undiscovered);
      node.classList.toggle("travel-locked", locked);
      node.setAttribute("aria-hidden", String(undiscovered));
      node.setAttribute("tabindex", undiscovered ? "-1" : "0");
      node.classList.remove("unvisited", "partial", "complete");
      node.classList.add(done === 0 ? "unvisited" : done === visible.length ? "complete" : "partial");
      const count = node.querySelector(".map-location-count");
      if (count && count.textContent !== String(visible.length)) count.textContent = String(visible.length);
      const title = node.querySelector("title");
      if (title) {
        const titleText = locked ? `${done}/${visible.length} besøkt · krever reise` : `${done}/${visible.length} besøkt`;
        if (title.textContent !== titleText) title.textContent = titleText;
      }
    });
    const overseasLabel = document.querySelector('[data-map-location="loc-overseas"] .map-location-label');
    if (overseasLabel) overseasLabel.textContent = known.has("lu") ? "Europa / fjern" : "Fjernregistre";
  }

  function patchMapInfo() {
    const info = document.querySelector("#map-info");
    if (!info || info.classList.contains("hidden") || !info.querySelector(".map-location-heading")) return;
    const state = readState();
    const buttons = Array.from(info.querySelectorAll(".map-entry-button[data-lead-id]"));
    const visibleButtons = [];
    const requiredCountries = new Set();
    buttons.forEach((button) => {
      const item = leadById(button.dataset.leadId);
      if (!leadVisible(item, state)) {
        button.remove();
        return;
      }
      visibleButtons.push(button);
      const accessible = leadAccessible(item, state);
      button.disabled = !accessible;
      button.classList.toggle("travel-locked-entry", !accessible);
      const small = button.querySelector("small");
      if (small && !(state.visited || []).includes(item.id)) {
        const label = accessLabel(item, state);
        if (small.textContent !== label) small.textContent = label;
      }
      const access = accessForLead(item);
      if (!accessible && access.country) requiredCountries.add(access.country);
    });
    const headingCount = info.querySelector(".map-location-heading > span");
    if (headingCount) {
      const visited = visibleButtons.filter((button) => (state.visited || []).includes(button.dataset.leadId)).length;
      const countText = `${visited}/${visibleButtons.length} besøkt`;
      if (headingCount.textContent !== countText) headingCount.textContent = countText;
    }
    const noteHtml = requiredCountries.size
      ? Array.from(requiredCountries).map((countryId) => `<button type="button" class="btn btn-small travel-button" data-travel-country="${countryId}">Reis til ${esc(COUNTRIES[countryId].label)} <span>+${TRAVEL_COST}</span></button>`).join("")
      : esc(`Tilgjengelig fra ${COUNTRIES[state.currentCountry].label}.`);
    let note = info.querySelector(".map-access-note");
    if (!note) {
      note = document.createElement("div");
      note.className = "map-access-note";
      info.append(note);
    }
    if (note.innerHTML !== noteHtml) note.innerHTML = noteHtml;
  }

  function patchConfirmation() {
    const modal = document.querySelector(".lead-detail-overlay .visit-confirmation");
    if (!modal) return;
    const warning = modal.querySelector(".action-warning");
    if (!warning || warning.querySelector(".travel-unit-preview")) return;
    const leadId = modal.closest(".lead-detail-overlay")?.dataset.returnLead;
    const item = leadById(leadId);
    const state = readState();
    const preview = document.createElement("p");
    preview.className = "travel-unit-preview";
    preview.textContent = `Etter oppslaget vil ruten koste ${usedUnits(state) + Number(item?.cost || 1)} etterforskningsenheter totalt.`;
    warning.append(preview);
  }

  function questionScore(question, state) {
    return (question.criteria || []).reduce((total, criterion, index) => total + (state.criterionChecks?.[`${question.id}:${index}`] ? Number(criterion.points || 0) : 0), 0);
  }

  function patchDebrief() {
    const summary = document.querySelector("#debrief-summary");
    if (!summary) return;
    const state = readState();
    if (!state.investigationEnded) return;
    const questions = DATA.episode.questions || [];
    const main = questions.filter((item) => item.group === "main");
    const bonus = questions.filter((item) => item.group === "bonus");
    const scoreFor = (items) => items.reduce((total, item) => total + questionScore(item, state), 0);
    const maxFor = (items) => items.reduce((total, item) => total + Number(item.points || 0), 0);
    const referenceLeads = (DATA.episode.referenceLeadIds || []).map(leadById).filter(Boolean);
    const referenceLeadUnits = referenceLeads.reduce((total, item) => total + Number(item.cost || 1), 0);
    const referenceUnits = referenceLeadUnits + REFERENCE_TRAVEL_UNITS;
    const routeAdjustment = Math.max(-50, Math.min(20, (referenceUnits - usedUnits(state)) * 5));
    const answerScore = scoreFor(questions);
    const totalScore = answerScore + routeAdjustment;
    const signedRoute = routeAdjustment > 0 ? `+${routeAdjustment}` : String(routeAdjustment);
    const signature = [state.debriefSubmitted, leadUnits(state), travelUnits(state), answerScore, routeAdjustment].join(":");
    if (summary.dataset.travelSignature === signature && summary.querySelector("[data-travel-score-summary]")) return;
    summary.dataset.travelSignature = signature;
    summary.innerHTML = `<div data-travel-score-summary><div class="eff-label">ETTERFORSKNINGSSTATUS</div>
      <p>Besøkt: <strong>${(state.visited || []).length}</strong> av ${DATA.directory.length} registeroppføringer · dokumenter: <strong>${(state.foundDocuments || []).length}</strong>.</p>
      <p>Ruten kostet <strong>${usedUnits(state)}</strong> etterforskningsenheter: ${leadUnits(state)} oppslag + ${travelUnits(state)} reise. Referansen bruker ${referenceLeadUnits} oppslag + ${REFERENCE_TRAVEL_UNITS} reise = ${referenceUnits}; hver forskjell gir ±5 poeng (maks +20 / −50).</p>
      ${state.debriefSubmitted
        ? `<div class="scoreboard"><span>Hovedsak <strong>${scoreFor(main)}/${maxFor(main)}</strong></span><span>Sidespor <strong>${scoreFor(bonus)}/${maxFor(bonus)}</strong></span><span>Rute <strong>${signedRoute}</strong></span><span>Sluttsum <strong>${totalScore}</strong></span></div><details class="reference-route"><summary>Vis referansestien (${referenceUnits} enheter)</summary><p>${esc(referenceLeads.map((item) => `${item.code} ${item.name}`).join(" · "))}</p><p>Referansen samler Australia-sporene før Japan og Luxembourg åpnes: to internasjonale etapper à ${TRAVEL_COST}. Dette er én effektiv rute, ikke den eneste gyldige løsningen.</p></details>`
        : '<p>Svar med konkrete navn, datoer og dokumentkoblinger. Løsningsheftet viser faste poengkriterier etter innlevering.</p>'}</div>`;
  }

  function patchAll() {
    renderTravelConsole();
    patchBudget();
    patchDirectory();
    patchMap();
    patchMapInfo();
    patchConfirmation();
    patchDebrief();
  }

  function travelTo(countryId) {
    const state = readState();
    const known = knownCountries(state);
    if (state.investigationEnded) {
      toast("Etterforskningen er avsluttet. Nye reiser er låst.");
      return;
    }
    if (!COUNTRIES[countryId] || !known.has(countryId) || countryId === state.currentCountry) return;
    const from = state.currentCountry;
    const message = `Reise fra ${COUNTRIES[from].label} til ${COUNTRIES[countryId].label}? Reisen koster ${TRAVEL_COST} etterforskningsenheter. Ubesøkte lokale oppslag i ${COUNTRIES[from].label} blir utilgjengelige til du reiser tilbake.`;
    if (!window.confirm(message)) return;
    state.currentCountry = countryId;
    state.activeTab = "map";
    state.travelHistory.push({ from, to: countryId, cost: TRAVEL_COST, act: Number(state.currentAct || 1), at: new Date().toISOString() });
    writeState(state);
    sessionStorage.setItem("lady-travel-arrival", `Ankommet ${COUNTRIES[countryId].label}. Reisen kostet ${TRAVEL_COST} enheter.`);
    window.location.reload();
  }

  function finishWithTravel(event) {
    const button = event.target.closest?.("#finish-btn");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = readState();
    if (state.investigationEnded) return;
    const total = usedUnits(state);
    if (Number(state.currentAct || 1) === 1) {
      if (!window.confirm(`Avslutte 1997-arbeidet etter ${total} etterforskningsenheter og åpne de senere arkivene? Du kan fortsatt reise tilbake til tidligere land og bruke alle 1997-oppslag.`)) return;
      state.currentAct = 2;
      state.activeTab = "directory";
      writeState(state);
      window.location.reload();
      return;
    }
    if (!window.confirm(`Avslutte hele etterforskningen etter ${total} etterforskningsenheter? Besøkte oppslag og dokumenter forblir tilgjengelige, men nye oppslag og reiser stenges.`)) return;
    state.investigationEnded = true;
    state.activeTab = "debrief";
    writeState(state);
    window.location.reload();
  }

  function gateLead(event) {
    const target = event.target.closest?.("[data-lead-id]");
    if (!target) return;
    const item = leadById(target.dataset.leadId);
    const state = readState();
    if (!item || leadAccessible(item, state)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!leadVisible(item, state)) {
      toast("Dette reisemålet er ikke dokumentert i saken ennå.");
      return;
    }
    const access = accessForLead(item);
    toast(`Oppslaget krever at du reiser til ${COUNTRIES[access.country].label}.`);
  }

  function bind() {
    document.addEventListener("click", gateLead, true);
    document.addEventListener("click", finishWithTravel, true);
    document.addEventListener("click", (event) => {
      const button = event.target.closest?.("[data-travel-country]");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      travelTo(button.dataset.travelCountry);
    }, true);

    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        patchAll();
      });
    });
    const app = document.querySelector("#app");
    if (app) observer.observe(app, { childList: true, subtree: true });
    patchAll();
    const arrival = sessionStorage.getItem("lady-travel-arrival");
    if (arrival) {
      sessionStorage.removeItem("lady-travel-arrival");
      window.scrollTo(0, 0);
      setTimeout(() => toast(arrival), 80);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();
})();
