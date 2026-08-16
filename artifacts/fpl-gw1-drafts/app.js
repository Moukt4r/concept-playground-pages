"use strict";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

const LABEL = { GKP: "Goalkeepers", DEF: "Defenders", MID: "Midfielders", FWD: "Forwards" };


const state = { data: null, squad: 0, details: null, detailPromise: null };

function fmtDate(iso) {
  if (!iso) return "unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Oslo",
  }) + " Oslo";
}
function label(key) { return String(key).replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function safeUrl(value) {
  try {
    const url = new URL(value, location.href);
    return ["http:", "https:"].includes(url.protocol) ? h(url.href) : "#";
  } catch { return "#"; }
}
function num(value, digits = 1) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}
function statValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return h(JSON.stringify(value));
  return h(value);
}

/** Tags are claims about a player, so each one must be derivable from the data. */
function tagsFor(p) {
  const out = [];
  if (p.clears_defcon) {
    out.push(`<span class="tag defcon">DefCon ${num(p.dc90)} / ${h(p.defcon_bar)}</span>`);
  } else if (p.measured === false) {
    out.push('<span class="tag unknown">No PL 2025/26 record</span>');
  }
  if (Number(p.owned) < 5) out.push(`<span class="tag diff">${num(p.owned)}% owned</span>`);
  if (Number.isFinite(Number(p.fdr3)) && Number(p.fdr3) <= 8) out.push(`<span class="tag fix">FDR ${h(p.fdr3)} in 3</span>`);
  if (p.status && p.status !== "a") out.push(`<span class="tag risk">${h(p.status_label || p.status)}</span>`);
  return out.join("");
}

function rowFor(p) {
  const cap = p.captain ? '<span class="cap">C</span>'
    : p.vice ? '<span class="cap vice">V</span>' : "";
  const content = `
    <span class="pos">${h(p.pos)}</span>
    <span class="club">${h(p.team)}</span>
    <span class="nm">${h(p.name)}${cap}</span>
    <span class="cost">£${num(p.cost)}</span>
    <span class="own">${num(p.owned)}%</span>
    <span class="pts">${p.points === null || p.points === undefined ? "—" : `${h(p.points)}p`}</span>
    <span class="tags">${tagsFor(p)}</span>`;
  if (p.id) {
    return `<button type="button" class="row player-row ${p.xi ? "" : "bench"}" data-pid="${Number(p.id)}" aria-label="Open all statistics for ${h(p.name)}">${content}</button>`;
  }
  return `<div class="row ${p.xi ? "" : "bench"}">${content}</div>`;
}

function renderSquad() {
  const d = state.data;
  const s = d.squads[state.squad];
  const groups = ["GKP", "DEF", "MID", "FWD"].map((g) => {
    const ps = s.players.filter((p) => p.pos === g)
      .sort((a, b) => (Number(b.xi) - Number(a.xi)) || (Number(b.cost) - Number(a.cost)));
    return `<div class="group"><div class="group-head">${LABEL[g]}</div>${ps.map(rowFor).join("")}</div>`;
  }).join("");
  const legal = s.legal
    ? '<span class="chip ok">Legal squad</span>'
    : `<span class="chip bad">${h((s.violations || []).join("; "))}</span>`;
  const mode = s.key === "locked"
    ? '<span class="chip current">Current server squad</span>'
    : '<span class="chip snapshot">Draft snapshot</span>';
  // Bank is null when purchase prices are unknowable from public data. A dash
  // with a tooltip is honest; "£0.0m" would be a number we cannot stand behind.
  const bank = s.bank === null || s.bank === undefined
    ? `<span class="chip" title="${h(s.bank_note || "")}"><b>Bank unknown</b></span>`
    : `<span class="chip"><b>£${num(s.bank)}m</b> bank</span>`;
  const defcon = `<span class="chip"><b>${h(s.defcon_count)}</b> clear the DefCon bar`
    + (s.defcon_unknown ? ` · ${h(s.defcon_unknown)} unknown` : "") + "</span>";

  $("#main").innerHTML = `<section class="panel">
    <p class="thesis">${h(s.thesis)}</p>
    <p class="why">${h(s.why)}</p>
    <div class="chips">
      ${mode}
      <span class="chip"><b>£${num(s.cost)}m</b> spent</span>
      ${bank}
      <span class="chip"><b>${h(s.formation)}</b></span>
      <span class="chip">C <b>${h(s.captain)}</b></span>
      <span class="chip">V <b>${h(s.vice)}</b></span>
      ${defcon}
      ${legal}
    </div>
    ${groups}
  </section>`;

  $$(".tab").forEach((el, i) => el.setAttribute("aria-selected", String(i === state.squad)));
}

function renderTabs() {
  $("#tabs").innerHTML = state.data.squads.map((s, i) =>
    `<button class="tab" data-i="${i}" aria-selected="${i === 0}">
      <b>${h(s.label)}</b>
      <small>£${num(s.cost)}m · ${h(s.formation)} · C ${h(s.captain)}</small>
    </button>`).join("");
}

async function loadDetails() {
  if (state.details) return state.details;
  if (!state.detailPromise) {
    state.detailPromise = fetch(state.data.players_url || "./players.json", { cache: "no-cache" })
      .then((r) => { if (!r.ok) throw new Error(`Player detail HTTP ${r.status}`); return r.json(); })
      .then((d) => (state.details = d));
  }
  return state.detailPromise;
}

function statGrid(entries) {
  return `<div class="stat-grid">${entries.map(([key, value]) => {
    const empty = value === null || value === undefined || value === "";
    return `<div class="stat-item ${empty ? "empty" : ""}"><em>${h(label(key))}</em><b>${statValue(value)}</b></div>`;
  }).join("")}</div>`;
}

function sourceRows(sources) {
  if (!sources) return "";
  const entries = Array.isArray(sources) ? sources.map((x, i) => [x.name || `Source ${i + 1}`, x]) : Object.entries(sources);
  return entries.map(([name, src]) => {
    const value = typeof src === "object" && src ? src : { status: src };
    const bits = [
      value.describes, value.status, value.coverage, value.season,
      value.error ? `error: ${value.error}` : "",
      value.captured_at ? fmtDate(value.captured_at) : "",
    ].filter(Boolean);
    return `<li><b>${h(label(name))}</b>${bits.length ? ` — ${h(bits.join(" · "))}` : ""}</li>`;
  }).join("");
}

function fixturesTable(fixtures) {
  if (!fixtures?.length) return '<p class="dim">No upcoming fixture rows were returned.</p>';
  const rows = fixtures.map((f) => {
    const event = f.event_name || (f.event ? `GW${f.event}` : "—");
    const opp = f.opponent_name || f.opponent || f.opp || "—";
    const where = f.is_home === true ? "H" : f.is_home === false ? "A" : (f.where || "");
    const diff = f.difficulty ?? f.d ?? "—";
    const kickoff = f.kickoff_time ? fmtDate(f.kickoff_time) : "TBC";
    return `<tr><td>${h(event)}</td><td class="left">${h(opp)} ${h(where)}</td><td>${h(diff)}</td><td class="left">${h(kickoff)}</td></tr>`;
  }).join("");
  return `<div class="table-scroll"><table class="detail-table"><thead><tr><th>GW</th><th class="left">Opponent</th><th>FDR</th><th class="left">Kickoff</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function newsList(news) {
  // The backend emits a block, not a bare list: an empty list with a stated
  // reason is a real answer, and must not render the same as a failed fetch.
  const items = Array.isArray(news) ? news : (news?.articles || []);
  const note = Array.isArray(news) ? "" : (news?.note || "");
  if (!items.length) {
    return `<p class="dim">${h(note || "No official Premier League article matched this player.")}</p>`;
  }
  return `<div class="news-list">${items.map((item) => `<a class="news-link" href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer">
    <span><b>${h(item.title)}</b>${item.description ? `<small>${h(item.description)}</small>` : ""}</span>
    <time>${h(item.date ? fmtDate(item.date) : "")}</time>
  </a>`).join("")}</div>`;
}

function historyTable(history) {
  if (!history?.length) return '<p class="dim">No completed-season rows were returned.</p>';
  const rows = [...history].reverse().map((r) => `<tr>
    <td class="left">${h(r.season_name || r.season || "—")}</td>
    <td>${h(r.total_points ?? "—")}</td><td>${h(r.starts ?? "—")}</td><td>${h(r.minutes ?? "—")}</td>
    <td>${h(r.goals_scored ?? "—")}</td><td>${h(r.assists ?? "—")}</td>
    <td>${h(r.expected_goal_involvements ?? "—")}</td>
  </tr>`).join("");
  return `<div class="table-scroll"><table class="detail-table"><thead><tr><th class="left">Season</th><th>Pts</th><th>Starts</th><th>Min</th><th>G</th><th>A</th><th>xGI</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/** `[["Title", {stat: value}], ...]` - the shape every exported stat block uses. */
function renderGroupPairs(pairs, prefix = "") {
  return (pairs || []).map(([title, values]) => {
    const rows = Object.entries(values || {});
    return rows.length
      ? `<section class="stat-group"><h4>${h(prefix ? `${prefix} · ${title}` : title)}</h4>${statGrid(rows)}</section>`
      : "";
  }).join("");
}

function renderPulselive(pulse) {
  if (!pulse) return "";
  const head = `Premier League event data · ${h(pulse.season || "")}`;
  if (pulse.coverage !== "covered") {
    return `<section class="stat-group"><h4>${head}</h4>`
      + `<div class="coverage-missing">${h(pulse.coverage_note || "No prior-season record was available. Missing is not zero.")}</div></section>`;
  }
  const reported = `<p class="dim">${h(pulse.stats_reported)} of ${h(pulse.stats_requested)} requested statistics were reported for this player. A blank is not reported, never a measured zero.</p>`;
  const extra = pulse.ungrouped && Object.keys(pulse.ungrouped).length
    ? `<section class="stat-group"><h4>Premier League · ${h(pulse.ungrouped_count)} further Opta fields</h4>`
      + `<p class="dim">Everything else the Premier League returned for this player, unfiltered.</p>`
      + statGrid(Object.entries(pulse.ungrouped).sort(([a], [b]) => a.localeCompare(b))) + "</section>"
    : "";
  // Prefixed because "Defending" and "Discipline" exist in both sources and
  // count different things: two headings with one name is how a reader
  // compares an Opta tackle count with an FPL bonus input by accident.
  return `<section class="stat-group"><h4>${head}</h4>${reported}</section>`
    + renderGroupPairs(pulse.groups, "Premier League") + extra;
}

function renderDetail(detail) {
  const derived = { ...(detail.derived || {}) };
  const defcon = derived.defcon || {};
  delete derived.defcon;
  const reason = derived.no_data_reason;
  delete derived.no_data_reason;

  const defconRows = [
    ["defcon_per_90", defcon.per_90],
    ["defcon_bar", defcon.bar],
    ["clears_the_bar", defcon.clears],
    ["defcon_total", defcon.total],
    ["cap_per_match", defcon.cap_per_match],
  ];
  const status = detail.status || {};
  const statusLine = [detail.team_name, detail.pos, `£${num(detail.cost)}`,
    status.label || status.status || "—"].filter(Boolean).join(" · ");

  $("#modal-title").textContent = detail.full_name || detail.name || "Player";
  $("#modal-sub").textContent = statusLine;
  $("#modal-body").innerHTML = `
    ${reason ? `<div class="coverage-missing">${h(reason)}</div>` : ""}
    <section class="derived-box"><h4>Derived rates</h4>
      ${statGrid(Object.entries(derived))}
    </section>
    <section class="stat-group"><h4>Defensive contribution</h4>${statGrid(defconRows)}
      ${defcon.note ? `<p class="dim">${h(defcon.note)}</p>` : ""}</section>
    <section class="stat-group"><h4>Next fixtures</h4>${fixturesTable(detail.fixtures)}</section>
    <section class="stat-group"><h4>Relevant Premier League news</h4>${newsList(detail.news)}</section>
    <section class="stat-group"><h4>Completed FPL seasons</h4>${historyTable(detail.element_summary?.history_past)}</section>
    ${renderPulselive(detail.pulselive)}
    ${renderGroupPairs(detail.fpl?.groups, "FPL")}
    ${detail.fpl?.ungrouped?.length
      ? `<section class="stat-group"><h4>FPL · ${h(detail.fpl.ungrouped.length)} unclaimed field names</h4>`
        + `<p class="dim">Fields the API returns that no group above claims. Named rather than dropped, so nothing is hidden — values are in <a href="players.json">players.json</a>.</p>`
        + `<p class="dim mono">${detail.fpl.ungrouped.map((k) => h(k)).join(", ")}</p></section>`
      : ""}
    <section class="provenance"><h4>Coverage and provenance</h4>
      <ul>${sourceRows(state.data.sources)}</ul>
      <ul>${(state.data.caveats || []).map((x) => `<li>${h(x)}</li>`).join("")}</ul>
    </section>`;
}

async function openPlayer(id) {
  const modal = $("#modal");
  $("#modal-title").textContent = "Player statistics";
  $("#modal-sub").textContent = "Loading official API data…";
  $("#modal-body").innerHTML = '<div class="loading">Loading player detail…</div>';
  modal.dataset.open = "1";
  document.body.style.overflow = "hidden";
  try {
    const details = await loadDetails();
    const detail = details[String(Number(id))] || details[Number(id)];
    if (!detail) throw new Error("No detail entry was exported for this player.");
    renderDetail(detail);
  } catch (error) {
    $("#modal-body").innerHTML = `<div class="coverage-missing">${h(error.message)}</div>`;
  }
}
function closeModal() {
  $("#modal").dataset.open = "0";
  document.body.style.overflow = "";
}

function bindEvents() {
  $("#tabs").addEventListener("click", (event) => {
    const btn = event.target.closest(".tab");
    if (!btn) return;
    state.squad = Number(btn.dataset.i);
    renderSquad();
  });
  $("#main").addEventListener("click", (event) => {
    const row = event.target.closest("[data-pid]");
    if (row) openPlayer(row.dataset.pid);
  });
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (event) => { if (event.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
}

async function main() {
  const res = await fetch("data.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Squad data HTTP ${res.status}`);
  state.data = await res.json();
  const d = state.data;
  $("#meta").textContent =
    `Gameweek 1 deadline ${fmtDate(d.deadline)} · squad/API refresh ${fmtDate(d.generated_at)} `
    + `· budget £${num(d.rules?.budget)}m · max ${h(d.rules?.max_per_club)} per club`;
  $("#foot-meta").textContent =
    `Official FPL API captured ${fmtDate(d.api_snapshot || d.generated_at)}. `
    + `Player detail is loaded on demand from ${h(d.players_count || 0)} exported squad records. `
    + "Unavailable historical coverage is shown as unavailable, never as a measured zero.";
  renderTabs();
  bindEvents();
  renderSquad();
}

main().catch((error) => {
  $("#main").innerHTML = `<section class="panel"><h2>Squad unavailable</h2><p>${h(error.message)}</p></section>`;
});
