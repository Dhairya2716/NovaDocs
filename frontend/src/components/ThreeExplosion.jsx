import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Full-screen Three.js explosion particle field.
 * Amber-gold + teal particles burst from centre, drift outward,
 * then gently pull back — loops forever.
 */
export default function ThreeExplosion({ className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // ── Particles ─────────────────────────────────────────────
    const COUNT = 3200;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const origins = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    // Amber-gold colour: rgb(232,168,56) and teal: rgb(88,217,196)
    const palette = [
      new THREE.Color(0xe8a838), // signal amber
      new THREE.Color(0xf0be60), // signal-400
      new THREE.Color(0x58d9c4), // vector teal
      new THREE.Color(0x7ee9d6), // vector-400
      new THREE.Color(0xfbd48c), // citation warm
      new THREE.Color(0xe8a838),
      new THREE.Color(0xe8a838), // weight amber more
    ];

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      // All particles start at origin
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      // Spherical direction for explosion
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.02 + Math.random() * 0.06;
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed * 0.4;

      // Target (resting) position
      const spread = 3.5 + Math.random() * 3;
      origins[i3] = Math.sin(phi) * Math.cos(theta) * spread;
      origins[i3 + 1] = Math.sin(phi) * Math.sin(theta) * spread;
      origins[i3 + 2] = Math.cos(phi) * spread * 0.3;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      sizes[i] = 1.5 + Math.random() * 3.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(position);
          vAlpha = clamp(dist * 0.3 + 0.1, 0.05, 0.9);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, d));
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Animation ─────────────────────────────────────────────
    let phase = 0; // 0 = exploding, 1 = drifting
    let phaseTime = 0;
    let raf;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      phaseTime += delta;
      material.uniforms.uTime.value += delta;

      const pos = geometry.attributes.position.array;

      if (phaseTime < 1.8) {
        // Phase 0: explosive burst outward
        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3;
          pos[i3] += velocities[i3];
          pos[i3 + 1] += velocities[i3 + 1];
          pos[i3 + 2] += velocities[i3 + 2];
          // Slow down as they travel
          velocities[i3] *= 0.97;
          velocities[i3 + 1] *= 0.97;
          velocities[i3 + 2] *= 0.97;
        }
      } else if (phaseTime < 6) {
        // Phase 1: gentle drift with perlin-like wobble
        const t = material.uniforms.uTime.value;
        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3;
          const ox = origins[i3],
            oy = origins[i3 + 1],
            oz = origins[i3 + 2];
          // Drift toward origin + small sin oscillation
          pos[i3] += (ox * 0.6 + Math.sin(t * 0.4 + i) * 0.01 - pos[i3]) * 0.005;
          pos[i3 + 1] += (oy * 0.6 + Math.cos(t * 0.3 + i) * 0.01 - pos[i3 + 1]) * 0.005;
          pos[i3 + 2] += (oz * 0.6 - pos[i3 + 2]) * 0.005;
        }
      } else {
        // Phase 2: pull back to centre and restart
        let allNearCenter = true;
        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3;
          pos[i3] *= 0.94;
          pos[i3 + 1] *= 0.94;
          pos[i3 + 2] *= 0.94;
          if (Math.abs(pos[i3]) > 0.05) allNearCenter = false;
        }
        if (allNearCenter || phaseTime > 9) {
          // Reset for next explosion
          phaseTime = 0;
          const theta0 = Math.random() * Math.PI * 2;
          for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            pos[i3] = 0; pos[i3 + 1] = 0; pos[i3 + 2] = 0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = 0.02 + Math.random() * 0.06;
            velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
            velocities[i3 + 2] = Math.cos(phi) * speed * 0.4;
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;

      // Slow camera rotation
      const t = material.uniforms.uTime.value;
      camera.position.x = Math.sin(t * 0.08) * 0.5;
      camera.position.y = Math.cos(t * 0.06) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}
