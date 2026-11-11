/* ==========================================================================
   SZENARIODATEN – „Die Trainerbank“
   Alle Verläufe sind vordefiniert. Es gibt keine Echtzeitberechnung.

   Aufbau
   ------
   TRAINERBANK.scenes       Spielfeld-Momentaufnahmen (Positionen, Pfeile, Zonen)
   TRAINERBANK.first        Entscheidung 1 (Optionen A, B)
   TRAINERBANK.consequences Situation nach A bzw. B + Entscheidung 2
   TRAINERBANK.endings      Vier Abschlüsse (A1, A2, B1, B2) mit Spielzug-Frames

   Koordinaten (Modell): x = 0..68 (Breite), y = 0..100 (Länge).
   Das eigene Team greift Richtung y = 0 an. pitch.js dreht das Bild
   für die Darstellung ins Querformat (Angriff nach rechts).

   Spielerreihenfolge (je Team 8 Figuren, vereinfachte Darstellung):
   0 Torwart · 1 Innenverteidiger links · 2 Innenverteidiger rechts ·
   3 defensives Mittelfeld · 4 zentrales Mittelfeld · 5 Flügel links ·
   6 Flügel rechts · 7 Stürmer
   ========================================================================== */
(function (global) {
  'use strict';

  const scenes = {
    /* ---------- Ausgangslage ---------- */
    start: {
      own: [[34, 94], [24, 76], [44, 76], [34, 64], [34, 55], [15, 46], [53, 46], [34, 40]],
      opp: [[34, 6], [26, 17], [42, 17], [12, 26], [56, 26], [25, 32], [43, 32], [34, 47]],
      ball: [36, 52]
    },

    /* ---------- Nach A: offensiv gewechselt, Ballverlust ---------- */
    A: {
      own: [[34, 88], [27, 58], [41, 58], [34, 46], [43, 36], [14, 30], [54, 28], [30, 25]],
      opp: [[34, 8], [26, 20], [42, 20], [11, 40], [57, 40], [23, 46], [46, 44], [33, 52]],
      ball: [33, 50],
      subs: [5, 6, 7],
      zones: [{ x: 18, y: 62, w: 32, h: 20, kind: 'risk', label: 'Offener Raum' }],
      arrows: [
        { kind: 'opp', from: [33, 55], to: [33, 70] },
        { kind: 'opp', from: [46, 48], to: [47, 64] }
      ]
    },
    A1a: {
      own: [[34, 84], [28, 56], [40, 56], [27, 48], [40, 46], [22, 40], [46, 38], [31, 40]],
      opp: [[34, 8], [26, 22], [42, 22], [11, 42], [57, 42], [24, 47], [45, 47], [33, 52]],
      ball: [33, 50],
      subs: [5, 6, 7],
      arrows: [
        { kind: 'own', from: [22, 40], to: [30, 48] },
        { kind: 'own', from: [46, 38], to: [37, 48] }
      ]
    },
    A1b: {
      own: [[34, 80], [28, 52], [40, 52], [33, 46], [38, 38], [20, 32], [48, 30], [32, 32]],
      opp: [[34, 8], [26, 22], [42, 22], [12, 38], [56, 38], [25, 45], [45, 43], [35, 50]],
      ball: [37, 38],
      subs: [5, 6, 7],
      arrows: [{ kind: 'own', from: [37, 35], to: [32, 24] }]
    },
    A1c: {
      own: [[34, 76], [28, 48], [40, 48], [34, 38], [40, 28], [20, 26], [50, 20], [34, 17]],
      opp: [[34, 6], [26, 19], [42, 19], [12, 32], [56, 32], [26, 32], [44, 30], [36, 36]],
      ball: [34, 16],
      subs: [5, 6, 7],
      arrows: [{ kind: 'own', from: [34, 14], to: [34, 2] }]
    },
    A2a: {
      own: [[34, 90], [28, 72], [40, 72], [34, 64], [42, 62], [22, 60], [46, 60], [34, 58]],
      opp: [[34, 8], [26, 22], [42, 22], [11, 42], [57, 42], [24, 48], [45, 48], [33, 52]],
      ball: [33, 50],
      subs: [5, 6, 7],
      zones: [{ x: 16, y: 54, w: 36, h: 26, kind: 'chance', label: 'Kompakter Block' }]
    },
    A2b: {
      own: [[34, 90], [28, 72], [40, 72], [34, 63], [42, 62], [22, 60], [46, 60], [34, 58]],
      opp: [[34, 8], [26, 24], [42, 24], [11, 46], [57, 46], [24, 50], [45, 52], [33, 56]],
      ball: [34, 62],
      subs: [5, 6, 7],
      arrows: [{ kind: 'opp', dash: true, from: [33, 59], to: [34, 68] }]
    },
    A2c: {
      own: [[34, 92], [26, 72], [42, 72], [34, 62], [34, 54], [18, 50], [50, 50], [34, 44]],
      opp: [[34, 8], [26, 20], [42, 20], [12, 30], [56, 30], [26, 36], [42, 36], [34, 46]],
      ball: [34, 60],
      subs: [5, 6, 7]
    },

    /* ---------- Nach B: kontrolliert aufgebaut, Angriffsdrittel ---------- */
    B: {
      own: [[34, 86], [26, 68], [42, 68], [36, 54], [40, 45], [12, 32], [56, 32], [34, 30]],
      opp: [[34, 6], [28, 16], [40, 16], [14, 22], [54, 22], [24, 27], [44, 27], [29, 37]],
      ball: [40, 44],
      zones: [{ x: 2, y: 2, w: 64, h: 30, kind: 'chance', label: 'Angriffsdrittel' }]
    },
    B1a: {
      own: [[34, 84], [26, 64], [42, 64], [36, 52], [40, 44], [14, 28], [54, 28], [34, 30]],
      opp: [[34, 6], [28, 16], [40, 16], [14, 22], [54, 22], [24, 27], [44, 27], [29, 37]],
      ball: [40, 44],
      arrows: [
        { kind: 'own', dash: true, from: [34, 28], to: [34, 13] },
        { kind: 'own', from: [40, 42], to: [35, 17] }
      ]
    },
    B1b: {
      own: [[34, 80], [26, 62], [42, 62], [36, 50], [40, 42], [14, 26], [54, 26], [34, 11]],
      opp: [[34, 8], [28, 17], [40, 17], [14, 24], [54, 24], [24, 29], [44, 29], [29, 39]],
      ball: [34, 12],
      arrows: [{ kind: 'own', from: [34, 10], to: [37, 2] }]
    },
    B1c: {
      own: [[34, 78], [26, 58], [42, 58], [36, 46], [40, 36], [16, 22], [52, 20], [34, 12]],
      opp: [[38, 5], [28, 16], [40, 16], [14, 22], [54, 22], [24, 27], [44, 27], [29, 37]],
      ball: [44, 3]
    },
    B2a: {
      own: [[34, 84], [26, 64], [42, 64], [36, 50], [40, 42], [14, 28], [56, 30], [34, 26]],
      opp: [[34, 6], [28, 16], [40, 16], [14, 22], [52, 24], [26, 28], [44, 30], [30, 38]],
      ball: [56, 30],
      arrows: [
        { kind: 'own', from: [41, 41], to: [54, 31] },
        { kind: 'own', dash: true, from: [14, 26], to: [26, 14] }
      ]
    },
    B2b: {
      own: [[34, 80], [26, 60], [42, 60], [36, 46], [40, 38], [26, 16], [56, 14], [38, 12]],
      opp: [[34, 6], [28, 15], [40, 15], [14, 20], [54, 18], [26, 26], [44, 24], [30, 36]],
      ball: [56, 14],
      arrows: [{ kind: 'own', from: [54, 13], to: [40, 11] }]
    },
    B2c: {
      own: [[34, 80], [26, 60], [42, 60], [36, 46], [40, 38], [26, 16], [56, 16], [36, 9]],
      opp: [[34, 6], [28, 15], [40, 15], [14, 20], [54, 18], [26, 26], [44, 24], [30, 36]],
      ball: [35, 3],
      arrows: [{ kind: 'own', from: [36, 7], to: [34, 1.5] }]
    }
  };

  /* ---------- ENTSCHEIDUNG 1 ---------- */
  const first = {
    stage: 1,
    scene: 'start',
    clock: '87.',
    score: [1, 1],
    caption: 'Ausgangslage: Dein Team (blau) spielt von links nach rechts. Der Ball ist in der Mitte.',
    title: 'Wie gehst du die Schlussphase an?',
    situation: '87. Minute, 1:1. Deine Mannschaft ist erschöpft und braucht einen Sieg. Es läuft noch etwa drei Minuten plus Nachspielzeit.',
    options: [
      {
        id: 'A', key: 'A', label: 'Offensiv wechseln',
        summary: 'Frische Offensivkräfte bringen mehr Angriffsdruck – mit höherem Konterrisiko.',
        chance: 'Neue, frische Offensivspieler können den Gegner tief in die eigene Hälfte drängen. So entstehen mehr Abschlüsse in kurzer Zeit.',
        risk: 'Hinter der aufgerückten Mannschaft entsteht mehr Raum. Ein Ballverlust kann dem Gegner einen schnellen Konter ermöglichen.'
      },
      {
        id: 'B', key: 'B', label: 'Kontrolliert aufbauen',
        summary: 'Mehr Ballkontrolle und Geduld – aber weniger Zeit.',
        chance: 'Das Team behält den Ball, ordnet sich und wartet auf eine passende Lücke. Für den Gegner bleiben weniger offene Räume.',
        risk: 'Die Zeit wird knapper. Dauert der Aufbau zu lange, bleiben am Ende weniger Möglichkeiten für einen Abschluss.'
      }
    ]
  };

  /* ---------- KONSEQUENZ + ENTSCHEIDUNG 2 ---------- */
  const consequences = {
    A: {
      stage: 2,
      scene: 'A',
      clock: '89.',
      score: [1, 1],
      caption: 'Ballverlust: Der Gegner (gelb) kann in den Raum hinter deiner Mittelfeldreihe kontern.',
      feedback: 'Du hast offensiv gewechselt: Drei frische Offensivkräfte sind im Spiel und die Mannschaft ist aufgerückt.',
      title: 'Ballverlust – ein Konter droht',
      situation: '89. Minute. Dein Team steht hoch, doch ein Pass im Mittelfeld wurde abgefangen. Der Gegner startet schnell in den freien Raum hinter deiner Mittelfeldreihe.',
      options: [
        {
          id: 'A1', key: 'A1', label: 'Gegenpressing',
          summary: 'Sofort Druck auf den Ball, um ihn zurückzuerobern.',
          chance: 'Gelingt der Ballgewinn schnell, steht der Gegner oft noch ungeordnet. Der Weg zum Tor ist dann kurz.',
          risk: 'Wird das Pressing überspielt, ist hinter den pressenden Spielern viel Platz für den Gegner.'
        },
        {
          id: 'A2', key: 'A2', label: 'Defensive Räume schließen',
          summary: 'Zurückfallen und die Mitte kompakt halten.',
          chance: 'Eine kompakte Formation nimmt dem Gegner Passwege. Das Ergebnis bleibt gut abgesichert.',
          risk: 'Das Team gibt die Initiative ab. Eigene Torchancen werden in den letzten Minuten dadurch seltener.'
        }
      ]
    },
    B: {
      stage: 2,
      scene: 'B',
      clock: '89.',
      score: [1, 1],
      caption: 'Dein Team hat den Ball sicher im Angriffsdrittel. Der Gegner steht tief.',
      feedback: 'Du hast kontrolliert aufgebaut: Dein Team behält den Ball und kommt geordnet in die Nähe des gegnerischen Strafraums.',
      title: 'Kontrolliert im Angriffsdrittel',
      situation: '89. Minute. Dein Team hat den Ball sicher und erreicht das Angriffsdrittel. Der Gegner verteidigt tief – aber die Zeit läuft.',
      options: [
        {
          id: 'B1', key: 'B1', label: 'Riskanter Steilpass',
          summary: 'Ein Pass in die Lücke hinter der Abwehr.',
          chance: 'Ein präziser Pass kann die Abwehr mit einem Mal überwinden und eine große Torchance schaffen.',
          risk: 'Der Pass ist anspruchsvoll. Wird er abgefangen, ist der Ball weg und es bleibt kaum Zeit für einen neuen Angriff.'
        },
        {
          id: 'B2', key: 'B2', label: 'Angriff über außen',
          summary: 'Den Ball auf den Flügel bringen und in den Strafraum flanken.',
          chance: 'Flanken ziehen die Abwehr auseinander und bieten mehrere Abschlussmöglichkeiten im Strafraum.',
          risk: 'Der Weg ist langsamer und gut zu verteidigen. Eine abgeblockte Flanke kostet wertvolle Sekunden.'
        }
      ]
    }
  };

  /* ---------- ABSCHLÜSSE ---------- */
  const endings = {
    A1: {
      headline: 'Ballgewinn und schneller Abschluss',
      outcome: 'Tor zum 2:1 (90.+1)',
      frames: [
        { scene: 'A1a', clock: '89.', score: [1, 1], caption: 'Mehrere Spieler pressen sofort auf den Ballführenden.' },
        { scene: 'A1b', clock: '90.', score: [1, 1], caption: 'Ballgewinn im Mittelfeld – der Gegner steht noch ungeordnet.' },
        { scene: 'A1c', clock: '90.+1', score: [2, 1], caption: 'Schnelles Umschalten, Abschluss im Strafraum: simuliertes Tor zum 2:1.' }
      ],
      events: [
        { min: '89.', text: 'Mehrere Spieler pressen sofort auf den Ballführenden.' },
        { min: '90.', text: 'Der Ball wird im Mittelfeld erobert, der Gegner ist noch nicht sortiert.' },
        { min: '90.+1', text: 'Schneller Pass nach vorn, Abschluss im Strafraum: 2:1.' }
      ],
      reflection: {
        chance: 'Der Ball wurde früh zurückerobert. In so einer Situation ist der Gegner oft noch nicht sortiert und der Weg zum Tor ist kurz.',
        risk: 'Das Pressing hätte auch überspielt werden können. Dann wäre hinter deinen pressenden Spielern viel Platz gewesen.',
        alternative: 'Mit „Defensive Räume schließen“ hättest du das Risiko verkleinert – und dafür weniger Chancen auf einen Siegtreffer gehabt.'
      }
    },
    A2: {
      headline: 'Kompakt gestanden, Punkt gesichert',
      outcome: '1:1 zum Schlusspfiff',
      frames: [
        { scene: 'A2a', clock: '89.', score: [1, 1], caption: 'Das Team fällt zurück und verdichtet die Mitte.' },
        { scene: 'A2b', clock: '90.', score: [1, 1], caption: 'Der Pass in die Tiefe wird abgefangen. Der Konter verpufft.' },
        { scene: 'A2c', clock: '90.+3', score: [1, 1], caption: 'Dein Team beruhigt das Spiel. Simulierter Schlusspfiff beim 1:1.' }
      ],
      events: [
        { min: '89.', text: 'Das Team fällt zurück und verdichtet die Mitte.' },
        { min: '90.', text: 'Der Pass in die Tiefe wird abgefangen, der Konter verpufft.' },
        { min: '90.+3', text: 'Der Ball läuft durch die eigenen Reihen, dann kommt der Schlusspfiff: 1:1.' }
      ],
      reflection: {
        chance: 'Die kompakte Formation nahm dem Gegner die Passwege. Der Punkt blieb gut abgesichert.',
        risk: 'Mit dem Zurückfallen gibt das Team die Initiative ab. Eigene Torchancen werden in der Schlussphase dadurch seltener.',
        alternative: 'Mit Gegenpressing hättest du auf den schnellen Ballgewinn und einen Abschluss gesetzt – bei mehr Raum im Rücken.'
      }
    },
    B1: {
      headline: 'Steilpass: große Chance erspielt',
      outcome: '1:1 zum Schlusspfiff (Torwart pariert)',
      frames: [
        { scene: 'B1a', clock: '89.', score: [1, 1], caption: 'Der Stürmer startet in die Lücke zwischen den Innenverteidigern.' },
        { scene: 'B1b', clock: '90.', score: [1, 1], caption: 'Der Steilpass kommt an – Abschluss gegen den herauslaufenden Torwart.' },
        { scene: 'B1c', clock: '90.+2', score: [1, 1], caption: 'Der Torwart lenkt den Ball zur Ecke. Danach pfeift der Schiedsrichter ab: 1:1.' }
      ],
      events: [
        { min: '89.', text: 'Der Stürmer startet in die Lücke zwischen den Innenverteidigern.' },
        { min: '90.', text: 'Der Steilpass kommt an, der Stürmer schließt ab.' },
        { min: '90.+2', text: 'Der Torwart lenkt den Ball zur Ecke. Danach ist Schluss: 1:1.' }
      ],
      reflection: {
        chance: 'Der Pass hat die Abwehr überwunden und eine große Torchance geschaffen.',
        risk: 'So ein anspruchsvoller Pass hätte auch abgefangen werden können. Dann wäre der Ball weg gewesen und kaum Zeit für einen neuen Angriff geblieben.',
        alternative: 'Mit „Angriff über außen“ wäre der Weg langsamer gewesen, dafür hätte dein Team den Ball länger unter Kontrolle gehabt.'
      }
    },
    B2: {
      headline: 'Über außen zur Flanke und zum Kopfball',
      outcome: 'Tor zum 2:1 (90.+2)',
      frames: [
        { scene: 'B2a', clock: '90.', score: [1, 1], caption: 'Der Ball geht auf den Flügel – die Abwehr muss zur Seite schieben.' },
        { scene: 'B2b', clock: '90.+1', score: [1, 1], caption: 'Flanke in den Strafraum: Drei Abnehmer warten.' },
        { scene: 'B2c', clock: '90.+2', score: [2, 1], caption: 'Kopfball nach der Flanke: simuliertes Tor zum 2:1.' }
      ],
      events: [
        { min: '90.', text: 'Der Ball geht auf den Flügel, die Abwehr muss zur Seite schieben.' },
        { min: '90.+1', text: 'Flanke in den Strafraum, drei Abnehmer warten dort.' },
        { min: '90.+2', text: 'Kopfball nach der Flanke: 2:1.' }
      ],
      reflection: {
        chance: 'Die Flanke fand mehrere Abnehmer im Strafraum, während die Abwehr zur Seite verschieben musste.',
        risk: 'Der Weg über außen ist langsamer und gut zu verteidigen. Eine abgeblockte Flanke hätte wertvolle Sekunden gekostet.',
        alternative: 'Mit dem Steilpass hättest du schneller, aber riskanter versucht, die Abwehr zu überwinden.'
      }
    }
  };

  global.TRAINERBANK = {
    teams: { home: 'FC Nordstadt', away: 'SV Südhafen' },
    scenes: scenes,
    first: first,
    consequences: consequences,
    endings: endings
  };
})(window);
