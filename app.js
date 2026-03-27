// ══════════════════════════════════════════════════════
//  APP.JS — Orquestador principal
//  El Laboratorio de Juanita con Rumi la Ingeniera
// ══════════════════════════════════════════════════════

import { initRumi, renderRumi, setRumiMessage, RUMI_MOOD } from './rumi.js';
import { SumasGame } from './sumas.js';
import { ElectricidadGame } from './electricidad.js';
import { PalabrasGame } from './palabras.js';

const App = {
  totalStars: 0,
  currentGame: null,

  // Mensajes de bienvenida de Rumi por módulo (entusiasta y explosiva)
  rumiIntros: {
    sumas: [
      '¡VAMOS Juanita! Los números son el lenguaje del universo 🔢💥',
      '¡A calcular como una ingeniera PRO! ¡Yo sé que podés! 🚀',
      '¡Las matemáticas son INCREÍBLES! ¡Cada suma te hace más fuerte! ⚡',
    ],
    electricidad: [
      '¡La electricidad está EN TODOS LADOS! ¡Hoy vos la controlás! ⚡🔋',
      '¡Vamos a construir circuitos reales! ¡Igual que los ingenieros! 💡🔥',
      '¡Conectá los cables y hacé que la magia eléctrica fluya! ⚡✨',
    ],
    poleas: [
      '¡Con poleas podés levantar un ELEFANTE con un dedo! (casi) 🌀💪',
      '¡La física es MÁGICA! ¡Hoy entendés cómo funcionan las grúas! 🏗️',
    ],
    engranajes: [
      '¡Los engranajes son el corazón que hace latir a las máquinas! ⚙️❤️',
      '¡Fijate cómo se mueven juntos! ¡Eso es trabajo en equipo! ⚙️🔥',
    ],
    palabras: [
      '¡BIENVENIDA a mi Laboratorio de Palabras! 🧪📝 ¡Las palabras son superpoderes!',
      '¡Leer y escribir son las herramientas más poderosas del universo! 📚🚀',
      '¡Juanita, hoy tu cerebro va a explotar de aprendizaje! 🧠💥',
    ],
  },

  init() {
    this.loadStars();
    this.bindEvents();
    this.updateStarsDisplay();
  },

  loadStars() {
    this.totalStars = parseInt(localStorage.getItem('juanita-stars') || '0');
  },

  saveStars() {
    localStorage.setItem('juanita-stars', this.totalStars);
  },

  addStars(n) {
    this.totalStars += n;
    this.saveStars();
    this.updateStarsDisplay();
  },

  updateStarsDisplay() {
    document.querySelectorAll('#total-stars').forEach(el => el.textContent = this.totalStars);
    document.querySelectorAll('.stars-count').forEach(el => el.textContent = this.totalStars);
  },

  bindEvents() {
    // Botones de juego
    document.querySelectorAll('.game-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.game));
    });

    // Botones de volver
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.target));
    });
  },

  navigate(target) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });

    const screen = document.getElementById(`${target}-screen`);
    if (!screen) return;

    screen.style.display = 'flex';
    screen.classList.add('active');

    // Mensaje de Rumi según pantalla
    if (target !== 'welcome') {
      const intros = this.rumiIntros[target];
      if (intros) {
        const msg = intros[Math.floor(Math.random() * intros.length)];
        setRumiMessage(`rumi-msg-${target}`, msg, RUMI_MOOD.FELIZ, `rumi-${target}`);
      }
      this.startGame(target);
    }

    this.updateStarsDisplay();
  },

  startGame(name) {
    if (this.currentGame?.destroy) this.currentGame.destroy();

    switch (name) {
      case 'sumas':
        this.currentGame = new SumasGame({
          container: document.getElementById('sumas-content'),
          onStar: () => this.onStar('sumas'),
        });
        break;
      case 'electricidad':
        this.currentGame = new ElectricidadGame({
          container: document.getElementById('electricidad-content'),
          onStar: () => this.onStar('electricidad'),
        });
        break;
      case 'poleas':
        document.getElementById('poleas-content').innerHTML =
          `<div class="placeholder-card"><div class="placeholder-icon">🌀</div>¡Módulo de Poleas próximamente!<br><small>Rumi está preparando algo ÉPICO</small></div>`;
        break;
      case 'engranajes':
        document.getElementById('engranajes-content').innerHTML =
          `<div class="placeholder-card"><div class="placeholder-icon">⚙️</div>¡Módulo de Engranajes próximamente!<br><small>Rumi está dibujando los planos</small></div>`;
        break;
      case 'palabras':
        this.currentGame = new PalabrasGame({
          container: document.getElementById('palabras-content'),
          menu: document.getElementById('palabras-menu'),
          backBtn: document.getElementById('palabras-back-menu'),
          onStar: () => this.onStar('palabras'),
          setRumiMsg: (msg, mood) => setRumiMessage('rumi-msg-palabras', msg, mood, 'rumi-palabras'),
        });
        break;
    }
  },

  onStar(gameId) {
    this.addStars(1);
    // Mensaje celebración de Rumi
    const msgs = [
      '¡INCREÍBLE Juanita! ¡Eso fue PERFECTO! 🎉⭐',
      '¡BRILLANTE! ¡Sabía que podías! 🚀⭐',
      '¡WOW! ¡Sos una ingeniera de verdad! ⭐🔥',
      '¡ESPECTACULAR! ¡Una estrella para vos! ⭐✨',
    ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    setRumiMessage(`rumi-msg-${gameId}`, msg, RUMI_MOOD.CELEBRANDO, `rumi-${gameId}`);
    showConfetti();
    showSuperMsg('¡GENIAL JUANITA! ⭐');
  },
};

// ── CONFETTI ────────────────────────────────────────────
function showConfetti() {
  const overlay = document.getElementById('confetti-overlay');
  overlay.style.display = 'block';
  overlay.innerHTML = '';
  const colors = ['#FF6B9D','#F1C40F','#00D4FF','#2ECC71','#9B59B6','#FF8C42'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random()*100}%;
      top: -10px;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      width: ${6 + Math.random()*8}px;
      height: ${6 + Math.random()*8}px;
      border-radius: ${Math.random()>0.5?'50%':'2px'};
      animation-delay: ${Math.random()*0.8}s;
      animation-duration: ${1.5+Math.random()*1.5}s;
    `;
    overlay.appendChild(piece);
  }
  setTimeout(() => { overlay.style.display = 'none'; }, 3000);
}

// ── SUPER MENSAJE ────────────────────────────────────────
function showSuperMsg(text) {
  const el = document.createElement('div');
  el.className = 'super-msg';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// Exponer para uso en juegos
export { showConfetti, showSuperMsg };

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar pantalla de bienvenida
  const welcome = document.getElementById('welcome-screen');
  welcome.style.display = 'flex';

  App.init();
});
