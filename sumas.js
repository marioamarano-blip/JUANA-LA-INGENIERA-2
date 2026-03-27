// ══════════════════════════════════════════════════════
//  SUMAS.JS — Juego de sumas para Juanita
// ══════════════════════════════════════════════════════

export class SumasGame {
  constructor({ container, onStar }) {
    this.container = container;
    this.onStar = onStar;
    this.nivel = 1;
    this.intentos = 0;
    this.maxPreguntas = 5;
    this.preguntaActual = 0;
    this.respondidas = [];
    this.render();
  }

  generarPregunta() {
    const max = Math.min(5 + this.nivel * 3, 20);
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const respuesta = a + b;

    // Generar 3 opciones incorrectas únicas
    const opciones = new Set([respuesta]);
    while (opciones.size < 4) {
      const dist = Math.floor(Math.random() * 5) + 1;
      const wrong = Math.random() > 0.5 ? respuesta + dist : Math.max(1, respuesta - dist);
      if (wrong !== respuesta) opciones.add(wrong);
    }

    return {
      a, b, respuesta,
      opciones: [...opciones].sort(() => Math.random() - 0.5),
    };
  }

  render() {
    this.pregunta = this.generarPregunta();
    this.container.innerHTML = `
      <div class="suma-card">
        <div class="progress-dots">
          ${Array.from({length: this.maxPreguntas}, (_, i) =>
            `<div class="dot ${i < this.preguntaActual ? 'done' : ''}"></div>`
          ).join('')}
        </div>

        <div class="suma-problem">
          ${this.pregunta.a} + ${this.pregunta.b} = <span style="color:rgba(255,255,255,0.3)">?</span>
        </div>

        <div class="opciones-hint" style="color:var(--text-muted);font-size:0.9rem;text-align:center">
          Elegí la respuesta correcta 👇
        </div>

        <div class="options-grid">
          ${this.pregunta.opciones.map(op => `
            <button class="option-btn" data-valor="${op}">${op}</button>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => this.responder(parseInt(btn.dataset.valor), btn));
    });
  }

  responder(valor, btn) {
    const btns = this.container.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);

    if (valor === this.pregunta.respuesta) {
      btn.classList.add('correct');
      this.preguntaActual++;
      this.respondidas.push(true);

      if (this.preguntaActual >= this.maxPreguntas) {
        setTimeout(() => this.mostrarResultados(), 700);
      } else {
        setTimeout(() => this.render(), 800);
      }

      if (this.onStar) this.onStar();

    } else {
      btn.classList.add('wrong');
      // Mostrar correcta
      btns.forEach(b => {
        if (parseInt(b.dataset.valor) === this.pregunta.respuesta) b.classList.add('correct');
      });
      this.respondidas.push(false);

      setTimeout(() => {
        if (this.preguntaActual < this.maxPreguntas) {
          this.preguntaActual++;
          this.render();
        }
      }, 1200);
    }
  }

  mostrarResultados() {
    const correctas = this.respondidas.filter(Boolean).length;
    this.container.innerHTML = `
      <div class="suma-card" style="gap:16px">
        <div style="font-size:3rem">${correctas >= 4 ? '🎉' : correctas >= 2 ? '😊' : '💪'}</div>
        <div style="font-family:var(--font-title);font-size:2rem;color:var(--magic-yellow)">
          ¡${correctas} de ${this.maxPreguntas}!
        </div>
        <div style="color:var(--text-muted);font-size:1rem">
          ${correctas >= 4 ? '¡Juanita sos una crack de las matemáticas! 🚀' :
            correctas >= 2 ? '¡Muy bien! Seguí practicando 💪' :
            '¡Vamos de nuevo, la próxima la rompés! 🔥'}
        </div>
        <button class="reiniciar-btn" id="btn-reiniciar">¡Otra vez! 🔄</button>
      </div>
    `;
    document.getElementById('btn-reiniciar').addEventListener('click', () => {
      this.preguntaActual = 0;
      this.respondidas = [];
      this.nivel = correctas >= 4 ? this.nivel + 1 : this.nivel;
      this.render();
    });
  }

  destroy() {}
}
