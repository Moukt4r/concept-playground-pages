(() => {
  "use strict";

  const DATA = window.CASE_DATA;
  const STORAGE_KEY = "case-files-lady-vanishes-v02";
  const TAG_LABELS = {
    fact: "FAKTA",
    inferred: "SLUTNING",
    theory: "TEORI",
    lead: "ÅPENT SPOR"
  };

  if (!DATA || !Array.isArray(DATA.episodes) || DATA.episodes.length === 0) {
    document.body.innerHTML = '<main class="fatal-error">Kunne ikke laste den offentlige innholdspakken.</main>';
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);

  const episode = () => DATA.episodes.find((item) => item.id === state.episodeId) || DATA.episodes[0];
  const claim = (id) => DATA.claims[id];
  const documentById = (id) => DATA.documents.find((item) => item.id === id);
  const sourceById = (id) => DATA.sources.find((item) => item.id === id);
  const locationById = (id) => DATA.locations.find((item) => item.id === id);

  const freshState = () => ({
    accepted: false,
    episodeId: DATA.episodes[0].id,
    activeTab: "directory",
    investigated: [],
    discoveredClaims: [...(DATA.episodes[0].initialClaimIds || [])],
    discoveredDocs: [],
    pinnedClaims: [],
    notes: "",
    hypotheses: [],
    answers: {},
    debriefSubmitted: false
  });

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return freshState();
      const base = freshState();
      const merged = { ...base, ...saved };
      ["investigated", "discoveredClaims", "discoveredDocs", "pinnedClaims", "hypotheses"].forEach((key) => {
        if (!Array.isArray(merged[key])) merged[key] = base[key];
      });
      if (!merged.answers || typeof merged.answers !== "object") merged.answers = {};
      return merged;
    } catch {
      return freshState();
    }
  }

  let state = loadState();

  function saveState(showConfirmation = false) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (showConfirmation) toast("Fremdriften er lagret lokalt i nettleseren.");
  }

  function uniquePush(array, values) {
    values.forEach((value) => {
      if (value && !array.includes(value)) array.push(value);
    });
  }

  function usedBudget() {
    const leadMap = new Map(episode().leads.map((item) => [item.id, item]));
    return state.investigated.reduce((total, id) => total + Number(leadMap.get(id)?.cost || 0), 0);
  }

  function sourceRefs(ids = []) {
    if (!ids.length) return "Ingen kilde oppgitt";
    return ids.map((id) => {
      const item = sourceById(id);
      return item ? item.title : id;
    }).join(" · ");
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
    toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
  }

  function showApp() {
    $("#disclaimer-overlay").classList.add("hidden");
    const app = $("#app");
    app.classList.remove("hidden");
    app.setAttribute("aria-hidden", "false");
    renderAll();
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
    renderBudget();
    renderEpisodes();
    renderSources();
    renderDirectory();
    renderMap();
    renderDocuments();
    renderNotebook();
    renderDebrief();
    switchTab(state.activeTab || "directory");
  }

  function renderBudget() {
    const used = usedBudget();
    const budget = episode().leadBudget || 0;
    const display = $("#lead-budget-display");
    display.textContent = `${used}/${budget} kapasitet`;
    display.classList.toggle("over-budget", used > budget);
    display.title = used > budget
      ? "Du er over veiledende kapasitet, men kan fortsette etterforskningen."
      : "Brukt kapasitet / veiledende kapasitet";
  }

  function renderEpisodes() {
    const items = [
      ...DATA.episodes.map((item) => ({ ...item, status: "playable" })),
      ...(DATA.meta.futureEpisodes || [])
    ];
    $("#episode-list").innerHTML = items.map((item) => {
      const playable = item.status === "playable";
      return `<li class="${item.id === state.episodeId ? "active" : ""} ${playable ? "" : "locked-episode"}" ${playable ? `data-episode="${escapeHtml(item.id)}" tabindex="0"` : ""}>
        <div class="ep-title">${playable ? "ÅPEN" : "ARKIVERT SENERE"} · ${escapeHtml(item.title)}</div>
        <div class="ep-intro">${escapeHtml(item.period || "")} ${playable ? `— ${escapeHtml(item.premise || "")}` : "— kommer i en senere prototype"}</div>
      </li>`;
    }).join("");
  }

  function renderSources() {
    $("#sources-list").innerHTML = DATA.sources.map((item) => `<article class="source-item">
      <div class="source-id">${escapeHtml(item.id)} <span class="source-type">${escapeHtml(item.kind)}</span></div>
      <strong>${escapeHtml(item.title)}</strong>
      <div>${escapeHtml(item.date || "")}</div>
      <p>${escapeHtml(item.note || "")}</p>
    </article>`).join("");
  }

  function ensureCategoryOptions() {
    const select = $("#lead-filter");
    const existing = new Set($$("option", select).map((option) => option.value));
    [...new Set(episode().leads.map((item) => item.category).filter(Boolean))].sort().forEach((category) => {
      const value = `category:${category}`;
      if (existing.has(value)) return;
      const option = document.createElement("option");
      option.value = value;
      option.textContent = `Kategori: ${category}`;
      select.append(option);
    });
  }

  function renderDirectory() {
    ensureCategoryOptions();
    const search = ($("#lead-search").value || "").trim().toLocaleLowerCase("nb-NO");
    const filter = $("#lead-filter").value;
    const investigated = new Set(state.investigated);
    const leads = episode().leads.filter((item) => {
      const haystack = `${item.code} ${item.title} ${item.summary} ${item.category}`.toLocaleLowerCase("nb-NO");
      if (search && !haystack.includes(search)) return false;
      if (filter === "available" && investigated.has(item.id)) return false;
      if (filter === "investigated" && !investigated.has(item.id)) return false;
      if (filter.startsWith("category:") && item.category !== filter.slice(9)) return false;
      return true;
    });

    const introParagraphs = Array.isArray(episode().intro) ? episode().intro : [episode().intro].filter(Boolean);
    const intro = `<article class="episode-brief">
      <div class="brief-stamp">EPISODE 1 · ${escapeHtml(episode().period)}</div>
      <h3>${escapeHtml(episode().title)}</h3>
      <p>${escapeHtml(episode().premise)}</p>
      ${introParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <p class="brief-caution">${escapeHtml(DATA.meta.currentFrame)} ${escapeHtml(DATA.meta.caution)}</p>
    </article>`;

    const cards = leads.length ? leads.map((item) => {
      const done = investigated.has(item.id);
      const location = locationById(item.locationId);
      return `<button class="lead-card ${done ? "investigated" : ""}" data-lead-id="${escapeHtml(item.id)}">
        <div class="lead-code">${escapeHtml(item.code)}</div>
        <div class="lead-title">${escapeHtml(item.title)}</div>
        <div class="lead-desc">${escapeHtml(item.summary)}</div>
        <div class="lead-meta">
          <span class="lead-tag">${escapeHtml(item.category)}</span>
          ${location ? `<span class="lead-tag">${escapeHtml(location.name)}</span>` : ""}
          <span class="lead-tag">${Number(item.cost || 0)} kapasitet</span>
        </div>
      </button>`;
    }).join("") : '<p class="empty-state">Ingen spor matcher søket.</p>';

    $("#leads-grid").innerHTML = intro + cards;
  }

  function claimMarkup(id) {
    const item = claim(id);
    if (!item) return "";
    return `<li><span class="epistemic-stamp tag-${escapeHtml(item.tag)}">${escapeHtml(TAG_LABELS[item.tag] || item.tag)}</span>
      <strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p>
      <small>${escapeHtml(item.confidence)} konfidens · kjent fra: ${escapeHtml(item.knownFrom)}</small></li>`;
  }

  function openLead(leadId) {
    const item = episode().leads.find((lead) => lead.id === leadId);
    if (!item) return;
    const already = state.investigated.includes(item.id);
    const modal = document.createElement("div");
    modal.className = "lead-detail-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<article class="lead-detail-card">
      <div class="lead-code">${escapeHtml(item.code)} · ${escapeHtml(item.category)}</div>
      <h3>${escapeHtml(item.title)}</h3>
      ${item.poiCaution ? `<div class="poi-caution">${escapeHtml(item.poiCaution)}</div>` : ""}
      <div class="lead-full-text">${(item.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      ${item.availabilityNote ? `<p class="availability-note">${escapeHtml(item.availabilityNote)}</p>` : ""}
      <div class="claims-revealed"><h4>Opplysninger i dette sporet</h4><ul>${(item.claimIds || []).map(claimMarkup).join("") || "<li>Ingen ny påstand.</li>"}</ul></div>
      ${(item.documentIds || []).length ? `<div class="documents-revealed"><h4>Dokumenter</h4><p>${item.documentIds.map((id) => escapeHtml(documentById(id)?.title || id)).join(" · ")}</p></div>` : ""}
      <p class="source-line"><strong>Kilder:</strong> ${escapeHtml(sourceRefs(item.sourceIds))}</p>
      <div class="modal-actions">
        <button class="btn btn-primary visit-lead" data-lead-id="${escapeHtml(item.id)}">${already ? "Sporet er undersøkt" : `Undersøk · ${Number(item.cost || 0)} kapasitet`}</button>
        <button class="btn close-modal">Lukk</button>
      </div>
    </article>`;
    document.body.append(modal);
    $(".close-modal", modal).addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    $(".visit-lead", modal).addEventListener("click", () => {
      if (!already) investigateLead(item);
      modal.remove();
    });
    $(".close-modal", modal).focus();
  }

  function investigateLead(item) {
    uniquePush(state.investigated, [item.id]);
    uniquePush(state.discoveredClaims, item.claimIds || []);
    uniquePush(state.discoveredDocs, item.documentIds || []);
    saveState();
    renderAll();
    const used = usedBudget();
    const budget = episode().leadBudget || 0;
    toast(used > budget ? "Sporet er logget. Du er over veiledende kapasitet, men kan fortsette." : "Sporet, påstandene og dokumentene er logget.");
  }

  function projectLocation(item, index) {
    const schematic = {
      "loc-southport": { x: 690, y: 300 },
      "loc-merinda-court": { x: 785, y: 345 },
      "loc-ashmore": { x: 650, y: 370 },
      "loc-tss": { x: 825, y: 280 },
      "loc-brisbane-airport": { x: 530, y: 255 },
      "loc-burleigh-heads": { x: 875, y: 405 },
      "loc-byron-bay": { x: 805, y: 485 },
      "loc-ballina": { x: 875, y: 540 },
      "loc-wollongbar": { x: 705, y: 520 },
      "loc-grafton": { x: 505, y: 515 },
      "loc-narita": { x: 830, y: 115 },
      "loc-tunbridge-wells": { x: 105, y: 145 },
      "loc-rye": { x: 205, y: 205 },
      "loc-hastings": { x: 105, y: 235 }
    };
    if (schematic[item.id]) return schematic[item.id];
    return { x: 360 + (index % 4) * 80, y: 100 + (index % 3) * 60 };
  }

  function renderMap() {
    const svg = $("#map-svg");
    const investigated = new Set(state.investigated);
    const zones = `
      <rect class="map-bg" x="20" y="20" width="960" height="560" rx="3" />
      <rect class="map-zone" x="45" y="65" width="275" height="205" /><text class="region-label" x="60" y="90">STORBRITANNIA · 1997</text>
      <rect class="map-zone" x="410" y="190" width="540" height="355" /><text class="region-label" x="430" y="218">AUSTRALIA · ØSTKYSTEN</text>
      <rect class="map-zone" x="745" y="55" width="205" height="110" /><text class="region-label" x="760" y="80">JAPAN · DOKUMENTSPOR</text>`;
    const pins = DATA.locations.map((item, index) => {
      const point = projectLocation(item, index);
      const related = episode().leads.filter((lead) => lead.locationId === item.id);
      const visited = related.some((lead) => investigated.has(lead.id));
      return `<g class="loc-pin ${visited ? "visited" : ""}" data-location-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(item.name)}" transform="translate(${point.x} ${point.y})">
        <circle class="loc-dot" r="${visited ? 8 : 6}"></circle>
        <text class="loc-label" x="11" y="4">${escapeHtml(item.name)}</text>
      </g>`;
    }).join("");
    svg.innerHTML = zones + pins;
  }

  function showMapInfo(locationId) {
    const item = locationById(locationId);
    if (!item) return;
    const related = episode().leads.filter((lead) => lead.locationId === item.id);
    const info = $("#map-info");
    info.classList.remove("hidden");
    info.innerHTML = `<h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.note)}</p>
      <p><strong>Region:</strong> ${escapeHtml(item.region)}, ${escapeHtml(item.country)}</p>
      <p><strong>Tilknyttede spor:</strong> ${related.map((lead) => escapeHtml(lead.title)).join(" · ") || "Ingen i denne episoden"}</p>
      <p class="source-line"><strong>Kilder:</strong> ${escapeHtml(sourceRefs(item.sourceIds))}</p>`;
  }

  function renderDocuments() {
    const discovered = new Set(state.discoveredDocs);
    $("#documents-grid").innerHTML = DATA.documents.map((item) => {
      const open = discovered.has(item.id);
      return `<button class="doc-card ${open ? "" : "locked"}" ${open ? `data-document-id="${escapeHtml(item.id)}"` : "disabled"}>
        <span class="doc-stamp">${open ? "ÅPNET" : escapeHtml(item.lockedUntil || "SPOR KREVES")}</span>
        <div class="doc-title">${escapeHtml(item.title)}</div>
        <div class="doc-type">${escapeHtml(item.kind)} · ${escapeHtml(item.date || item.knownFrom || "")}</div>
        ${!open ? `<p class="locked-note">${escapeHtml(item.knownFrom || "Åpnes via et relevant spor")}</p>` : ""}
      </button>`;
    }).join("");
  }

  function openDocument(documentId) {
    const item = documentById(documentId);
    if (!item || !state.discoveredDocs.includes(item.id)) return;
    $("#document-content").innerHTML = `<div class="doc-eyebrow">${escapeHtml(item.eyebrow || item.kind)}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p><strong>Dato/kunnskapstid:</strong> ${escapeHtml(item.date || item.knownFrom || "Ukjent")}</p>
      <div class="doc-body">${(item.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      <div class="document-claims"><h4>Dokumentet støtter</h4><ul>${(item.claimIds || []).map(claimMarkup).join("")}</ul></div>
      <p class="doc-source-ref"><strong>Kilder:</strong> ${escapeHtml(sourceRefs(item.sourceIds))}</p>`;
    $("#document-viewer").classList.remove("hidden");
    $(".document-close").focus();
  }

  function renderNotebook() {
    const discovered = state.discoveredClaims.map(claim).filter(Boolean);
    const pinned = new Set(state.pinnedClaims);
    const chip = (item, isPinned) => `<button class="claim-chip ${isPinned ? "pinned" : ""}" data-claim-id="${escapeHtml(item.id)}" title="${isPinned ? "Løsne" : "Fest"} påstanden">
      <span class="pin-icon">${isPinned ? "📌" : "○"}</span>
      <span>${escapeHtml(item.title)}</span>
      <span class="claim-epistemic">${escapeHtml(TAG_LABELS[item.tag] || item.tag)}</span>
    </button>`;
    $("#pinned-claims").innerHTML = discovered.filter((item) => pinned.has(item.id)).map((item) => chip(item, true)).join("") || '<p class="empty-state compact">Ingen festede påstander.</p>';
    $("#available-claims").innerHTML = discovered.filter((item) => !pinned.has(item.id)).map((item) => chip(item, false)).join("") || '<p class="empty-state compact">Undersøk flere spor for å åpne påstander.</p>';
    $("#free-notes").value = state.notes || "";

    const options = state.pinnedClaims.map((id) => claim(id)).filter(Boolean).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("");
    $("#hyp-claim-a").innerHTML = `<option value="">— Påstand A —</option>${options}`;
    $("#hyp-claim-b").innerHTML = `<option value="">— Påstand B —</option>${options}`;
    $("#hypotheses-list").innerHTML = state.hypotheses.map((item, index) => `<article class="hypothesis-item">
      <button class="hyp-remove" data-hyp-index="${index}" aria-label="Fjern kobling">✕</button>
      <div class="hyp-link">${escapeHtml(claim(item.a)?.title || item.a)} ↔ ${escapeHtml(claim(item.b)?.title || item.b)}</div>
      <div class="hyp-text">${escapeHtml(item.reasoning)}</div>
    </article>`).join("") || '<p class="empty-state compact">Ingen hypotesekoblinger ennå.</p>';
  }

  function togglePinned(claimId) {
    if (!state.discoveredClaims.includes(claimId)) return;
    if (state.pinnedClaims.includes(claimId)) {
      state.pinnedClaims = state.pinnedClaims.filter((id) => id !== claimId);
      state.hypotheses = state.hypotheses.filter((item) => item.a !== claimId && item.b !== claimId);
    } else {
      state.pinnedClaims.push(claimId);
    }
    saveState();
    renderNotebook();
  }

  function addHypothesis() {
    const a = $("#hyp-claim-a").value;
    const b = $("#hyp-claim-b").value;
    const reasoning = $("#hyp-reasoning").value.trim();
    if (!a || !b || a === b || !reasoning) {
      toast("Velg to ulike påstander og skriv et resonnement.");
      return;
    }
    state.hypotheses.push({ a, b, reasoning, createdAt: new Date().toISOString() });
    $("#hyp-reasoning").value = "";
    saveState();
    renderNotebook();
  }

  function renderDebrief() {
    const used = usedBudget();
    const budget = episode().leadBudget || 0;
    const within = used <= budget;
    $("#debrief-efficiency").innerHTML = `<div class="eff-label">Etterforskningsdebrief</div>
      <p>Du har undersøkt <strong>${state.investigated.length}</strong> av ${episode().leads.length} spor, åpnet <strong>${state.discoveredDocs.length}</strong> dokumenter og brukt <strong>${used}</strong> av ${budget} veiledende kapasitet.</p>
      <p>${within ? "Du holdt deg innenfor den veiledende rammen." : "Du fortsatte etter at den veiledende rammen var brukt opp. Det er tillatt — dette er refleksjon, ikke en highscore."}</p>
      <p class="brief-caution">Ingen debrief vurderer skyld. Den tester bare om du skiller dokumenterte fakta fra slutninger, teorier og åpne spørsmål.</p>`;

    $("#debrief-questions").innerHTML = episode().questions.map((item, index) => {
      const related = (item.claimIds || []).map(claim).filter(Boolean);
      const reflection = state.debriefSubmitted ? `<div class="debrief-reflection"><strong>Relevant kildegrunnlag:</strong><ul>${related.map((entry) => `<li><span class="epistemic-stamp tag-${escapeHtml(entry.tag)}">${escapeHtml(TAG_LABELS[entry.tag] || entry.tag)}</span> ${escapeHtml(entry.text)}</li>`).join("")}</ul></div>` : "";
      return `<article class="debrief-q"><h4>${index + 1}. ${escapeHtml(item.prompt)}</h4>
        <textarea data-question-id="${escapeHtml(item.id)}" ${state.debriefSubmitted ? "readonly" : ""}>${escapeHtml(state.answers[item.id] || "")}</textarea>${reflection}</article>`;
    }).join("") + `<button id="submit-debrief" class="btn btn-primary" ${state.debriefSubmitted ? "disabled" : ""}>${state.debriefSubmitted ? "Debrief levert" : "Lever debrief og vis kildegrunnlag"}</button>`;
  }

  function submitDebrief() {
    $$("[data-question-id]").forEach((textarea) => { state.answers[textarea.dataset.questionId] = textarea.value.trim(); });
    state.debriefSubmitted = true;
    saveState();
    renderDebrief();
    toast("Debrief lagret. Kildegrunnlaget er nå synlig.");
  }

  function setDrawer(drawerId, open) {
    ["episode-drawer", "sources-drawer"].forEach((id) => {
      const drawer = $(`#${id}`);
      drawer.classList.toggle("hidden", id !== drawerId || !open);
    });
  }

  function resetProgress() {
    if (!window.confirm("Nullstille alle lokale notater, spor og koblinger for denne prototypen?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = freshState();
    state.accepted = true;
    saveState();
    renderAll();
    toast("Lokal fremdrift er nullstilt.");
  }

  function bindEvents() {
    $("#disclaimer-accept").addEventListener("click", () => {
      state.accepted = true;
      saveState();
      showApp();
    });
    $$(".tab-btn").forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
    $("#episode-select-btn").addEventListener("click", () => setDrawer("episode-drawer", true));
    $("#sources-btn").addEventListener("click", () => setDrawer("sources-drawer", true));
    $$(".drawer-close").forEach((button) => button.addEventListener("click", () => setDrawer("", false)));
    $$(".drawer").forEach((drawer) => drawer.addEventListener("click", (event) => { if (event.target === drawer) setDrawer("", false); }));
    $("#save-btn").addEventListener("click", () => saveState(true));
    $("#reset-btn").addEventListener("click", resetProgress);
    $("#lead-search").addEventListener("input", renderDirectory);
    $("#lead-filter").addEventListener("change", renderDirectory);
    $("#free-notes").addEventListener("input", (event) => { state.notes = event.target.value; saveState(); });
    $("#hyp-add").addEventListener("click", addHypothesis);
    $(".document-close").addEventListener("click", () => $("#document-viewer").classList.add("hidden"));
    $("#document-viewer").addEventListener("click", (event) => { if (event.target.id === "document-viewer") event.currentTarget.classList.add("hidden"); });

    document.addEventListener("click", (event) => {
      const leadCard = event.target.closest("[data-lead-id]");
      if (leadCard && !leadCard.classList.contains("visit-lead")) openLead(leadCard.dataset.leadId);
      const docCard = event.target.closest("[data-document-id]");
      if (docCard) openDocument(docCard.dataset.documentId);
      const claimChip = event.target.closest("[data-claim-id]");
      if (claimChip) togglePinned(claimChip.dataset.claimId);
      const remove = event.target.closest("[data-hyp-index]");
      if (remove) {
        state.hypotheses.splice(Number(remove.dataset.hypIndex), 1);
        saveState();
        renderNotebook();
      }
      const pin = event.target.closest("[data-location-id]");
      if (pin) showMapInfo(pin.dataset.locationId);
      if (event.target.id === "submit-debrief") submitDebrief();
      const episodeItem = event.target.closest("[data-episode]");
      if (episodeItem) setDrawer("", false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setDrawer("", false);
      $$(".lead-detail-overlay").forEach((node) => node.remove());
      $("#document-viewer").classList.add("hidden");
    });
  }

  bindEvents();
  if (state.accepted) showApp();
})();
