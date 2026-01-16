"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";
import { TextureLoader } from "three";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;

  uniform sampler2D uTexture;
  uniform sampler2D uDepthMap;
  uniform vec2 uMouse;
  uniform float uAmount;
  uniform float uPivot;
  uniform vec2 uRange;

  varying vec2 vUv;

  void main() {
    vec4 depth = texture2D(uDepthMap, vUv);
    float depthValue = depth.r;

    // Apply pivot (0 = back, 1 = front)
    float adjustedDepth = depthValue - uPivot;

    // Apply range (min/max depth influence)
    float rangedDepth = smoothstep(uRange.x, uRange.y, depthValue) * 2.0 - 1.0;

    // Calculate displacement
    vec2 displacement = uMouse * adjustedDepth * uAmount;

    // Apply displacement to UV
    vec2 newUv = vUv + displacement;

    // Clamp UVs to prevent edge artifacts
    newUv = clamp(newUv, 0.0, 1.0);

    gl_FragColor = texture2D(uTexture, newUv);
  }
`;

function DepthImage() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));

  const { viewport } = useThree();

  const { amount, pivot, rangeMin, rangeMax, smoothing } = useControls(
    "Depth Effect",
    {
      amount: {
        value: 0.007,
        min: 0,
        max: 0.025,
        step: 0.0001,
        label: "Amount",
      },
      pivot: {
        value: "Front" as "Back" | "Front",
        options: ["Back", "Front"],
        label: "Pivot",
      },
      rangeMin: {
        value: 0.06,
        min: 0,
        max: 0.38,
        step: 0.001,
        label: "Range Min",
      },
      rangeMax: {
        value: 0.18,
        min: 0,
        max: 0.7,
        step: 0.001,
        label: "Range Max",
      },
      smoothing: {
        value: 0.1,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Smoothing",
      },
    }
  );

  // Convert pivot option to numeric value
  const pivotValue = pivot === "Front" ? 1.0 : 0.0;

  // Load textures with Suspense support
  const [texture, depthMap] = useLoader(TextureLoader, [
    "/assets/base-img.png",
    "/assets/depth-map.png",
  ]);

  // Calculate scale to maintain aspect ratio (cover behavior)
  const imageAspect = texture.image
    ? texture.image.width / texture.image.height
    : 16 / 9;
  const viewportAspect = viewport.width / viewport.height;

  let scaleX = viewport.width;
  let scaleY = viewport.height;

  if (viewportAspect > imageAspect) {
    // Viewport is wider than image - scale based on width
    scaleY = viewport.width / imageAspect;
  } else {
    // Viewport is taller than image - scale based on height
    scaleX = viewport.height * imageAspect;
  }

  // Create uniforms - only recreate when textures change
  const uniforms = useRef({
    uTexture: { value: texture },
    uDepthMap: { value: depthMap },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uAmount: { value: amount },
    uPivot: { value: pivotValue },
    uRange: { value: new THREE.Vector2(rangeMin, rangeMax) },
  }).current;

  // Mouse movement handler
  useFrame(() => {
    if (materialRef.current) {
      // Lerp mouse position with configurable smoothing
      mouseCurrent.current.lerp(mouseTarget.current, smoothing);

      materialRef.current.uniforms.uMouse.value.copy(mouseCurrent.current);
      materialRef.current.uniforms.uAmount.value = amount;
      materialRef.current.uniforms.uPivot.value = pivotValue;
      materialRef.current.uniforms.uRange.value.set(rangeMin, rangeMax);
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={[scaleX, scaleY, 1]}
      onPointerMove={(e) => {
        mouseTarget.current.set(
          (e.point.x / scaleX) * 2,
          (e.point.y / scaleY) * 2
        );
      }}
      onPointerLeave={() => {
        mouseTarget.current.set(0, 0);
      }}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function DepthMapScene() {
  return (
    <div className="inset-0 w-[90vw] h-[90vh]">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100] }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <DepthImage />
        </Suspense>
      </Canvas>
    </div>
  );
}
