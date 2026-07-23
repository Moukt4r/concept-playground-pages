(() => {
  "use strict";

  const DATA = window.CASE_DATA;
  const STORAGE_KEY = "case-files-lady-vanishes-v07";
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
  const sourceNames = (ids) => (ids || []).map(sourceById).filter(Boolean).map((item) => item.title);
  const locationById = (id) => DATA.locations.find((item) => item.id === id);
  const identityById = (id) => (DATA.identities || []).find((item) => item.id === id);

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
      criterionChecks: {},
      identityLinks: [],
      currentAct: 1,
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
      ["visited", "foundDocuments", "pins", "identityLinks"].forEach((key) => {
        if (!Array.isArray(state[key])) state[key] = base[key];
      });
      ["pinNotes", "answers", "answerNotes", "criterionChecks"].forEach((key) => {
        if (!state[key] || typeof state[key] !== "object") state[key] = {};
      });
      if (![1, 2].includes(Number(state.currentAct))) state.currentAct = 1;
      return state;
    } catch {
      return freshState();
    }
  }

  let state = loadState();
  let drawerReturnFocus = null;
  let documentReturnId = null;

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
    if (tabName === "map") {
      renderMap();
      requestAnimationFrame(() => {
        const container = $(".map-container");
        if (container && window.innerWidth <= 768) container.scrollLeft = Math.max(0, (container.scrollWidth - container.clientWidth) / 2);
      });
    }
    if (tabName === "documents") renderDocuments();
    if (tabName === "notebook") renderNotebook();
    if (tabName === "debrief") renderDebrief();
    saveState();
  }

  function renderAll() {
    const act = (DATA.episode.acts || []).find((item) => Number(item.id) === Number(state.currentAct)) || DATA.episode.acts?.[0];
    $("#act-stamp").textContent = act?.stamp || "AKT I · 1997";
    $("#episode-title").textContent = act?.title || DATA.episode.title;
    $("#episode-brief").innerHTML = (act?.brief || DATA.episode.brief || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    $("#debrief-tab").classList.toggle("hidden", !state.investigationEnded);
    $("#finish-btn").classList.toggle("hidden", state.investigationEnded);
    $("#finish-btn").textContent = Number(state.currentAct) === 1 ? "Åpne arkivene" : "Avslutt";
    $("#finish-btn").title = Number(state.currentAct) === 1
      ? "Avslutt 1997-sporet og åpne senere arkiver"
      : "Avslutt etterforskningen og åpne sluttspørsmålene";
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
    const display = $("#lead-budget-display");
    display.textContent = `${used} ${used === 1 ? "oppslag" : "oppslag"}`;
    display.classList.remove("over-budget");
    display.title = `Antall registeroppslag. Referansestien bruker ${(DATA.episode.referenceLeadIds || []).length || 16}; hvert ekstra oppslag trekker 5 poeng, men låser aldri registeret.`;
  }

  function renderSources() {
    if (!state.debriefSubmitted) {
      $("#sources-list").innerHTML = `<div class="method-note"><p>Kildeoversikten åpnes etter at svarene er levert.</p></div>`;
      return;
    }
    $("#sources-list").innerHTML = DATA.sources.map((item) => `<article class="source-item">
      <div class="source-id"><span class="source-type">${escapeHtml(item.kind)}</span></div>
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
    const available = DATA.directory.filter((item) => Number(item.act || 1) <= Number(state.currentAct));
    const entries = available.filter((item) => {
      const location = locationById(item.locationId);
      const revealed = visited.has(item.id) ? (item.result || []).join(" ") : "";
      const foundDocText = (item.documentIds || []).filter((id) => state.foundDocuments.includes(id)).map(documentById).filter(Boolean)
        .flatMap((doc) => [doc.title, ...(doc.transcript || [])]).join(" ");
      const haystack = `${item.code} ${item.name} ${item.address || ""} ${location?.name || ""} ${(item.lookupTerms || []).join(" ")} ${revealed} ${foundDocText}`.toLocaleLowerCase("nb-NO");
      if (search && !haystack.includes(search)) return false;
      if (filter === "visited" && !visited.has(item.id)) return false;
      if (filter === "unvisited" && visited.has(item.id)) return false;
      if (filter === "pinned" && !pinned.has(`lead:${item.id}`)) return false;
      return true;
    });

    $("#directory-count").textContent = `${entries.length} av ${available.length} tilgjengelige oppføringer`;
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
    modal.dataset.returnLead = item.id;
    const close = () => {
      modal.remove();
      $(`[data-lead-id="${item.id}"]`)?.focus();
    };

    if (mode === "confirm") {
      modal.innerHTML = `<article class="lead-detail-card visit-confirmation">
        <div class="lead-code">${escapeHtml(item.code)}</div>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="directory-address">${escapeHtml(item.address || location?.name || "Adresse ikke oppført")}</p>
        <div class="action-warning">
          <strong>Dette blir oppslag nummer ${usedActions() + Number(item.cost || 1)}.</strong>
          <p>Det finnes ingen handlingsgrense, og du får ikke vite på forhånd om oppføringen inneholder et nytt spor.</p>
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
        ${state.debriefSubmitted && sourceNames(item.sourceIds).length ? `<p class="source-line"><strong>Kilder:</strong> ${escapeHtml(sourceNames(item.sourceIds).join(" · "))}</p>` : ""}
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
    if (Number(item.act || 1) > Number(state.currentAct)) {
      toast("Dette arkivet er ikke åpnet ennå.");
      return;
    }
    if (state.investigationEnded && !visited) {
      toast("Etterforskningen er avsluttet. Bare besøkte oppføringer kan åpnes igjen.");
      return;
    }
    createLeadModal(item, visited ? "result" : "confirm");
  }

  function renderDocuments() {
    const documents = state.foundDocuments.map(documentById).filter(Boolean);
    if (!documents.length) {
      $("#documents-grid").innerHTML = `<div class="empty-state dossier-empty">
        <div class="empty-folder" aria-hidden="true">▱</div>
        <p>Saksmappen er tom.</p>
        <p>Dokumenttitler vises ikke før du faktisk finner dem.</p>
      </div>`;
      return;
    }
    const hasPassengerCards = state.foundDocuments.includes("doc03") && state.foundDocuments.includes("doc06");
    const comparison = hasPassengerCards ? `<button class="doc-card comparison-card" data-compare-passenger-cards>
      <span class="doc-stamp">BORD</span>
      <div class="doc-title">Utreise / innreise</div>
      <div class="doc-type">Legg kortene side om side</div>
    </button>` : "";
    $("#documents-grid").innerHTML = comparison + documents.map((item) => {
      const pinned = state.pins.includes(`doc:${item.id}`);
      return `<button class="doc-card" data-document-id="${escapeHtml(item.id)}">
        <span class="doc-stamp">FUNNET</span>
        <div class="doc-title">${escapeHtml(item.title)}</div>
        <div class="doc-type">${escapeHtml(item.dateLabel || item.date || "Dato ukjent")}</div>
        ${pinned ? '<div class="pinned-mark">FESTET</div>' : ""}
      </button>`;
    }).join("");
  }

  function openDocument(documentId) {
    const item = documentById(documentId);
    if (!item || !state.foundDocuments.includes(item.id)) return;
    documentReturnId = item.id;
    switchTab("documents");
    $(".document-viewer-inner").classList.remove("comparison-open");
    const pinned = state.pins.includes(`doc:${item.id}`);
    const sourceLine = state.debriefSubmitted && sourceNames(item.sourceIds).length
      ? `<p class="source-line"><strong>Kilder:</strong> ${escapeHtml(sourceNames(item.sourceIds).join(" · "))}</p>`
      : "";
    const transcript = (item.transcript || []).length ? `<details class="document-transcript" open>
      <summary>Tilgjengelig transkripsjon av synlig innhold</summary>
      <ul>${item.transcript.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      <p>Gjengir synlige felt uten å forklare hvilke detaljer som er viktige.</p>
    </details>` : "";
    $("#document-content").innerHTML = `<div class="doc-eyebrow">SAKSMATERIALE · ${escapeHtml(item.dateLabel || item.date || "UDATERT")}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <figure class="document-facsimile">
        <a href="${escapeHtml(item.facsimile)}" target="_blank" rel="noopener" title="Åpne dokumentbildet i full størrelse">
          <img src="${escapeHtml(item.facsimile)}" alt="${escapeHtml(item.alt)}" class="doc-facsimile-img">
        </a>
      </figure>
      ${transcript}
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

  function openPassengerComparison() {
    if (!state.foundDocuments.includes("doc03") || !state.foundDocuments.includes("doc06")) return;
    const departure = documentById("doc03");
    const arrival = documentById("doc06");
    documentReturnId = "compare";
    switchTab("documents");
    $(".document-viewer-inner").classList.add("comparison-open");
    $("#document-content").innerHTML = `<div class="doc-eyebrow">SAKSBORD</div>
      <h3>Utreise / innreise</h3>
      <div class="comparison-controls" role="group" aria-label="Velg kortvisning">
        <button class="btn btn-small" data-comparison-mode="departure">22. juni</button>
        <button class="btn btn-small" data-comparison-mode="arrival">2. august</button>
        <button class="btn btn-small active" data-comparison-mode="both">Begge</button>
      </div>
      <div class="comparison-grid compare-both">
        <figure>
          <figcaption>22. juni 1997</figcaption>
          <a href="${escapeHtml(departure.facsimile)}" target="_blank" rel="noopener">
            <img src="${escapeHtml(departure.facsimile)}" alt="${escapeHtml(departure.alt)}">
          </a>
        </figure>
        <figure>
          <figcaption>2. august 1997</figcaption>
          <a href="${escapeHtml(arrival.facsimile)}" target="_blank" rel="noopener">
            <img src="${escapeHtml(arrival.facsimile)}" alt="${escapeHtml(arrival.alt)}">
          </a>
        </figure>
      </div>`;
    $("#document-viewer").classList.remove("hidden");
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

  function discoveredIdentities() {
    const found = new Set(state.foundDocuments);
    return (DATA.identities || []).filter((item) => (item.documentIds || []).some((id) => found.has(id)));
  }

  function addIdentityLink() {
    const a = $("#identity-a").value;
    const b = $("#identity-b").value;
    const reason = $("#identity-reason").value.trim();
    const discovered = new Set(discoveredIdentities().map((item) => item.id));
    if (!a || !b || a === b || !discovered.has(a) || !discovered.has(b)) {
      toast("Velg to forskjellige identiteter du har funnet.");
      return;
    }
    const pair = [a, b].sort().join(":");
    if (state.identityLinks.some((item) => [item.a, item.b].sort().join(":") === pair)) {
      toast("De identitetene er allerede koblet.");
      return;
    }
    state.identityLinks.push({ a, b, reason });
    saveState();
    renderNotebook();
    toast("Identitetsteorien er lagt på tavlen.");
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

    const identities = discoveredIdentities();
    const options = '<option value="">Velg navn</option>' + identities.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join("");
    $("#identity-a").innerHTML = options;
    $("#identity-b").innerHTML = options;
    $("#identity-a").disabled = identities.length < 2;
    $("#identity-b").disabled = identities.length < 2;
    $("#identity-reason").disabled = identities.length < 2;
    $("#add-identity-link").disabled = identities.length < 2;
    $("#identity-links").innerHTML = state.identityLinks.length ? state.identityLinks.map((link, index) => {
      const left = identityById(link.a)?.label || link.a;
      const right = identityById(link.b)?.label || link.b;
      return `<article class="identity-link">
        <div><strong>${escapeHtml(left)} ↔ ${escapeHtml(right)}</strong>${link.reason ? `<p>${escapeHtml(link.reason)}</p>` : ""}</div>
        <button class="identity-remove" data-remove-identity-link="${index}" aria-label="Fjern identitetskobling">×</button>
      </article>`;
    }).join("") : `<p class="empty-state compact">${identities.length < 2 ? "Finn flere identiteter i arkivene før du kan koble dem." : "Ingen identiteter er koblet ennå."}</p>`;
  }

  const MAP_POINTS = {
    "loc-london": [78, 108],
    "loc-tunbridge": [178, 122],
    "loc-rye": [230, 185],
    "loc-hastings": [118, 220],
    "loc-brisbane": [420, 92],
    "loc-tss": [500, 112],
    "loc-southport": [555, 148],
    "loc-merinda": [625, 165],
    "loc-ashmore": [490, 195],
    "loc-burleigh": [590, 225],
    "loc-tweed": [680, 300],
    "loc-byron": [635, 355],
    "loc-ballina": [595, 415],
    "loc-lismore": [495, 425],
    "loc-grafton": [530, 515],
    "loc-nsw": [690, 505],
    "loc-narita": [805, 120],
    "loc-seoul": [835, 245],
    "loc-overseas": [905, 185]
  };

  const MAP_LABELS = {
    "loc-london": [-22, -21, "London"],
    "loc-tunbridge": [-72, -19, "Tunbridge Wells"],
    "loc-rye": [16, 20, "Rye"],
    "loc-hastings": [-56, 23, "Hastings"],
    "loc-southport": [18, -10, "Southport"],
    "loc-merinda": [18, 20, "Merinda Ct"],
    "loc-tss": [-18, -22, "TSS"],
    "loc-brisbane": [-48, -20, "Brisbane"],
    "loc-ashmore": [-58, 23, "Ashmore"],
    "loc-burleigh": [18, 23, "Burleigh"],
    "loc-byron": [18, -10, "Byron Bay"],
    "loc-ballina": [18, 22, "Ballina"],
    "loc-lismore": [-58, 23, "Lismore"],
    "loc-grafton": [18, 22, "Grafton"],
    "loc-tweed": [18, -10, "Tweed"],
    "loc-nsw": [18, 22, "NSW archive"],
    "loc-narita": [-35, -20, "Narita"],
    "loc-seoul": [16, 5, "Seoul / transitt"],
    "loc-overseas": [-28, 25, "Europe"]
  };

  function availableDirectory() {
    return DATA.directory.filter((item) => Number(item.act || 1) <= Number(state.currentAct));
  }

  function renderMap() {
    const available = availableDirectory();
    const visited = new Set(state.visited);
    const groups = DATA.locations.map((location) => ({
      location,
      entries: available.filter((item) => item.locationId === location.id)
    })).filter((group) => group.entries.length);

    const base = `<rect class="map-bg" x="18" y="18" width="964" height="584" rx="12" />
      <path class="map-land" d="M42 74 C92 46 198 48 275 78 C306 111 294 220 244 265 C186 291 90 280 48 232 C24 183 24 111 42 74 Z" />
      <path class="map-land" d="M355 52 C430 35 571 42 660 91 C711 161 730 250 716 338 C700 433 660 539 603 580 L374 580 C395 489 403 407 395 326 C385 223 357 143 355 52 Z" />
      <path class="map-coast" d="M622 67 C597 116 597 178 621 231 C648 289 654 349 632 413 C616 463 586 516 559 565" />
      <path class="map-land" d="M758 66 C816 40 927 43 966 88 C982 137 964 233 915 266 C855 285 784 253 755 210 C739 162 739 103 758 66 Z" />
      <text class="map-region-label" x="55" y="58">STORBRITANNIA</text>
      <text class="map-region-label" x="372" y="47">AUSTRALIA · ØSTKYSTEN</text>
      <text class="map-region-label" x="770" y="56">INTERNASJONALT</text>
      <path class="map-route" d="M420 92 C555 38 744 130 835 245" />
      <path class="map-route" d="M835 245 C654 505 360 365 178 122" />
      <path class="map-route return" d="M178 122 C286 284 362 230 420 92" />
      <text class="map-route-label" x="620" y="202">MARION · UT 22. JUNI</text>
      <text class="map-route-label" x="300" y="292">TILBAKE 2. AUGUST</text>
      ${state.foundDocuments.includes("doc18") || state.foundDocuments.includes("doc20") ? `<path class="map-route archive" d="M420 92 C555 2 704 24 805 120" />
        <path class="map-route archive" d="M805 120 C620 16 360 24 178 122" />
        <text class="map-route-label archive" x="585" y="73">WESTBURY · 17. JUNI</text>` : ""}
      <g class="map-legend" transform="translate(765 535)">
        <circle class="legend-unvisited" cx="0" cy="0" r="7"/><text x="12" y="4">ikke besøkt</text>
        <circle class="legend-partial" cx="92" cy="0" r="7"/><text x="104" y="4">delvis</text>
        <circle class="legend-complete" cx="160" cy="0" r="7"/><text x="172" y="4">fullført</text>
      </g>`;

    const nodes = groups.map(({ location, entries }) => {
      const override = MAP_POINTS[location.id];
      const point = override ? { x: override[0], y: override[1] } : (location.map || { x: 500, y: 300 });
      const done = entries.filter((item) => visited.has(item.id)).length;
      const status = done === 0 ? "unvisited" : done === entries.length ? "complete" : "partial";
      const [dx, dy, label] = MAP_LABELS[location.id] || [12, -12, location.name];
      return `<g class="map-location ${status}" data-map-location="${escapeHtml(location.id)}" tabindex="0" role="button" aria-label="${escapeHtml(location.name)}, ${entries.length} oppslag, ${done} besøkt" transform="translate(${point.x} ${point.y})">
        <circle class="map-location-dot" r="15"></circle>
        <text class="map-location-count" text-anchor="middle" y="4">${entries.length}</text>
        <text class="map-location-label" x="${dx}" y="${dy}">${escapeHtml(label)}</text>
        <title>${escapeHtml(location.name)} · ${done}/${entries.length} besøkt</title>
      </g>`;
    }).join("");
    $("#map-svg").innerHTML = base + nodes;
  }

  function showMapInfo(locationId) {
    const location = locationById(locationId);
    if (!location) return;
    const visited = new Set(state.visited);
    const entries = availableDirectory().filter((item) => item.locationId === locationId);
    const info = $("#map-info");
    info.classList.remove("hidden");
    info.innerHTML = `<div class="map-location-heading">
        <div><span class="lead-code">${escapeHtml(location.region || "SAKSKART")}</span><h4>${escapeHtml(location.name)}</h4></div>
        <span>${entries.filter((item) => visited.has(item.id)).length}/${entries.length} besøkt</span>
      </div>
      <div class="map-entry-list">${entries.map((item) => `<button class="map-entry-button ${visited.has(item.id) ? "visited" : ""}" data-lead-id="${escapeHtml(item.id)}">
        <span class="lead-code">${escapeHtml(item.code)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${visited.has(item.id) ? "Besøkt" : "Ikke besøkt"}</small>
      </button>`).join("")}</div>`;
  }

  function renderDebrief() {
    if (!state.investigationEnded) {
      $("#debrief-summary").innerHTML = "";
      $("#debrief-form").innerHTML = "";
      $("#current-status").classList.add("hidden");
      $("#current-status").innerHTML = "";
      return;
    }
    const questions = DATA.episode.questions || [];
    const mainQuestions = questions.filter((item) => item.group === "main");
    const bonusQuestions = questions.filter((item) => item.group === "bonus");
    const questionScore = (item) => (item.criteria || []).reduce((total, criterion, index) =>
      total + (state.criterionChecks[`${item.id}:${index}`] ? Number(criterion.points || 0) : 0), 0);
    const scoreFor = (items) => items.reduce((total, item) => total + questionScore(item), 0);
    const maxFor = (items) => items.reduce((total, item) => total + Number(item.points || 0), 0);
    const referenceLeads = (DATA.episode.referenceLeadIds || []).map(leadById).filter(Boolean);
    const referenceActions = referenceLeads.length || 16;
    const routeAdjustment = Math.max(-50, Math.min(20, (referenceActions - usedActions()) * 5));
    const answerScore = scoreFor(questions);
    const totalScore = answerScore + routeAdjustment;
    const signedRoute = routeAdjustment > 0 ? `+${routeAdjustment}` : String(routeAdjustment);

    $("#debrief-summary").innerHTML = `<div class="eff-label">ETTERFORSKNINGSSTATUS</div>
      <p>Besøkt: <strong>${state.visited.length}</strong> av ${DATA.directory.length} registeroppføringer · dokumenter: <strong>${state.foundDocuments.length}</strong>.</p>
      <p>Du brukte <strong>${usedActions()}</strong> oppslag. Referansestien bruker ${referenceActions}; hvert ekstra oppslag trekker 5 poeng, og hvert spart oppslag gir 5 poeng (maks +20 / −50).</p>
      ${state.debriefSubmitted
        ? `<div class="scoreboard"><span>Hovedsak <strong>${scoreFor(mainQuestions)}/${maxFor(mainQuestions)}</strong></span><span>Sidespor <strong>${scoreFor(bonusQuestions)}/${maxFor(bonusQuestions)}</strong></span><span>Rute <strong>${signedRoute}</strong></span><span>Sluttsum <strong>${totalScore}</strong></span></div><details class="reference-route"><summary>Vis referansestien (${referenceActions} oppslag)</summary><p>${escapeHtml(referenceLeads.map((item) => `${item.code} ${item.name}`).join(" · "))}</p><p>Dette er én effektiv rute, ikke den eneste gyldige løsningen.</p></details>`
        : `<p>Svar med konkrete navn, datoer og dokumentkoblinger. Løsningsheftet viser faste poengkriterier etter innlevering.</p>`}`;

    const renderQuestion = (item, index) => {
      const answer = state.answers[item.id] || "";
      const solution = state.debriefSubmitted ? `<section class="solution-booklet">
        <div class="solution-stamp">LØSNINGSHEFTE · ${questionScore(item)}/${item.points} POENG</div>
        ${(item.modelAnswer || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        <fieldset class="criterion-score"><legend>Kryss av det svaret ditt inneholdt</legend>
          ${(item.criteria || []).map((criterion, criterionIndex) => {
            const key = `${item.id}:${criterionIndex}`;
            return `<label><input type="checkbox" data-criterion-key="${escapeHtml(key)}" ${state.criterionChecks[key] ? "checked" : ""}> <strong>+${Number(criterion.points || 0)}</strong> ${escapeHtml(criterion.text)}</label>`;
          }).join("")}
        </fieldset>
        <div class="source-line">Kilder: ${escapeHtml(sourceNames(item.sourceIds).join(" · "))}</div>
      </section>` : "";
      return `<fieldset class="debrief-q ${item.group === "bonus" ? "bonus-q" : "main-q"}">
        <legend><span class="question-kind">${item.group === "bonus" ? "SIDESPOR" : "HOVEDSPØRSMÅL"} · ${item.points} POENG</span>${index + 1}. ${escapeHtml(item.prompt)}</legend>
        <label class="reasoning-label">Ditt svar
          <textarea data-answer-text="${escapeHtml(item.id)}" ${state.debriefSubmitted ? "readonly" : ""} placeholder="Navn, datoer, steder og dokumentkoblinger …">${escapeHtml(answer)}</textarea>
        </label>${solution}</fieldset>`;
    };

    $("#debrief-form").innerHTML = `<div class="question-section"><h3>Fem hovedspørsmål · ${maxFor(mainQuestions)} poeng</h3>${mainQuestions.map((item, index) => renderQuestion(item, index)).join("")}</div>
      <div class="question-section bonus-section"><h3>Fem sidespor · ${maxFor(bonusQuestions)} poeng</h3>${bonusQuestions.map((item, index) => renderQuestion(item, index)).join("")}</div>
      ${state.debriefSubmitted ? '<div class="booklet-complete">Løsningsheftet er åpnet. Kryss av poengkriteriene som finnes i svarene dine.</div>' : '<button type="submit" class="btn btn-primary">Lever ti svar og åpne løsningsheftet</button>'}`;

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
    if (Number(state.currentAct) === 1) {
      const message = `Avslutte 1997-arbeidet etter ${used} oppslag og åpne de senere arkivene? Du kan fortsatt gå tilbake til alle besøkte og ubesøkte 1997-oppslag.`;
      if (!window.confirm(message)) return;
      state.currentAct = 2;
      state.activeTab = "directory";
      $("#lead-search").value = "";
      $("#lead-filter").value = "all";
      saveState();
      renderAll();
      toast("Arkivene er åpnet. Akt II er i gang.");
      return;
    }
    const message = `Avslutte hele etterforskningen etter ${used} oppslag? Du kan fortsatt lese besøkte oppføringer og dokumenter, men ikke oppsøke nye steder.`;
    if (!window.confirm(message)) return;
    state.investigationEnded = true;
    state.activeTab = "debrief";
    saveState();
    renderAll();
    toast("Etterforskningen er avsluttet. Sluttspørsmålene er åpnet.");
  }

  function submitDebrief(event) {
    event.preventDefault();
    if (state.debriefSubmitted) return;
    const missing = DATA.episode.questions.filter((item) => !(state.answers[item.id] || "").trim());
    if (missing.length) {
      toast(`Skriv et svar på alle ${DATA.episode.questions.length} spørsmål før du leverer.`);
      $("#debrief-form").querySelector(`[data-answer-text="${missing[0].id}"]`)?.focus();
      return;
    }
    state.debriefSubmitted = true;
    state.submittedAt = new Date().toISOString();
    uniquePush(state.foundDocuments, DATA.episode.debriefDocumentIds || []);
    saveState();
    renderSources();
    renderDocuments();
    renderDebrief();
    toast("Svarene er låst. Løsningsheftet og senere kildefunn er åpnet.");
  }

  function setSourcesOpen(open) {
    const drawer = $("#sources-drawer");
    if (open) {
      drawerReturnFocus = document.activeElement;
      drawer.classList.remove("hidden");
      $(".drawer-close", drawer)?.focus();
      return;
    }
    const wasOpen = !drawer.classList.contains("hidden");
    drawer.classList.add("hidden");
    if (wasOpen && drawerReturnFocus?.isConnected) drawerReturnFocus.focus();
    drawerReturnFocus = null;
  }

  function closeDocumentViewer() {
    $("#document-viewer").classList.add("hidden");
    if (documentReturnId === "compare") {
      $("[data-compare-passenger-cards]")?.focus();
    } else if (documentReturnId) {
      $(`[data-document-id="${documentReturnId}"]`)?.focus();
    }
    $(".document-viewer-inner").classList.remove("comparison-open");
    documentReturnId = null;
  }

  function resetProgress() {
    if (!window.confirm("Nullstille alle besøk, dokumenter, notater og sluttsvar?")) return;
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
    $("#reset-btn").addEventListener("click", resetProgress);
    $("#lead-search").addEventListener("input", renderDirectory);
    $("#lead-filter").addEventListener("change", renderDirectory);
    $("#free-notes").addEventListener("input", (event) => { state.notes = event.target.value; saveState(); });
    $("#add-identity-link").addEventListener("click", addIdentityLink);
    $(".document-close").addEventListener("click", closeDocumentViewer);
    $("#document-viewer").addEventListener("click", (event) => { if (event.target.id === "document-viewer") closeDocumentViewer(); });
    $("#debrief-form").addEventListener("submit", submitDebrief);

    document.addEventListener("click", (event) => {
      const leadCard = event.target.closest("[data-lead-id]");
      if (leadCard) openLead(leadCard.dataset.leadId);
      const comparisonCard = event.target.closest("[data-compare-passenger-cards]");
      if (comparisonCard) openPassengerComparison();
      const comparisonMode = event.target.closest("[data-comparison-mode]");
      if (comparisonMode) {
        const grid = $(".comparison-grid");
        if (grid) {
          grid.classList.remove("compare-departure", "compare-arrival", "compare-both");
          grid.classList.add(`compare-${comparisonMode.dataset.comparisonMode}`);
          $$('[data-comparison-mode]').forEach((button) => button.classList.toggle("active", button === comparisonMode));
        }
      }
      const docCard = event.target.closest("[data-document-id]");
      if (docCard) openDocument(docCard.dataset.documentId);
      const mapLocation = event.target.closest("[data-map-location]");
      if (mapLocation) showMapInfo(mapLocation.dataset.mapLocation);
      const removePin = event.target.closest("[data-remove-pin]");
      if (removePin) togglePin(removePin.dataset.removePin);
      const removeIdentity = event.target.closest("[data-remove-identity-link]");
      if (removeIdentity) {
        state.identityLinks.splice(Number(removeIdentity.dataset.removeIdentityLink), 1);
        saveState();
        renderNotebook();
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-criterion-key]")) {
        state.criterionChecks[event.target.dataset.criterionKey] = event.target.checked;
        saveState();
        renderDebrief();
      }
    });

    document.addEventListener("input", (event) => {
      if (event.target.matches("[data-pin-note]")) {
        state.pinNotes[event.target.dataset.pinNote] = event.target.value;
        saveState();
      }
      if (event.target.matches("[data-answer-text]")) {
        state.answers[event.target.dataset.answerText] = event.target.value;
        saveState();
      }
    });

    document.addEventListener("keydown", (event) => {
      const mapLocation = event.target.closest?.("[data-map-location]");
      if (mapLocation && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        showMapInfo(mapLocation.dataset.mapLocation);
        return;
      }

      if (event.key === "Tab") {
        const leadDialogs = $$(".lead-detail-overlay");
        const activeDialog = leadDialogs.at(-1)
          || (!$("#document-viewer").classList.contains("hidden") ? $("#document-viewer") : null)
          || (!$("#sources-drawer").classList.contains("hidden") ? $("#sources-drawer") : null);
        if (activeDialog) {
          const focusable = $$('button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])', activeDialog)
            .filter((node) => node.getClientRects().length);
          if (focusable.length) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }
        return;
      }

      if (event.key !== "Escape") return;
      const overlays = $$(".lead-detail-overlay");
      const topOverlay = overlays.at(-1);
      if (topOverlay) {
        const leadId = topOverlay.dataset.returnLead;
        topOverlay.remove();
        if (leadId) $(`[data-lead-id="${leadId}"]`)?.focus();
        return;
      }
      if (!$("#document-viewer").classList.contains("hidden")) {
        closeDocumentViewer();
        return;
      }
      setSourcesOpen(false);
    });
  }

  bindEvents();
  if (state.accepted) showApp();
})();
