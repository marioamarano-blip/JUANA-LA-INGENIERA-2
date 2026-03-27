// ══════════════════════════════════════════════════════
//  PALABRAS.JS — Laboratorio de Palabras de Rumi
//  4 sub-juegos: letra inicial, completar, unir, ahorcado
// ══════════════════════════════════════════════════════

// ─── BASE DE DATOS DE PALABRAS ──────────────────────────
const PALABRAS = [
  { emoji: '🐶', palabra: 'PERRO',   pista: 'El mejor amigo del humano' },
  { emoji: '🐱', palabra: 'GATO',    pista: 'Animal que maúlla' },
  { emoji: '🌸', palabra: 'FLOR',    pista: 'Es muy linda y perfumada' },
  { emoji: '🌙', palabra: 'LUNA',    pista: 'Brilla de noche' },
  { emoji: '☀️',  palabra: 'SOL',     pista: 'Calienta y da luz' },
  { emoji: '🍎', palabra: 'MANZANA', pista: 'Fruta roja o verde' },
  { emoji: '🐟', palabra: 'PEZ',     pista: 'Vive en el agua' },
  { emoji: '🌳', palabra: 'ARBOL',   pista: 'Tiene ramas y hojas' },
  { emoji: '🏠', palabra: 'CASA',    pista: 'Donde vivimos' },
  { emoji: '🎈', palabra: 'GLOBO',   pista: 'Vuela con aire' },
  { emoji: '🐘', palabra: 'ELEFANTE',pista: 'Tiene trompa larga' },
  { emoji: '🦁', palabra: 'LEON',    pista: 'Rey de la selva' },
  { emoji: '🍕', palabra: 'PIZZA',   pista: 'Comida italiana muy rica' },
  { emoji: '🚂', palabra: 'TREN',    pista: 'Viaja sobre rieles' },
  { emoji: '✈️',  palabra: 'AVION',   pista: 'Vuela en el cielo' },
  { emoji: '🎸', palabra: 'GUITARRA',pista: 'Instrumento musical de cuerdas' },
  { emoji: '⭐', palabra: 'ESTRELLA',pista: 'Brilla en el cielo nocturno' },
  { emoji: '🦋', palabra: 'MARIPOSA',pista: 'Insecto con alas coloridas' },
  { emoji: '🍦', palabra: 'HELADO',  pista: 'Postre frío y dulce' },
  { emoji: '🐸', palabra: 'RANA',    pista: 'Salta y vive cerca del agua' },
];

const ABECEDARIO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ABECEDARIO_ES = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

// Mensajes de Rumi entusiasta según resultado
const RUMI_CORRECTO = [
  '¡EXACTO! ¡Sos brillante Juanita! 🚀⭐',
  '¡WOW! ¡Sabía que lo ibas a saber! 🎉',
  '¡PERFECTO! ¡Sos una crack! 💥⭐',
  '¡INCREÍBLE! ¡Lo clavaste! 🔥',
  '¡ESO ES! ¡Mi alumna favorita! ✨',
];
const RUMI_INCORRECTO = [
  '¡Casi! ¡La próxima la rompés! 💪',
  '¡No te rindas! ¡Volvamos a intentarlo! 🔄',
  '¡Eso estuvo cerca! ¡Seguí así! 🌟',
  '¡Error noble! ¡Así se aprende! 💡',
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffleArr(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ══════════════════════════════════════════════════════
export class PalabrasGame {
  constructor({ container, menu, backBtn, onStar, setRumiMsg }) {
    this.container = container;
    this.menu = menu;
    this.backBtn = backBtn;
    this.onStar = onStar;
    this.setRumiMsg = setRumiMsg;

    this.bindMenu();
  }

  bindMenu() {
    this.menu.querySelectorAll('.palabras-btn').forEach(btn => {
      btn.addEventListener('click', () => this.startSubjuego(btn.dataset.subjuego));
    });
    this.backBtn.addEventListener('click', () => {
      this.container.style.display = 'none';
      this.menu.style.display = 'grid';
      this.backBtn.style.display = 'none';
      this.setRumiMsg('¡Elegí otro juego de palabras! ¡Son todos buenísimos! 📝🚀');
    });
  }

  startSubjuego(nombre) {
    this.menu.style.display = 'none';
    this.container.style.display = 'block';
    this.backBtn.style.display = 'block';

    switch (nombre) {
      case 'letra-inicial': this.juegoLetraInicial(); break;
      case 'completar':     this.juegoCompletar();    break;
      case 'unir':          this.juegoUnir();          break;
      case 'ahorcado':      this.juegoAhorcado();      break;
    }
  }

  // ════════════════════════════════════════════════════
  //  JUEGO 1: ¿Con qué letra empieza?
  // ════════════════════════════════════════════════════
  juegoLetraInicial() {
    this.setRumiMsg('¡Mirá la imagen y buscá la letra con la que empieza! 🔤🔍', 'pensativa');
    const item = randomFrom(PALABRAS);
    const letraCorrecta = item.palabra[0];

    // 7 letras incorrectas al azar + la correcta
    const incorrectas = shuffleArr(ABECEDARIO.filter(l => l !== letraCorrecta)).slice(0, 7);
    const opciones = shuffleArr([letraCorrecta, ...incorrectas]);

    this.container.innerHTML = `
      <div class="letra-inicial-card">
        <div class="emoji-grande">${item.emoji}</div>
        <div class="pregunta-label">¿Con qué letra empieza?</div>
        <div class="letras-grid">
          ${opciones.map(l => `<button class="letra-btn" data-letra="${l}">${l}</button>`).join('')}
        </div>
        <button class="next-btn" id="sig-letra" style="display:none">Siguiente ➡️</button>
      </div>
    `;

    this.container.querySelectorAll('.letra-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.letra-btn').forEach(b => b.disabled = true);
        if (btn.dataset.letra === letraCorrecta) {
          btn.classList.add('correct');
          this.setRumiMsg(randomFrom(RUMI_CORRECTO), 'celebrando');
          if (this.onStar) this.onStar();
        } else {
          btn.classList.add('wrong');
          this.container.querySelectorAll('.letra-btn').forEach(b => {
            if (b.dataset.letra === letraCorrecta) b.classList.add('correct');
          });
          this.setRumiMsg(`La palabra "${item.palabra}" empieza con <strong>${letraCorrecta}</strong>. ${randomFrom(RUMI_INCORRECTO)}`);
        }
        document.getElementById('sig-letra').style.display = 'inline-block';
      });
    });
    document.getElementById('sig-letra').addEventListener('click', () => this.juegoLetraInicial());
  }

  // ════════════════════════════════════════════════════
  //  JUEGO 2: Completar la palabra
  // ════════════════════════════════════════════════════
  juegoCompletar() {
    this.setRumiMsg('¡Completá la palabra tocando las letras! 🧩✏️', 'pensativa');
    const item = randomFrom(PALABRAS.filter(p => p.palabra.length >= 3 && p.palabra.length <= 8));
    const palabra = item.palabra;

    // Elegir 1 o 2 letras a ocultar según longitud
    const cantOcultas = palabra.length <= 4 ? 1 : 2;
    const indices = shuffleArr([...Array(palabra.length).keys()]).slice(0, cantOcultas);
    const letrasOcultas = indices.map(i => palabra[i]);
    const llenadas = new Array(palabra.length).fill(null);

    // Letras opción: las ocultas + distractores
    const distractores = shuffleArr(ABECEDARIO.filter(l => !letrasOcultas.includes(l))).slice(0, 4);
    const opcionesLetras = shuffleArr([...letrasOcultas, ...distractores]);

    const renderSlots = () => {
      return palabra.split('').map((l, i) => {
        if (!indices.includes(i)) {
          return `<div class="letra-slot">${l}</div>`;
        } else {
          const rellena = llenadas[i];
          return `<div class="letra-slot ${rellena ? 'completa' : 'vacia'}" data-idx="${i}">${rellena || '_'}</div>`;
        }
      }).join('');
    };

    let indicePendiente = 0; // qué hueco llenar

    const renderJuego = () => {
      this.container.innerHTML = `
        <div class="completar-card">
          <div class="hint-emoji">${item.emoji}</div>
          <div class="pregunta-label">Completá la palabra:</div>
          <div class="palabra-display">${renderSlots()}</div>
          <div class="opciones-letras">
            ${opcionesLetras.map((l, idx) => `
              <button class="opcion-letra-btn ${letrasOcultas.every(lo => llenadas.includes(lo)) ? 'usada' : ''}"
                      data-letra="${l}" data-idx="${idx}">${l}</button>
            `).join('')}
          </div>
          <button class="next-btn" id="sig-completar" style="display:none">Siguiente ➡️</button>
        </div>
      `;

      this.container.querySelectorAll('.opcion-letra-btn').forEach(btn => {
        if (btn.classList.contains('usada')) return;
        btn.addEventListener('click', () => {
          const letra = btn.dataset.letra;
          const huecosVacios = indices.filter(i => !llenadas[i]);
          if (huecosVacios.length === 0) return;

          const primerVacio = huecosVacios[0];
          llenadas[primerVacio] = letra;
          btn.disabled = true;
          btn.classList.add('usada');

          // Verificar si todos llenos
          const todosLlenos = indices.every(i => llenadas[i]);
          if (todosLlenos) {
            const correcto = indices.every(i => llenadas[i] === palabra[i]);
            if (correcto) {
              this.setRumiMsg(randomFrom(RUMI_CORRECTO), 'celebrando');
              if (this.onStar) this.onStar();
            } else {
              this.setRumiMsg(`La palabra correcta es <strong>${palabra}</strong>. ${randomFrom(RUMI_INCORRECTO)}`);
            }
            document.getElementById('sig-completar').style.display = 'inline-block';
          }

          // Actualizar slots
          const slots = this.container.querySelectorAll('.letra-slot[data-idx]');
          slots.forEach(slot => {
            const i = parseInt(slot.dataset.idx);
            if (llenadas[i]) {
              const ok = llenadas[i] === palabra[i];
              slot.textContent = llenadas[i];
              slot.style.color = ok ? 'var(--magic-green)' : '#FF5050';
            }
          });
        });
      });

      document.getElementById('sig-completar')?.addEventListener('click', () => this.juegoCompletar());
    };

    renderJuego();
  }

  // ════════════════════════════════════════════════════
  //  JUEGO 3: Unir imagen con palabra
  // ════════════════════════════════════════════════════
  juegoUnir() {
    this.setRumiMsg('¡Tocá la imagen y después su palabra! ¿Las podés unir? 🔗🧠', 'feliz');
    const items = shuffleArr(PALABRAS).slice(0, 4);
    const palabrasShuffled = shuffleArr(items.map(i => i.palabra));
    let selectedImg = null;
    let matched = new Set();

    const render = () => {
      this.container.innerHTML = `
        <div class="unir-card">
          <div class="pregunta-label" style="margin-bottom:4px">Uní cada imagen con su palabra:</div>
          <div class="unir-grid">
            <div class="unir-col">
              <div class="unir-col-title">Imágenes</div>
              ${items.map((item, i) => `
                <div class="unir-item ${matched.has(item.palabra) ? 'matched' : ''}"
                     data-type="img" data-idx="${i}" data-palabra="${item.palabra}">
                  <span class="unir-emoji">${item.emoji}</span>
                  <small>${matched.has(item.palabra) ? '✓ ' + item.palabra : ''}</small>
                </div>
              `).join('')}
            </div>
            <div class="unir-col">
              <div class="unir-col-title">Palabras</div>
              ${palabrasShuffled.map((p, i) => `
                <div class="unir-item ${matched.has(p) ? 'matched' : ''}"
                     data-type="word" data-idx="${i}" data-palabra="${p}">
                  ${p}
                </div>
              `).join('')}
            </div>
          </div>
          ${matched.size === items.length ? `<button class="next-btn" id="sig-unir">¡Otro juego! ➡️</button>` : ''}
        </div>
      `;

      document.getElementById('sig-unir')?.addEventListener('click', () => this.juegoUnir());

      this.container.querySelectorAll('.unir-item:not(.matched)').forEach(el => {
        el.addEventListener('click', () => {
          const type = el.dataset.type;
          const palabra = el.dataset.palabra;

          if (type === 'img') {
            // Limpiar selección previa
            this.container.querySelectorAll('.unir-item').forEach(e => e.classList.remove('selected-img','selected-word'));
            el.classList.add('selected-img');
            selectedImg = palabra;
          } else if (type === 'word') {
            if (!selectedImg) {
              // Seleccionar palabra primero
              this.container.querySelectorAll('.unir-item').forEach(e => e.classList.remove('selected-img','selected-word'));
              el.classList.add('selected-word');
            } else {
              // Verificar match
              if (selectedImg === palabra) {
                matched.add(palabra);
                this.setRumiMsg(randomFrom(RUMI_CORRECTO), 'celebrando');
                if (this.onStar) this.onStar();
                if (matched.size === items.length) {
                  setTimeout(() => this.setRumiMsg('¡PERFECTOOO! ¡Uniste TODAS! ¡Genio total! 🎉🚀🌟', 'celebrando'), 400);
                }
              } else {
                el.classList.add('wrong-flash');
                setTimeout(() => el.classList.remove('wrong-flash'), 600);
                this.setRumiMsg(randomFrom(RUMI_INCORRECTO), 'pensativa');
              }
              selectedImg = null;
              setTimeout(() => render(), 500);
            }
          }
        });
      });
    };

    render();
  }

  // ════════════════════════════════════════════════════
  //  JUEGO 4: Ahorcado Mágico
  // ════════════════════════════════════════════════════
  juegoAhorcado() {
    this.setRumiMsg('¡El AHORCADO MÁGICO! ¡Adiviná la palabra letra por letra! 🎪🔤', 'feliz');
    const item = randomFrom(PALABRAS);
    const palabra = item.palabra;
    const maxErrores = 6;
    let errores = 0;
    let letrasUsadas = new Set();

    const corazonesDisplay = () => {
      const llenos = maxErrores - errores;
      return '❤️'.repeat(llenos) + '🖤'.repeat(errores);
    };

    const galibitoEtapas = [
      // 0 errores — poste vacío
      `<svg width="140" height="160" viewBox="0 0 140 160">
        <line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/>
        <line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/>
      </svg>`,
      // 1 — cabeza
      `<svg width="140" height="160" viewBox="0 0 140 160">
        <line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/>
        <line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/>
        <circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/>
      </svg>`,
      // 2 — cuerpo
      `<svg width="140" height="160" viewBox="0 0 140 160">
        <line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/>
        <line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/>
        <circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/>
        <line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/>
      </svg>`,
      // 3 — brazo izq
      `<svg width="140" height="160" viewBox="0 0 140 160">
        <line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/>
        <line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/>
        <circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/>
        <line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/>
        <line x1="90" y1="65" x2="65" y2="82" stroke="#FF8C42" stroke-width="3"/>
      </svg>`,
      // 4 — brazo der
      `<svg width="140" height="160" viewBox="0 0 140 160">
        <line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/>
        <line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/>
        <circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/>
        <line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/>
        <line x1="90" y1="65" x2="65" y2="82" stroke="#FF8C42" stroke-width="3"/>
        <line x1="90" y1="65" x2="115" y2="82" stroke="#FF8C42" stroke-width="3"/>
      </svg>`,
      // 5 — pierna izq
      `<svg width="140" height="160" viewBox="0 0 140 160">
        <line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/>
        <line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/>
        <circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/>
        <line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/>
        <line x1="90" y1="65" x2="65" y2="82" stroke="#FF8C42" stroke-width="3"/>
        <line x1="90" y1="65" x2="115" y2="82" stroke="#FF8C42" stroke-width="3"/>
        <line x1="90" y1="100" x2="65" y2="130" stroke="#FF8C42" stroke-width="3"/>
      </svg>`,
      // 6 — completo
      `<svg width="140" height="160" viewBox="0 0 140 160">
        <line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/>
        <line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/>
        <line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/>
        <circle cx="90" cy="42" r="12" stroke="#FF5050" stroke-width="3" fill="none"/>
        <line x1="90" y1="54" x2="90" y2="100" stroke="#FF5050" stroke-width="3"/>
        <line x1="90" y1="65" x2="65" y2="82" stroke="#FF5050" stroke-width="3"/>
        <line x1="90" y1="65" x2="115" y2="82" stroke="#FF5050" stroke-width="3"/>
        <line x1="90" y1="100" x2="65" y2="130" stroke="#FF5050" stroke-width="3"/>
        <line x1="90" y1="100" x2="115" y2="130" stroke="#FF5050" stroke-width="3"/>
        <!-- cara triste -->
        <line x1="84" y1="38" x2="86" y2="40" stroke="#FF5050" stroke-width="2"/>
        <line x1="86" y1="38" x2="84" y2="40" stroke="#FF5050" stroke-width="2"/>
        <line x1="94" y1="38" x2="96" y2="40" stroke="#FF5050" stroke-width="2"/>
        <line x1="96" y1="38" x2="94" y2="40" stroke="#FF5050" stroke-width="2"/>
        <path d="M84,47 Q90,43 96,47" stroke="#FF5050" stroke-width="2" fill="none"/>
      </svg>`,
    ];

    const render = () => {
      const adivinado = palabra.split('').every(l => letrasUsadas.has(l));
      const perdio = errores >= maxErrores;

      this.container.innerHTML = `
        <div class="ahorcado-card">
          <div class="ahorcado-pista">${item.emoji} <small style="font-size:0.7rem;color:var(--text-muted)">${item.pista}</small></div>
          <div class="ahorcado-layout">
            <div class="ahorcado-dibujo">${galibitoEtapas[errores]}</div>
            <div class="ahorcado-derecha">
              <div class="ahorcado-vidas">${corazonesDisplay()}</div>
              <div class="ahorcado-slots">
                ${palabra.split('').map(l =>
                  `<div class="ahorcado-slot">${letrasUsadas.has(l) ? l : ''}</div>`
                ).join('')}
              </div>
              ${adivinado || perdio ? '' : `
                <div class="teclado">
                  ${ABECEDARIO_ES.map(l => `
                    <button class="tecla ${letrasUsadas.has(l) ? (palabra.includes(l) ? 'acierto' : 'fallo') : ''}"
                            data-letra="${l}"
                            ${letrasUsadas.has(l) ? 'disabled' : ''}>${l}</button>
                  `).join('')}
                </div>
              `}
              ${adivinado ? `<div style="text-align:center;font-family:var(--font-title);font-size:1.4rem;color:var(--magic-green)">¡Adivinaste! 🎉</div>` : ''}
              ${perdio ? `<div style="text-align:center;font-family:var(--font-title);color:#FF5050">Era: <span style="color:var(--magic-yellow)">${palabra}</span> 😅</div>` : ''}
            </div>
          </div>
          ${(adivinado || perdio) ? `<button class="next-btn" id="sig-ahorcado">¡Otra palabra! 🔄</button>` : ''}
        </div>
      `;

      document.getElementById('sig-ahorcado')?.addEventListener('click', () => this.juegoAhorcado());

      this.container.querySelectorAll('.tecla:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          const letra = btn.dataset.letra;
          letrasUsadas.add(letra);
          if (!palabra.includes(letra)) {
            errores++;
            this.setRumiMsg(errores >= maxErrores
              ? `¡Ay! Era <strong>${palabra}</strong>. ¡Pero aprendiste una palabra nueva! 📚`
              : randomFrom(RUMI_INCORRECTO), errores >= 4 ? 'pensativa' : 'feliz');
          } else {
            const adivinadoNow = palabra.split('').every(l => letrasUsadas.has(l));
            if (adivinadoNow) {
              this.setRumiMsg(randomFrom(RUMI_CORRECTO), 'celebrando');
              if (this.onStar) this.onStar();
            } else {
              this.setRumiMsg('¡Bien! ¡Seguí buscando las letras! 🔍', 'feliz');
            }
          }
          render();
        });
      });
    };

    render();
  }

  destroy() {}
}
