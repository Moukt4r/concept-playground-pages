"use strict";

/* FPL Expected XI - all 20 clubs.
 *
 * Two rules this file exists to enforce, both learned the hard way:
 *
 * 1. POINTS ARE PER GAME PLAYED, never per 90. FPL's own points_per_game is a
 *    measured field; p90 divides away every game a manager got nothing from,
 *    so the less a player plays the better he looks. The exporter strips p90
 *    from the payload entirely, so this file cannot reach for it by accident.
 *
 * 2. SIZE ENCODES MAGNITUDE VIA LENGTH, NEVER FONT SIZE. Every bar on the page
 *    is scaled against a shared maximum, so two bars in different rows are
 *    comparable by eye.
 *
 * The lineup itself is a PRIOR - somebody else's forecast - and it is labelled
 * as one wherever it appears. Everything else is measured and decomposes into
 * blocks that sum to the published figure, so a reader can audit the
 * arithmetic instead of trusting a score. There is no composite rating here on
 * purpose.
 */

const BLOCK_COLOUR = {
  "CLEAN SHEETS": "#ffffff",
  GOALS: "#00ff87",
  ASSISTS: "#04f5ff",
  BONUS: "#ffb300",
  DEFCON: "#ff1751",
  "PEN SAVES": "#a371f7",
  SAVES: "#7ee787",
  "GOALS CONCEDED": "#8b5cf6",
  CARDS: "#f85149",
  APPEARANCE: "#8b95a5",
};

const POS_ORDER = { GKP: 0, DEF: 1, MID: 2, FWD: 3 };

const state = { data: null, club: null, player: null };

const $ = (sel) => document.querySelector(sel);

function crest(code) {
  return `https://resources.premierleague.com/premierleague/badges/50/t${code}.png`;
}

function initials(name) {
  return name
    .replace(/[^A-Za-zÀ-ÿ .'-]/g, "")
    .split(/[ .'-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function money(cost) {
  return `£${(cost / 10).toFixed(1)}m`;
}

/* Formation is DERIVED from the position counts, never written beside them.
 * Typing "4-3-3" next to a row that holds four midfielders is the same class
 * of defect as a headline that disagrees with its chart, and it is silent. */
function formationOf(xi) {
  const counts = { GKP: 0, DEF: 0, MID: 0, FWD: 0 };
  xi.forEach((p) => (counts[p.pos] += 1));
  return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
}

function rowsOf(xi) {
  const rows = { GKP: [], DEF: [], MID: [], FWD: [] };
  xi.forEach((p) => rows[p.pos].push(p));
  Object.values(rows).forEach((r) =>
    r.sort((a, b) => (b.ppg ?? -1) - (a.ppg ?? -1)),
  );
  return Object.keys(rows)
    .sort((a, b) => POS_ORDER[a] - POS_ORDER[b])
    .map((k) => ({ pos: k, players: rows[k] }))
    .filter((r) => r.players.length);
}

function renderClubs() {
  const nav = $("#clubs");
  nav.innerHTML = "";
  state.data.clubs.forEach((c) => {
    const b = document.createElement("button");
    b.className = "club" + (c.club === state.club.club ? " on" : "");
    b.type = "button";
    b.setAttribute("aria-pressed", String(c.club === state.club.club));
    b.innerHTML =
      `<img src="${crest(c.code)}" alt="" loading="lazy" width="28" height="28">` +
      `<span>${c.club}</span>` +
      (c.omitted.length ? `<i class="warn" title="projection omits ${c.omitted.length}">!</i>` : "");
    b.addEventListener("click", () => selectClub(c.club));
    nav.appendChild(b);
  });
}

function renderPitch() {
  const club = state.club;
  $("#club-name").textContent = club.name;
  const unresolved = club.unresolved.length;
  $("#formation").textContent = formationOf(club.xi) +
    (unresolved ? ` + ${unresolved} unresolved` : "");

  const gw = club.xi.find((p) => p.gw)?.gw;
  const fx = gw ? ` · GW${state.data.gw} ${gw.ha} vs ${gw.opp}` : "";
  $("#club-sub").innerHTML =
    `Current projected XI · <strong>prior</strong>, not measured${fx}` +
    (unresolved ? ` · <strong>${unresolved} player not matched to FPL</strong>` : "");

  // Shared scale across the whole squad, so a bar in the forward row is
  // directly comparable to one in defence.
  const max = Math.max(...club.xi.map((p) => p.ppg || 0), 1);

  const pitch = $("#pitch");
  pitch.innerHTML = "";
  rowsOf(club.xi).forEach((row) => {
    const r = document.createElement("div");
    r.className = "row";
    row.players.forEach((p) => r.appendChild(playerCard(p, max)));
    pitch.appendChild(r);
  });
}

function playerCard(p, max) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "player" + (state.player && state.player.id === p.id ? " on" : "");
  el.setAttribute("aria-pressed", String(!!state.player && state.player.id === p.id));

  const rate = p.ppg == null ? "–" : p.ppg.toFixed(1);
  const width = p.ppg ? Math.max(4, (p.ppg / max) * 100) : 0;
  const fdr = p.gw ? `<i class="chip fdr-${p.gw.fdr}">${p.gw.ha} ${p.gw.opp}</i>` : "";
  const av = p.availability || {};
  let availability = "";
  if (av.projection_conflict) {
    availability = `<i class="chip av-check">CHECK START</i>`;
  } else if (av.status === "i" || av.chance === 0) {
    availability = `<i class="chip av-out">OUT</i>`;
  } else if (av.status === "d" || (av.chance != null && av.chance < 100)) {
    availability = `<i class="chip av-doubt">${av.chance ?? "?"}%</i>`;
  }
  const origin = p.ppg == null && p.origin?.label
    ? `<span class="origin-tag">${p.origin.label}</span>` : "";

  el.innerHTML =
    `<span class="disc">${initials(p.name)}</span>` +
    `<span class="pname">${p.name}</span>` +
    `<span class="rate"><b>${rate}</b> ppg</span>` +
    `<span class="bar"><i style="width:${width}%"></i></span>` +
    `<span class="meta">${money(p.cost)} · ${p.own.toFixed(1)}%</span>` +
    origin + fdr + availability;

  el.addEventListener("click", () => selectPlayer(p));
  return el;
}

function renderPanel() {
  const panel = $("#panel");
  const p = state.player;
  if (!p) {
    panel.innerHTML = '<p class="empty-state">Select a player.</p>';
    return;
  }

  const av = p.availability || {};
  const avNote = av.projection_conflict
    ? `<p class="availability check">Current evidence conflicts with this projected start.</p>`
    : av.status === "i" || av.chance === 0
      ? `<p class="availability out">Unavailable: ${av.news || "no return information"}</p>`
      : av.status === "d" || (av.chance != null && av.chance < 100)
        ? `<p class="availability doubt">Availability ${av.chance ?? "?"}%: ${av.news || "doubtful"}</p>`
        : "";

  // A player with no Premier League record is shown as a GAP, never as 0.00.
  // Zero is a measurement; this is the absence of one, and a blank reads as a
  // rendering fault.
  if (p.ppg == null || !p.blocks.length) {
    panel.innerHTML =
      `<h3>${p.name}</h3>` +
      `<p class="ptag">${p.pos} · ${money(p.cost)} · ${p.own.toFixed(1)}% owned</p>` +
      `<p class="gap">No 2025/26 Premier League record.<br>` +
      `<span class="muted">${p.origin?.label || "origin unknown"}. ` +
      `He is in this XI on projected selection, not on a measured rate.</span></p>` +
      avNote;
    return;
  }

  const blocks = [...p.blocks].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const scale = Math.max(...blocks.map((b) => Math.abs(b[1])), 0.01);
  const sum = blocks.reduce((t, b) => t + b[1], 0);

  panel.innerHTML =
    `<h3>${p.name}</h3>` +
    `<p class="ptag">${p.pos} · ${money(p.cost)} · ${p.own.toFixed(1)}% owned` +
    (p.gw ? ` · GW${state.data.gw} ${p.gw.ha} vs ${p.gw.opp} (FDR ${p.gw.fdr})` : "") +
    `</p>` +
    `<p class="headline"><b>${p.ppg.toFixed(1)}</b> points per game played` +
    `<span class="muted"> · ${p.total_points} points from ${p.apps ?? "?"} appearances</span></p>` +
    `<p class="origin">${p.origin?.label || ""}` +
    (p.origin && p.origin.club_attributable === false
      ? ` <em>· earned at a previous club</em>`
      : "") +
    `</p>` + avNote +
    `<ul class="blocks">` +
    blocks
      .map(
        (b) =>
          `<li><span class="bl">${b[0]}</span>` +
          `<span class="bb"><i style="width:${(Math.abs(b[1]) / scale) * 100}%;` +
          `background:${BLOCK_COLOUR[b[0]] || "#8b95a5"}"></i></span>` +
          `<span class="bv${b[1] < 0 ? " neg" : ""}">${b[1] >= 0 ? "" : "−"}${Math.abs(b[1]).toFixed(2)}</span></li>`,
      )
      .join("") +
    `</ul>` +
    `<p class="sums">Blocks sum to ${sum.toFixed(2)} · FPL publishes ${p.ppg.toFixed(1)}` +
    `<span class="muted"> — rounding to two decimals can leave a hundredth on the table</span></p>` +
    `<p class="mins muted">${p.starts} starts · ${p.minutes} minutes in 2025/26</p>`;
}

function renderOmissions() {
  const box = $("#omissions");
  const c = state.club;
  if (!c.omitted.length && !c.unresolved.length && !c.fallback.length) {
    box.innerHTML =
      `<h2>Projection check</h2>` +
      `<p class="ok">The projected XI lists every fit ${state.data.points_floor}+ point player at ${c.name}.</p>`;
    return;
  }
  box.innerHTML =
    `<h2>What the projection leaves out</h2>` +
    `<p class="lede">These ${c.name} players scored ${state.data.points_floor}+ points in 2025/26 and are ` +
    `flagged available right now, yet the projected XI does not name them. ` +
    `They are shown here rather than hidden, because a lineup missing its best ` +
    `returners is evidence about the forecast.</p>` +
    `<ul class="omit">` +
    c.omitted
      .map(
        (o) =>
          `<li><b>${o.name}</b><span>${o.points} pts · ${o.own.toFixed(1)}% owned · ${money(o.cost)}</span></li>`,
      )
      .join("") +
    `</ul>` +
    (c.unresolved.length
      ? `<p class="unresolved"><strong>Unresolved projected slot:</strong> ${c.unresolved.join(", ")}. ` +
        `The page shows ten resolved players rather than guessing an identity.</p>`
      : "") +
    (c.fallback.length
      ? `<p class="muted">Identity fallback used: ${c.fallback.join(", ")}.</p>`
      : "");
}

function selectPlayer(p) {
  state.player = p;
  renderPitch();
  renderPanel();
}

function selectClub(code) {
  state.club = state.data.clubs.find((c) => c.club === code);
  state.player = null;
  renderClubs();
  renderPitch();
  renderPanel();
  renderOmissions();
}

async function boot() {
  const res = await fetch("./data.json");
  state.data = await res.json();
  state.club = state.data.clubs[0];

  const flagged = state.data.clubs.filter((c) => c.omitted.length).length;
  $("#provenance").innerHTML =
    `Projected line-ups are a prior, not a measurement. Player prices, ownership and ` +
    `2025/26 records are measured. <strong>${flagged} of ${state.data.clubs.length} clubs</strong> ` +
    `have a fit, high-scoring player missing from the forecast — each one is listed on that club's page.`;

  selectClub(state.club.club);
}

boot();
