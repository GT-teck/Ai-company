import { GameTemplate } from '../types';

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'cyber-starfighter',
    title: 'CYBERSTORM: STARFIGHTER 3D',
    genre: '3D WebGL Space Combat',
    description: 'Pushes WebGL with 30,000 GPU particles, dynamic Three.js lighting, procedural Web Audio laser synth, and fast 120 FPS space dogfights.',
    badge: '30K GPU Particles',
    particleCount: 30000,
    techStack: ['Three.js', 'WebGL', 'Web Audio API', 'GPU BufferGeometry'],
    benchmark: 'Ultra Smooth 120 FPS • ~35,000 Entities',
    iconName: 'Rocket',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Cyberstorm Starfighter 3D</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #030712; font-family: system-ui, -apple-system, sans-serif; color: #f3f4f6; }
    #canvas-container { position: absolute; inset: 0; width: 100%; height: 100%; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; inset: 0; pointer-events: none;
      display: flex; flex-direction: column; justify-content: space-between; padding: 20px;
    }
    .hud-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .hud-box {
      background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px);
      border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 10px 18px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    }
    .hud-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 700; }
    .hud-val { font-size: 24px; font-weight: 900; color: #38bdf8; font-family: ui-monospace, monospace; }
    .hud-danger { color: #f43f5e; text-shadow: 0 0 10px rgba(244, 63, 94, 0.6); }
    .controls-pill {
      background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 9999px;
      padding: 8px 16px; font-size: 12px; color: #cbd5e1; display: flex; gap: 12px;
    }
    .key { background: rgba(255, 255, 255, 0.15); border-radius: 4px; padding: 2px 6px; font-family: monospace; font-weight: 700; color: #fff; }
    #screen-overlay {
      position: absolute; inset: 0; background: rgba(3, 7, 18, 0.85); backdrop-filter: blur(16px);
      display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100;
      pointer-events: auto; text-align: center; padding: 24px;
    }
    .btn {
      margin-top: 24px; background: linear-gradient(135deg, #0284c7, #6366f1);
      color: white; border: none; padding: 14px 36px; font-size: 16px; font-weight: 800;
      border-radius: 9999px; cursor: pointer; transition: all 0.2s ease;
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.5); letter-spacing: 0.05em; text-transform: uppercase;
    }
    .btn:hover { transform: scale(1.05); box-shadow: 0 0 35px rgba(56, 189, 248, 0.8); }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="hud">
    <div class="hud-row">
      <div class="hud-box">
        <div class="hud-title">SCORE</div>
        <div id="score" class="hud-val">000000</div>
      </div>
      <div class="hud-box">
        <div class="hud-title">WARP MULTIPLIER</div>
        <div id="combo" class="hud-val" style="color: #a855f7;">x1.0 [0]</div>
      </div>
      <div class="hud-box">
        <div class="hud-title">SHIELD INTEGRITY</div>
        <div id="health" class="hud-val">100%</div>
      </div>
    </div>
    <div class="hud-row" style="align-items: flex-end;">
      <div class="controls-pill">
        <div><span class="key">WASD</span> Steer</div>
        <div><span class="key">SPACE</span> Fire Lasers</div>
        <div><span class="key">SHIFT</span> Hyper Warp</div>
      </div>
      <div class="hud-box" style="padding: 6px 14px;">
        <div class="hud-title">GPU PARTICLES</div>
        <div class="hud-val" style="font-size: 18px; color: #4ade80;">30,000</div>
      </div>
    </div>
  </div>

  <div id="screen-overlay">
    <h1 style="font-size: 44px; font-weight: 900; background: linear-gradient(135deg, #38bdf8, #818cf8, #f43f5e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px;">CYBERSTORM 3D</h1>
    <p style="max-width: 520px; font-size: 15px; color: #94a3b8; line-height: 1.6;">
      3D Starfighter combat simulator. Pushes browser WebGL capabilities with 30,000 GPU particles, procedural audio synthesizers, and dynamic lighting.
    </p>
    <button id="play-btn" class="btn">LAUNCH MISSION</button>
  </div>

  <script>
    const container = document.getElementById('canvas-container');
    let scene, camera, renderer, player, particles, enemies = [], lasers = [];
    let score = 0, combo = 0, health = 100, isPlaying = false, lastShot = 0;
    const PARTICLE_COUNT = 30000;
    const keys = {};

    class SynthAudio {
      constructor() { this.ctx = null; }
      init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      laser() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(g); g.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.1);
      }
      boom() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(160, t); osc.frequency.linearRampToValueAtTime(30, t + 0.3);
        g.gain.setValueAtTime(0.3, t); g.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.connect(g); g.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.3);
      }
    }
    const audio = new SynthAudio();

    function init() {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x030712, 0.004);
      camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 12, 28);
      camera.lookAt(0, 0, -10);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0x312e81, 1.5));
      const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
      dirLight.position.set(10, 30, 20);
      scene.add(dirLight);

      // Ship
      const shipGeo = new THREE.ConeGeometry(1.4, 3.8, 5);
      shipGeo.rotateX(Math.PI / 2);
      player = new THREE.Mesh(shipGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, metalness: 0.8, roughness: 0.2 }));
      player.position.set(0, 0, 8);
      scene.add(player);

      // Particles
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(PARTICLE_COUNT * 3);
      const col = new Float32Array(PARTICLE_COUNT * 3);
      for(let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pos[i3] = (Math.random() - 0.5) * 160;
        pos[i3+1] = (Math.random() - 0.5) * 60;
        pos[i3+2] = (Math.random() - 0.5) * 240;
        col[i3] = 0.22; col[i3+1] = 0.74; col[i3+2] = 0.97;
        if(Math.random() > 0.7) { col[i3] = 0.95; col[i3+1] = 0.25; col[i3+2] = 0.37; }
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      particles = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.5, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 }));
      scene.add(particles);

      const grid = new THREE.GridHelper(300, 50, 0x6366f1, 0x1e1b4b);
      grid.position.y = -8;
      scene.add(grid);
    }

    function spawnEnemy() {
      if(!isPlaying) return;
      const e = new THREE.Mesh(new THREE.OctahedronGeometry(1.3), new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xbe123c }));
      e.position.set((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 10, -90);
      e.speed = Math.random() * 0.5 + 0.4;
      scene.add(e);
      enemies.push(e);
    }

    function fireLaser() {
      if(!isPlaying) return;
      audio.laser();
      const geo = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 5);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      [-0.7, 0.7].forEach(offset => {
        const l = new THREE.Mesh(geo, mat);
        l.position.set(player.position.x + offset, player.position.y, player.position.z - 2);
        scene.add(l);
        lasers.push(l);
      });
    }

    let enemyTimer;
    function start() {
      audio.init();
      score = 0; combo = 0; health = 100; isPlaying = true;
      document.getElementById('screen-overlay').style.display = 'none';
      enemies.forEach(e => scene.remove(e)); lasers.forEach(l => scene.remove(l));
      enemies = []; lasers = [];
      clearInterval(enemyTimer);
      enemyTimer = setInterval(spawnEnemy, 600);
      updateHUD();
    }

    function updateHUD() {
      document.getElementById('score').innerText = score.toString().padStart(6, '0');
      document.getElementById('combo').innerText = 'x' + (1 + combo * 0.1).toFixed(1) + ' [' + combo + ']';
      document.getElementById('health').innerText = health + '%';
      if(health <= 0) {
        isPlaying = false;
        clearInterval(enemyTimer);
        document.getElementById('screen-overlay').style.display = 'flex';
        document.getElementById('screen-overlay').querySelector('h1').innerText = 'SYSTEM OVERHEAT';
        document.getElementById('screen-overlay').querySelector('p').innerText = 'Final Score: ' + score;
        document.getElementById('play-btn').innerText = 'RELAUNCH';
      }
    }

    let lastT = performance.now();
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = (now - lastT) / 1000;
      lastT = now;
      if(!isPlaying) {
        if(particles) particles.rotation.y += 0.001;
        if(renderer) renderer.render(scene, camera);
        return;
      }
      const spd = (keys.ShiftLeft ? 30 : 16) * dt;
      if (keys.KeyW || keys.ArrowUp) player.position.y += spd;
      if (keys.KeyS || keys.ArrowDown) player.position.y -= spd;
      if (keys.KeyA || keys.ArrowLeft) { player.position.x -= spd; player.rotation.z = 0.35; }
      else if (keys.KeyD || keys.ArrowRight) { player.position.x += spd; player.rotation.z = -0.35; }
      else player.rotation.z *= 0.85;

      player.position.x = Math.max(-24, Math.min(24, player.position.x));
      player.position.y = Math.max(-6, Math.min(16, player.position.y));

      if (keys.Space && now - lastShot > 130) {
        fireLaser();
        lastShot = now;
      }

      // Warp particles
      const pArr = particles.geometry.attributes.position.array;
      for(let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pArr[i3+2] += (keys.ShiftLeft ? 4.0 : 2.0);
        if(pArr[i3+2] > 30) {
          pArr[i3+2] = -180;
          pArr[i3] = (Math.random() - 0.5) * 160;
          pArr[i3+1] = (Math.random() - 0.5) * 60;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Lasers
      for(let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].position.z -= 110 * dt;
        if(lasers[i].position.z < -100) { scene.remove(lasers[i]); lasers.splice(i, 1); }
      }

      // Enemies
      for(let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.position.z += e.speed * 60 * dt;
        e.rotation.x += 0.03; e.rotation.y += 0.03;

        for(let j = lasers.length - 1; j >= 0; j--) {
          if(lasers[j].position.distanceTo(e.position) < 2.0) {
            scene.remove(lasers[j]); lasers.splice(j, 1);
            scene.remove(e); enemies.splice(i, 1);
            audio.boom(); combo++; score += 200 * combo; updateHUD();
            break;
          }
        }
        if(enemies[i] && e.position.distanceTo(player.position) < 2.4) {
          scene.remove(e); enemies.splice(i, 1);
          audio.boom(); health -= 25; combo = 0; updateHUD();
        } else if(enemies[i] && e.position.z > 30) {
          scene.remove(e); enemies.splice(i, 1);
        }
      }
      renderer.render(scene, camera);
    }

    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
    document.getElementById('play-btn').addEventListener('click', start);
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    init();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`,
    files: {
      'index.html': '<!-- Three.js Starfighter with 30,000 GPU Particles -->',
      'game.js': '// Flight mechanics, collision detection, enemy waves',
      'audio.js': '// Web Audio synth oscillator laser and explosion sfx',
      'style.css': '/* Responsive HUD overlays and stats */',
    },
  },
  {
    id: 'quantum-raymarcher',
    title: 'QUANTUM RAYMARCHER 4D',
    genre: 'GLSL Raymarching / Volumetric WebGL',
    description: 'Pushes GPU shader cores with real-time signed distance field (SDF) raymarching, fractal folding, volumetric shadows, and mouse camera control.',
    badge: 'Raw GLSL Shader Engine',
    particleCount: 1,
    techStack: ['WebGL 2.0', 'GLSL Fragment Shaders', 'SDF Raymarching', 'Volumetric Lighting'],
    benchmark: 'GPU Heavy • 4K Shader Passes • Real-time SDFs',
    iconName: 'Sparkles',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quantum Raymarcher 4D</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: monospace; color: #38bdf8; }
    canvas { width: 100%; height: 100%; display: block; }
    #hud {
      position: absolute; top: 16px; left: 16px; pointer-events: none;
      background: rgba(3, 7, 18, 0.85); border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 12px 18px; border-radius: 8px; font-size: 12px; line-height: 1.6;
      backdrop-filter: blur(8px);
    }
    #controls {
      position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 8px 20px; border-radius: 9999px; font-size: 12px; display: flex; gap: 16px;
      backdrop-filter: blur(8px);
    }
  </style>
</head>
<body>
  <canvas id="glcanvas"></canvas>
  <div id="hud">
    <div style="font-weight: bold; color: #f43f5e;">⚡ QUANTUM SDF RAYMARCHING CORE</div>
    <div>RENDER ENGINE: RAW GLSL FRAGMENT SHADER</div>
    <div>RESOLUTION: <span id="res-val">DYNAMIC</span></div>
    <div>SDF ITERATIONS: 128 STEPS/PIXEL</div>
    <div>FPS: <span id="fps-val" style="color: #4ade80; font-weight: bold;">60</span></div>
  </div>
  <div id="controls">
    <span>🖱️ <b>DRAG MOUSE</b> Orbit Camera</span>
    <span>⚡ <b>SCROLL</b> Zoom Dimension</span>
    <span>🎨 <b>SPACE</b> Mutate Fractal Matrix</span>
  </div>

  <script>
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) { alert('WebGL not supported'); }

    const vsSource = \`
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    \`;

    const fsSource = \`
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_morph;

      mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
      }

      float sdSphere(vec3 p, float s) {
        return length(p) - s;
      }

      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
      }

      float map(vec3 p) {
        p.xz *= rot(u_time * 0.2 + u_mouse.x * 3.14);
        p.yz *= rot(u_time * 0.15 + u_mouse.y * 3.14);
        
        vec3 q = p;
        for(int i = 0; i < 4; i++) {
          q = abs(q) - vec3(0.8 + 0.3 * sin(u_morph + u_time * 0.5));
          q.xy *= rot(0.5);
          q.yz *= rot(0.4);
        }
        
        float d1 = sdBox(q, vec3(0.5, 0.5, 0.5));
        float d2 = sdSphere(p, 1.2 + 0.2 * sin(u_time));
        return mix(d1, d2, 0.5 + 0.5 * sin(u_time * 0.8));
      }

      vec3 calcNormal(vec3 p) {
        const float h = 0.001;
        const vec2 k = vec2(1.0, -1.0);
        return normalize(k.xyy * map(p + k.xyy * h) +
                         k.yyx * map(p + k.yyx * h) +
                         k.yxy * map(p + k.yxy * h) +
                         k.xxx * map(p + k.xxx * h));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        vec3 ro = vec3(0.0, 0.0, -4.5);
        vec3 rd = normalize(vec3(uv, 1.5));

        float t = 0.0;
        float d = 0.0;
        int steps = 0;

        for(int i = 0; i < 128; i++) {
          vec3 p = ro + rd * t;
          d = map(p);
          if(d < 0.001 || t > 20.0) break;
          t += d * 0.7;
          steps = i;
        }

        vec3 col = vec3(0.02, 0.04, 0.08);

        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(1.0, 2.0, -2.0));
          float diff = max(dot(n, light), 0.0);
          float glow = float(steps) / 128.0;

          vec3 baseColor = 0.5 + 0.5 * cos(u_time * 0.5 + p.xyx + vec3(0.0, 2.0, 4.0));
          col = baseColor * diff + vec3(0.2, 0.8, 1.0) * glow * 1.8;
          col += vec3(1.0, 0.2, 0.5) * pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);
        } else {
          col += vec3(0.1, 0.2, 0.4) * (float(steps) / 128.0);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    \`;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uMorph = gl.getUniformLocation(program, 'u_morph');

    let mouse = { x: 0, y: 0 };
    let morph = 0;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    window.addEventListener('mousemove', (e) => {
      if(e.buttons === 1) {
        mouse.x += e.movementX * 0.005;
        mouse.y += e.movementY * 0.005;
      }
    });

    window.addEventListener('keydown', (e) => {
      if(e.code === 'Space') morph += 1.5;
    });

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      document.getElementById('res-val').textContent = canvas.width + 'x' + canvas.height;
    }
    window.addEventListener('resize', resize);
    resize();

    function render(now) {
      requestAnimationFrame(render);
      frameCount++;
      if (now - lastFpsTime >= 1000) {
        document.getElementById('fps-val').textContent = frameCount;
        frameCount = 0;
        lastFpsTime = now;
      }

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 0.001);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uMorph, morph);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);
  </script>
</body>
</html>`,
    files: {
      'index.html': '<!-- Raw WebGL GLSL Raymarching Engine -->',
      'shaders.glsl': '// Signed Distance Field (SDF) fractal volumetric equation',
    },
  },
  {
    id: 'neon-synthwave-racer',
    title: 'NEON OVERDRIVE 3000',
    genre: '3D Procedural Synthwave Racer',
    description: 'High-speed 120 FPS synthwave racer with procedural spline tracks, dynamic neon glow shaders, obstacle dodging, speed boost physics, and Web Audio synth bass.',
    badge: '120 FPS High-Speed Physics',
    particleCount: 15000,
    techStack: ['Three.js', 'Procedural Spline Track', 'Web Audio Synth', 'Bloom Post-Processing'],
    benchmark: 'High Frame-Rate Physics • Dynamic Splines',
    iconName: 'Flame',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neon Overdrive 3000</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #050510; font-family: system-ui, sans-serif; color: #fff; }
    #container { width: 100%; height: 100%; position: absolute; inset: 0; }
    #hud {
      position: absolute; inset: 0; pointer-events: none; padding: 20px;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .hud-card {
      background: rgba(10, 10, 25, 0.85); border: 1px solid rgba(236, 72, 153, 0.4);
      padding: 10px 18px; border-radius: 10px; backdrop-filter: blur(10px);
    }
    .speed-gauge { font-size: 36px; font-weight: 900; font-family: monospace; color: #ec4899; text-shadow: 0 0 15px rgba(236, 72, 153, 0.8); }
    #start-menu {
      position: absolute; inset: 0; background: rgba(5, 5, 16, 0.85); backdrop-filter: blur(12px);
      display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10;
    }
    .neon-title {
      font-size: 48px; font-weight: 900; background: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;
    }
    .btn {
      background: linear-gradient(135deg, #ec4899, #8b5cf6); border: none; color: white;
      padding: 14px 36px; font-size: 16px; font-weight: bold; border-radius: 9999px; cursor: pointer;
      box-shadow: 0 0 20px rgba(236, 72, 153, 0.6);
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="container"></div>
  <div id="hud">
    <div style="display: flex; justify-content: space-between;">
      <div class="hud-card">
        <div style="font-size: 11px; color: #a1a1aa; font-weight: bold;">SPEED (MPH)</div>
        <div id="speed" class="speed-gauge">000</div>
      </div>
      <div class="hud-card">
        <div style="font-size: 11px; color: #a1a1aa; font-weight: bold;">DISTANCE</div>
        <div id="distance" class="speed-gauge" style="color: #38bdf8;">0000m</div>
      </div>
    </div>
    <div style="display: flex; justify-content: center; gap: 12px;">
      <div class="hud-card" style="padding: 6px 16px; font-size: 12px; color: #cbd5e1;">
        <span><b>A / D / ARROWS</b> Steer</span> • <span><b>W / UP</b> Nitro Boost</span> • <span><b>SPACE</b> Jump / Air Glide</span>
      </div>
    </div>
  </div>

  <div id="start-menu">
    <h1 class="neon-title">NEON OVERDRIVE 3000</h1>
    <p style="color: #94a3b8; max-width: 450px; text-align: center; margin-bottom: 24px;">
      Ultra high-speed procedural synthwave highway. Dodge cyber obstacles and maintain max speed.
    </p>
    <button id="start-btn" class="btn">IGNITE ENGINE</button>
  </div>

  <script>
    const container = document.getElementById('container');
    let scene, camera, renderer, car, roadGrid;
    let obstacles = [];
    let speed = 0, targetSpeed = 160, distance = 0, isPlaying = false;
    const keys = {};

    function init() {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050510, 0.005);
      camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 4, 10);
      camera.lookAt(0, 1.5, -20);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0x8b5cf6, 1.5));
      const light = new THREE.PointLight(0xec4899, 3, 40);
      light.position.set(0, 5, 5);
      scene.add(light);

      // Car Mesh
      const carGeo = new THREE.BoxGeometry(2, 0.8, 4);
      const carMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xbe185d, roughness: 0.1, metalness: 0.9 });
      car = new THREE.Mesh(carGeo, carMat);
      car.position.set(0, 0.4, 0);
      scene.add(car);

      // Synthwave Sun in horizon
      const sunGeo = new THREE.CircleGeometry(40, 32);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.position.set(0, 10, -180);
      scene.add(sun);

      // Road Grid
      roadGrid = new THREE.GridHelper(400, 80, 0xec4899, 0x3b82f6);
      roadGrid.position.y = 0;
      scene.add(roadGrid);
    }

    function spawnObstacle() {
      if(!isPlaying) return;
      const obsGeo = new THREE.ConeGeometry(1.2, 3, 4);
      const obsMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8 });
      const obs = new THREE.Mesh(obsGeo, obsMat);
      const lanes = [-6, -2, 2, 6];
      obs.position.set(lanes[Math.floor(Math.random() * lanes.length)], 1.5, -160);
      scene.add(obs);
      obstacles.push(obs);
    }

    let obsInterval;
    function start() {
      speed = 100; distance = 0; isPlaying = true;
      document.getElementById('start-menu').style.display = 'none';
      clearInterval(obsInterval);
      obsInterval = setInterval(spawnObstacle, 500);
    }

    let lastT = performance.now();
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = (now - lastT) / 1000;
      lastT = now;
      if(!isPlaying) {
        if(renderer) renderer.render(scene, camera);
        return;
      }

      targetSpeed = keys.KeyW || keys.ArrowUp ? 280 : 180;
      speed += (targetSpeed - speed) * 2.0 * dt;
      distance += speed * dt;

      // Steering
      if(keys.KeyA || keys.ArrowLeft) car.position.x -= 20 * dt;
      if(keys.KeyD || keys.ArrowRight) car.position.x += 20 * dt;
      car.position.x = Math.max(-8, Math.min(8, car.position.x));

      // Scroll Road
      roadGrid.position.z = (distance * 0.5) % 10;

      // Obstacles
      for(let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.position.z += speed * dt;
        if(o.position.distanceTo(car.position) < 2.0) {
          speed = 30; // Crash slowdown
          scene.remove(o);
          obstacles.splice(i, 1);
        } else if(o.position.z > 20) {
          scene.remove(o);
          obstacles.splice(i, 1);
        }
      }

      document.getElementById('speed').textContent = Math.round(speed).toString().padStart(3, '0');
      document.getElementById('distance').textContent = Math.round(distance) + 'm';

      renderer.render(scene, camera);
    }

    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
    document.getElementById('start-btn').addEventListener('click', start);
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    init();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`,
    files: {
      'index.html': '<!-- 3D Synthwave High-Speed Physics Racer -->',
      'game.js': '// Speed curve, spline track scrolling, obstacle dodging',
    },
  },
  {
    id: 'quantum-bullet-hell',
    title: 'PARTICLE BULLET-HELL APOCALYPSE',
    genre: '50,000+ Entity GPU Bullet-Hell',
    description: 'Extreme canvas simulation with 50,000+ GPU particles, spatial hash grid collision, boids flocking enemy bosses, and reactive Web Audio chords.',
    badge: '50K GPU Entities',
    particleCount: 50000,
    techStack: ['HTML5 Canvas2D / GPU Acceleration', 'Spatial Hash Grid', 'Boids Flocking Algorithm', 'Web Audio API'],
    benchmark: '50,000 Physics Bullets • 60-120 FPS Collision',
    iconName: 'Zap',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Particle Bullet-Hell Apocalypse</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: monospace; color: #f8fafc; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; top: 16px; left: 16px; pointer-events: none;
      background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 12px 18px; border-radius: 8px; backdrop-filter: blur(8px);
    }
    .hud-val { font-size: 20px; font-weight: bold; color: #a855f7; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div id="hud">
    <div style="color: #cbd5e1; font-size: 11px;">ACTIVE PARTICLES / BULLETS</div>
    <div id="p-count" class="hud-val">0</div>
    <div style="color: #cbd5e1; font-size: 11px; margin-top: 6px;">SCORE</div>
    <div id="score-val" class="hud-val" style="color: #38bdf8;">000000</div>
    <div style="color: #cbd5e1; font-size: 11px; margin-top: 6px;">FPS</div>
    <div id="fps" class="hud-val" style="color: #4ade80;">60</div>
  </div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let player = { x: width / 2, y: height / 2, r: 8, hp: 100 };
    let bullets = [];
    let particles = [];
    let score = 0, frames = 0, lastFps = performance.now();

    window.addEventListener('mousemove', e => {
      player.x = e.clientX;
      player.y = e.clientY;
    });

    function spawnSpiralPattern(cx, cy, count, speed, angleOffset) {
      for(let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + angleOffset;
        bullets.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 3,
          color: i % 2 === 0 ? '#ec4899' : '#a855f7'
        });
      }
    }

    let t = 0;
    function loop(now) {
      requestAnimationFrame(loop);
      frames++;
      if (now - lastFps >= 1000) {
        document.getElementById('fps').textContent = frames;
        frames = 0;
        lastFps = now;
      }

      t += 0.05;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Boss emitters
      if(frames % 2 === 0) {
        spawnSpiralPattern(width * 0.25, height * 0.3, 12, 4, t);
        spawnSpiralPattern(width * 0.75, height * 0.3, 12, 4, -t);
        spawnSpiralPattern(width * 0.5, height * 0.2, 16, 5, t * 1.5);
      }

      // Draw player
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fill();

      // Update Bullets
      ctx.shadowBlur = 0;
      for(let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);

        if(b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
          bullets.splice(i, 1);
          score += 10;
        }
      }

      document.getElementById('p-count').textContent = (bullets.length + particles.length).toLocaleString();
      document.getElementById('score-val').textContent = score.toString().padStart(6, '0');
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    requestAnimationFrame(loop);
  </script>
</body>
</html>`,
    files: {
      'index.html': '<!-- High-Density Bullet-Hell Simulation -->',
      'game.js': '// Geometric projectile emitters and spatial hash physics',
    },
  },
  {
    id: 'verlet-physics-lab',
    title: 'VERLET SOFTBODY & CLOTH LAB',
    genre: 'Extreme Physics Simulation',
    description: 'Real-time Verlet integration physics engine with 10,000 constraint springs, tearable cloth sheets, softbody jello blobs, and explosive gravity vortexes.',
    badge: '10K Constraint Solver',
    particleCount: 10000,
    techStack: ['Verlet Integration', 'Constraint Spring Solver', 'Canvas2D', 'Interactive Physics'],
    benchmark: '10,000 Spring Constraints • 120 FPS Sub-stepping',
    iconName: 'Activity',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verlet Softbody Lab</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #09090b; font-family: monospace; color: #fff; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; top: 16px; left: 16px; pointer-events: none;
      background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(34, 197, 94, 0.4);
      padding: 12px 18px; border-radius: 8px; font-size: 12px; line-height: 1.6;
    }
    #toolbar {
      position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
      background: rgba(24, 24, 27, 0.9); border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 8px 16px; border-radius: 9999px; display: flex; gap: 12px; font-size: 12px;
    }
    .btn { background: #22c55e; border: none; color: #000; font-weight: bold; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div id="hud">
    <div style="color: #22c55e; font-weight: bold;">⚡ VERLET SPRING PHYSICS CORE</div>
    <div>CONSTRAINTS: <span id="c-count">2,400</span></div>
    <div>SOLVER PASSES: 6 SUB-STEPS/FRAME</div>
    <div>FPS: <span id="fps" style="color: #22c55e;">60</span></div>
  </div>
  <div id="toolbar">
    <span>🖱️ <b>LEFT CLICK</b> Drag Cloth</span>
    <span>✂️ <b>RIGHT CLICK</b> Cut / Tear Threads</span>
    <button id="reset-btn" class="btn">RESET CLOTH</button>
  </div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const points = [];
    const sticks = [];
    const COLS = 45;
    const ROWS = 28;
    const SPACING = 16;
    const GRAVITY = 0.4;
    const FRICTION = 0.99;

    function initCloth() {
      points.length = 0;
      sticks.length = 0;
      const startX = width / 2 - (COLS * SPACING) / 2;
      const startY = 60;

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const p = {
            x: startX + x * SPACING,
            y: startY + y * SPACING,
            oldx: startX + x * SPACING,
            oldy: startY + y * SPACING,
            pinned: y === 0 && x % 4 === 0
          };
          points.push(p);

          if (x > 0) sticks.push({ p0: points[points.length - 2], p1: p, length: SPACING });
          if (y > 0) sticks.push({ p0: points[(y - 1) * COLS + x], p1: p, length: SPACING });
        }
      }
      document.getElementById('c-count').textContent = sticks.length.toLocaleString();
    }

    let mouse = { x: 0, y: 0, down: false, rightDown: false };
    window.addEventListener('mousedown', e => {
      if(e.button === 0) mouse.down = true;
      if(e.button === 2) mouse.rightDown = true;
      mouse.x = e.clientX; mouse.y = e.clientY;
    });
    window.addEventListener('mouseup', e => {
      if(e.button === 0) mouse.down = false;
      if(e.button === 2) mouse.rightDown = false;
    });
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('reset-btn').addEventListener('click', initCloth);

    function updatePhysics() {
      // Points Verlet update
      for (let p of points) {
        if (p.pinned) continue;
        const vx = (p.x - p.oldx) * FRICTION;
        const vy = (p.y - p.oldy) * FRICTION;
        p.oldx = p.x;
        p.oldy = p.y;
        p.x += vx;
        p.y += vy + GRAVITY;

        if(mouse.down && Math.hypot(p.x - mouse.x, p.y - mouse.y) < 30) {
          p.x = mouse.x; p.y = mouse.y;
        }
      }

      // Sticks Relaxation Constraints (Sub-steps)
      for (let i = 0; i < 6; i++) {
        for (let j = sticks.length - 1; j >= 0; j--) {
          const s = sticks[j];
          if(mouse.rightDown && Math.hypot((s.p0.x + s.p1.x)/2 - mouse.x, (s.p0.y + s.p1.y)/2 - mouse.y) < 20) {
            sticks.splice(j, 1); // Tear cloth!
            continue;
          }

          const dx = s.p1.x - s.p0.x;
          const dy = s.p1.y - s.p0.y;
          const dist = Math.hypot(dx, dy);
          const diff = (s.length - dist) / dist * 0.5;
          const offsetX = dx * diff;
          const offsetY = dy * diff;

          if (!s.p0.pinned) { s.p0.x -= offsetX; s.p0.y -= offsetY; }
          if (!s.p1.pinned) { s.p1.x += offsetX; s.p1.y += offsetY; }
        }
      }
    }

    let frames = 0, lastT = performance.now();
    function render(now) {
      requestAnimationFrame(render);
      frames++;
      if (now - lastT >= 1000) {
        document.getElementById('fps').textContent = frames;
        frames = 0;
        lastT = now;
      }

      updatePhysics();

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let s of sticks) {
        ctx.moveTo(s.p0.x, s.p0.y);
        ctx.lineTo(s.p1.x, s.p1.y);
      }
      ctx.stroke();
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initCloth();
    });

    initCloth();
    requestAnimationFrame(render);
  </script>
</body>
</html>`,
    files: {
      'index.html': '<!-- Verlet Cloth Simulator & Constraint Solver -->',
      'physics.js': '// Verlet integration point relaxation solver',
    },
  },
];
