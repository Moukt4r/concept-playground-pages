(() => {
  "use strict";

  const DATA = window.CASE_DATA;
  const STORAGE_KEY = "case-files-lady-vanishes-v03";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);

  if (!DATA || !DATA.episode || !Array.isArray(DATA.directory)) {
    document.body.innerHTML = '<main class="fatal-error">Kunne ikke laste den offentlige innholdspakken.</main>';
    return;
  }

  const leadById = (id) => DATA.directory.find((item) => item.id === id);
  const documentById = (id) => DATA.documents.find((item) => item.id === id);
  const sourceById = (id) => DATA.sources.find((item) => item.id === id);
  const locationById = (id) => DATA.locations.find((item) => item.id === id);

  function freshState() {
    return {
      accepted: false,
      activeTab: "directory",
      visited: [],
      foundDocuments: [...(DATA.episode.initialDocumentIds || [])],
      pins: [],
      notes: "",
      pinNotes: {},
      answers: {},
      answerNotes: {},
      investigationEnded: false,
      debriefSubmitted: false,
      submittedAt: null
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return freshState();
      const base = freshState();
      const state = { ...base, ...saved };
      ["visited", "foundDocuments", "pins"].forEach((key) => {
        if (!Array.isArray(state[key])) state[key] = base[key];
      });
      ["pinNotes", "answers", "answerNotes"].forEach((key) => {
        if (!state[key] || typeof state[key] !== "object") state[key] = {};
      });
      return state;
    } catch {
      return freshState();
    }
  }

  let state = loadState();

  function saveState(showConfirmation = false) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (showConfirmation) toast("Fremdriften er lagret lokalt i denne nettleseren.");
  }

  function uniquePush(target, values) {
    values.forEach((value) => {
      if (value && !target.includes(value)) target.push(value);
    });
  }

  function toast(message) {
    let node = $("#status-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "status-toast";
      node.className = "status-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2300);
  }

  function showApp() {
    $("#disclaimer-overlay").classList.add("hidden");
    const app = $("#app");
    app.classList.remove("hidden");
    app.setAttribute("aria-hidden", "false");
    renderAll();
  }

  function usedActions() {
    return state.visited.reduce((total, id) => total + Number(leadById(id)?.cost || 1), 0);
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    $$(".tab-btn").forEach((button) => {
      const active = button.dataset.tab === tabName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    $$(".panel").forEach((panel) => {
      const active = panel.id === `panel-${tabName}`;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
    if (tabName === "map") renderMap();
    if (tabName === "documents") renderDocuments();
    if (tabName === "notebook") renderNotebook();
    if (tabName === "debrief") renderDebrief();
    saveState();
  }

  function renderAll() {
    $("#episode-title").textContent = DATA.episode.title;
    $("#episode-brief").innerHTML = (DATA.episode.brief || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    $("#debrief-tab").classList.toggle("hidden", !state.investigationEnded);
    $("#finish-btn").classList.toggle("hidden", state.investigationEnded);
    renderBudget();
    renderSources();
    renderDirectory();
    renderMap();
    renderDocuments();
    renderNotebook();
    renderDebrief();
    switchTab(state.activeTab || "directory");
  }

  function renderBudget() {
    const used = usedActions();
    const budget = Number(DATA.episode.actionBudget || 14);
    const display = $("#lead-budget-display");
    display.textContent = `${used}/${budget} handlinger`;
    display.classList.toggle("over-budget", used > budget);
    display.title = used > budget
      ? "Du er over den veiledende rammen. Du kan fortsette, men effektiviteten faller."
      : "Brukte handlinger / veiledende ramme";
  }

  function renderSources() {
    if (!state.debriefSubmitted) {
      $("#sources-list").innerHTML = `<div class="method-note">
        <p><strong>Kildene er skjult under etterforskningen.</strong> Titler og senere datoer kan røpe svar som ikke var tilgjengelige i 1997.</p>
        <p>Alt historisk innhold bygger på offentlige coronerfunn og kildeførte saksoversikter. Kataloghenvendelser uten dokumentert historisk resultat er tydelig omtalt som spillrekonstruksjoner.</p>
        <p>Full kildeoversikt åpnes når debriefen leveres.</p>
      </div>`;
      return;
    }
    $("#sources-list").innerHTML = DATA.sources.map((item) => `<article class="source-item">
      <div class="source-id">${escapeHtml(item.id)} <span class="source-type">${escapeHtml(item.kind)}</span></div>
      <strong>${escapeHtml(item.title)}</strong>
      <div>${escapeHtml(item.date || "")}</div>
      <p>${escapeHtml(item.note || "")}</p>
    </article>`).join("");
  }

  function renderDirectory() {
    const search = ($("#lead-search").value || "").trim().toLocaleLowerCase("nb-NO");
    const filter = $("#lead-filter").value;
    const visited = new Set(state.visited);
    const pinned = new Set(state.pins);
    const entries = DATA.directory.filter((item) => {
      const location = locationById(item.locationId);
      const haystack = `${item.code} ${item.name} ${item.address || ""} ${location?.name || ""}`.toLocaleLowerCase("nb-NO");
      if (search && !haystack.includes(search)) return false;
      if (filter === "visited" && !visited.has(item.id)) return false;
      if (filter === "unvisited" && visited.has(item.id)) return false;
      if (filter === "pinned" && !pinned.has(`lead:${item.id}`)) return false;
      return true;
    });

    $("#directory-count").textContent = `${entries.length} av ${DATA.directory.length} oppføringer`;
    $("#leads-grid").innerHTML = entries.map((item) => {
      const done = visited.has(item.id);
      const location = locationById(item.locationId);
      const locked = state.investigationEnded && !done;
      return `<button class="lead-card ${done ? "investigated" : ""} ${locked ? "ended-lock" : ""}" data-lead-id="${escapeHtml(item.id)}" ${locked ? "disabled" : ""}>
        <div class="lead-code">${escapeHtml(item.code)}</div>
        <div class="lead-title">${escapeHtml(item.name)}</div>
        <div class="lead-address">${escapeHtml(item.address || location?.name || "Adresse ikke oppført")}</div>
        <div class="lead-status">${done ? "BESØKT" : locked ? "IKKE BESØKT · ETTERFORSKNING AVSLUTTET" : "IKKE BESØKT"}</div>
      </button>`;
    }).join("") || '<p class="empty-state">Ingen oppføringer matcher søket.</p>';
  }

  function createLeadModal(item, mode) {
    const modal = document.createElement("div");
    modal.className = "lead-detail-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    const location = locationById(item.locationId);
    const close = () => modal.remove();

    if (mode === "confirm") {
      modal.innerHTML = `<article class="lead-detail-card visit-confirmation">
        <div class="lead-code">${escapeHtml(item.code)}</div>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="directory-address">${escapeHtml(item.address || location?.name || "Adresse ikke oppført")}</p>
        <div class="action-warning">
          <strong>Oppslaget koster ${Number(item.cost || 1)} handling.</strong>
          <p>Du får ikke vite på forhånd om oppføringen inneholder et nytt spor.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary confirm-visit">Oppsøk</button>
          <button class="btn close-modal">Avbryt</button>
        </div>
      </article>`;
      document.body.append(modal);
      $(".close-modal", modal).addEventListener("click", close);
      $(".confirm-visit", modal).addEventListener("click", () => {
        uniquePush(state.visited, [item.id]);
        uniquePush(state.foundDocuments, item.documentIds || []);
        saveState();
        renderAll();
        modal.remove();
        createLeadModal(item, "result");
      });
    } else {
      const pinned = state.pins.includes(`lead:${item.id}`);
      const illustration = item.illustration ? `<figure class="lead-illustration">
        <img src="${escapeHtml(item.illustration.file)}" alt="${escapeHtml(item.illustration.alt)}" class="lead-ill-img">
      </figure>` : "";
      const foundDocs = (item.documentIds || []).map(documentById).filter(Boolean);
      const documents = foundDocs.length ? `<div class="documents-found">
        <div class="result-label">LAGT I SAKSMAPPEN</div>
        ${foundDocs.map((doc) => `<button class="document-link" data-open-document="${escapeHtml(doc.id)}">${escapeHtml(doc.title)}</button>`).join("")}
      </div>` : "";
      modal.innerHTML = `<article class="lead-detail-card">
        ${illustration}
        <div class="lead-code">${escapeHtml(item.code)}</div>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="directory-address">${escapeHtml(item.address || location?.name || "")}</p>
        <div class="lead-full-text">${(item.result || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
        ${documents}
        <p class="simulation-note">${escapeHtml(DATA.meta.actionDisclaimer)}</p>
        ${state.debriefSubmitted ? `<p class="source-line"><strong>Kilde-ID:</strong> ${escapeHtml((item.sourceIds || []).join(" · ") || "metode-rekonstruksjon")}</p>` : ""}
        <div class="modal-actions">
          <button class="btn pin-lead">${pinned ? "Fjern fra notatbok" : "Fest i notatbok"}</button>
          <button class="btn close-modal">Lukk</button>
        </div>
      </article>`;
      document.body.append(modal);
      $(".pin-lead", modal).addEventListener("click", () => {
        togglePin(`lead:${item.id}`);
        modal.remove();
        createLeadModal(item, "result");
      });
      $$('[data-open-document]', modal).forEach((button) => button.addEventListener("click", () => {
        modal.remove();
        openDocument(button.dataset.openDocument);
      }));
      $(".close-modal", modal).addEventListener("click", close);
    }

    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    const focusTarget = $(mode === "confirm" ? ".confirm-visit" : ".close-modal", modal);
    focusTarget?.focus({ preventScroll: true });
    $(".lead-detail-card", modal).scrollTop = 0;
  }

  function openLead(leadId) {
    const item = leadById(leadId);
    if (!item) return;
    const visited = state.visited.includes(item.id);
    if (state.investigationEnded && !visited) {
      toast("Etterforskningen er avsluttet. Bare besøkte oppføringer kan åpnes igjen.");
      return;
    }
    createLeadModal(item, visited ? "result" : "confirm");
  }

  function renderDocuments() {
    const documents = state.foundDocuments.map(documentById).filter(Boolean);
    $("#documents-grid").innerHTML = documents.length ? documents.map((item) => {
      const pinned = state.pins.includes(`doc:${item.id}`);
      return `<button class="doc-card" data-document-id="${escapeHtml(item.id)}">
        <span class="doc-stamp">FUNNET</span>
        <div class="doc-title">${escapeHtml(item.title)}</div>
        <div class="doc-type">${escapeHtml(item.dateLabel || item.date || "Dato ukjent")}</div>
        ${pinned ? '<div class="pinned-mark">FESTET</div>' : ""}
      </button>`;
    }).join("") : `<div class="empty-state dossier-empty">
      <div class="empty-folder" aria-hidden="true">▱</div>
      <p>Saksmappen er tom.</p>
      <p>Dokumenttitler vises ikke før du faktisk finner dem.</p>
    </div>`;
  }

  function openDocument(documentId) {
    const item = documentById(documentId);
    if (!item || !state.foundDocuments.includes(item.id)) return;
    switchTab("documents");
    const pinned = state.pins.includes(`doc:${item.id}`);
    const sourceLine = state.debriefSubmitted
      ? `<p class="source-line"><strong>Kilde-ID:</strong> ${escapeHtml((item.sourceIds || []).join(" · "))}</p>`
      : "";
    $("#document-content").innerHTML = `<div class="doc-eyebrow">SAKSMATERIALE · ${escapeHtml(item.dateLabel || item.date || "UDATERT")}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <figure class="document-facsimile">
        <a href="${escapeHtml(item.facsimile)}" target="_blank" rel="noopener" title="Åpne dokumentbildet i full størrelse">
          <img src="${escapeHtml(item.facsimile)}" alt="${escapeHtml(item.alt)}" class="doc-facsimile-img">
        </a>
      </figure>
      <p class="facsimile-note">${escapeHtml(item.accuracyNote || "Rekonstruksjon basert på offentlig kildegrunnlag.")}</p>
      ${sourceLine}
      <button class="btn pin-document">${pinned ? "Fjern fra notatbok" : "Fest i notatbok"}</button>`;
    $("#document-viewer").classList.remove("hidden");
    $(".pin-document").addEventListener("click", () => {
      togglePin(`doc:${item.id}`);
      openDocument(item.id);
    });
    $(".document-close").focus({ preventScroll: true });
    $(".document-viewer-inner").scrollTop = 0;
  }

  function pinLabel(ref) {
    const [kind, id] = ref.split(":");
    if (kind === "lead") {
      const item = leadById(id);
      return item ? `${item.code} · ${item.name}` : ref;
    }
    const item = documentById(id);
    return item ? `Dokument · ${item.title}` : ref;
  }

  function togglePin(ref) {
    if (state.pins.includes(ref)) {
      state.pins = state.pins.filter((item) => item !== ref);
      delete state.pinNotes[ref];
    } else {
      state.pins.push(ref);
    }
    saveState();
    renderDirectory();
    renderDocuments();
    renderNotebook();
  }

  function renderNotebook() {
    $("#free-notes").value = state.notes || "";
    $("#pinned-items").innerHTML = state.pins.length ? state.pins.map((ref) => `<article class="pinned-reference" data-pin-ref="${escapeHtml(ref)}">
      <div class="pin-heading">
        <strong>${escapeHtml(pinLabel(ref))}</strong>
        <button class="pin-remove" data-remove-pin="${escapeHtml(ref)}" aria-label="Fjern festet referanse">×</button>
      </div>
      <textarea class="pin-note" data-pin-note="${escapeHtml(ref)}" placeholder="Hvorfor kan dette være relevant?">${escapeHtml(state.pinNotes[ref] || "")}</textarea>
    </article>`).join("") : '<p class="empty-state compact">Fest oppføringer eller dokumenter fra saksmappen. Spillet foreslår ingen forbindelser for deg.</p>';
  }

  function projectLead(item) {
    const [group, numberText] = item.code.split("-");
    const number = Math.max(1, Number(numberText || 1)) - 1;
    if (group === "SP") return { x: 390 + (number % 4) * 48, y: 125 + Math.floor(number / 4) * 38 };
    if (group === "GC") return { x: 590 + (number % 4) * 48, y: 125 + Math.floor(number / 4) * 38 };
    if (group === "NS") return { x: 445 + (number % 6) * 82, y: 350 + Math.floor(number / 6) * 82 };
    if (group === "XR" && number < 7) return { x: 90 + (number % 3) * 92, y: 135 + Math.floor(number / 3) * 85 };
    return { x: 740 + ((number - 7) % 3) * 82, y: 135 + Math.floor((number - 7) / 3) * 85 };
  }

  function renderMap() {
    const zones = `<rect class="map-bg" x="20" y="20" width="960" height="580" rx="3" />
      <rect class="map-zone" x="45" y="70" width="280" height="230"/><text class="region-label" x="60" y="94">STORBRITANNIA</text>
      <rect class="map-zone" x="350" y="70" width="355" height="230"/><text class="region-label" x="365" y="94">SOUTHPORT / BRISBANE / GOLD COAST</text>
      <rect class="map-zone" x="350" y="320" width="590" height="235"/><text class="region-label" x="365" y="344">NORTHERN NSW</text>
      <rect class="map-zone" x="725" y="70" width="215" height="230"/><text class="region-label" x="740" y="94">ØVRIGE REGISTRE</text>`;
    const visited = new Set(state.visited);
    const pins = DATA.directory.map((item) => {
      const point = projectLead(item);
      return `<g class="loc-pin ${visited.has(item.id) ? "visited" : ""}" data-map-lead="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(item.code + " " + item.name)}" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})">
        <circle class="loc-dot" r="6"></circle><text class="loc-code" x="9" y="3">${escapeHtml(item.code)}</text>
      </g>`;
    }).join("");
    $("#map-svg").innerHTML = zones + pins;
  }

  function showMapInfo(leadId) {
    const item = leadById(leadId);
    if (!item) return;
    const location = locationById(item.locationId);
    const info = $("#map-info");
    info.classList.remove("hidden");
    info.innerHTML = `<div><span class="lead-code">${escapeHtml(item.code)}</span><h4>${escapeHtml(item.name)}</h4>
      <p>${escapeHtml(item.address || location?.name || "Adresse ikke oppført")}</p></div>
      <button class="btn btn-small map-open-lead" data-lead-id="${escapeHtml(item.id)}">${state.visited.includes(item.id) ? "Åpne igjen" : "Oppsøk"}</button>`;
  }

  function renderDebrief() {
    const used = usedActions();
    const budget = Number(DATA.episode.actionBudget || 14);
    const correct = state.debriefSubmitted
      ? DATA.episode.questions.filter((item) => state.answers[item.id] === item.correct).length
      : 0;
    $("#debrief-summary").innerHTML = `<div class="eff-label">ETTERFORSKNINGSSTATUS</div>
      <p>Besøkt: <strong>${state.visited.length}</strong> av ${DATA.directory.length} registeroppføringer · handlinger: <strong>${used}</strong> av ${budget} · dokumenter: <strong>${state.foundDocuments.length}</strong>.</p>
      ${state.debriefSubmitted ? `<p>Dokumentforståelse: <strong>${correct} av ${DATA.episode.questions.length}</strong>. Dette måler kildeforståelse, ikke skyld.</p>` : `<p>Du kan levere når som helst. Svarene og dagens saksstatus åpnes da permanent for denne gjennomspillingen.</p>`}`;

    $("#debrief-form").innerHTML = DATA.episode.questions.map((item, index) => {
      const options = item.options.map((option) => `<label class="answer-option ${state.debriefSubmitted && option.value === item.correct ? "correct-answer" : ""}">
        <input type="radio" name="${escapeHtml(item.id)}" value="${escapeHtml(option.value)}" ${state.answers[item.id] === option.value ? "checked" : ""} ${state.debriefSubmitted ? "disabled" : ""}>
        <span>${escapeHtml(option.label)}</span>
      </label>`).join("");
      const feedback = state.debriefSubmitted ? `<div class="answer-feedback ${state.answers[item.id] === item.correct ? "is-correct" : "is-wrong"}">
        <strong>${state.answers[item.id] === item.correct ? "Riktig." : "Ikke helt."}</strong> ${escapeHtml(item.explanation)}
        <div class="source-line">Kilde-ID: ${escapeHtml((item.sourceIds || []).join(" · "))}</div>
      </div>` : "";
      return `<fieldset class="debrief-q"><legend>${index + 1}. ${escapeHtml(item.prompt)}</legend>${options}
        <label class="reasoning-label">Din begrunnelse (valgfri)
          <textarea data-answer-note="${escapeHtml(item.id)}" ${state.debriefSubmitted ? "readonly" : ""}>${escapeHtml(state.answerNotes[item.id] || "")}</textarea>
        </label>${feedback}</fieldset>`;
    }).join("") + `<button type="submit" class="btn btn-primary" ${state.debriefSubmitted ? "disabled" : ""}>${state.debriefSubmitted ? "Debrief levert" : "Lever og åpne senere funn"}</button>`;

    const status = $("#current-status");
    status.classList.toggle("hidden", !state.debriefSubmitted);
    status.innerHTML = state.debriefSubmitted ? `<div class="status-stamp">SENERE KUNNSKAP · IKKE TILGJENGELIG I 1997</div>
      <h3>Dagens saksstatus</h3>
      ${(DATA.meta.currentStatus || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <p class="poi-caution">${escapeHtml(DATA.meta.poiCaution)}</p>` : "";
  }

  function finishInvestigation() {
    if (state.investigationEnded) return;
    const used = usedActions();
    const message = `Avslutte etterforskningen etter ${used} handlinger? Du kan fortsatt lese besøkte oppføringer og dokumenter, men ikke oppsøke nye steder.`;
    if (!window.confirm(message)) return;
    state.investigationEnded = true;
    state.activeTab = "debrief";
    saveState();
    renderAll();
    toast("Etterforskningen er avsluttet. Debriefen er åpnet.");
  }

  function submitDebrief(event) {
    event.preventDefault();
    if (state.debriefSubmitted) return;
    const missing = DATA.episode.questions.filter((item) => !state.answers[item.id]);
    if (missing.length) {
      toast(`Svar på alle ${DATA.episode.questions.length} spørsmål før du leverer.`);
      $("#debrief-form").querySelector(`input[name="${missing[0].id}"]`)?.focus();
      return;
    }
    state.debriefSubmitted = true;
    state.submittedAt = new Date().toISOString();
    uniquePush(state.foundDocuments, DATA.episode.debriefDocumentIds || []);
    saveState();
    renderSources();
    renderDocuments();
    renderDebrief();
    toast("Debrief levert. Senere kildefunn er nå åpnet.");
  }

  function setSourcesOpen(open) {
    $("#sources-drawer").classList.toggle("hidden", !open);
  }

  function resetProgress() {
    if (!window.confirm("Nullstille alle besøk, dokumenter, notater og debriefsvar for v0.3?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = freshState();
    state.accepted = true;
    saveState();
    renderAll();
    toast("Den lokale saksmappen er nullstilt.");
  }

  function bindEvents() {
    $("#disclaimer-accept").addEventListener("click", () => {
      state.accepted = true;
      saveState();
      showApp();
    });
    $$(".tab-btn").forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
    $("#sources-btn").addEventListener("click", () => setSourcesOpen(true));
    $("#finish-btn").addEventListener("click", finishInvestigation);
    $(".drawer-close").addEventListener("click", () => setSourcesOpen(false));
    $("#sources-drawer").addEventListener("click", (event) => { if (event.target.id === "sources-drawer") setSourcesOpen(false); });
    $("#save-btn").addEventListener("click", () => saveState(true));
    $("#reset-btn").addEventListener("click", resetProgress);
    $("#lead-search").addEventListener("input", renderDirectory);
    $("#lead-filter").addEventListener("change", renderDirectory);
    $("#free-notes").addEventListener("input", (event) => { state.notes = event.target.value; saveState(); });
    $(".document-close").addEventListener("click", () => $("#document-viewer").classList.add("hidden"));
    $("#document-viewer").addEventListener("click", (event) => { if (event.target.id === "document-viewer") event.currentTarget.classList.add("hidden"); });
    $("#debrief-form").addEventListener("submit", submitDebrief);

    document.addEventListener("click", (event) => {
      const leadCard = event.target.closest("[data-lead-id]");
      if (leadCard) openLead(leadCard.dataset.leadId);
      const docCard = event.target.closest("[data-document-id]");
      if (docCard) openDocument(docCard.dataset.documentId);
      const mapPin = event.target.closest("[data-map-lead]");
      if (mapPin) showMapInfo(mapPin.dataset.mapLead);
      const removePin = event.target.closest("[data-remove-pin]");
      if (removePin) togglePin(removePin.dataset.removePin);
    });

    document.addEventListener("change", (event) => {
      if (event.target.matches('#debrief-form input[type="radio"]')) {
        state.answers[event.target.name] = event.target.value;
        saveState();
      }
    });

    document.addEventListener("input", (event) => {
      if (event.target.matches("[data-pin-note]")) {
        state.pinNotes[event.target.dataset.pinNote] = event.target.value;
        saveState();
      }
      if (event.target.matches("[data-answer-note]")) {
        state.answerNotes[event.target.dataset.answerNote] = event.target.value;
        saveState();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setSourcesOpen(false);
      $$(".lead-detail-overlay").forEach((node) => node.remove());
      $("#document-viewer").classList.add("hidden");
    });
  }

  bindEvents();
  if (state.accepted) showApp();
})();
