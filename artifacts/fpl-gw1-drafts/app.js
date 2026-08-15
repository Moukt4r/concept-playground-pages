"use strict";

const $ = (sel) => document.querySelector(sel);
const h = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

const ORDER = { GKP: 0, DEF: 1, MID: 2, FWD: 3 };
const LABEL = { GKP: "Goalkeepers", DEF: "Defenders", MID: "Midfielders", FWD: "Forwards" };

const state = { data: null, squad: 0 };

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}

/** Tags are claims about a player, so each one must be derivable from the data. */
function tagsFor(p) {
  const out = [];
  if (p.clears_defcon) {
    const bar = p.pos === "DEF" ? 10 : 12;
    out.push(`<span class="tag defcon">DefCon ${p.dc90.toFixed(1)} / ${bar}</span>`);
  }
  if (p.owned < 5) out.push(`<span class="tag diff">${p.owned.toFixed(1)}% owned</span>`);
  if (p.fdr3 <= 8) out.push(`<span class="tag fix">FDR ${p.fdr3} in 3</span>`);
  return out.join("");
}

function rowFor(p) {
  const cap = p.captain ? '<span class="cap">C</span>'
    : p.vice ? '<span class="cap vice">V</span>' : "";
  return `<div class="row ${p.xi ? "" : "bench"}">
    <span class="pos">${h(p.pos)}</span>
    <span class="club">${h(p.team)}</span>
    <span class="nm">${h(p.name)}${cap}</span>
    <span class="cost">£${p.cost.toFixed(1)}</span>
    <span class="own">${p.owned.toFixed(1)}%</span>
    <span class="pts">${p.points}p</span>
    <span class="tags">${tagsFor(p)}</span>
  </div>`;
}

function fixtureStrip(data, teams) {
  const seen = [...new Set(teams)];
  return seen.map((t) => {
    const runs = data.fdr[t] || [];
    const cells = runs.map((f) =>
      `<span class="fx d${f.d}">${f.where}${h(f.opp)} ${f.d}</span>`).join("");
    return `<div class="fixtures"><span class="club">${h(t)}</span>${cells}</div>`;
  }).join("");
}

function renderSquad() {
  const d = state.data;
  const s = d.squads[state.squad];

  const groups = ["GKP", "DEF", "MID", "FWD"].map((g) => {
    const ps = s.players
      .filter((p) => p.pos === g)
      .sort((a, b) => (b.xi - a.xi) || (b.cost - a.cost));
    return `<div class="group">
      <div class="group-head">${LABEL[g]}</div>
      ${ps.map(rowFor).join("")}
    </div>`;
  }).join("");

  const legal = s.legal
    ? '<span class="chip ok">Legal squad</span>'
    : `<span class="chip bad">${h(s.violations.join("; "))}</span>`;

  $("#main").innerHTML = `<section class="panel">
    <p class="thesis">${h(s.thesis)}</p>
    <p class="why">${h(s.why)}</p>
    <div class="chips">
      <span class="chip"><b>£${s.cost.toFixed(1)}m</b> spent</span>
      <span class="chip"><b>£${s.bank.toFixed(1)}m</b> bank</span>
      <span class="chip"><b>${h(s.formation)}</b></span>
      <span class="chip">C <b>${h(s.captain)}</b></span>
      <span class="chip">V <b>${h(s.vice)}</b></span>
      <span class="chip"><b>${s.defcon_count}</b> clear the DefCon bar</span>
      ${legal}
    </div>
    ${groups}
  </section>`;

  document.querySelectorAll(".tab").forEach((el, i) =>
    el.setAttribute("aria-selected", String(i === state.squad)));
}

function renderTabs() {
  $("#tabs").innerHTML = state.data.squads.map((s, i) =>
    `<button class="tab" data-i="${i}" aria-selected="${i === 0}">
      <b>${h(s.label)}</b>
      <small>£${s.cost.toFixed(1)}m · ${h(s.formation)} · C ${h(s.captain)}</small>
    </button>`).join("");

  $("#tabs").addEventListener("click", (ev) => {
    const btn = ev.target.closest(".tab");
    if (!btn) return;
    state.squad = Number(btn.dataset.i);
    renderSquad();
  });
}

async function main() {
  const res = await fetch("data.json");
  state.data = await res.json();
  const d = state.data;

  $("#meta").textContent =
    `Gameweek 1 deadline ${fmtDate(d.deadline)} · squads built ${fmtDate(d.generated_at)} `
    + `· budget £${d.rules.budget.toFixed(1)}m · max ${d.rules.max_per_club} per club`;

  $("#foot-meta").textContent =
    "Every figure is read from the official Fantasy Premier League API at build time. "
    + "Last season's totals are shown as a prior, never as a forecast: zero of 38 "
    + "gameweeks have been played.";

  renderTabs();
  renderSquad();
}

main();
