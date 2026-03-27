// ══════════════════════════════════════════════════════
//  ELECTRICIDAD.JS — Constructor de circuitos
//  Lógica real de circuito con canvas
// ══════════════════════════════════════════════════════

export class ElectricidadGame {
  constructor({ container, onStar }) {
    this.container = container;
    this.onStar = onStar;
    this.cables = [];
    this.cableEnCurso = null;
    this.puntoOrigen = null;
    this.interruptorCerrado = false;
    this.circuitoCompleto = false;
    this.animFrame = null;
    this.tiempo = 0;
    this.render();
  }

  // Componentes del circuito con sus posiciones y puntos de conexión
  getComponentes() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    // Escala según ancho del canvas
    const s = Math.min(W / 700, 1);
    const cx = W / 2;

    return {
      bateria: {
        id: 'bateria', label: '🔋 Batería',
        x: cx - 260*s, y: H/2 - 20,
        w: 80*s, h: 60,
        terminals: {
          pos: { x: cx - 220*s, y: H/2 - 40, label: '+', color: '#FF4444' },
          neg: { x: cx - 220*s, y: H/2 + 40, label: '−', color: '#222' },
        }
      },
      interruptor: {
        id: 'interruptor', label: '🔘 Interruptor',
        x: cx - 30*s, y: H/2 - 120,
        w: 60*s, h: 40,
        terminals: {
          a: { x: cx - 40*s, y: H/2 - 100, label: 'A' },
          b: { x: cx + 40*s, y: H/2 - 100, label: 'B' },
        }
      },
      lampara: {
        id: 'lampara', label: '💡 Lámpara',
        x: cx + 120*s, y: H/2 - 30,
        w: 60*s, h: 60,
        terminals: {
          a: { x: cx + 100*s, y: H/2 - 40, label: 'A' },
          b: { x: cx + 100*s, y: H/2 + 40, label: 'B' },
        }
      },
      motor: {
        id: 'motor', label: '🌀 Motor',
        x: cx + 120*s, y: H/2 + 60,
        w: 60*s, h: 60,
        terminals: {
          a: { x: cx + 100*s, y: H/2 + 50, label: 'A' },
          b: { x: cx + 100*s, y: H/2 + 110, label: 'B' },
        }
      },
    };
  }

  render() {
    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
        <canvas id="circuit-canvas" width="700" height="380" style="max-width:100%"></canvas>
        <div class="circuit-status" id="circuit-status">Conectá los componentes para cerrar el circuito ⚡</div>
        <div class="circuit-controls">
          <button class="circuit-btn" id="btn-interruptor">🔘 Abrir/Cerrar Interruptor</button>
          <button class="circuit-btn" id="btn-limpiar">🗑️ Limpiar Cables</button>
          <button class="circuit-btn" id="btn-hint">💡 Ayuda</button>
        </div>
        <div id="circuit-hint" style="color:var(--text-muted);font-size:0.85rem;text-align:center;max-width:500px;display:none;padding:8px">
          Conectá: <strong>+ Batería → Interruptor A → Interruptor B → Lámpara A → Lámpara B → − Batería</strong>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('circuit-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ajustarCanvas();

    // Eventos
    this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup',   e => this.onMouseUp(e));
    this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this.onMouseDown(e.touches[0]); }, {passive:false});
    this.canvas.addEventListener('touchmove',  e => { e.preventDefault(); this.onMouseMove(e.touches[0]); }, {passive:false});
    this.canvas.addEventListener('touchend',   e => { e.preventDefault(); this.onMouseUp(e.changedTouches[0]); }, {passive:false});

    document.getElementById('btn-interruptor').addEventListener('click', () => {
      this.interruptorCerrado = !this.interruptorCerrado;
      this.verificarCircuito();
    });
    document.getElementById('btn-limpiar').addEventListener('click', () => {
      this.cables = [];
      this.cableEnCurso = null;
      this.puntoOrigen = null;
      this.circuitoCompleto = false;
      this.setStatus('Cables borrados. ¡A conectar de nuevo! 🔌');
    });
    document.getElementById('btn-hint').addEventListener('click', () => {
      const h = document.getElementById('circuit-hint');
      h.style.display = h.style.display === 'none' ? 'block' : 'none';
    });

    this.loop();
  }

  ajustarCanvas() {
    const maxW = Math.min(700, this.container.clientWidth - 16);
    this.canvas.style.width = maxW + 'px';
    this.canvas.style.height = Math.round(maxW * 380/700) + 'px';
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  getTerminals() {
    const comps = this.getComponentes();
    const all = [];
    Object.values(comps).forEach(comp => {
      Object.entries(comp.terminals).forEach(([key, t]) => {
        all.push({ compId: comp.id, key, ...t });
      });
    });
    return all;
  }

  findTerminalNear(pos, radio = 20) {
    return this.getTerminals().find(t => Math.hypot(t.x - pos.x, t.y - pos.y) < radio);
  }

  onMouseDown(e) {
    const pos = this.getPos(e);
    const t = this.findTerminalNear(pos);
    if (t) {
      this.puntoOrigen = t;
      this.cableEnCurso = { x1: t.x, y1: t.y, x2: pos.x, y2: pos.y };
    }
  }
  onMouseMove(e) {
    if (!this.cableEnCurso) return;
    const pos = this.getPos(e);
    this.cableEnCurso.x2 = pos.x;
    this.cableEnCurso.y2 = pos.y;
  }
  onMouseUp(e) {
    if (!this.cableEnCurso || !this.puntoOrigen) { this.cableEnCurso = null; return; }
    const pos = this.getPos(e);
    const destino = this.findTerminalNear(pos);
    if (destino && destino.compId !== this.puntoOrigen.compId) {
      // Verificar que no exista ya ese cable
      const existe = this.cables.some(c =>
        (c.desde.compId === this.puntoOrigen.compId && c.desde.key === this.puntoOrigen.key &&
         c.hasta.compId  === destino.compId && c.hasta.key === destino.key) ||
        (c.hasta.compId  === this.puntoOrigen.compId && c.hasta.key === this.puntoOrigen.key &&
         c.desde.compId  === destino.compId && c.desde.key === destino.key)
      );
      if (!existe) {
        const esDesdePositivo = this.puntoOrigen.compId === 'bateria' && this.puntoOrigen.key === 'pos';
        const esHastaPositivo = destino.compId === 'bateria' && destino.key === 'pos';
        const color = (esDesdePositivo || esHastaPositivo) ? '#FF4444' : '#555';
        this.cables.push({ desde: this.puntoOrigen, hasta: destino, color });
        this.verificarCircuito();
      }
    }
    this.cableEnCurso = null;
    this.puntoOrigen = null;
  }

  // Verificación de circuito usando DFS desde positivo hasta negativo
  verificarCircuito() {
    // Construir grafo de conexiones
    const grafo = {};
    this.cables.forEach(c => {
      const a = `${c.desde.compId}:${c.desde.key}`;
      const b = `${c.hasta.compId}:${c.hasta.key}`;
      if (!grafo[a]) grafo[a] = [];
      if (!grafo[b]) grafo[b] = [];
      grafo[a].push(b);
      grafo[b].push(a);
    });

    // Nodo inicio: bateria:pos, nodo fin: bateria:neg
    const inicio = 'bateria:pos';
    const fin    = 'bateria:neg';

    // DFS que respeta interruptor
    const visitados = new Set();
    const dfs = (nodo) => {
      if (nodo === fin) return true;
      visitados.add(nodo);
      const vecinos = grafo[nodo] || [];
      for (const v of vecinos) {
        // Si el nodo actual es interruptor:a y destino es interruptor:b → solo si cerrado
        const esInterruptorAB = nodo === 'interruptor:a' && v === 'interruptor:b';
        const esInterruptorBA = nodo === 'interruptor:b' && v === 'interruptor:a';
        if ((esInterruptorAB || esInterruptorBA) && !this.interruptorCerrado) continue;
        if (!visitados.has(v)) {
          if (dfs(v)) return true;
        }
      }
      return false;
    };

    const completo = dfs(inicio);
    this.circuitoCompleto = completo;

    if (completo && this.interruptorCerrado) {
      this.setStatus('⚡ ¡CIRCUITO COMPLETO! ¡Juanita lo logró! 🎉');
      if (this.onStar) this.onStar();
    } else if (completo && !this.interruptorCerrado) {
      this.setStatus('🔘 Circuito conectado. ¡Cerrá el interruptor para activarlo!');
    } else {
      this.setStatus('🔌 Seguí conectando... el circuito aún no está completo');
    }
  }

  setStatus(msg) {
    const el = document.getElementById('circuit-status');
    if (el) el.innerHTML = msg;
  }

  // ─── DRAW LOOP ──────────────────────────────────────────
  loop() {
    this.animFrame = requestAnimationFrame(() => this.loop());
    this.tiempo += 0.04;
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Fondo
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0820');
    grad.addColorStop(1, '#0d0b2b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid puntitos
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x = 20; x < W; x += 30) {
      for (let y = 20; y < H; y += 30) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
      }
    }

    const comps = this.getComponentes();

    // Dibujar cables ya hechos
    this.cables.forEach(c => {
      this.drawCable(c.desde.x, c.desde.y, c.hasta.x, c.hasta.y, c.color, this.circuitoCompleto && this.interruptorCerrado);
    });

    // Cable en curso
    if (this.cableEnCurso) {
      this.drawCable(this.cableEnCurso.x1, this.cableEnCurso.y1,
                     this.cableEnCurso.x2, this.cableEnCurso.y2, '#888', false, true);
    }

    // Componentes
    this.drawBateria(comps.bateria);
    this.drawInterruptor(comps.interruptor);
    this.drawLampara(comps.lampara);
    this.drawMotor(comps.motor);

    // Terminales
    this.getTerminals().forEach(t => this.drawTerminal(t));
  }

  drawCable(x1, y1, x2, y2, color, energizado, enCurso = false) {
    const ctx = this.ctx;
    ctx.save();

    if (energizado) {
      // Efecto glow
      ctx.shadowColor = color === '#FF4444' ? '#FF6666' : '#4488FF';
      ctx.shadowBlur = 12;
      // Animación de flujo
      ctx.setLineDash([12, 8]);
      ctx.lineDashOffset = -this.tiempo * 12;
    }

    ctx.strokeStyle = enCurso ? 'rgba(200,200,200,0.5)' : color;
    ctx.lineWidth = energizado ? 4 : 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    // Curva suave
    const mx = (x1+x2)/2;
    ctx.bezierCurveTo(mx, y1, mx, y2, x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  drawTerminal(t) {
    const ctx = this.ctx;
    const isEnCurso = this.puntoOrigen && this.puntoOrigen.compId === t.compId && this.puntoOrigen.key === t.key;
    ctx.save();
    ctx.beginPath();
    ctx.arc(t.x, t.y, isEnCurso ? 9 : 7, 0, Math.PI*2);
    ctx.fillStyle = t.color || '#AAA';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (t.label) {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label, t.x, t.y);
    }
    ctx.restore();
  }

  drawBateria(b) {
    const ctx = this.ctx;
    ctx.save();
    // Cuerpo pila
    const rx = b.x, ry = b.y, rw = b.w, rh = b.h;
    // Sombra
    ctx.shadowColor = '#F1C40F'; ctx.shadowBlur = this.circuitoCompleto && this.interruptorCerrado ? 20 : 5;
    // Cuerpo
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 8); ctx.fill();
    // Franja positiva
    ctx.fillStyle = '#FF4444';
    ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh/2-2, [8,8,0,0]); ctx.fill();
    // Franja negativa
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.roundRect(rx, ry+rh/2+2, rw, rh/2-2, [0,0,8,8]); ctx.fill();
    // Texto
    ctx.fillStyle = 'white'; ctx.font = 'bold 16px Fredoka One, cursive';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('+', rx+rw/2, ry+rh/4);
    ctx.fillText('−', rx+rw/2, ry+3*rh/4);
    // Label
    ctx.fillStyle = '#F1C40F'; ctx.font = '11px Nunito, sans-serif';
    ctx.fillText('🔋 Batería', rx+rw/2, ry-10);
    ctx.restore();
  }

  drawInterruptor(sw) {
    const ctx = this.ctx;
    const t = sw.terminals;
    ctx.save();
    // Base
    ctx.fillStyle = '#34495E';
    ctx.beginPath(); ctx.roundRect(sw.x, sw.y, sw.w, sw.h, 6); ctx.fill();
    // Palanca
    ctx.strokeStyle = this.interruptorCerrado ? '#2ECC71' : '#FF6B6B';
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(t.a.x, t.a.y);
    if (this.interruptorCerrado) {
      ctx.lineTo(t.b.x, t.b.y); // cerrado: horizontal
    } else {
      ctx.lineTo(t.a.x + (t.b.x-t.a.x)*0.6, t.a.y - 18); // abierto: diagonal
    }
    ctx.stroke();
    // Label
    ctx.fillStyle = '#AAA'; ctx.font = '11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔘 ' + (this.interruptorCerrado ? 'CERRADO' : 'ABIERTO'),
                 sw.x + sw.w/2, sw.y - 10);
    ctx.restore();
  }

  drawLampara(l) {
    const ctx = this.ctx;
    const encendida = this.circuitoCompleto && this.interruptorCerrado;
    ctx.save();
    if (encendida) {
      // Halo de luz
      const grd = ctx.createRadialGradient(l.x+l.w/2, l.y+l.h/2, 5, l.x+l.w/2, l.y+l.h/2, 50);
      grd.addColorStop(0, `rgba(255,240,100,${0.5 + 0.3*Math.sin(this.tiempo*3)})`);
      grd.addColorStop(1, 'rgba(255,200,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(l.x-30, l.y-30, l.w+60, l.h+60);
    }
    // Bombilla
    ctx.beginPath();
    ctx.arc(l.x+l.w/2, l.y+l.h/2, 22, 0, Math.PI*2);
    ctx.fillStyle = encendida ? `rgba(255,240,100,${0.8+0.2*Math.sin(this.tiempo*4)})` : '#2C3E50';
    ctx.fill();
    ctx.strokeStyle = '#F1C40F'; ctx.lineWidth = 2.5;
    ctx.stroke();
    // Filamento
    ctx.strokeStyle = encendida ? '#FF8C00' : '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(l.x+l.w/2-8, l.y+l.h/2+5);
    ctx.quadraticCurveTo(l.x+l.w/2, l.y+l.h/2-8, l.x+l.w/2+8, l.y+l.h/2+5);
    ctx.stroke();
    // Emoji
    ctx.font = '18px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(encendida ? '💡' : '⬜', l.x+l.w/2, l.y+l.h/2);
    ctx.fillStyle = '#AAA'; ctx.font = '11px Nunito, sans-serif';
    ctx.fillText('💡 Lámpara', l.x+l.w/2, l.y-10);
    ctx.restore();
  }

  drawMotor(m) {
    const ctx = this.ctx;
    const girando = this.circuitoCompleto && this.interruptorCerrado;
    ctx.save();
    // Cuerpo motor
    ctx.beginPath();
    ctx.arc(m.x+m.w/2, m.y+m.h/2, 24, 0, Math.PI*2);
    ctx.fillStyle = '#2C3E50'; ctx.fill();
    ctx.strokeStyle = '#FF8C42'; ctx.lineWidth = 3;
    ctx.stroke();
    // Hélice
    if (girando) {
      for (let i = 0; i < 3; i++) {
        const ang = this.tiempo*4 + (i * Math.PI*2/3);
        ctx.save();
        ctx.translate(m.x+m.w/2, m.y+m.h/2);
        ctx.rotate(ang);
        ctx.fillStyle = 'rgba(255,140,66,0.7)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.font = '22px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🌀', m.x+m.w/2, m.y+m.h/2);
    }
    ctx.fillStyle = '#AAA'; ctx.font = '11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌀 Motor', m.x+m.w/2, m.y-10);
    ctx.restore();
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}
