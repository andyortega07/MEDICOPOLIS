import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ── Types ─────────────────────────────────────────────────────────────────────

type SquareType = "start" | "money" | "card" | "hospital";
type CardType = "health" | "risk" | "hospital" | "bonus";

interface Square {
  type: SquareType;
  icon: string;
  label: string;
}

interface Player {
  id: number;
  name: string;
  color: string;
  money: number;
  position: number;
}

interface EventCard {
  type: CardType;
  title: string;
  description: string;
  amount: number;
  icon: string;
}

// ── Game Data ─────────────────────────────────────────────────────────────────

const SQUARES: Square[] = [
  { type: "start",    icon: "🏁", label: "Salida"   },
  { type: "money",    icon: "💰", label: "+$100"    },
  { type: "card",     icon: "🎴", label: "Evento"   },
  { type: "money",    icon: "💰", label: "+$75"     },
  { type: "card",     icon: "🎴", label: "Evento"   },
  { type: "hospital", icon: "🏥", label: "Hospital" },
  { type: "money",    icon: "💰", label: "+$50"     },
  { type: "card",     icon: "🎴", label: "Evento"   },
  { type: "money",    icon: "💰", label: "+$125"    },
  { type: "card",     icon: "🎴", label: "Evento"   },
  { type: "hospital", icon: "🏥", label: "Hospital" },
  { type: "money",    icon: "💰", label: "+$100"    },
  { type: "card",     icon: "🎴", label: "Evento"   },
  { type: "money",    icon: "💰", label: "+$75"     },
  { type: "card",     icon: "🎴", label: "Evento"   },
  { type: "hospital", icon: "🏥", label: "Hospital" },
  { type: "money",    icon: "💰", label: "+$50"     },
  { type: "card",     icon: "🎴", label: "Evento"   },
  { type: "money",    icon: "💰", label: "+$125"    },
  { type: "card",     icon: "🎴", label: "Evento"   },
];

const MONEY_MAP: Record<number, number> = {
  1: 100, 3: 75, 6: 50, 8: 125, 11: 100, 13: 75, 16: 50, 18: 125,
};

const GENERAL_CARDS: EventCard[] = [
  { type: "health", title: "Vacuna Preventiva",  description: "Te vacunaste a tiempo. Excelente prevención de enfermedades infecciosas.",  amount:  150, icon: "💉" },
  { type: "health", title: "Ejercicio Diario",   description: "30 minutos de actividad física al día mejoran tu calidad de vida.",         amount:  100, icon: "🏃" },
  { type: "health", title: "Alimentación Sana",  description: "Consumir frutas y verduras a diario beneficia tu bienestar general.",       amount:  120, icon: "🥦" },
  { type: "health", title: "Sueño Reparador",    description: "Dormir 8 horas fortalece tu sistema inmunológico y tu salud mental.",      amount:   90, icon: "😴" },
  { type: "risk",   title: "Gripe Estacional",   description: "Necesitas medicamentos. Paga los honorarios médicos y la receta.",          amount: -100, icon: "🤧" },
  { type: "risk",   title: "Estrés Laboral",     description: "El estrés crónico afecta tu salud. Paga el tratamiento de bienestar.",     amount:  -75, icon: "😰" },
  { type: "risk",   title: "Sedentarismo",       description: "La inactividad física trae consecuencias. Paga la consulta nutricional.",   amount:  -50, icon: "🛋️" },
  { type: "bonus",  title: "Seguro Médico",      description: "Tu póliza de seguro cubre todos los gastos médicos de este mes.",          amount:  250, icon: "🎁" },
  { type: "bonus",  title: "Premio a la Salud",  description: "Reconocimiento especial por mantener hábitos preventivos de salud.",       amount:  300, icon: "⭐" },
];

const HOSPITAL_CARDS: EventCard[] = [
  { type: "hospital", title: "Hospitalización",  description: "Debes cubrir los gastos de tu estadía hospitalaria de emergencia.",        amount: -200, icon: "🏥" },
  { type: "hospital", title: "Cirugía Menor",    description: "Un procedimiento quirúrgico inesperado. Los costos médicos son elevados.", amount: -250, icon: "🔬" },
  { type: "hospital", title: "Urgencias",        description: "Atención de emergencia inmediata. Paga los costos del servicio médico.",   amount: -150, icon: "🚑" },
];

const UCI_CARD: EventCard = {
  type: "hospital",
  title: "🚨 UCI — Ingreso Forzado",
  description: "Tres dobles consecutivos. Ingreso directo a la Unidad de Cuidados Intensivos. Paga todos los gastos.",
  amount: -300,
  icon: "🚨",
};

const INITIAL_PLAYERS: Player[] = [
  { id: 0, name: "Jugador 1", color: "#EF4444", money: 1000, position: 0 },
  { id: 1, name: "Jugador 2", color: "#3B82F6", money: 1000, position: 0 },
  { id: 2, name: "Jugador 3", color: "#22C55E", money: 1000, position: 0 },
  { id: 3, name: "Jugador 4", color: "#EAB308", money: 1000, position: 0 },
];

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<"menu" | "game">("menu");
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS.map(p => ({ ...p })));
  const [currentTurn, setCurrentTurn] = useState(0);
  const [messages, setMessages] = useState<string[]>(["¡Bienvenidos a MédicoPolis! 🏥", "Turno de Jugador 1 🔴"]);
  const [diceA, setDiceA] = useState<number | null>(null);
  const [diceB, setDiceB] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [pendingCard, setPendingCard] = useState<EventCard | null>(null);
  const [pendingPlayerIdx, setPendingPlayerIdx] = useState<number | null>(null);
  const [consecutiveDoubles, setConsecutiveDoubles] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const addMessage = (msg: string) => {
    setMessages(prev => [msg, ...prev].slice(0, 6));
  };

  const advanceTurn = (ct: number) => {
    const next = (ct + 1) % 4;
    setCurrentTurn(next);
    setConsecutiveDoubles(0);
    addMessage(`Turno de ${INITIAL_PLAYERS[next].name}`);
  };

  const startGame = () => {
    setPlayers(INITIAL_PLAYERS.map(p => ({ ...p })));
    setCurrentTurn(0);
    setConsecutiveDoubles(0);
    setMessages(["¡Bienvenidos a MédicoPolis! 🏥", "Turno de Jugador 1 🔴"]);
    setDiceA(null);
    setDiceB(null);
    setPendingCard(null);
    setPendingPlayerIdx(null);
    setScreen("game");
  };

  const rollDice = () => {
    if (rolling || pendingCard) return;
    const ct = currentTurn;
    setRolling(true);

    const a = Math.floor(Math.random() * 6) + 1;
    const b = Math.floor(Math.random() * 6) + 1;
    const isDouble = a === b;
    const total = a + b;
    const newDoubleCount = isDouble ? consecutiveDoubles + 1 : 0;

    setTimeout(() => {
      setDiceA(a);
      setDiceB(b);
      setRolling(false);

      const player = players[ct];

      // ── UCI: 3rd consecutive double ────────────────────────────────────────
      if (newDoubleCount >= 3) {
        setConsecutiveDoubles(0);
        addMessage(`🚨 ${player.name} sacó 3 dobles consecutivos — ¡UCI!`);
        setTimeout(() => {
          setPendingCard(UCI_CARD);
          setPendingPlayerIdx(ct);
        }, 600);
        return;
      }

      // ── Normal move ────────────────────────────────────────────────────────
      setConsecutiveDoubles(newDoubleCount);

      const newPos = (player.position + total) % 20;
      const square = SQUARES[newPos];
      setPlayers(prev => prev.map((p, i) => i === ct ? { ...p, position: newPos } : p));

      if (isDouble) {
        addMessage(`🎲🎲 ¡Doble ${a}+${b}=${total}! ${player.name} → ${square.label}`);
      } else {
        addMessage(`${player.name} sacó ${a}+${b}=${total} → ${square.label} ${square.icon}`);
      }

      setTimeout(() => {
        if (square.type === "start") {
          // ── Salida: always +$200 ─────────────────────────────────────────
          setPlayers(prev => prev.map((p, i) =>
            i === ct ? { ...p, money: p.money + 200 } : p
          ));
          addMessage(`🏁 ${player.name} pasó por Salida — ganó $200`);
          if (isDouble) {
            addMessage(`🎲 ¡Doble! ${player.name} vuelve a lanzar`);
          } else {
            setTimeout(() => advanceTurn(ct), 700);
          }

        } else if (square.type === "money") {
          // ── Casilla de dinero ────────────────────────────────────────────
          const amount = MONEY_MAP[newPos] || 100;
          setPlayers(prev => prev.map((p, i) =>
            i === ct ? { ...p, money: p.money + amount } : p
          ));
          addMessage(`💰 ${player.name} ganó $${amount}`);
          if (isDouble) {
            addMessage(`🎲 ¡Doble! ${player.name} vuelve a lanzar`);
          } else {
            setTimeout(() => advanceTurn(ct), 700);
          }

        } else if (square.type === "hospital") {
          // ── Hospital: draw hospital card ─────────────────────────────────
          const card = HOSPITAL_CARDS[Math.floor(Math.random() * HOSPITAL_CARDS.length)];
          setPendingCard(card);
          setPendingPlayerIdx(ct);
          if (isDouble) setConsecutiveDoubles(0); // doubles reset on card event

        } else {
          // ── Evento: draw general card ────────────────────────────────────
          const card = GENERAL_CARDS[Math.floor(Math.random() * GENERAL_CARDS.length)];
          setPendingCard(card);
          setPendingPlayerIdx(ct);
          if (isDouble) setConsecutiveDoubles(0);
        }
      }, 500);
    }, 950);
  };

  // ── Apply card and advance turn ──────────────────────────────────────────────
  const dismissCard = () => {
    if (!pendingCard || pendingPlayerIdx === null) return;
    const ct = pendingPlayerIdx;
    const { amount, type } = pendingCard;

    // Apply the card amount to the current player's balance
    setPlayers(prev => prev.map((p, i) => {
      if (i !== ct) return p;
      const next = p.money + amount;
      return { ...p, money: next < 0 ? 0 : next };
    }));

    // Type-specific feedback message
    if (type === "bonus" || type === "health") {
      addMessage(`🎁 +$${amount} → ${players[ct].name} cobró el bono`);
    } else {
      addMessage(`💸 −$${Math.abs(amount)} descontado a ${players[ct].name}`);
    }

    setPendingCard(null);
    setPendingPlayerIdx(null);
    setTimeout(() => advanceTurn(ct), 300);
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      <AnimatePresence mode="wait">
        {screen === "menu" ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MenuScreen onPlay={startGame} />
          </motion.div>
        ) : (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              players={players}
              currentTurn={currentTurn}
              messages={messages}
              diceA={diceA}
              diceB={diceB}
              rolling={rolling}
              pendingCard={pendingCard}
              pendingPlayerIdx={pendingPlayerIdx}
              consecutiveDoubles={consecutiveDoubles}
              showRules={showRules}
              onRoll={rollDice}
              onDismissCard={dismissCard}
              onToggleRules={() => setShowRules(v => !v)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Menu Screen ───────────────────────────────────────────────────────────────

function MenuScreen({ onPlay }: { onPlay: () => void }) {
  const bg = [
    { emoji: "💊", cls: "top-[7%] left-[5%] text-7xl" },
    { emoji: "❤️", cls: "top-[10%] right-[7%] text-6xl" },
    { emoji: "🩺", cls: "bottom-[18%] left-[7%] text-6xl" },
    { emoji: "🧬", cls: "bottom-[8%] right-[5%] text-7xl" },
    { emoji: "⚕️", cls: "top-[42%] left-[2%] text-5xl" },
    { emoji: "🔬", cls: "top-[38%] right-[2%] text-5xl" },
    { emoji: "💉", cls: "top-[68%] left-[14%] text-4xl" },
    { emoji: "🫀", cls: "top-[62%] right-[14%] text-4xl" },
  ];

  return (
    <div className="min-h-screen bg-[#0A2342] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bg.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.cls} opacity-[0.055] select-none`}
            animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut" }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-3 select-none"
        >
          🏥
        </motion.div>

        <h1 className="font-black text-white tracking-[0.18em] leading-none" style={{ fontSize: "clamp(3.5rem,10vw,6rem)" }}>
          MÉDICO
        </h1>
        <h1 className="font-black tracking-[0.18em] leading-none mb-3" style={{ fontSize: "clamp(3.5rem,10vw,6rem)", color: "#03C4A1" }}>
          POLIS
        </h1>

        <p className="text-[#4A7FA5] tracking-[0.25em] uppercase text-xs mb-12 font-semibold">
          Educación en Salud · Juego de Mesa Digital
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 36px rgba(2,128,144,0.55)" }}
          whileTap={{ scale: 0.96 }}
          onClick={onPlay}
          className="bg-[#028090] hover:bg-[#02A0B5] text-white font-black tracking-widest text-lg px-20 py-5 rounded-2xl mb-14 transition-colors"
        >
          🎮  JUGAR
        </motion.button>

        <div className="flex gap-10">
          {[
            { icon: "👥", label: "4 Jugadores" },
            { icon: "🎲", label: "2 Dados"     },
            { icon: "🎴", label: "Tarjetas"    },
            { icon: "🏥", label: "Salud"       },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-[#4A7FA5] text-xs tracking-wider font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Game Screen ───────────────────────────────────────────────────────────────

function GameScreen({
  players, currentTurn, messages, diceA, diceB, rolling,
  pendingCard, pendingPlayerIdx, consecutiveDoubles,
  showRules, onRoll, onDismissCard, onToggleRules,
}: {
  players: Player[];
  currentTurn: number;
  messages: string[];
  diceA: number | null;
  diceB: number | null;
  rolling: boolean;
  pendingCard: EventCard | null;
  pendingPlayerIdx: number | null;
  consecutiveDoubles: number;
  showRules: boolean;
  onRoll: () => void;
  onDismissCard: () => void;
  onToggleRules: () => void;
}) {
  const cp = players[currentTurn];
  const isDouble = diceA !== null && diceB !== null && diceA === diceB;

  return (
    <div className="min-h-screen bg-[#0A2342] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#071830] border-b border-[#1A4080]/50 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">🏥</span>
            <span className="font-black text-white tracking-widest text-base hidden sm:block">MÉDICOPOLIS</span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-center">
            <span className="text-[#8BB8D4] text-xs font-semibold uppercase tracking-wider hidden sm:block">Turno:</span>
            <div className="flex items-center gap-2 bg-[#0E2D58] px-4 py-1.5 rounded-full border border-[#1A4080]/60">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cp.color }} />
              <span className="text-white font-bold text-sm">{cp.name}</span>
              {consecutiveDoubles > 0 && (
                <span className="text-yellow-400 text-xs font-bold ml-1">
                  {consecutiveDoubles === 2 ? "⚠️ ×2 dobles" : "🎲 ×1 doble"}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap justify-end items-center">
            {players.map(p => (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-300 ${
                  p.id === currentTurn ? "bg-[#028090]/25 ring-1 ring-[#028090]" : "bg-[#0E2D58]/50"
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-white font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>
                  ${p.money.toLocaleString()}
                </span>
              </div>
            ))}

            <button
              onClick={onToggleRules}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#028090]/20 hover:bg-[#028090]/35 text-[#03C4A1] border border-[#028090]/40 transition-colors ml-1"
            >
              📋 Reglas
            </button>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-start justify-center gap-5 p-4 overflow-auto">
        <Board players={players} />

        {/* Right panel */}
        <div className="flex flex-col gap-3 w-58 flex-shrink-0" style={{ width: 228 }}>

          {/* ── Dice panel ─────────────────────────────────────────────────── */}
          <div className="bg-[#0E2D58] rounded-2xl p-4 flex flex-col items-center gap-3 border border-[#1A4080]/50">
            <div className="text-[#8BB8D4] text-[10px] font-bold uppercase tracking-widest">Dados</div>

            <div className="flex gap-3 items-center">
              {[diceA, diceB].map((d, idx) => (
                <motion.div
                  key={idx}
                  animate={rolling ? { rotate: [-12, 12, -12], y: [-4, 4, -4] } : { rotate: 0, y: 0 }}
                  transition={rolling ? { duration: 0.35, repeat: Infinity } : { duration: 0.2 }}
                  className={`w-[58px] h-[58px] bg-white rounded-xl flex items-center justify-center shadow-xl select-none border-2 transition-colors ${
                    isDouble && !rolling ? "border-yellow-400" : "border-transparent"
                  }`}
                >
                  <span className="text-4xl leading-none">
                    {rolling ? "🎲" : d ? DICE_FACES[d - 1] : "🎲"}
                  </span>
                </motion.div>
              ))}
            </div>

            {diceA && diceB && !rolling && (
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {diceA} + {diceB} =
                </span>
                <span
                  className={`font-black text-xl ${isDouble ? "text-yellow-400" : "text-[#03C4A1]"}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {diceA + diceB}
                </span>
                {isDouble && (
                  <span className="text-yellow-400 text-[10px] font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-full">
                    ¡DOBLE!
                  </span>
                )}
              </div>
            )}

            {/* Doubles warning */}
            {consecutiveDoubles > 0 && (
              <div className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                consecutiveDoubles === 2 ? "bg-red-900/40 text-red-300 border border-red-600/40" : "bg-yellow-900/30 text-yellow-300 border border-yellow-600/30"
              }`}>
                {consecutiveDoubles === 2 ? "⚠️ 2/3 dobles — ¡uno más = UCI!" : "🎲 1/3 dobles consecutivos"}
              </div>
            )}

            <button
              onClick={onRoll}
              disabled={rolling || !!pendingCard}
              className="w-full py-2.5 bg-[#028090] hover:bg-[#02A0B5] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm"
            >
              {rolling ? "Lanzando..." : "🎲 Lanzar Dado"}
            </button>
          </div>

          {/* ── Messages ────────────────────────────────────────────────────── */}
          <div className="bg-[#0E2D58] rounded-2xl p-4 border border-[#1A4080]/50">
            <div className="text-[#8BB8D4] text-[10px] font-bold uppercase tracking-widest mb-2.5">Eventos</div>
            <div className="flex flex-col gap-1.5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="text-[11px] rounded-lg px-2.5 py-1.5 bg-[#071830]/60 leading-snug"
                  style={{ color: `rgba(232,244,253,${Math.max(0.25, 0.9 - i * 0.13)})` }}
                >
                  {msg}
                </div>
              ))}
            </div>
          </div>

          {/* ── Players ─────────────────────────────────────────────────────── */}
          <div className="bg-[#0E2D58] rounded-2xl p-4 border border-[#1A4080]/50">
            <div className="text-[#8BB8D4] text-[10px] font-bold uppercase tracking-widest mb-2.5">Saldos</div>
            <div className="flex flex-col gap-1.5">
              {players.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all ${
                    p.id === currentTurn ? "bg-[#028090]/15 ring-1 ring-[#028090]/30" : ""
                  }`}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20" style={{ backgroundColor: p.color }} />
                  <span className="text-white/80 text-xs flex-1 font-semibold">{p.name}</span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: p.money >= 500 ? "#03C4A1" : p.money >= 200 ? "#EAB308" : "#EF4444",
                    }}
                  >
                    ${p.money.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Legend ──────────────────────────────────────────────────────── */}
          <div className="bg-[#0E2D58] rounded-2xl p-4 border border-[#1A4080]/50">
            <div className="text-[#8BB8D4] text-[10px] font-bold uppercase tracking-widest mb-2.5">Casillas</div>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] text-white/55">
              <div className="flex items-center gap-1.5"><span>🏁</span>Salida +$200</div>
              <div className="flex items-center gap-1.5"><span>💰</span>Gana dinero</div>
              <div className="flex items-center gap-1.5"><span>🎴</span>Tarjeta evento</div>
              <div className="flex items-center gap-1.5"><span>🏥</span>Hospital</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {pendingCard && pendingPlayerIdx !== null && (
          <CardModal card={pendingCard} player={players[pendingPlayerIdx]} onDismiss={onDismissCard} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showRules && <RulesModal onClose={onToggleRules} />}
      </AnimatePresence>
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────

const CELL = 76;

function Board({ players }: { players: Player[] }) {
  const posMap: Record<number, Player[]> = {};
  players.forEach(p => {
    posMap[p.position] = [...(posMap[p.position] || []), p];
  });

  const topRow    = [15, 14, 13, 12, 11, 10];
  const bottomRow = [0,  1,  2,  3,  4,  5 ];
  const leftCol   = [16, 17, 18, 19];
  const rightCol  = [9,  8,  7,  6 ];
  const boardSize = CELL * 6;

  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden border border-[#1A4080]/60 shadow-2xl"
      style={{ width: boardSize, height: boardSize }}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-shrink-0" style={{ height: CELL }}>
          {topRow.map(i => <BoardCell key={i} idx={i} players={posMap[i] || []} style={{ width: CELL, height: CELL }} />)}
        </div>

        <div className="flex flex-1">
          <div className="flex flex-col flex-shrink-0" style={{ width: CELL }}>
            {leftCol.map(i => <BoardCell key={i} idx={i} players={posMap[i] || []} className="flex-1" style={{ width: CELL }} />)}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-[#071830]">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-[3rem] mb-1 select-none"
            >
              🏥
            </motion.div>
            <div className="font-black text-white tracking-[0.15em] leading-none text-xl text-center">MÉDICO</div>
            <div className="font-black tracking-[0.15em] leading-none text-xl text-center mb-3" style={{ color: "#03C4A1" }}>POLIS</div>
            <div className="flex gap-3">
              {players.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 rounded-full border-2 border-white/25" style={{ backgroundColor: p.color }} />
                  <span className="text-[9px] text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
                    ${p.money}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col flex-shrink-0" style={{ width: CELL }}>
            {rightCol.map(i => <BoardCell key={i} idx={i} players={posMap[i] || []} className="flex-1" style={{ width: CELL }} />)}
          </div>
        </div>

        <div className="flex flex-shrink-0" style={{ height: CELL }}>
          {bottomRow.map(i => <BoardCell key={i} idx={i} players={posMap[i] || []} style={{ width: CELL, height: CELL }} />)}
        </div>
      </div>
    </div>
  );
}

// ── Board Cell ────────────────────────────────────────────────────────────────

const CELL_STYLES: Record<SquareType, { bg: string; border: string }> = {
  start:    { bg: "rgba(234,179,8,0.18)",  border: "rgba(202,138,4,0.5)"  },
  money:    { bg: "rgba(2,128,144,0.22)",  border: "rgba(2,128,144,0.45)" },
  card:     { bg: "rgba(30,58,95,0.65)",   border: "rgba(45,90,143,0.55)" },
  hospital: { bg: "rgba(127,29,29,0.35)",  border: "rgba(153,27,27,0.55)" },
};

function BoardCell({
  idx, players, className = "", style = {},
}: {
  idx: number;
  players: Player[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const sq = SQUARES[idx];
  const { bg, border } = CELL_STYLES[sq.type];

  return (
    <div
      className={`relative flex flex-col items-center justify-center border ${className}`}
      style={{ backgroundColor: bg, borderColor: border, ...style }}
    >
      <span className="text-lg leading-none select-none">{sq.icon}</span>
      <span className="text-[7px] text-white/40 mt-0.5 text-center px-0.5 leading-tight font-semibold tracking-wide">
        {sq.label}
      </span>
      <span className="absolute top-0.5 left-1 text-[6px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
        {idx}
      </span>
      {players.length > 0 && (
        <div className="absolute bottom-1 right-1 flex gap-0.5 flex-wrap justify-end" style={{ maxWidth: "100%" }}>
          {players.map(p => (
            <motion.div
              key={p.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 300 }}
              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-md"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Rules Modal ───────────────────────────────────────────────────────────────

const RULES = [
  {
    step: "1",
    title: "Lanzar dados y avanzar fichas",
    desc: "Cada jugador lanza 2 dados en su turno y avanza su ficha el número de casillas indicado.",
    icon: "🎲",
  },
  {
    step: "2",
    title: "Ejecutar acción de la casilla",
    desc: "Dependiendo de la casilla: cobrar dinero 💰, robar tarjeta de evento 🎴 o pagar hospital 🏥.",
    icon: "▶️",
  },
  {
    step: "3",
    title: "Comprar propiedad (opcional)",
    desc: "Al caer en una casilla libre, el jugador puede comprarla para cobrar renta a otros jugadores.",
    icon: "🏠",
  },
  {
    step: "4",
    title: "Construir Clínicas u Hospitales",
    desc: "Si posees el grupo completo de propiedades, puedes construir:\n• Clínica: $50 por casilla\n• Hospital: $200 por casilla",
    icon: "🏗️",
  },
];

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.82, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.82, y: 24 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0E2D58] border border-[#1A4080]/70 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="font-black text-white text-xl tracking-wide">Reglas del Juego</h2>
              <p className="text-[#8BB8D4] text-xs">MédicoPolis — Turno a turno</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#071830] hover:bg-[#1A4080] text-white/60 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 mb-5">
          {RULES.map(r => (
            <div key={r.step} className="flex gap-3 bg-[#071830]/60 rounded-2xl p-4 border border-[#1A4080]/30">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#028090]/30 border border-[#028090]/50 flex items-center justify-center">
                <span className="text-[#03C4A1] font-black text-sm">{r.step}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{r.icon}</span>
                  <span className="text-white font-bold text-sm leading-tight">{r.title}</span>
                </div>
                <p className="text-[#8BB8D4] text-xs leading-relaxed whitespace-pre-line">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* UCI Warning */}
        <div className="flex gap-3 bg-red-900/30 border border-red-500/50 rounded-2xl p-4">
          <div className="flex-shrink-0 text-2xl">⚠️</div>
          <div>
            <p className="text-red-300 font-black text-sm mb-1">3 Dobles Consecutivos = UCI</p>
            <p className="text-red-400/80 text-xs leading-relaxed">
              Si un jugador saca dobles tres veces seguidas, ingresa directamente a la
              Unidad de Cuidados Intensivos y debe pagar una penalización de $300.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 bg-[#028090] hover:bg-[#02A0B5] text-white font-bold rounded-2xl transition-colors text-sm"
        >
          Entendido — ¡A jugar!
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Card Modal ────────────────────────────────────────────────────────────────

const CARD_STYLES: Record<CardType, {
  bg: string; border: string; title: string; btn: string; badge: string; amount: string;
}> = {
  health:   { bg: "from-emerald-50 to-green-50",   border: "border-green-300",  title: "text-green-800",  btn: "bg-green-500 hover:bg-green-600",   badge: "💚 Salud",   amount: "text-green-600"  },
  risk:     { bg: "from-orange-50 to-amber-50",    border: "border-orange-300", title: "text-orange-800", btn: "bg-orange-500 hover:bg-orange-600",  badge: "⚠️ Riesgo",  amount: "text-orange-600" },
  hospital: { bg: "from-red-50 to-rose-50",        border: "border-red-300",    title: "text-red-800",    btn: "bg-red-500 hover:bg-red-600",        badge: "🏥 Hospital", amount: "text-red-600"    },
  bonus:    { bg: "from-yellow-50 to-amber-50",    border: "border-yellow-300", title: "text-yellow-800", btn: "bg-yellow-500 hover:bg-yellow-600",  badge: "🎁 Bono",    amount: "text-yellow-600" },
};

function CardModal({
  card, player, onDismiss,
}: {
  card: EventCard;
  player: Player;
  onDismiss: () => void;
}) {
  const s = CARD_STYLES[card.type];
  const isGain = card.amount >= 0;
  const newMoney = Math.max(0, player.money + card.amount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.78, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.78, y: 28 }}
        transition={{ type: "spring", damping: 22, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className={`bg-gradient-to-br ${s.bg} ${s.border} border-2 rounded-3xl p-8 w-full max-w-sm shadow-2xl`}
      >
        <div className="text-center">
          <span className={`inline-block text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 ${s.btn}`}>
            {s.badge}
          </span>

          <div className="text-7xl mb-5 select-none">{card.icon}</div>
          <h2 className={`text-2xl font-black mb-3 ${s.title}`}>{card.title}</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{card.description}</p>

          {/* Money delta — prominent for bonuses */}
          <div className={`text-5xl font-black mb-1 ${s.amount}`} style={{ fontFamily: "'DM Mono', monospace" }}>
            {isGain ? "+" : "−"}${Math.abs(card.amount)}
          </div>
          {isGain && (
            <p className="text-green-600 text-xs font-bold mb-3 uppercase tracking-wider">
              Bono acreditado al saldo
            </p>
          )}

          {/* Before → After */}
          <div className="flex items-center justify-center gap-3 text-sm mb-7 bg-gray-100 rounded-2xl py-3 px-4">
            <div className="text-center">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Saldo actual</p>
              <p className="font-black text-gray-500" style={{ fontFamily: "'DM Mono', monospace" }}>
                ${player.money.toLocaleString()}
              </p>
            </div>
            <span className={`text-xl font-bold ${isGain ? "text-green-500" : "text-red-500"}`}>
              {isGain ? "→" : "→"}
            </span>
            <div className="text-center">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Nuevo saldo</p>
              <p
                className={`font-black ${isGain ? "text-green-600" : "text-red-600"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                ${newMoney.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
            <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: player.color }} />
            <span className="font-semibold text-gray-500">{player.name}</span>
          </div>

          <button
            onClick={onDismiss}
            className={`w-full py-3.5 text-white font-bold rounded-2xl transition-colors text-base ${s.btn}`}
          >
            Continuar →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
