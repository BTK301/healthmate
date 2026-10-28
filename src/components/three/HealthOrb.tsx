"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vWave;

  float wave(vec3 p) {
    return sin(p.x * 3.1 + uTime * 0.55) * 0.5
         + sin(p.y * 2.7 - uTime * 0.45) * 0.32
         + sin(p.z * 3.4 + uTime * 0.38) * 0.22;
  }

  void main() {
    float w = wave(position);
    vWave = w;
    vec3 pos = position + normal * w * 0.05;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uMint;
  uniform vec3 uPeach;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vWave;

  void main() {
    float fres = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 2.2);
    vec3 body = mix(vec3(1.0), uMint, 0.34 + vWave * 0.07);
    vec3 col = mix(body, uPeach, fres * 0.62);
    col += smoothstep(0.55, 1.0, vNormal.y) * 0.09;
    float alpha = 0.03 + fres * 0.5;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.85));
  }
`;

function Orb({ animate }: { animate: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMint: { value: new THREE.Color("#d7f0e5") },
          uPeach: { value: new THREE.Color("#fbe3cc") },
        },
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    if (!animate) return;
    const d = Math.min(delta, 1 / 30);
    material.uniforms.uTime!.value += d;
    if (!mesh.current) return;
    mesh.current.rotation.y += d * 0.07;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.14;
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.012;
    mesh.current.scale.setScalar(breathe);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.28, 48, 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function HealthOrb({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {/* Static fallback / base glow — also what shows if WebGL is unavailable */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(214,240,228,0.45) 38%, rgba(250,214,180,0.28) 68%, rgba(250,214,180,0) 100%)",
          filter: "blur(12px)",
          transform: "scale(1.12)",
        }}
      />
      {!reduced ? (
        <Canvas
          dpr={[1, 1.5]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 0, 3.5], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <Orb animate={visible} />
        </Canvas>
      ) : null}
    </div>
  );
}
