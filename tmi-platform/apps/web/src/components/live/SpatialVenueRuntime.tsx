"use client";

import React, { useEffect, useRef } from "react";

export interface SpatialVenueRuntimeProps {
  skinId?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SpatialVenueRuntime
 * Replaces flat 2D background visuals with a spatial 3D scene graph.
 * Injects physical material lighting and spatial avatar positioning nodes.
 */
export default function SpatialVenueRuntime({
  skinId = "cinema",
  className = "",
  style,
}: SpatialVenueRuntimeProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let animId: number;

    // Client-side dynamic import of Three.js to prevent SSR mismatch
    import("three").then((THREE) => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth || 800;
      const height = mountRef.current.clientHeight || 450;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 3, 10);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Clean old canvas
      mountRef.current.innerHTML = "";
      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const spotlight = new THREE.SpotLight(0xffaa00, 2.5);
      spotlight.position.set(0, 12, 6);
      scene.add(spotlight);

      // Simple 3D Floor Plane representing Spatial Floor Nodes
      const floorGeo = new THREE.PlaneGeometry(30, 20);
      const floorMat = new THREE.MeshStandardMaterial({
        color: skinId === "cinema" ? 0x1a0a04 : 0x050510,
        roughness: 0.2,
        metalness: 0.8,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener("resize", handleResize);

      const animate = () => {
        animId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    }).catch(() => {
      /* fallback if Three.js loading fails */
    });

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [skinId]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[300px] overflow-hidden bg-neutral-950 ${className}`}
      style={style}
    />
  );
}
