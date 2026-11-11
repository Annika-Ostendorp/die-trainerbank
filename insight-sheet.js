/* ==========================================================================
   InsightSheet – wiederverwendbares Bottom Sheet „Chancen & Risiken“
   - Wird für beide Entscheidungsstufen genutzt (eine Instanz, andere Inhalte).
   - Schließen: X, „Zurück zur Entscheidung“, Escape, Klick auf den Hintergrund.
   - Fokus: beim Öffnen auf die Überschrift, Tab bleibt im Sheet,
     beim Schließen zurück zum auslösenden Button.
   - Hintergrund wird "inert" und bleibt sichtbar (abgedunkelt).
   - Das Sheet verändert keinen App-Zustand (die gewählte Strategie bleibt).
   - Animation ca. 260 ms; bei prefers-reduced-motion ohne Bewegung.
   ========================================================================== */
(function (global) {
  'use strict';

  const CLOSE_MS = 260;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON_CHANCE =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  const ICON_RISK =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>';

  /** Chance- und Risiko-Block (auch auf dem Abschluss-Screen genutzt). */
  function blocks(info) {
    return (
      '<div class="insight chance">' +
        '<span class="insight-ic">' + ICON_CHANCE + '</span>' +
        '<div><p class="insight-label">Mögliche Chance</p><p>' + esc(info.chance) + '</p></div>' +
      '</div>' +
      '<div class="insight risk">' +
        '<span class="insight-ic">' + ICON_RISK + '</span>' +
        '<div><p class="insight-label">Mögliches Risiko</p><p>' + esc(info.risk) + '</p></div>' +
      '</div>'
    );
  }

  class InsightSheet {
    /**
     * @param {HTMLElement} root  Container mit .sheet, .sheet-backdrop usw.
     * @param {{inert?: HTMLElement[]}} options  Elemente, die bei geöffnetem Sheet inert werden
     */
    constructor(root, options) {
      options = options || {};
      this.root = root;
      this.sheet = root.querySelector('.sheet');
      this.titleEl = root.querySelector('#sheet-title');
      this.eyebrowEl = root.querySelector('#sheet-eyebrow');
      this.bodyEl = root.querySelector('#sheet-body');
      this.noteEl = root.querySelector('#sheet-note');
      this.inertEls = options.inert || [];
      this.trigger = null;
      this.isOpen = false;
      this._timer = null;

      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) this.close();
      });
      document.addEventListener('keydown', (e) => this._onKey(e));
    }

    /**
     * @param {{trigger: HTMLElement, eyebrow: string, title: string,
     *          items: Array<{label:string, chance:string, risk:string}>, note: string}} content
     */
    open(content) {
      if (this.isOpen) return;
      clearTimeout(this._timer);

      this.trigger = content.trigger || null;
      this.eyebrowEl.textContent = content.eyebrow || '';
      this.titleEl.textContent = content.title || '';
      this.noteEl.textContent = content.note || '';
      this.bodyEl.innerHTML = content.items.map((item) =>
        '<section class="sheet-item">' +
          (content.items.length > 1 ? '<h3>' + esc(item.label) + '</h3>' : '') +
          blocks(item) +
        '</section>'
      ).join('');
      this.bodyEl.scrollTop = 0;

      this.root.hidden = false;
      document.body.classList.add('sheet-open');
      this.inertEls.forEach((el) => { el.inert = true; });
      void this.sheet.offsetWidth; // Startzustand festschreiben, damit die Transition läuft
      this.root.classList.add('is-open');
      this.isOpen = true;
      if (this.trigger) this.trigger.setAttribute('aria-expanded', 'true');
      this.titleEl.focus({ preventScroll: true });
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.root.classList.remove('is-open');
      document.body.classList.remove('sheet-open');
      this.inertEls.forEach((el) => { el.inert = false; });

      const finish = () => { this.root.hidden = true; };
      if (reduced()) finish();
      else this._timer = setTimeout(finish, CLOSE_MS);

      if (this.trigger) {
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.focus();
      }
    }

    _onKey(e) {
      if (!this.isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = Array.prototype.slice.call(
        this.sheet.querySelectorAll('button:not([disabled]), a[href], input, select, textarea')
      );
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;
      const inside = this.sheet.contains(active);

      if (!inside) { e.preventDefault(); firstEl.focus(); return; }
      if (e.shiftKey && (active === firstEl || active === this.titleEl)) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && active === lastEl) { e.preventDefault(); firstEl.focus(); }
    }
  }

  InsightSheet.blocks = blocks;
  global.InsightSheet = InsightSheet;
})(window);
