/* ==========================================================================
   Spielfeld als SVG
   - Die Szenariodaten nutzen Hochformat-Koordinaten (Angriff Richtung y = 0).
   - Hier wird alles ins Querformat gedreht (100 x 68), das eigene Team
     greift von links nach rechts an.
   - Bewegungen laufen über CSS-Transitions (siehe styles.css, --move).
   ========================================================================== */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const W = 100;
  const H = 68;
  let uid = 0;

  // Modell (x lateral, y Länge) -> Darstellung (X Länge, Y lateral)
  const toView = (p) => [W - p[1], p[0]];
  const r1 = (n) => Math.round(n * 10) / 10;

  function markings() {
    let stripes = '';
    for (let i = 0; i < 10; i++) {
      stripes += '<rect x="' + (i * 10) + '" y="0" width="10" height="' + H + '" class="' + (i % 2 ? 'g1' : 'g2') + '"/>';
    }
    return (
      '<g class="grass">' + stripes + '</g>' +
      '<g class="lines">' +
      '<rect x="2" y="2" width="96" height="64"/>' +
      '<line x1="50" y1="2" x2="50" y2="66"/>' +
      '<circle cx="50" cy="34" r="9"/><circle class="spot" cx="50" cy="34" r="0.6"/>' +
      '<rect x="82" y="14" width="16" height="40"/><rect x="92" y="25" width="6" height="18"/>' +
      '<rect x="2" y="14" width="16" height="40"/><rect x="2" y="25" width="6" height="18"/>' +
      '<circle class="spot" cx="88" cy="34" r="0.6"/><circle class="spot" cx="12" cy="34" r="0.6"/>' +
      '<path d="M82 27.3A9 9 0 0 0 82 40.7"/><path d="M18 27.3A9 9 0 0 1 18 40.7"/>' +
      '<rect x="98" y="30" width="2" height="8"/><rect x="0" y="30" width="2" height="8"/>' +
      '</g>'
    );
  }

  function zoneSvg(z) {
    const x = W - (z.y + z.h);
    const y = z.x;
    return (
      '<g class="zone ' + z.kind + '">' +
      '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + z.h + '" height="' + z.w + '" rx="2"/>' +
      '<text x="' + r1(x + 1.6) + '" y="' + r1(y + 4) + '">' + z.label + '</text>' +
      '</g>'
    );
  }

  function create(host, opts) {
    opts = opts || {};
    const id = ++uid;
    const decorative = !!opts.decorative;

    host.innerHTML =
      '<svg class="pitch-svg" viewBox="0 0 ' + W + ' ' + H + '" ' +
      (decorative ? 'aria-hidden="true"' : 'role="img" aria-label="Spielfeld"') + ' focusable="false">' +
      '<defs>' +
      '<marker id="ah-own-' + id + '" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0 0L4 2L0 4z" fill="#ffffff"/></marker>' +
      '<marker id="ah-opp-' + id + '" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0 0L4 2L0 4z" fill="#ffc83d"/></marker>' +
      '</defs>' +
      markings() +
      '<g class="zones"></g><g class="arrows"></g><g class="players"></g><g class="ball"></g>' +
      '</svg>';

    const svg = host.querySelector('svg');
    const zonesG = svg.querySelector('.zones');
    const arrowsG = svg.querySelector('.arrows');
    const playersG = svg.querySelector('.players');
    const ballG = svg.querySelector('g.ball');

    function player(team, i) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'pl ' + team);
      g.innerHTML = '<circle class="sub-ring" r="4.3"/>' +
        (team === 'own'
          ? '<circle class="dot" r="2.6"/>'
          : '<rect class="dot" x="-2.4" y="-2.4" width="4.8" height="4.8" rx="1.1"/>');
      g.style.transitionDelay = (i * 25) + 'ms';
      playersG.appendChild(g);
      return g;
    }

    const own = [];
    const opp = [];
    for (let i = 0; i < 8; i++) { own.push(player('own', i)); opp.push(player('opp', i)); }
    ballG.innerHTML = '<ellipse class="shadow" cx="0.3" cy="1.1" rx="1.5" ry="0.6"/><circle class="b" r="1.5"/>';

    function place(g, p) {
      const v = toView(p);
      g.style.transform = 'translate(' + r1(v[0]) + 'px,' + r1(v[1]) + 'px)';
    }

    function arrowSvg(a) {
      const kind = a.kind || 'own';
      const f = toView(a.from);
      const t = toView(a.to);
      return '<path class="arrow ' + kind + (a.dash ? ' dash' : '') + '" d="M' + r1(f[0]) + ' ' + r1(f[1]) +
        'L' + r1(t[0]) + ' ' + r1(t[1]) + '" marker-end="url(#ah-' + kind + '-' + id + ')"/>';
    }

    function show(scene, o) {
      const instant = !!(o && o.instant);
      if (instant) svg.classList.add('is-instant');

      scene.own.forEach((p, i) => place(own[i], p));
      scene.opp.forEach((p, i) => place(opp[i], p));
      place(ballG, scene.ball);
      own.forEach((g, i) => g.classList.toggle('is-sub', !!(scene.subs && scene.subs.indexOf(i) !== -1)));

      zonesG.innerHTML = (scene.zones || []).map(zoneSvg).join('');
      arrowsG.innerHTML = (scene.arrows || []).map(arrowSvg).join('');

      if (instant) {
        void svg.getBoundingClientRect(); // Position ohne Animation übernehmen
        svg.classList.remove('is-instant');
      }
    }

    function setLabel(text) {
      if (!decorative) svg.setAttribute('aria-label', text);
    }

    return { show: show, setLabel: setLabel };
  }

  global.TBPitch = { create: create };
})(window);
