import { getCurrentMunicipality, haversineKm } from './game.mjs';
const $ = (selector) => document.querySelector(selector);
const oneDecimal = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const formatDistance = (km) => km < 1 ? `${Math.round(km * 1000)} m` : `${oneDecimal.format(km)} km`;

/** Local SVG map: genuine geographic projection, inverse picking, zoom, touch and keyboard. */
export class NorwayMap {
  constructor(background, municipalGeometry, callbacks) {
    this.d3 = window.d3;
    if (!this.d3) throw new Error('Kartbiblioteket kunne ikke lastes.');
    const d3 = this.d3;
    this.callbacks = callbacks;
    this.background = background;
    this.norway = background.features.find((f) => f.properties.role === 'norway');
    if (!this.norway) throw new Error('Norgeskartet mangler.');
    this.municipalGeometry = municipalGeometry;
    this.municipalById = new Map(municipalGeometry.features.map((f) => [f.properties.id, f]));
    if (this.municipalById.size !== 357 || !callbacks.municipalities.every((m) => this.municipalById.has(m.id))) throw new Error('Kommunegrensene samsvarer ikke med kommunelisten.');
    this.svg = d3.select('#norway-map'); this.node = this.svg.node();
    this.transform = d3.zoomIdentity; this.width = 600; this.height = 700; this.keyboardPoint = null;
    this.projection = d3.geoConicConformal().parallels([58, 70]).rotate([-15, 0]).center([0, 65]);
    this.path = d3.geoPath(this.projection);
    this.svg.append('defs').append('clipPath').attr('id', 'norway-land-clip').append('path');
    this.world = this.svg.append('g').attr('class', 'map-world');
    this.graticule = this.world.append('path').attr('class', 'graticule');
    this.countries = this.world.append('g').attr('class', 'countries');
    this.grid = this.world.append('g').attr('clip-path', 'url(#norway-land-clip)').attr('aria-hidden', 'true');
    this.labels = this.world.append('g').attr('aria-hidden', 'true');
    this.area = this.world.append('path').attr('class', 'target-area');
    this.lines = this.world.append('g').attr('aria-hidden', 'true');
    this.markers = this.world.append('g');
    this.crosshair = this.svg.append('g').attr('class', 'keyboard-crosshair').attr('aria-hidden', 'true').style('display', 'none');
    this.crosshair.append('circle').attr('r', 7); this.crosshair.append('path').attr('d', 'M-16 0h7m18 0h7M0-16v7m0 18v7');
    this.zoom = d3.zoom().scaleExtent([1, 14]).clickDistance(6).extent(() => [[0, 0], [this.width, this.height]])
      .on('start', (e) => { if (e.sourceEvent) this.svg.classed('dragging', true); })
      .on('zoom', (e) => {
        this.transform = e.transform; this.world.attr('transform', this.transform.toString());
        this.grid.attr('opacity', Math.min(0.5, Math.max(0, (this.transform.k - 1.6) * 0.25)));
        this.positionFixedSizeElements(); this.updateScale();
      }).on('end', () => this.svg.classed('dragging', false));
    this.svg.call(this.zoom).on('dblclick.zoom', null);
    this.svg.on('click.place', (e) => {
      if (e.defaultPrevented || e.sourceCapabilities?.firesTouchEvents || e.pointerType === 'touch') return;
      this.placeAtScreenPoint(d3.pointer(e, this.node));
    });
    this.svg.on('mousemove.coordinates', (e) => {
      const c = this.screenToCoordinate(d3.pointer(e, this.node));
      if (c?.every(Number.isFinite)) $('#map-coordinate').textContent = `${oneDecimal.format(c[1])}° N · ${oneDecimal.format(c[0])}° Ø`;
    });
    this.svg.on('mouseleave.coordinates', () => { $('#map-coordinate').textContent = '58°–71° N'; });
    // D3 owns pinch/pan. Pointer tracking recognizes a stationary one-finger tap,
    // including browsers that suppress synthetic click after handled touch events.
    this.touchPointers = new Set(); this.touchStart = null; this.wasMultitouch = false;
    this.node.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      this.touchPointers.add(e.pointerId);
      if (this.touchPointers.size === 1) this.touchStart = { x: e.clientX, y: e.clientY, at: performance.now() };
      if (this.touchPointers.size > 1) this.wasMultitouch = true;
    });
    this.node.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'touch') return;
      const start = this.touchStart;
      const isTap = this.touchPointers.size === 1 && !this.wasMultitouch && start && Math.hypot(start.x - e.clientX, start.y - e.clientY) < 8 && performance.now() - start.at < 800;
      this.touchPointers.delete(e.pointerId);
      if (isTap) { const r = this.node.getBoundingClientRect(); this.placeAtScreenPoint([e.clientX - r.left, e.clientY - r.top]); }
      if (!this.touchPointers.size) { this.touchStart = null; this.wasMultitouch = false; }
    });
    this.node.addEventListener('pointercancel', () => { this.touchPointers.clear(); this.touchStart = null; this.wasMultitouch = false; });
    this.node.addEventListener('keydown', (e) => this.keydown(e));
    this.node.addEventListener('blur', () => this.crosshair.style('display', 'none'));
    let resizeTimer;
    this.observer = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => this.resize(), 90); });
    this.observer.observe($('#map-container'));
    this.resize();
  }
  name(m) {
    return this.callbacks.municipalities.some((x) => x.id !== m.id && x.name === m.name) ? `${m.name} (${m.county})` : m.name;
  }
  resize() {
    const r = $('#map-container').getBoundingClientRect(); if (!r.width || !r.height) return;
    if (Math.abs(this.width - r.width) < 1 && Math.abs(this.height - r.height) < 1 && this.ready) return;
    this.width = r.width; this.height = r.height;
    const horizontalPadding = this.width < 450 ? 33 : 46;
    this.projection.fitExtent([[horizontalPadding, 62], [this.width - horizontalPadding, this.height - 76]], this.norway);
    this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
    this.zoom.translateExtent([[-this.width * 0.6, -this.height * 0.5], [this.width * 1.6, this.height * 1.5]]);
    this.svg.select('#norway-land-clip path').attr('d', this.path(this.norway));
    this.graticule.attr('d', this.path(this.d3.geoGraticule().extent([[-8, 53], [39, 73]]).step([4, 2])()));
    const countries = [...this.background.features].sort((a, b) => Number(a.properties.role === 'norway') - Number(b.properties.role === 'norway'));
    this.countries.selectAll('path').data(countries).join('path').attr('class', (d) => `country country-${d.properties.role}`).attr('data-country', (d) => d.properties.name).attr('d', this.path);
    this.grid.selectAll('path').data(this.municipalGeometry.features).join('path').attr('class', 'municipal-grid').attr('d', this.path);
    const labels = [
      { text: 'S V E R I G E', coordinate: [15.6, 63.0], cls: 'country-label', rotation: -18 },
      { text: 'F I N L A N D', coordinate: [25.9, 65.5], cls: 'country-label', rotation: 0 },
      { text: 'Norskehavet', coordinate: [3.0, 65.4], cls: 'sea-label norwegian-sea', rotation: -35 },
      { text: 'Barentshavet', coordinate: [28.2, 71.7], cls: 'sea-label', rotation: 0 }
    ];
    this.labels.selectAll('text').data(labels).join('text').attr('class', (d) => `${d.cls} map-fixed`).text((d) => d.text);
    this.ready = true; this.keyboardPoint = [this.width * 0.5, this.height * 0.5];
    this.renderState(true, false, true);
  }
  screenToCoordinate(point) { return this.projection.invert(this.transform.invert(point)); }
  placeAtScreenPoint(point) {
    if (this.callbacks.getGame()?.phase !== 'guessing') return;
    this.keyboardPoint = point; this.crosshair.style('display', 'none');
    this.callbacks.onGuess(this.screenToCoordinate(point));
  }
  keydown(e) {
    const step = e.shiftKey ? 35 : 8, point = this.keyboardPoint || [this.width / 2, this.height / 2];
    const directions = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (directions[e.key] && this.callbacks.getGame()?.phase === 'guessing') {
      e.preventDefault(); const delta = directions[e.key];
      this.keyboardPoint = [Math.max(8, Math.min(this.width - 8, point[0] + delta[0])), Math.max(8, Math.min(this.height - 8, point[1] + delta[1]))];
      this.crosshair.attr('transform', `translate(${this.keyboardPoint})`).style('display', null);
    } else if ((e.key === 'Enter' || e.key === ' ') && this.callbacks.getGame()?.phase === 'guessing') {
      e.preventDefault(); this.placeAtScreenPoint(point);
    } else if (e.key === '+' || e.key === '=') { e.preventDefault(); this.zoomBy(1.65); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); this.zoomBy(1 / 1.65); }
    else if (e.key === '0') { e.preventDefault(); this.callbacks.onReset(); this.renderState(true, true); }
  }
  zoomBy(factor) {
    (reducedMotion.matches ? this.svg : this.svg.transition().duration(230)).call(this.zoom.scaleBy, factor);
  }
  moveTo(transform, instant = false) {
    this.svg.interrupt();
    (instant || reducedMotion.matches ? this.svg : this.svg.transition().duration(550)).call(this.zoom.transform, transform);
  }
  fitCoordinates(coordinates, instant = false) {
    const points = coordinates.map((c) => this.projection(c)).filter((p) => p?.every(Number.isFinite));
    if (!points.length) { this.moveTo(this.d3.zoomIdentity, instant); return; }
    const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const dx = Math.max(maxX - minX, this.width / 9), dy = Math.max(maxY - minY, this.height / 9);
    const k = Math.max(1, Math.min(7, Math.min((this.width - 115) / dx, (this.height - 190) / dy) * 0.8));
    this.moveTo(this.d3.zoomIdentity.translate(this.width / 2 - k * (minX + maxX) / 2, this.height / 2 - k * (minY + maxY) / 2).scale(k), instant);
  }
  positionFixedSizeElements() {
    const k = this.transform.k;
    this.world.selectAll('.map-fixed').attr('transform', (d) => `translate(${this.projection(d.coordinate)}) scale(${1 / k})${d.rotation ? ` rotate(${d.rotation})` : ''}`);
    const view = this;
    this.markers.selectAll('text.marker-label').each(function (d) {
      const projected = view.transform.apply(view.projection(d.coordinate));
      const half = this.getComputedTextLength() / 2;
      const shift = Math.max(half + 13 - projected[0], Math.min(0, view.width - half - 13 - projected[0]));
      view.d3.select(this).attr('x', shift);
    });
  }
  updateScale() {
    const left = this.screenToCoordinate([this.width / 2 - 40, this.height / 2]), right = this.screenToCoordinate([this.width / 2 + 40, this.height / 2]);
    if (!left?.every(Number.isFinite) || !right?.every(Number.isFinite)) return;
    const km = haversineKm(left, right); if (!(km > 0)) return;
    const scale = 10 ** Math.floor(Math.log10(km)), normalized = km / scale;
    const nice = (normalized >= 5 ? 5 : normalized >= 2 ? 2 : 1) * scale;
    $('#map-scale').style.width = `${Math.max(20, Math.min(100, 80 * nice / km))}px`;
    $('#map-scale-label').textContent = `${oneDecimal.format(nice)} km`;
  }
  addMarker(coordinate, kind, { label = '', number = null } = {}) {
    const g = this.markers.append('g').datum({ coordinate }).attr('class', `map-fixed answer-marker ${kind}-marker`).attr('data-lon', coordinate[0]).attr('data-lat', coordinate[1]);
    if (number !== null) {
      g.append('circle').attr('r', 10).attr('fill', '#45653a').attr('stroke', '#fffef9').attr('stroke-width', 1.5);
      g.append('text').attr('class', 'summary-number').attr('y', 0.5).text(number);
    } else if (kind === 'guess') {
      g.append('path').attr('d', 'M0 0C-3-5-11-11-11-19a11 11 0 1 1 22 0C11-11 3-5 0 0Z').attr('fill', '#d86a43').attr('stroke', '#fffef9').attr('stroke-width', 2);
      g.append('circle').attr('cy', -19).attr('r', 3.5).attr('fill', '#fffef9');
      g.append('ellipse').attr('cy', 2).attr('rx', 5).attr('ry', 1.5).attr('fill', '#59301b').attr('opacity', 0.15);
    } else {
      g.append('circle').attr('r', 15).attr('fill', '#d3ef92').attr('fill-opacity', 0.35);
      g.append('circle').attr('r', 8).attr('fill', '#3d6034').attr('stroke', '#fffef9').attr('stroke-width', 2);
      g.append('path').attr('d', 'm-3.5 0 2.5 2.5 4.5-5').attr('fill', 'none').attr('stroke', '#e1f6b1').attr('stroke-width', 1.6).attr('stroke-linecap', 'round');
    }
    if (label) g.append('text').attr('class', `marker-label ${kind}-label`).attr('y', kind === 'guess' ? -38 : 29).text(label);
    return g;
  }
  renderState(fit = false, reset = false, instant = false) {
    if (!this.ready) return;
    const game = this.callbacks.getGame(), selectedResult = this.callbacks.getSelected();
    this.area.attr('d', null); this.lines.selectAll('*').remove(); this.markers.selectAll('*').remove();
    const callout = $('#map-callout'), legend = $('#map-legend'); legend.hidden = true; callout.hidden = false;
    this.crosshair.style('display', 'none'); let fitPoints = null;
    if (!game) {
      $('#map-mode-label').textContent = 'DITT NESTE LILLE EVENTYR';
      this.node.setAttribute('aria-label', 'Navnefritt kart over Norge. Start en rute for å spille.');
      callout.innerHTML = `${icon('pin')}<span>Hele Norge. Bare din lokalsans.</span>`;
      const route = [[5.9, 59.4], [10.6, 63.3], [14.6, 66.1], [20, 69.8]];
      this.lines.append('path').datum({ type: 'LineString', coordinates: route }).attr('class', 'intro-route').attr('d', this.path);
      route.forEach((coordinate, i) => {
        const g = this.markers.append('g').datum({ coordinate }).attr('class', 'map-fixed intro-marker');
        g.append('circle').attr('r', i === 1 ? 19 : 13).attr('class', 'intro-marker-ring');
        if (i === 1) g.append('circle').attr('r', 9).attr('class', 'intro-marker-ring map-ping');
        g.append('circle').attr('r', i === 1 ? 6 : 4).attr('class', 'intro-marker-core');
      });
    } else if (game.phase === 'guessing') {
      const m = getCurrentMunicipality(game, this.callbacks.municipalities);
      $('#map-mode-label').textContent = 'NAVNEFRITT KART · DIN TUR';
      this.node.setAttribute('aria-label', `Kart over Norge. Hvor ligger ${this.name(m)}? Bruk piltaster og Enter for å plassere nålen, eller klikk på kartet.`);
      callout.innerHTML = game.guess ? `${icon('pin')}<span>Du kan flytte nålen før du låser svaret.</span>` : `${icon('pin')}<span>Et sted her ligger ${escapeHtml(m.name)}.</span>`;
      if (game.guess) { callout.hidden = true; this.addMarker(game.guess, 'guess', { label: 'Ditt svar' }); }
    } else if (game.phase === 'revealed' || (game.phase === 'finished' && selectedResult !== null)) {
      const result = game.results[game.phase === 'revealed' ? game.results.length - 1 : selectedResult]; if (!result) return;
      $('#map-mode-label').textContent = 'FASIT · KOMMUNENS KARTPUNKT';
      this.node.setAttribute('aria-label', `Fasit for ${this.name(result)}. Ditt svar er ${formatDistance(result.distanceKm)} fra kartpunktet.`);
      legend.hidden = false; callout.hidden = true;
      const feature = this.municipalById.get(result.id); if (feature) this.area.attr('d', this.path(feature));
      this.lines.append('path').datum({ type: 'LineString', coordinates: [result.guess, result.target] }).attr('class', 'answer-line').attr('d', this.path);
      this.addMarker(result.guess, 'guess', { label: 'Ditt svar' }); this.addMarker(result.target, 'target', { label: result.name });
      fitPoints = [result.guess, result.target];
    } else {
      $('#map-mode-label').textContent = '10 KOMMUNER · HELE REISEN';
      this.node.setAttribute('aria-label', 'Hele reisen: ti fasitpunkter nummerert etter runde, med linjer fra dine svar.');
      legend.hidden = false; callout.hidden = true;
      game.results.forEach((result, index) => {
        this.lines.append('path').datum({ type: 'LineString', coordinates: [result.guess, result.target] }).attr('class', 'answer-line summary-line').attr('d', this.path);
        const guess = this.markers.append('g').datum({ coordinate: result.guess }).attr('class', 'map-fixed answer-marker');
        guess.append('circle').attr('r', 3).attr('fill', '#d86a43').attr('stroke', '#fffef9').attr('stroke-width', 1);
        this.addMarker(result.target, 'target', { number: index + 1 });
      });
    }
    if (fit || reset) { if (fitPoints && !reset) this.fitCoordinates(fitPoints, instant); else this.moveTo(this.d3.zoomIdentity, instant); }
    this.positionFixedSizeElements(); this.updateScale();
  }
}
