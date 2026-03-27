"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0, y: 0 });

  // Lắng nghe chuột toàn trang
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Tạo 5000 hạt (ổn định, chỉ tạo 1 lần)
  const positions = useMemo(() => {
    const arr = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  // Animation: tự xoay + theo chuột
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(t / 4) / 2 + mouse.current.y * 1.2;
    ref.current.rotation.y = Math.cos(t / 4) / 2 + mouse.current.x * 1.2;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#8B5CF6"   // tím neon
        size={0.05}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

export default function Background() {
  return (
    // ✅ phủ toàn màn, nằm dưới, không chặn chuột
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        dpr={[1, 1.5]}              // ✅ tiết kiệm GPU màn thường
      >
        <Particles />
      </Canvas>
    </div>
  );
}
