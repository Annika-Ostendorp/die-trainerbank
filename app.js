/* ==========================================================================
   App-Steuerung „Die Trainerbank“
   Zustände (state.view):
     entry  Einstieg
     d1     Erste Entscheidung
     d2     Konsequenz + zweite Entscheidung
     end    Abschluss und Reflexion
   ========================================================================== */
(function () {
  'use strict';

  const D = window.TRAINERBANK;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = {
    app: $('#app'),
    title: $('#bar-title'),
    back: $('#back-btn'),
    crumbs: $('#crumbs'),
    entry: $('#view-entry'),
    game: $('#view-game'),
    panel: $('#panel'),
    caption: $('#pitch-caption'),
    score: $('#sb-score'),
    clock: $('#sb-clock'),
    replay: $('#replay-btn'),
    sheet: $('#sheet')
  };

  const pitch = TBPitch.create($('#pitch-host'));
  const entryPitch = TBPitch.create($('#entry-pitch'), { decorative: true });
  const sheet = new InsightSheet(el.sheet, { inert: [el.app] });

  const state = {
    view: 'entry',
    stage: 0,
    node: null,
    first: null,
    second: null,
    selected: null,
    ending: null,
    timers: []
  };

  const PAGE_TITLES = {
    entry: 'Fußball',
    d1: 'Trainerbank – Entscheidung 1 von 2',
    d2: 'Trainerbank – Entscheidung 2 von 2',
    end: 'Trainerbank – Abschluss'
  };
  const CRUMB_LABELS = { d1: 'Entscheidung 1 von 2', d2: 'Entscheidung 2 von 2', end: 'Abschluss' };

  /* ---------- Grundgerüst ---------- */

  $('#sb-home').textContent = D.teams.home;
  $('#sb-away').textContent = D.teams.away;
  entryPitch.show(D.scenes.start, { instant: true });
  pitch.show(D.scenes.start, { instant: true });
  showView('entry');

  function showView(view) {
    state.view = view;
    const inGame = view !== 'entry';
    el.entry.hidden = inGame;
    el.game.hidden = !inGame;
    el.back.hidden = !inGame;
    el.replay.hidden = view !== 'end';
    el.title.textContent = inGame ? 'Trainerbank' : 'Fußball';
    document.title = PAGE_TITLES[view] + ' · CHECK24 Konzeptprototyp';
    renderCrumbs(view);
  }

  function renderCrumbs(view) {
    if (view === 'entry') {
      el.crumbs.innerHTML = '<li aria-current="page">Fußball</li>';
      return;
    }
    el.crumbs.innerHTML =
      '<li><button type="button" class="crumb-link" data-go="entry">Fußball</button></li>' +
      '<li>Trainerbank</li>' +
      '<li aria-current="page">' + CRUMB_LABELS[view] + '</li>';
  }

  function setPanel(html) {
    el.panel.innerHTML = html;
    el.panel.classList.remove('enter');
    void el.panel.offsetWidth;
    el.panel.classList.add('enter');
  }

  function focusHeading(root) {
    const h = $('h2', root);
    window.scrollTo(0, 0);
    if (h) h.focus({ preventScroll: true });
  }

  function clearTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
  }

  function applyScene(sceneKey, clock, score, caption, instant) {
    pitch.show(D.scenes[sceneKey], { instant: !!instant });
    el.clock.textContent = clock + (clock.indexOf('+') === -1 ? ' Minute' : ' Min.');
    el.score.textContent = score[0] + ' : ' + score[1];
    el.caption.textContent = caption;
    pitch.setLabel('Spielfeld: ' + caption);
  }

  /* ---------- Navigation ---------- */

  function goHome() {
    clearTimers();
    sheet.close();
    resetRun();
    applyScene('start', D.first.clock, D.first.score, D.first.caption, true);
    showView('entry');
    focusHeading(el.entry);
  }

  function resetRun() {
    state.node = null;
    state.first = null;
    state.second = null;
    state.selected = null;
    state.ending = null;
  }

  function startRun() {
    clearTimers();
    resetRun();
    applyScene('start', D.first.clock, D.first.score, D.first.caption, state.view === 'entry');
    renderDecision(D.first, 1);
  }

  /* ---------- Bausteine ---------- */

  function stepsHtml(stage) {
    const labels = ['Entscheidung 1', 'Entscheidung 2', 'Abschluss'];
    return '<ol class="steps" aria-label="Fortschritt">' + labels.map((l, i) => {
      const n = i + 1;
      const cls = n < stage ? ' class="done"' : '';
      const cur = n === stage ? ' aria-current="step"' : '';
      return '<li' + cls + cur + '>' + l + '</li>';
    }).join('') + '</ol>';
  }

  function optionHtml(o) {
    return (
      '<label class="opt">' +
        '<input type="radio" name="strategy" value="' + esc(o.id) + '">' +
        '<span class="opt-body">' +
          '<span class="opt-key" aria-hidden="true">' + esc(o.key) + '</span>' +
          '<span class="opt-text"><strong>' + esc(o.label) + '</strong><span>' + esc(o.summary) + '</span></span>' +
          '<span class="opt-check" aria-hidden="true">✓</span>' +
        '</span>' +
      '</label>'
    );
  }

  /* ---------- ZUSTAND 2 + 3: Entscheidung ---------- */

  function renderDecision(node, stage) {
    state.node = node;
    state.stage = stage;
    state.selected = null;
    showView(stage === 1 ? 'd1' : 'd2');

    const feedback = node.feedback
      ? '<div class="feedback"><span class="feedback-ic" aria-hidden="true">✓</span><p>' + esc(node.feedback) + '</p></div>'
      : '';

    setPanel(
      stepsHtml(stage) +
      feedback +
      '<p class="eyebrow">Entscheidung ' + stage + ' von 2</p>' +
      '<h2 id="panel-title" tabindex="-1">' + esc(node.title) + '</h2>' +
      '<p class="situation">' + esc(node.situation) + '</p>' +
      '<fieldset class="options">' +
        '<legend class="sr-only">Wähle deine Strategie</legend>' +
        node.options.map(optionHtml).join('') +
      '</fieldset>' +
      '<button type="button" class="btn ghost block" id="insight-btn" aria-haspopup="dialog" aria-expanded="false">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/></svg>' +
        'Chancen &amp; Risiken verstehen' +
      '</button>' +
      '<p class="optional-hint">Optional – du kannst auch direkt entscheiden.</p>' +
      '<div class="action-bar">' +
        '<button type="button" class="btn primary block" id="confirm-btn" disabled aria-describedby="confirm-hint">Entscheidung bestätigen</button>' +
        '<p class="confirm-hint" id="confirm-hint" aria-live="polite">Wähle zuerst eine Strategie.</p>' +
      '</div>' +
      '<button type="button" class="link-btn" data-restart>' + (stage === 1 ? 'Zurücksetzen' : 'Von vorn beginnen') + '</button>'
    );

    const confirmBtn = $('#confirm-btn', el.panel);
    const hint = $('#confirm-hint', el.panel);

    el.panel.querySelectorAll('input[name="strategy"]').forEach((input) => {
      input.addEventListener('change', () => {
        state.selected = input.value;
        const opt = node.options.find((o) => o.id === input.value);
        confirmBtn.disabled = false;
        hint.textContent = 'Gewählt: ' + opt.label;
      });
    });

    confirmBtn.addEventListener('click', confirmChoice);
    $('#insight-btn', el.panel).addEventListener('click', (e) => openInsight(e.currentTarget));

    focusHeading(el.panel);
  }

  function openInsight(trigger) {
    const node = state.node;
    const chosen = node.options.find((o) => o.id === state.selected);
    sheet.open({
      trigger: trigger,
      eyebrow: 'Chancen & Risiken · Entscheidung ' + state.stage + ' von 2',
      title: chosen ? chosen.label : 'Beide Strategien im Überblick',
      items: chosen ? [chosen] : node.options,
      note: (chosen
        ? 'Deine Auswahl bleibt erhalten. '
        : 'Du hast noch nichts gewählt – die Auswahl bleibt offen. ') +
        'Das ist eine Einordnung, keine Vorhersage. Wie sich das Spiel entwickelt, siehst du erst nach deiner bestätigten Entscheidung.'
    });
  }

  function confirmChoice() {
    const opt = state.node.options.find((o) => o.id === state.selected);
    if (!opt) return;

    if (state.stage === 1) {
      state.first = opt;
      const next = D.consequences[opt.id];
      applyScene(next.scene, next.clock, next.score, next.caption);
      renderDecision(next, 2);
    } else {
      state.second = opt;
      renderEnding(D.endings[opt.id]);
    }
  }

  /* ---------- ZUSTAND 4: Abschluss ---------- */

  function renderEnding(end) {
    state.stage = 3;
    state.ending = end;
    showView('end');

    const events = end.events.map((e) =>
      '<li><span class="min">' + esc(e.min) + '</span>' + esc(e.text) + '</li>'
    ).join('');

    setPanel(
      stepsHtml(3) +
      '<p class="eyebrow">Simulierter Abschluss</p>' +
      '<h2 id="panel-title" tabindex="-1">' + esc(end.headline) + '</h2>' +
      '<p class="result"><span class="result-tag">Simulierter Ausgang</span><strong>' + esc(end.outcome) + '</strong></p>' +

      '<h3 class="sub">Dein Weg</h3>' +
      '<div class="path"><span class="chip">' + esc(state.first.label) + '</span>' +
        '<span class="path-arrow" aria-hidden="true">→</span>' +
        '<span class="chip">' + esc(state.second.label) + '</span></div>' +

      '<h3 class="sub">Was passiert ist</h3>' +
      '<ol class="timeline">' + events + '</ol>' +

      '<h3 class="sub">Chancen und Risiken im Rückblick</h3>' +
      InsightSheet.blocks(end.reflection) +
      '<p class="alt">' + esc(end.reflection.alternative) + '</p>' +
      '<p class="disclaimer">Alle Verläufe sind vordefiniert und simuliert. In jeder Variante wäre auch ein anderer Ausgang denkbar gewesen.</p>' +

      '<div class="next" role="note">' +
        '<span class="next-ic" aria-hidden="true">⏱</span>' +
        '<div><strong>Nächste Trainer-Challenge</strong><br><span>Eine neue Spielsituation – Idee für später. Im Prototyp noch nicht verfügbar.</span></div>' +
        '<span class="next-tag">Kommt später</span>' +
      '</div>' +

      '<div class="action-bar">' +
        '<button type="button" class="btn primary block" data-restart>Anderen Spielverlauf ausprobieren</button>' +
      '</div>' +
      '<button type="button" class="link-btn" data-go="entry">Zurück zu Fußball</button>'
    );

    playFrames(end.frames, false);
    focusHeading(el.panel);
  }

  /** Spielt die Frames des Abschlusses ab (oder zeigt bei reduzierter Bewegung nur den letzten). */
  function playFrames(frames, fromConsequence) {
    clearTimers();
    const apply = (f, instant) => applyScene(f.scene, f.clock, f.score, f.caption, instant);

    if (reduced()) {
      apply(frames[frames.length - 1], true);
      return;
    }
    if (fromConsequence) {
      const c = D.consequences[state.first.id];
      applyScene(c.scene, c.clock, c.score, c.caption, true);
    }
    frames.forEach((f, i) => {
      state.timers.push(setTimeout(() => apply(f, false), 250 + i * 1700));
    });
  }

  /* ---------- Ereignisse ---------- */

  $('#start-btn').addEventListener('click', startRun);
  el.replay.addEventListener('click', () => {
    if (state.ending) playFrames(state.ending.frames, true);
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-restart]')) {
      startRun();
      return;
    }
    if (e.target.closest('[data-go="entry"]')) goHome();
  });
})();
