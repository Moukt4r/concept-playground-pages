(() => {
  "use strict";

  const ROUTES = [
    ["overview", "Overview"],
    ["players", "Players"],
    ["squads", "Squads"],
    ["chips", "Chips"],
    ["preseason", "Pre-season"],
    ["analytics", "Analytics"],
    ["teams", "Clubs"],
    ["setpieces", "Set pieces"],
    ["news", "News"],
  ];
  const POS_ORDER = { GKP: 1, DEF: 2, MID: 3, FWD: 4 };
  const state = {
    data: null,
    compact: new Map(),
    details: null,
    detailPromise: null,
    rendered: new Set(),
    route: "overview",
    squad: 0,
    playerFilters: { query: "", pos: "ALL", team: "ALL", maxCost: "ALL" },
    playerSort: { key: "projected", dir: -1 },
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const h = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const dash = (value, suffix = "") => value === null || value === undefined || value === ""
    ? "—" : `${h(value)}${suffix}`;
  const num = (value, digits = 1) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(digits) : "—";
  };
  const dateText = (value, withTime = true) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      timeZone: "Europe/Oslo",
    }).format(date);
  };
  const ago = (value) => {
    const ms = Date.now() - new Date(value).getTime();
    if (!Number.isFinite(ms)) return "unknown age";
    const hours = Math.max(0, Math.floor(ms / 3_600_000));
    if (hours < 1) return "updated less than an hour ago";
    if (hours < 48) return `updated ${hours}h ago`;
    return `updated ${Math.floor(hours / 24)}d ago`;
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:"].includes(url.protocol) ? h(url.href) : "#";
    } catch { return "#"; }
  };
  const label = (key) => String(key).replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  const playerAttrs = (id) => `data-pid="${Number(id)}" tabindex="0"`;
  const posBadge = (pos) => `<span class="pos ${h(pos)}">${h(pos)}</span>`;
  const fdrClass = (value) => `fdr-${Math.max(1, Math.min(5, Math.round(Number(value) || 3)))}`;

  function setPieceTags(pieces = {}) {
    const tags = [];
    if (pieces.penalties) tags.push(`<span class="sp sp-pen${pieces.penalties <= 1 ? 1 : 2}">P${h(pieces.penalties)}</span>`);
    if (pieces.direct_fk) tags.push(`<span class="sp sp-fk">FK${h(pieces.direct_fk)}</span>`);
    if (pieces.corners) tags.push(`<span class="sp sp-ck">CK${h(pieces.corners)}</span>`);
    return tags.join("");
  }

  function compactRow(row, rank) {
    return `<tr ${playerAttrs(row.id)}>
      ${rank === undefined ? "" : `<td class="rank">${rank}</td>`}
      <td class="left"><div class="who"><span class="name">${h(row.name)}</span><span class="club">${h(row.team)}</span>${row.new_club ? '<span class="newclub">NEW</span>' : ""}</div></td>
      <td>${posBadge(row.pos)}</td>
      <td>£${num(row.cost)}</td>
      <td class="big accent">${num(row.projected)}</td>
      <td>${num(row.per_million, 2)}</td>
      <td>${dash(row.start_share, "%")}${row.rotation_risk ? ' <span class="risk">RISK</span>' : ""}</td>
      <td>${dash(row.own, "%")}</td>
    </tr>`;
  }

  function rankingTable(rows, limit = 10) {
    const body = (rows || []).slice(0, limit).map((row, i) => compactRow(row, i + 1)).join("");
    return `<div class="table-scroll"><table>
      <thead><tr><th>#</th><th class="left">Player</th><th>Pos</th><th>Price</th><th>Proj</th><th>Pts/£m</th><th>Start</th><th>Own</th></tr></thead>
      <tbody>${body || '<tr><td colspan="8" class="left dim">No players available.</td></tr>'}</tbody>
    </table></div>`;
  }

  function viewHeader(title, text) {
    return `<header class="vh"><h1>${h(title)}</h1><p>${h(text)}</p></header>`;
  }
  function panel(title, note, body) {
    return `<section class="panel"><div class="panel-head"><h2>${h(title)}</h2>${note ? `<p>${h(note)}</p>` : ""}</div>${body}</section>`;
  }

  function renderNav() {
    const d = state.data;
    $("#nav").innerHTML = ROUTES.map(([key, title]) => {
      let count = "";
      if (key === "players") count = d.all_players?.length;
      if (key === "squads") count = d.squads?.length;
      if (key === "teams") count = d.teams?.length;
      if (key === "news") count = d.news?.length;
      if (key === "chips") count = d.chips?.suggestions?.length;
      if (key === "preseason") count = d.preseason_view?.counts?.flagged;
      if (key === "analytics") count = state.analytics?.charts?.length;
      return `<button class="navtab" data-route="${key}" role="tab" aria-current="false">${h(title)}${count !== "" ? `<span class="count">${h(count)}</span>` : ""}</button>`;
    }).join("");
    $("#stale").innerHTML = `<span title="Generated ${h(dateText(d.generated_at))}">${h(ago(d.generated_at))}</span>`;
  }

  function renderOverview() {
    const d = state.data;
    const best = d.by_total?.[0];
    const bestValue = d.by_value?.[0];
    const deadline = d.deadline ? dateText(d.deadline) : "Not announced";
    const caveats = (d.caveats || []).map(x => `<li>${h(x)}</li>`).join("");
    const fixtureRows = (d.fixtures || []).slice(0, 10).map((x, i) => `<tr>
      <td class="rank">${i + 1}</td><td class="left"><b>${h(x.team)}</b></td><td>${num(x.mean, 2)}</td>
      <td>${h((x.list || []).join(" · "))}</td><td>${dash(x.home)}</td>
    </tr>`).join("");
    const consensus = (d.consensus || []).slice(0, 14).map(x => `<div class="cons-row" ${playerAttrs(x.id)}>
      <b>${h(x.name)}</b><div class="pips">${Array.from({ length: d.squads?.length || 6 }, (_, i) => `<span class="pip ${i < x.picked_by ? "on" : ""}"></span>`).join("")}</div>
      <span class="cons-note">${h(x.picked_by)}/${h(x.of)} · ${h(x.team)} ${h(x.pos)}</span>
    </div>`).join("");

    $("#view-overview").innerHTML = `${viewHeader("Decision room", "The useful signals first. Every player and squad opens into the evidence behind it.")}
      <div class="ov-grid">
        <div class="ov-card"><h3>Gameweek</h3><div class="v">${h(d.gw_name || "—")}</div><div class="s">Deadline ${h(deadline)}</div></div>
        <div class="ov-card miniclick" data-route="players"><h3>Projected players</h3><div class="v">${dash(d.counts?.players_projected)}</div><div class="s">of ${dash(d.counts?.players_total)} in FPL</div></div>
        <div class="ov-card miniclick" ${best ? playerAttrs(best.id) : ""}><h3>Highest projection</h3><div class="v accent">${best ? num(best.projected) : "—"}</div><div class="s">${best ? `${h(best.name)} · ${h(best.team)}` : "No projection"}</div></div>
        <div class="ov-card miniclick" ${bestValue ? playerAttrs(bestValue.id) : ""}><h3>Best value</h3><div class="v accent-2">${bestValue ? num(bestValue.per_million, 2) : "—"}</div><div class="s">${bestValue ? `${h(bestValue.name)} · pts per £m` : "No projection"}</div></div>
      </div>
      ${d.preseason ? `<div class="warn"><h2>Pre-season model</h2><ul>${caveats}</ul></div>` : ""}
      <div class="grid2">
        ${panel("Projected points", `Next ${d.horizon || "—"} gameweeks`, rankingTable(d.by_total, 10))}
        ${panel("Value", "Projected points per £1m", rankingTable(d.by_value, 10))}
      </div>
      <div class="grid2">
        ${panel("Fixture runway", "Lowest mean FDR across the exported run", `<div class="table-scroll"><table><thead><tr><th>#</th><th class="left">Club</th><th>Mean</th><th>Run</th><th>Home</th></tr></thead><tbody>${fixtureRows || '<tr><td colspan="5" class="left dim">No fixture data.</td></tr>'}</tbody></table></div>`)}
        ${panel("Squad consensus", "Players selected by multiple independent strategies", `<div class="cons-grid">${consensus || '<div class="dim">No consensus data.</div>'}</div>`)}
      </div>`;
  }

  function playerValue(row, key) {
    if (key === "name") return row.name || "";
    if (key === "team") return row.team || "";
    if (key === "pos") return POS_ORDER[row.pos] || 9;
    return Number(row[key]);
  }

  function filteredPlayers() {
    const f = state.playerFilters;
    const query = f.query.trim().toLowerCase();
    return (state.data.all_players || []).filter(p => {
      if (query && !`${p.name} ${p.team}`.toLowerCase().includes(query)) return false;
      if (f.pos !== "ALL" && p.pos !== f.pos) return false;
      if (f.team !== "ALL" && p.team !== f.team) return false;
      if (f.maxCost !== "ALL" && Number(p.cost) > Number(f.maxCost)) return false;
      return true;
    }).sort((a, b) => {
      const av = playerValue(a, state.playerSort.key);
      const bv = playerValue(b, state.playerSort.key);
      if (typeof av === "string") return av.localeCompare(bv) * state.playerSort.dir;
      const aa = Number.isFinite(av) ? av : -Infinity;
      const bb = Number.isFinite(bv) ? bv : -Infinity;
      return (aa - bb) * state.playerSort.dir;
    });
  }

  const PLAYER_COLUMNS = [
    ["name", "Player", "left"], ["pos", "Pos", ""], ["cost", "Price", ""],
    ["projected", "Proj 3GW", ""], ["per_gw", "Proj/GW", ""], ["ep", "FPL ep", ""],
    ["per_million", "Pts/£m", ""], ["rate_per_90", "Pts/90", ""],
    ["exp_minutes", "Exp min", ""], ["start_share", "Start %", ""], ["pts", "Last pts", ""],
    ["xgi", "xGI", ""], ["own", "Own %", ""],
  ];

  function renderPlayerBody() {
    const rows = filteredPlayers();
    $("#players-result-count").textContent = `${rows.length} of ${state.data.all_players?.length || 0}`;
    $("#players-body").innerHTML = rows.map(p => `<tr ${playerAttrs(p.id)}>
      <td class="left"><div class="who"><span class="name">${h(p.name)}</span><span class="club">${h(p.team)}</span>${p.new_club ? '<span class="newclub">NEW</span>' : ""}</div></td>
      <td>${posBadge(p.pos)}</td><td>£${num(p.cost)}</td><td class="big accent">${num(p.projected)}</td>
      <td>${num(p.per_gw)}</td><td class="accent-2">${num(p.ep)}</td>
      <td>${num(p.per_million, 2)}</td><td>${num(p.rate_per_90, 2)}</td><td>${dash(p.exp_minutes)}</td>
      <td>${dash(p.start_share, "%")}${p.rotation_risk ? ' <span class="risk">RISK</span>' : ""}</td>
      <td>${dash(p.pts)}</td><td>${num(p.xgi, 2)}</td><td>${dash(p.own, "%")}</td>
    </tr>`).join("") || '<tr><td colspan="13" class="left dim">No players match these filters.</td></tr>';
    $$("#players-table th[data-sort]").forEach(th => {
      const on = th.dataset.sort === state.playerSort.key;
      const base = th.dataset.title;
      th.innerHTML = `${h(base)}${on ? ` <span class="arrow">${state.playerSort.dir > 0 ? "▲" : "▼"}</span>` : ""}`;
    });
  }

  function renderPlayers() {
    const teams = [...new Set((state.data.all_players || []).map(p => p.team))].sort();
    const headers = PLAYER_COLUMNS.map(([key, title, cls]) => `<th class="${cls}" data-sort="${key}" data-title="${h(title)}">${h(title)}</th>`).join("");
    $("#view-players").innerHTML = `${viewHeader("Player explorer", "Two independent numbers per player: our three-gameweek projection and FPL's own one-gameweek expected points. Where they disagree is where the thinking is.")}
      <section class="panel">
        <div class="filters">
          <input id="player-search" type="search" placeholder="Search player or club…" aria-label="Search players">
          <div class="pill-row" id="pos-filters">${["ALL", "GKP", "DEF", "MID", "FWD"].map(x => `<button class="pill" data-pos="${x}" aria-pressed="${x === "ALL"}">${x === "ALL" ? "All" : x}</button>`).join("")}</div>
          <select id="team-filter" aria-label="Filter by club"><option value="ALL">All clubs</option>${teams.map(x => `<option value="${h(x)}">${h(x)}</option>`).join("")}</select>
          <select id="cost-filter" aria-label="Filter by maximum price"><option value="ALL">Any price</option>${[4.5, 5, 6, 7, 8, 10, 12].map(x => `<option value="${x}">Up to £${num(x)}</option>`).join("")}</select>
          <span class="rescount" id="players-result-count"></span>
        </div>
        <div class="table-scroll"><table id="players-table"><thead><tr>${headers}</tr></thead><tbody id="players-body"></tbody></table></div>
      </section>`;
    renderPlayerBody();
  }

  function squadPlayerCard(p) {
    const badge = p.captain ? '<span class="badge">C</span>' : p.vice ? '<span class="badge v">V</span>' : "";
    return `<div class="card ${p.captain ? "cap" : p.vice ? "vc" : ""}" ${playerAttrs(p.id)}>${badge}
      <div class="card-name">${h(p.name)}</div><div class="card-meta">${h(p.team)} · ${h(p.pos)} · £${num(p.cost)}</div>
      <div class="card-proj">${num(p.projected)} pts</div><div class="card-tags">${setPieceTags(p.set_pieces)}${p.new_club ? '<span class="newclub">NEW</span>' : ""}${p.rotation_risk ? '<span class="risk">RISK</span>' : ""}</div>
    </div>`;
  }

  function squadPitch(squad) {
    if (!squad) return '<div class="nw-empty">No squad data.</div>';
    const line = pos => `<div class="line">${squad.xi.filter(p => p.pos === pos).map(squadPlayerCard).join("")}</div>`;
    return `<div class="sq-head"><div class="sq-why">${h(squad.rationale)}</div>
      <div class="stat"><b>£${num(squad.cost)}</b><span>Cost</span></div><div class="stat"><b>£${num(squad.bank)}</b><span>Bank</span></div>
      <div class="stat"><b>${num(squad.projected_xi)}</b><span>XI proj</span></div><div class="stat"><b>${h(squad.formation)}</b><span>Shape</span></div>
    </div><div class="pitch">${line("GKP")}${line("DEF")}${line("MID")}${line("FWD")}
      <div class="bench-strip"><div class="bench-label">Bench</div><div class="line">${squad.bench.map(squadPlayerCard).join("")}</div></div>
    </div>${squad.legal ? "" : `<div class="warn"><h2>Illegal squad</h2><ul>${(squad.violations || []).map(x => `<li>${h(x)}</li>`).join("")}</ul></div>`}`;
  }

  function renderSquads() {
    const squads = state.data.squads || [];
    $("#view-squads").innerHTML = `${viewHeader("Squad laboratory", "Six legal squads answer six different questions. Compare the assumptions, not just the totals.")}
      <section class="panel"><div class="sq-tabs" id="squad-tabs">${squads.map((s, i) => `<button class="sq-tab" data-squad="${i}" aria-selected="${i === state.squad}">${h(s.label)}<small>${num(s.projected_xi)} pts · £${num(s.cost)}</small></button>`).join("")}</div>
      <div id="squad-pitch">${squadPitch(squads[state.squad])}</div></section>`;
  }

  function parseFixture(text) {
    const match = String(text).match(/^(.*)\[(\d)\]$/);
    return { text: match ? match[1] : String(text), fdr: match ? Number(match[2]) : 3 };
  }

  function renderTeams() {
    const cards = (state.data.teams || []).map(t => {
      const fixtures = (t.fixtures || []).map(raw => { const fx = parseFixture(raw); return `<span class="tm-fdr ${fdrClass(fx.fdr)}" title="FDR ${fx.fdr}">${h(fx.text)}</span>`; }).join("");
      return `<article class="tm-card ${t.regulars < 11 ? "thin" : ""}">
        <div class="tm-top"><span class="tm-abbr">${h(t.team)}</span><span class="tm-full">${h(t.name)}</span><span class="tm-proj">${num(t.projected_total)}</span></div>
        <div class="tm-fx">${fixtures || '<span class="dim">No fixtures</span>'}</div>
        <div class="tm-rows">
          <div class="tm-row"><em>Best projection</em><b>${h(t.best || "—")} · ${num(t.best_projected)}</b></div>
          <div class="tm-row"><em>Mean FDR</em><b>${num(t.mean_fdr, 2)}</b></div>
          <div class="tm-row"><em>Squad / regulars</em><b>${dash(t.squad_size)} / ${dash(t.regulars)}</b></div>
          <div class="tm-row"><em>Goals / xG / xGC</em><b>${dash(t.goals)} / ${num(t.xg)} / ${num(t.xgc)}</b></div>
          <div class="tm-row"><em>Price span</em><b>£${num(t.cheapest)}–${num(t.priciest)}</b></div>
          <div class="tm-row"><em>Clean-sheet rank</em><b><span class="tm-cs">#${dash(t.clean_sheet_rank)}</span></b></div>
        </div>
        <div class="tm-sp"><span>P: <b>${h(t.penalty_taker || "—")}</b></span><span>FK: <b>${h(t.fk_taker || "—")}</b></span><span>CK: <b>${h(t.corner_taker || "—")}</b></span></div>
        ${t.new_signings || t.unavailable ? `<div class="tm-note">${t.new_signings ? `${h(t.new_signings)} new signing${t.new_signings === 1 ? "" : "s"}. ` : ""}${t.unavailable ? `${h(t.unavailable)} unavailable.` : ""}</div>` : ""}
      </article>`;
    }).join("");
    $("#view-teams").innerHTML = `${viewHeader("Club profiles", "Fixtures, squad depth, attack history and set-piece ownership in one scan.")}
      ${panel("All 20 clubs", "Projected total is the sum of exported player projections, not a league forecast", `<div class="tm-grid">${cards || '<div class="dim">No club profiles.</div>'}</div>`)}`;
  }

  function takerList(items = []) {
    return items.length ? items.map(p => `<span class="sp-taker" ${playerAttrs(p.id)}><span class="sp-nm">${h(p.name)}</span> <span class="sp-rk">#${h(p.rank)}</span></span>`).join("") : '<span class="dim">—</span>';
  }

  function renderSetPieces() {
    const cards = (state.data.set_pieces || []).map(t => `<article class="sp-card"><div class="sp-team">${h(t.team)}</div>
      <div class="sp-line"><span class="sp-kind">Pens</span><div class="sp-takers">${takerList(t.penalties)}</div></div>
      <div class="sp-line"><span class="sp-kind">Free</span><div class="sp-takers">${takerList(t.direct_fk)}</div></div>
      <div class="sp-line"><span class="sp-kind">Corner</span><div class="sp-takers">${takerList(t.corners)}</div></div>
    </article>`).join("");
    $("#view-setpieces").innerHTML = `${viewHeader("Set-piece map", "FPL's declared order, normalised within each club. Rank is opportunity—not a guarantee of minutes.")}
      ${panel("Declared takers", "P = penalties, free = direct free kicks", `<div class="sp-grid">${cards || '<div class="dim">No set-piece data.</div>'}</div>`)}`;
  }

  function renderNews() {
    const news = state.data.news || [];
    const rows = news.map(n => `<article class="nw-item">
      <div class="nw-score ${Number(n.score) >= 8 ? "hot" : ""}" title="Relevance score">${dash(n.score)}</div>
      <div><div class="nw-title"><a href="${safeUrl(n.link)}" target="_blank" rel="noopener noreferrer">${h(n.title)}</a></div>
      <div class="nw-meta">${h(n.source || "Unknown source")} · ${h(dateText(n.published || n.seen_at))}</div>
      ${n.summary ? `<div class="nw-meta">${h(n.summary)}</div>` : ""}
      <div class="nw-tags">${(n.players || []).map(p => `<span class="nw-player" ${playerAttrs(p.id)}>${h(p.name)} · ${h(p.team)}</span>`).join("")}${(n.teams || []).map(t => `<span class="nw-club">${h(t)}</span>`).join("")}</div></div>
    </article>`).join("");
    $("#view-news").innerHTML = `${viewHeader("News desk", "Conservative player matching from public RSS feeds. Ambiguous names are intentionally dropped rather than guessed.")}
      ${panel("FPL-relevant headlines", `${news.length} items in the current export · headline, source link and our short relevance summary only`, rows ? `<div class="nw-list">${rows}</div>` : '<div class="nw-empty">No player-linked news in the current scan. That means “nothing matched safely”, not “nothing happened”.</div>')}`;
  }

  function renderChips() {
    const c = state.data.chips;
    if (!c) {
      $("#view-chips").innerHTML = `${viewHeader("Chips", "No chip data in this export.")}`;
      return;
    }
    const windowRows = (c.windows || []).map(w => `<tr>
      <td class="left"><b>${h(w.label)}</b></td><td>GW${h(w.start_gw)}–${h(w.stop_gw)}</td>
      <td>Half ${h(w.half)}</td><td class="left dim">${h(w.type)}</td></tr>`).join("");

    const byChip = {};
    for (const s of c.suggestions || []) (byChip[s.label] ??= []).push(s);

    const groups = Object.entries(byChip).map(([label, items]) => {
      const rows = items.map(s => {
        const ties = (s.tied_with || []).length > 1
          ? `<div class="nw-meta">Tied with ${s.tied_with.length} other gameweeks — pick on form, not on this order.</div>` : "";
        const caveats = (s.caveats || []).map(x => `<div class="tm-note">${h(x)}</div>`).join("");
        return `<article class="nw-item">
          <div class="nw-score ${s.confidence === "medium" ? "" : "hot"}" title="Confidence: ${h(s.confidence)}">GW${h(s.gw)}</div>
          <div><div class="nw-title">${h(s.reason)}</div>
          <div class="nw-meta">Confidence: <b>${h(s.confidence)}</b> · score ${num(s.score, 2)}</div>
          ${ties}${caveats}</div></article>`;
      }).join("");
      return panel(label, `${items.length} candidate gameweek(s)`, `<div class="nw-list">${rows}</div>`);
    }).join("");

    const noneRanked = !(c.suggestions || []).length
      ? `<div class="nw-empty">No gameweek is ranked. That is the honest answer, not a missing feature — see the notes above.</div>` : "";

    $("#view-chips").innerHTML = `${viewHeader("Chip timing", "Ranked against a squad, never against the league. Fixture difficulty is coarse, so equal weeks are shown as ties rather than a false order.")}
      <div class="warn"><h2>What the fixture list actually says</h2><ul>${(c.status || []).map(x => `<li>${h(x)}</li>`).join("")}</ul></div>
      <div class="ov-grid">
        <div class="ov-card"><h3>Doubles scheduled</h3><div class="v">${c.doubles_scheduled ? "Yes" : "None"}</div><div class="s">Bench Boost / Triple Captain depend on these</div></div>
        <div class="ov-card"><h3>Blanks scheduled</h3><div class="v">${c.blanks_scheduled ? "Yes" : "None"}</div><div class="s">Free Hit answers a blank gameweek</div></div>
        <div class="ov-card"><h3>Reference squad</h3><div class="v" style="font-size:1.1rem">${h(c.squad || "—")}</div><div class="s">Change the squad and the answer changes</div></div>
      </div>
      ${panel("Chip windows", "Read from FPL, not assumed — unused first-half chips expire after GW19", `<div class="table-scroll"><table><thead><tr><th class="left">Chip</th><th>Window</th><th>Half</th><th class="left">Type</th></tr></thead><tbody>${windowRows}</tbody></table></div>`)}
      ${groups}${noneRanked}`;
  }

  function renderPreseason() {
    const p = state.data.preseason_view;
    if (!p) {
      $("#view-preseason").innerHTML = viewHeader("Pre-season", "No pre-season data in this export.");
      return;
    }
    const c = p.counts || {};
    const fixtureRow = (f) => {
      const score = f.played
        ? `<b class="${f.outcome === "W" ? "accent" : f.outcome === "L" ? "" : "dim"}">${h(f.scored)}–${h(f.conceded)}</b>`
        : '<span class="dim">—</span>';
      const link = f.link ? ` <a href="${safeUrl(f.link)}" target="_blank" rel="noopener noreferrer">${f.played ? "Report" : "Details"}</a>` : "";
      return `<tr><td class="left dim">${h(f.date)}</td>
        <td class="left"><b>${h(f.club)}</b></td>
        <td>${f.played ? `<span class="sp ${f.outcome === "W" ? "sp-pen1" : f.outcome === "L" ? "sp-fk" : "sp-ck"}">${h(f.outcome)}</span>` : ""}</td>
        <td>${score}</td>
        <td class="left">${h(f.opponent)}${f.venue ? ` <span class="club">(${h(f.venue)})</span>` : ""}${f.competition ? ` <span class="newclub">${h(f.competition)}</span>` : ""}${link}</td></tr>`;
    };
    const table = (rows, empty) => `<div class="table-scroll"><table><thead><tr><th class="left">Date</th><th class="left">Club</th><th></th><th>Score</th><th class="left">Opponent</th></tr></thead><tbody>${rows.map(fixtureRow).join("") || `<tr><td colspan="5" class="left dim">${h(empty)}</td></tr>`}</tbody></table></div>`;

    const availRows = (p.availability || []).map(r => `<tr ${playerAttrs(r.id)}>
      <td class="left"><div class="who"><span class="name">${h(r.name)}</span><span class="club">${h(r.team)}</span></div></td>
      <td>${posBadge(r.pos)}</td><td>£${num(r.cost)}</td>
      <td><span class="sp ${r.status === "a" ? "sp-ck" : r.status === "d" ? "sp-fk" : "sp-pen1"}">${h(r.status_label)}</span></td>
      <td>${r.chance === null || r.chance === undefined ? "—" : h(r.chance) + "%"}</td>
      <td>${dash(r.selected_by, "%")}</td>
      <td class="left dim">${h(r.news || "—")}</td></tr>`).join("");

    const signingRows = (p.new_signings || []).map(r => `<tr ${playerAttrs(r.id)}>
      <td class="left"><div class="who"><span class="name">${h(r.name)}</span><span class="club">${h(r.team)}</span><span class="newclub">NEW</span></div></td>
      <td>${posBadge(r.pos)}</td><td>£${num(r.cost)}</td>
      <td class="dim">${h(r.joined || "—")}</td>
      <td>${dash(r.total_points)}</td><td>${dash(r.minutes)}</td><td>${dash(r.selected_by, "%")}</td></tr>`).join("");

    const clubRows = (p.clubs || []).map(t => `<tr>
      <td class="left"><b>${h(t.club)}</b></td>
      <td>${h(t.played)}</td>
      <td><span class="dim">${h(t.won)}–${h(t.drawn)}–${h(t.lost)}</span></td>
      <td>${h(t.scored)}–${h(t.conceded)}</td>
      <td>${h(t.upcoming)}</td></tr>`).join("");

    $("#view-preseason").innerHTML = `${viewHeader("Pre-season", "Friendlies, fitness flags and summer moves — the only genuinely current signals before a ball is kicked.")}
      ${p.fetched_ok ? "" : '<div class="warn"><h2>Friendly fixtures unavailable</h2><ul><li>The source page could not be loaded for this build. Availability and signings below are unaffected — they come straight from FPL.</li></ul></div>'}
      <div class="ov-grid">
        <div class="ov-card"><h3>Friendlies played</h3><div class="v">${dash(c.played)}</div><div class="s">${dash(c.upcoming)} still to come</div></div>
        <div class="ov-card"><h3>Flagged players</h3><div class="v accent">${dash(c.flagged)}</div><div class="s">Injured, doubtful or unavailable</div></div>
        <div class="ov-card"><h3>Summer signings</h3><div class="v accent-2">${dash(c.new_signings)}</div><div class="s">Stats earned at a previous club</div></div>
        <div class="ov-card"><h3>Clubs covered</h3><div class="v">${dash(c.clubs)}</div><div class="s">of 20</div></div>
      </div>
      <div class="warn"><h2>Pre-season minutes are not available</h2><ul><li>${h(p.minutes_gap)}</li></ul></div>
      ${panel("GW1 availability", "Straight from FPL, updated daily. Worst first — this is the sharpest pre-season signal there is.", `<div class="table-scroll"><table><thead><tr><th class="left">Player</th><th>Pos</th><th>Price</th><th>Status</th><th>Chance</th><th>Own</th><th class="left">FPL note</th></tr></thead><tbody>${availRows || '<tr><td colspan="7" class="left dim">No flagged players.</td></tr>'}</tbody></table></div>`)}
      <div class="grid2">
        ${panel("Recent results", "Context, not evidence — opposition quality varies wildly and managers rotate heavily", table(p.recent || [], "No results yet."))}
        ${panel("Next up", "Upcoming friendlies", table(p.next_up || [], "No scheduled friendlies."))}
      </div>
      ${panel("Summer signings", "Bootstrap pairs last season's numbers with the player's CURRENT club — these earned them elsewhere", `<div class="table-scroll"><table><thead><tr><th class="left">Player</th><th>Pos</th><th>Price</th><th class="left">Joined</th><th>Last pts</th><th>Mins</th><th>Own</th></tr></thead><tbody>${signingRows || '<tr><td colspan="7" class="left dim">No summer signings detected.</td></tr>'}</tbody></table></div>`)}
      ${panel("Pre-season form by club", "Played, W–D–L, goals for/against, and fixtures remaining", `<div class="table-scroll"><table><thead><tr><th class="left">Club</th><th>P</th><th>W–D–L</th><th>GF–GA</th><th>To come</th></tr></thead><tbody>${clubRows || '<tr><td colspan="5" class="left dim">No club data.</td></tr>'}</tbody></table></div>`)}
      <div class="warn"><h2>Read this before trusting the table above</h2><ul>${(p.notes || []).map(x => `<li>${h(x)}</li>`).join("")}<li>Source: <a href="${safeUrl(p.source)}" target="_blank" rel="noopener noreferrer">premierleague.com club-by-club friendlies</a>. Fixture facts and a link only — no report text is copied.</li></ul></div>`;
  }

  async function renderAnalytics() {
    const view = $("#view-analytics");
    view.innerHTML = `${viewHeader("Analytics", "A data-science pass over 113,592 player-gameweeks. Several of these charts are deliberately unflattering to the model — a chart that only shows the number you like is marketing.")}<div class="loading">Loading analysis…</div>`;
    let a = state.analytics;
    if (!a) {
      try {
        const res = await fetch("./analytics.json", { cache: "no-cache" });
        if (!res.ok) throw new Error(`analytics.json HTTP ${res.status}`);
        a = state.analytics = await res.json();
        renderNav();
        $$(".navtab").forEach(el => el.setAttribute("aria-current", el.dataset.route === state.route ? "page" : "false"));
      } catch (err) {
        view.innerHTML = `${viewHeader("Analytics", "Model analysis over historical per-gameweek data.")}<div class="warn"><h2>Analysis unavailable</h2><ul><li>${h(err.message)}</li></ul></div>`;
        return;
      }
    }

    const c = a.counts || {};
    const scoreTable = (rows, caption) => `<div class="table-scroll"><table><thead><tr><th class="left">Model</th><th>MAE</th><th>RMSE</th><th>Spearman</th><th>Top-20 hit</th><th>n</th><th class="left">Note</th></tr></thead><tbody>${(rows || []).map(r => {
      const isModel = !/^baseline|always/.test(r.model);
      return `<tr><td class="left"><b class="${isModel ? "accent" : ""}">${h(r.model)}</b></td>
        <td>${num(r.MAE, 3)}</td><td>${num(r.RMSE, 3)}</td>
        <td class="big ${isModel ? "accent" : ""}">${r.spearman === null ? "—" : num(r.spearman, 4)}</td>
        <td>${num(r.top20_hit, 3)}</td><td class="dim">${dash(r.n)}</td>
        <td class="left dim">${h(r.note || "")}</td></tr>`;
    }).join("")}</tbody></table></div>${caption ? `<p class="dim" style="padding:0 1.2rem 1rem;font-size:.78rem;line-height:1.5">${h(caption)}</p>` : ""}`;

    const impRows = (rows, negative) => `<div class="table-scroll"><table><thead><tr><th class="left">Feature</th><th>Importance</th><th>± std</th></tr></thead><tbody>${(rows || []).map(r => `<tr>
      <td class="left"><code>${h(r.feature)}</code></td>
      <td class="big ${negative ? "" : "accent"}" ${negative ? 'style="color:var(--red)"' : ""}>${num(r.importance, 4)}</td>
      <td class="dim">${num(r.std, 4)}</td></tr>`).join("")}</tbody></table></div>`;

    const charts = (a.charts || []).map(ch => `<figure style="margin:0 0 1.5rem">
      <img src="${safeUrl(ch.file)}" alt="${h(ch.caption)}" loading="lazy" style="width:100%;height:auto;border:1px solid var(--line);border-radius:.7rem;background:var(--panel);display:block">
      <figcaption class="dim" style="margin-top:.5rem;font-size:.78rem">${h(ch.caption)}</figcaption>
    </figure>`).join("");

    const late = a.late_column_coverage || {};
    const lateRows = Object.entries(late).map(([col, seasons]) => `<tr>
      <td class="left"><code>${h(col)}</code></td>
      ${Object.values(seasons).map(v => `<td class="${v > 0 ? "accent" : "dim"}">${num(v * 100, 0)}%</td>`).join("")}</tr>`).join("");
    const lateHead = Object.keys(Object.values(late)[0] || {}).map(s => `<th>${h(s)}</th>`).join("");

    view.innerHTML = `${viewHeader("Analytics", "A data-science pass over 113,592 player-gameweeks. Several of these charts are deliberately unflattering to the model — a chart that only shows the number you like is marketing.")}
      <div class="ov-grid">
        <div class="ov-card"><h3>Player-gameweeks</h3><div class="v">${(c.player_gameweeks || 0).toLocaleString("en-GB")}</div><div class="s">${h((c.seasons || []).join(", "))}</div></div>
        <div class="ov-card"><h3>Features</h3><div class="v accent">${dash(c.features)}</div><div class="s">after leakage exclusions</div></div>
        <div class="ov-card"><h3>Did not play</h3><div class="v" style="color:var(--amber)">${num((c.zero_minute_share || 0) * 100, 1)}%</div><div class="s">of test rows — the trap below</div></div>
        <div class="ov-card"><h3>Test season</h3><div class="v" style="font-size:1.3rem">${h(a.test_season)}</div><div class="s">split by season, never random</div></div>
      </div>
      ${(a.corrections || []).length ? `<div class="warn" style="border-left-color:var(--red);background:rgb(248 81 73 / 8%);border-color:rgb(248 81 73 / 35%)"><h2 style="color:var(--red)">Corrections to an earlier build of this page</h2><ul style="color:#e8bdb9">${a.corrections.map(x => `<li>${h(x)}</li>`).join("")}</ul></div>` : ""}
      <div class="warn"><h2>What the analysis found</h2><ul>${(a.findings || []).map(x => `<li>${h(x)}</li>`).join("")}</ul></div>
      ${panel("Charts", "Rendered from the model run — aggregates only, no per-player rows from the source archive", `<div style="padding:1.2rem">${charts || '<div class="dim">No charts.</div>'}</div>`)}
      ${panel("Scores: like-for-like", `${(c.test_comparable || 0).toLocaleString("en-GB")} rows where FPL actually published its own xP, so every contender is scored on identical data. This is the fair comparison.`, scoreTable(a.scores_comparable, "FPL only published xP for 11 of 38 gameweeks in the test season. Scoring it on the rows it covers while scoring the models on all rows would put a 2,408-row number beside a 10,485-row one."))}
      ${panel("Scores: players who actually played", `${(c.test_played || 0).toLocaleString("en-GB")} rows. The all-rows version below is inflated by the ${num((c.zero_minute_share || 0) * 100, 1)}% who did not play.`, scoreTable(a.scores_played, "Note that 'always 2.0' has the best MAE and no ranking ability. FPL is a selection problem, so top-20 hit rate is the metric that matches how this is used."))}
      ${panel("Scores: all test rows", "Included for contrast, not as a result", scoreTable(a.scores_all_rows))}
      ${panel("Ablation: removing FPL's xP", "Retrained without the column, scored on the like-for-like subset", scoreTable(a.ablation, "Removing it costs the gradient booster 0.34 spearman. An earlier build of this page concluded the opposite, because blank gameweeks were being scored as a predicted zero."))}
      <div class="grid2">
        ${panel("Top features", "Permutation importance on the test set", impRows(a.importance, false))}
        ${panel("Features that did not earn their place", "Negative = shuffling the column improved the model", impRows(a.negative_features, true))}
      </div>
      ${lateRows ? panel("Schema drift", "Defensive columns exist in only one season, so they are excluded rather than zero-filled — zero is a real value for tackles", `<div class="table-scroll"><table><thead><tr><th class="left">Column</th>${lateHead}</tr></thead><tbody>${lateRows}</tbody></table></div>`) : ""}
      <div class="warn"><h2>Limits</h2><ul>${(a.limits || []).map(x => `<li>${h(x)}</li>`).join("")}<li>Source: <a href="${safeUrl(a.source)}" target="_blank" rel="noopener noreferrer">vaastav/Fantasy-Premier-League</a> (${h(a.source_licence)}). FPL's own API cannot answer this: per-gameweek history is wiped at season rollover.</li></ul></div>`;
  }

  const renderers = { overview: renderOverview, players: renderPlayers, squads: renderSquads, chips: renderChips, preseason: renderPreseason, analytics: renderAnalytics, teams: renderTeams, setpieces: renderSetPieces, news: renderNews };

  function route() {
    const requested = location.hash.replace(/^#\/?/, "").toLowerCase();
    const key = ROUTES.some(([x]) => x === requested) ? requested : "overview";
    state.route = key;
    if (!state.rendered.has(key)) { renderers[key](); state.rendered.add(key); }
    $$(".view").forEach(el => el.classList.toggle("active", el.id === `view-${key}`));
    $$(".navtab").forEach(el => el.setAttribute("aria-current", el.dataset.route === key ? "page" : "false"));
    document.title = `${ROUTES.find(([x]) => x === key)[1]} · FPL Analyzer`;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function findCompact(id) { return state.compact.get(Number(id)); }

  function tooltipHtml(p) {
    const newsCount = (state.data.news || []).filter(n => (n.players || []).some(x => Number(x.id) === Number(p.id))).length;
    return `<div class="tip-head"><span class="tip-name">${h(p.name)}</span>${posBadge(p.pos)}<span class="club">${h(p.team)}</span></div>
      <div class="tip-grid">
        <div class="tip-cell"><span>Proj 3GW</span><b>${num(p.projected)}</b></div><div class="tip-cell"><span>Proj/GW</span><b>${num(p.per_gw)}</b></div><div class="tip-cell"><span>FPL ep</span><b>${num(p.ep)}</b></div>
        <div class="tip-cell"><span>Price</span><b>£${num(p.cost)}</b></div><div class="tip-cell"><span>Value</span><b>${num(p.per_million, 2)}</b></div><div class="tip-cell"><span>Pts/90</span><b>${num(p.rate_per_90, 2)}</b></div>
        <div class="tip-cell"><span>Exp min</span><b>${dash(p.exp_minutes)}</b></div><div class="tip-cell"><span>Start</span><b>${dash(p.start_share, "%")}</b></div><div class="tip-cell"><span>Owned</span><b>${dash(p.own, "%")}</b></div>
      </div><div class="tip-fx">${h((p.fixtures || []).join(" · ") || "No exported fixtures")}</div>${newsCount ? `<div class="tip-news">${newsCount} linked news item${newsCount === 1 ? "" : "s"}</div>` : ""}<div class="tip-hint">Click for all exported FPL statistics</div>`;
  }

  function showTip(target, event) {
    const p = findCompact(target.dataset.pid);
    if (!p) return;
    const tip = $("#tip");
    tip.innerHTML = tooltipHtml(p);
    tip.dataset.show = "1"; tip.setAttribute("aria-hidden", "false");
    moveTip(event);
  }
  function moveTip(event) {
    const tip = $("#tip");
    if (tip.dataset.show !== "1") return;
    const pad = 14, w = tip.offsetWidth, hgt = tip.offsetHeight;
    let x = (event.clientX || innerWidth / 2) + 14, y = (event.clientY || 100) + 14;
    if (x + w + pad > innerWidth) x = Math.max(pad, (event.clientX || innerWidth) - w - 14);
    if (y + hgt + pad > innerHeight) y = Math.max(pad, (event.clientY || innerHeight) - hgt - 14);
    tip.style.left = `${x}px`; tip.style.top = `${y}px`;
  }
  function hideTip() { const tip = $("#tip"); tip.dataset.show = "0"; tip.setAttribute("aria-hidden", "true"); }

  async function loadDetails() {
    if (state.details) return state.details;
    if (!state.detailPromise) {
      state.detailPromise = fetch(state.data.players_url || "./players.json", { cache: "no-cache" })
        .then(r => { if (!r.ok) throw new Error(`Player detail HTTP ${r.status}`); return r.json(); })
        .then(d => (state.details = d));
    }
    return state.detailPromise;
  }

  function statValue(value) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return h(JSON.stringify(value));
    return h(value);
  }

  function renderDetail(detail) {
    const derived = detail.derived || {};
    const groups = state.data.stat_groups || [];
    const covered = new Set(groups.flatMap(x => x[1] || []));
    const groupHtml = groups.map(([title, keys]) => {
      const rows = (keys || []).filter(k => k in (detail.stats || {})).map(k => {
        const value = detail.stats[k];
        const empty = value === null || value === undefined || value === "";
        return `<div class="stat-item ${empty ? "empty" : ""}"><em>${h(label(k))}</em><b>${statValue(value)}</b></div>`;
      }).join("");
      return rows ? `<section class="stat-group"><h4>${h(title)}</h4><div class="stat-grid">${rows}</div></section>` : "";
    }).join("");
    const extras = Object.keys(detail.stats || {}).filter(k => !covered.has(k));
    const extraHtml = extras.length ? `<section class="stat-group"><h4>Additional FPL fields</h4><div class="stat-grid">${extras.map(k => `<div class="stat-item"><em>${h(label(k))}</em><b>${statValue(detail.stats[k])}</b></div>`).join("")}</div></section>` : "";
    $("#modal-title").textContent = detail.full_name || detail.name || "Player";
    $("#modal-sub").textContent = `${detail.team || "—"} · ${detail.pos || "—"} · £${num(detail.cost)} · ${detail.fixtures?.join(" · ") || "No fixtures"}`;
    $("#modal-body").innerHTML = `<div class="derived-box"><h4>Model layer — not official FPL data</h4><p>${derived.no_projection ? h(derived.no_projection) : `Projected over the next ${state.data.horizon || "—"} gameweeks from last-season rate, expected minutes and fixture adjustment.`}</p>
      <div class="stat-grid">
        ${[["Projected", num(derived.projected)], ["Per £m", num(derived.per_million, 2)], ["Rate / 90", num(derived.rate_per_90, 2)], ["Expected minutes", dash(derived.exp_minutes)], ["Start share", dash(derived.start_share, "%")], ["Mean FDR", num(derived.mean_fdr, 2)], ["Fixtures", dash(derived.n_fixtures)], ["Set pieces", setPieceTags(derived.set_pieces) || "—"]].map(([k, v]) => `<div class="stat-item"><em>${h(k)}</em><b>${v}</b></div>`).join("")}
      </div></div>${groupHtml}${extraHtml}`;
  }

  async function openPlayer(id) {
    hideTip();
    const modal = $("#modal");
    const compact = findCompact(id);
    $("#modal-title").textContent = compact?.name || "Player";
    $("#modal-sub").textContent = compact ? `${compact.team} · ${compact.pos}` : "";
    $("#modal-body").innerHTML = '<div class="loading">Loading player detail…</div>';
    modal.dataset.open = "1";
    document.body.style.overflow = "hidden";
    try {
      const details = await loadDetails();
      const detail = details[String(Number(id))] || details[Number(id)];
      if (!detail) throw new Error("No detail entry was exported for this player.");
      renderDetail(detail);
    } catch (error) {
      $("#modal-body").innerHTML = `<div class="warn"><h2>Detail unavailable</h2><ul><li>${h(error.message)}</li></ul></div>`;
    }
  }
  function closeModal() {
    $("#modal").dataset.open = "0";
    document.body.style.overflow = "";
  }

  function bindEvents() {
    document.addEventListener("click", event => {
      const routeTarget = event.target.closest("[data-route]");
      if (routeTarget) { location.hash = routeTarget.dataset.route; return; }
      const player = event.target.closest("[data-pid]");
      if (player) { openPlayer(player.dataset.pid); return; }
      const squad = event.target.closest("[data-squad]");
      if (squad) {
        state.squad = Number(squad.dataset.squad);
        $$(".sq-tab").forEach(x => x.setAttribute("aria-selected", x === squad ? "true" : "false"));
        $("#squad-pitch").innerHTML = squadPitch(state.data.squads[state.squad]);
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeModal();
      if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-pid]")) { event.preventDefault(); openPlayer(event.target.dataset.pid); }
    });
    document.addEventListener("mouseover", event => { const p = event.target.closest("[data-pid]"); if (p && !p.contains(event.relatedTarget)) showTip(p, event); });
    document.addEventListener("mousemove", event => moveTip(event));
    document.addEventListener("mouseout", event => { const p = event.target.closest("[data-pid]"); if (p && !p.contains(event.relatedTarget)) hideTip(); });
    document.addEventListener("input", event => {
      if (event.target.id === "player-search") { state.playerFilters.query = event.target.value; renderPlayerBody(); }
    });
    document.addEventListener("change", event => {
      if (event.target.id === "team-filter") { state.playerFilters.team = event.target.value; renderPlayerBody(); }
      if (event.target.id === "cost-filter") { state.playerFilters.maxCost = event.target.value; renderPlayerBody(); }
    });
    document.addEventListener("click", event => {
      const pill = event.target.closest("[data-pos]");
      if (pill) {
        state.playerFilters.pos = pill.dataset.pos;
        $$("[data-pos]").forEach(x => x.setAttribute("aria-pressed", x === pill ? "true" : "false"));
        renderPlayerBody();
      }
      const th = event.target.closest("#players-table th[data-sort]");
      if (th) {
        const key = th.dataset.sort;
        if (state.playerSort.key === key) state.playerSort.dir *= -1;
        else { state.playerSort.key = key; state.playerSort.dir = ["name", "team", "pos"].includes(key) ? 1 : -1; }
        renderPlayerBody();
      }
    });
    $("#modal-close").addEventListener("click", closeModal);
    $("#modal").addEventListener("click", event => { if (event.target.id === "modal") closeModal(); });
    window.addEventListener("hashchange", route);
  }

  async function init() {
    try {
      const response = await fetch("./data.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Dashboard data HTTP ${response.status}`);
      state.data = await response.json();
      (state.data.all_players || []).forEach(p => state.compact.set(Number(p.id), p));
      renderNav(); bindEvents(); route();
    } catch (error) {
      $(".shell").innerHTML = `<div class="vh"><h1>Dashboard unavailable</h1><p>${h(error.message)}</p></div>`;
    }
  }

  init();
})();
