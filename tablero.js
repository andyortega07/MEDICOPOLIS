/* ==============================================
   tablero.js — Dados, fichas y lógica de turno
============================================== */

/* ── CARAS DE DADO ── */
const FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

/* ── MAPA DE CASILLAS ──
   40 casillas en sentido horario empezando desde
   la esquina SALIDA (bottom-right) yendo hacia
   la izquierda por la fila inferior.
   Cada casilla = { cx, cy } centro en el SVG (900×900).
   Corner size 110×110, cell size 75×110 / 110×75.
*/
const SQUARES = [
  // 0 SALIDA (bottom-right corner)
  { cx: 843, cy: 843 },
  // 1-9 fila inferior derecha→izquierda
  { cx: 750, cy: 843 }, // C-1
  { cx: 675, cy: 843 }, // Salud
  { cx: 600, cy: 843 }, // N-1
  { cx: 525, cy: 843 }, // N-2
  { cx: 450, cy: 843 }, // Consulta
  { cx: 375, cy: 843 }, // D-1
  { cx: 300, cy: 843 }, // C-2
  { cx: 225, cy: 843 }, // Riesgo
  { cx: 150, cy: 843 }, // R-1
  // 10 VISITA HOSPITAL (bottom-left corner)
  { cx: 57,  cy: 843 },
  // 11-19 columna izquierda abajo→arriba
  { cx: 57,  cy: 750 }, // R-2
  { cx: 57,  cy: 675 }, // D-2
  { cx: 57,  cy: 600 }, // Salud
  { cx: 57,  cy: 525 }, // O-1
  { cx: 57,  cy: 450 }, // Seguro
  { cx: 57,  cy: 375 }, // C-3
  { cx: 57,  cy: 300 }, // N-3
  { cx: 57,  cy: 225 }, // Riesgo
  { cx: 57,  cy: 150 }, // O-2
  // 20 UCI (top-left corner)
  { cx: 57,  cy: 57  },
  // 21-29 fila superior izquierda→derecha
  { cx: 150, cy: 57  }, // N-4
  { cx: 225, cy: 57  }, // O-3
  { cx: 300, cy: 57  }, // Examen
  { cx: 375, cy: 57  }, // D-3
  { cx: 450, cy: 57  }, // C-4
  { cx: 525, cy: 57  }, // Salud
  { cx: 600, cy: 57  }, // R-3
  { cx: 675, cy: 57  }, // O-4
  { cx: 750, cy: 57  }, // Riesgo
  // 30 ZONA LIBRE (top-right corner)
  { cx: 843, cy: 57  },
  // 31-39 columna derecha arriba→abajo
  { cx: 843, cy: 150 }, // D-4
  { cx: 843, cy: 225 }, // N-5
  { cx: 843, cy: 300 }, // Análisis
  { cx: 843, cy: 375 }, // C-5
  { cx: 843, cy: 450 }, // Salud
  { cx: 843, cy: 525 }, // R-4
  { cx: 843, cy: 600 }, // O-5
  { cx: 843, cy: 675 }, // Riesgo
  { cx: 843, cy: 750 }, // N-6
];

const TOTAL = SQUARES.length; // 40

/* ── ESTADO DEL JUEGO ── */
const state = {
  turn:      0,          // índice del jugador activo
  positions: [0, 0, 0],  // casilla actual de cada jugador
  money:     [1500, 1500, 1500],
  rolling:   false,
};

const NAMES   = ['Jugador 1', 'Jugador 2', 'Jugador 3'];
const TOKENS  = ['🧑', '👩', '👦'];
const COLORS  = ['#C0392B', '#1A5276', '#1E8449'];
const OFFSETS = [              // offsets para que no se superpongan
  { dx: -12, dy:  12 },
  { dx:  12, dy: -12 },
  { dx:  14, dy:  14 },
];

/* ── UTILIDADES DOM ── */
function $(id) { return document.getElementById(id); }

function addLog(text, cls = '') {
  const log  = $('gameLog');
  const p    = document.createElement('p');
  p.className = 'log-entry ' + cls;
  p.textContent = text;
  log.prepend(p);          // más reciente arriba
  // mantener máx 30 entradas
  while (log.children.length > 30) log.removeChild(log.lastChild);
}

function updateMoneyUI() {
  state.money.forEach((m, i) => {
    $('p' + i + 'money').textContent = '$' + m.toLocaleString();
  });
}

function updateTurnUI() {
  for (let i = 0; i < 3; i++) {
    const card = $('p' + i + 'card');
    const ind  = $('p' + i + 'turn');
    if (i === state.turn) {
      card.classList.add('active-turn');
      ind.classList.remove('hidden');
    } else {
      card.classList.remove('active-turn');
      ind.classList.add('hidden');
    }
  }
}

/* ── POSICIÓN SVG DE UNA FICHA ── */
function getPawnPos(playerIdx) {
  const sq  = SQUARES[state.positions[playerIdx]];
  const off = OFFSETS[playerIdx];
  return { cx: sq.cx + off.dx, cy: sq.cy + off.dy };
}

/* ── MOVER FICHA EN EL SVG ── */
function movePawnSvg(playerIdx) {
  const pos    = getPawnPos(playerIdx);
  const circle = $('pawn' + playerIdx);
  const text   = $('pawn' + playerIdx + 't');

  // Animación CSS bounce
  circle.classList.remove('pawn-moving');
  text.classList.remove('pawn-moving');
  void circle.offsetWidth; // reflow
  circle.classList.add('pawn-moving');
  text.classList.add('pawn-moving');

  circle.setAttribute('cx', pos.cx);
  circle.setAttribute('cy', pos.cy);
  text.setAttribute('x', pos.cx);
  text.setAttribute('y', pos.cy + 6);

  setTimeout(() => {
    circle.classList.remove('pawn-moving');
    text.classList.remove('pawn-moving');
  }, 450);
}

/* ── INICIALIZAR FICHAS ── */
function initPawns() {
  for (let i = 0; i < 3; i++) movePawnSvg(i);
}

/* ── DADO: CARA UNICODE ── */
function dieFace(n) { return FACES[n - 1]; }

/* ── ANIMAR DADO ── */
function animateDie(elId, finalFace) {
  const el = $(elId);
  let count = 0;
  el.classList.add('rolling');
  const iv = setInterval(() => {
    el.textContent = FACES[Math.floor(Math.random() * 6)];
    count++;
    if (count >= 10) {
      clearInterval(iv);
      el.textContent = finalFace;
      el.classList.remove('rolling');
    }
  }, 55);
}

/* ── LÓGICA DE CASILLA ── */
const SQUARE_NAMES = [
  'SALIDA','C-1 Hipertensión','Tarjeta Salud','N-1 Alimentación',
  'N-2 Obesidad','Consulta Médica','D-1 Diabetes','C-2 Infarto',
  'Tarjeta Riesgo','R-1 EPOC',
  'Visita Hospital',
  'R-2 Asma','D-2 Glucemia','Tarjeta Salud','O-1 Detección',
  'Seguro Médico','C-3 Ejercicio','N-3 Dieta Sana','Tarjeta Riesgo','O-2 Tratamiento',
  'UCI — Emergencia',
  'N-4 Vitaminas','O-3 Prevención','Examen Salud','D-3 Insulina',
  'C-4 Colesterol','Tarjeta Salud','R-3 Tabaquismo','O-4 Diagnóstico','Tarjeta Riesgo',
  'Zona Libre',
  'D-4 Resistencia','N-5 Ultra-proc.','Análisis Clínicos','C-5 ACV',
  'Tarjeta Salud','R-4 Fibrosis','O-5 Biología','Tarjeta Riesgo','N-6 Hidratación',
];

const RENT = {
  1: 120, 3: 100, 4: 120, 6: 140, 7: 160, 9: 180,
  11: 160, 12: 140, 14: 200, 17: 160, 18: 180, 19: 220,
  21: 140, 22: 200, 24: 160, 25: 200, 27: 180, 28: 240,
  31: 180, 32: 160, 34: 220, 36: 200, 37: 240, 39: 180,
};
const SALUD_SQ  = [2, 13, 26, 35];
const RIESGO_SQ = [8, 18, 29, 38];
const PAY_SQ    = { 5: 75, 15: -100, 23: 80, 33: 90 }; // neg = cobrar

function resolveSquare(playerIdx, sq) {
  const name = SQUARE_NAMES[sq] || 'Casilla';
  const p    = playerIdx;

  if (sq === 0) {
    state.money[p] += 200;
    addLog(`🏁 ${NAMES[p]} pasa por SALIDA · cobra $200`, 'good');
    return;
  }
  if (sq === 20) {
    addLog(`🚨 ${NAMES[p]} cae en UCI — pierde 2 turnos o paga $150`, 'alert');
    return;
  }
  if (sq === 10) { addLog(`🏥 ${NAMES[p]} visita el hospital · solo de paseo`, ''); return; }
  if (sq === 30) { addLog(`🛡 ${NAMES[p]} descansa en Zona Libre`, 'good'); return; }

  if (SALUD_SQ.includes(sq)) {
    const bonus = [50, 75, 100][Math.floor(Math.random() * 3)];
    state.money[p] += bonus;
    addLog(`💚 ${NAMES[p]} saca Tarjeta Salud · cobra $${bonus}`, 'good');
    return;
  }
  if (RIESGO_SQ.includes(sq)) {
    const fine = [50, 75, 100][Math.floor(Math.random() * 3)];
    state.money[p] -= fine;
    addLog(`⚠️ ${NAMES[p]} saca Tarjeta Riesgo · paga $${fine}`, 'alert');
    return;
  }
  if (PAY_SQ[sq] !== undefined) {
    const val = PAY_SQ[sq];
    if (val > 0) {
      state.money[p] -= val;
      addLog(`💊 ${NAMES[p]} cae en ${name} · paga $${val}`, '');
    } else {
      state.money[p] += Math.abs(val);
      addLog(`💰 ${NAMES[p]} cae en Seguro · cobra $${Math.abs(val)}`, 'good');
    }
    return;
  }
  if (RENT[sq] !== undefined) {
    addLog(`🏠 ${NAMES[p]} cae en ${name} · renta $${RENT[sq]}`, 'highlight');
    return;
  }
  addLog(`📍 ${NAMES[p]} avanza a ${name}`);
}

/* ── TIRAR DADOS ── */
function rollDice() {
  if (state.rolling) return;
  state.rolling = true;

  const btn = $('rollBtn');
  btn.disabled = true;

  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2;

  // Animar ambos dados
  animateDie('die1', dieFace(d1));
  animateDie('die2', dieFace(d2));

  const result = $('diceResult');
  result.className = 'dice-result';
  result.textContent = '🎲 Tirando…';

  setTimeout(() => {
    result.className = 'dice-result big';
    result.textContent = `${NAMES[state.turn]} saca ${d1} + ${d2} = ${total}`;

    // Mover ficha
    const prev = state.positions[state.turn];
    state.positions[state.turn] = (prev + total) % TOTAL;

    // ¿pasó por SALIDA?
    if (state.positions[state.turn] < prev && state.positions[state.turn] !== 0) {
      state.money[state.turn] += 200;
      addLog(`🏁 ${NAMES[state.turn]} pasa por SALIDA · cobra $200`, 'good');
    }

    movePawnSvg(state.turn);
    resolveSquare(state.turn, state.positions[state.turn]);
    updateMoneyUI();

    // Siguiente turno
    state.turn = (state.turn + 1) % 3;
    updateTurnUI();
    addLog(`🎯 Turno de ${NAMES[state.turn]}`);

    state.rolling = false;
    btn.disabled = false;
  }, 680);
}

/* ── INIT ── */
initPawns();
updateTurnUI();
updateMoneyUI();
addLog(`🎮 ¡Juego iniciado! Turno: ${NAMES[state.turn]}`);
