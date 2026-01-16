"use client";

import { Suspense, useRef, useMemo, useEffect } from "react";
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

const IMAGE_OPTIONS = {
  Girl: {
    texture: "/assets/base-img.png",
    depth: "/assets/depth-map.png",
  },
  Cat: {
    texture: "/assets/cat_img.jpg",
    depth: "/assets/cat_depth_map.png",
  },
};

const planeMovement = 0.0085;

type ImageOption = keyof typeof IMAGE_OPTIONS;

function DepthImage({ selectedImage }: { selectedImage: ImageOption }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Mouse for depth effect
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));

  // Mouse for plane movement
  const planePositionTarget = useRef(new THREE.Vector3(0, 0, 0));
  const planePositionCurrent = useRef(new THREE.Vector3(0, 0, 0));

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
        value: 0.09,
        min: 0,
        max: 0.38,
        step: 0.001,
        label: "Range Min",
      },
      rangeMax: {
        value: 0.22,
        min: 0,
        max: 0.7,
        step: 0.001,
        label: "Range Max",
      },
      smoothing: {
        value: 0.33,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Smoothing",
      },
    }
  );

  // Convert pivot option to numeric value
  const pivotValue = pivot === "Front" ? 1.0 : 0.0;

  // Load all textures
  const allTextures = useLoader(TextureLoader, [
    IMAGE_OPTIONS.Girl.texture,
    IMAGE_OPTIONS.Girl.depth,
    IMAGE_OPTIONS.Cat.texture,
    IMAGE_OPTIONS.Cat.depth,
  ]);

  // Select current textures based on selection (fixed logic)
  const texture = selectedImage === "Girl" ? allTextures[0] : allTextures[2];
  const depthMap = selectedImage === "Girl" ? allTextures[1] : allTextures[3];

  // Calculate scale to maintain aspect ratio (cover behavior)
  const imageAspect = texture.image
    ? texture.image.width / texture.image.height
    : 16 / 9;
  const viewportAspect = viewport.width / viewport.height;

  let scaleX = viewport.width;
  let scaleY = viewport.height;

  if (viewportAspect > imageAspect) {
    scaleY = viewport.width / imageAspect;
  } else {
    scaleX = viewport.height * imageAspect;
  }

  // Create uniforms with useMemo - include selectedImage in deps to recreate on change
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uDepthMap: { value: depthMap },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAmount: { value: amount },
      uPivot: { value: pivotValue },
      uRange: { value: new THREE.Vector2(rangeMin, rangeMax) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedImage]
  );

  // Update texture uniforms when selection changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTexture.value = texture;
      materialRef.current.uniforms.uDepthMap.value = depthMap;
      materialRef.current.needsUpdate = true;
    }
  }, [texture, depthMap]);

  // Animation frame handler
  useFrame(() => {
    // Update shader uniforms
    if (materialRef.current) {
      // Lerp mouse position with configurable smoothing
      mouseCurrent.current.lerp(mouseTarget.current, smoothing);

      materialRef.current.uniforms.uMouse.value.copy(mouseCurrent.current);
      materialRef.current.uniforms.uAmount.value = amount;
      materialRef.current.uniforms.uPivot.value = pivotValue;
      materialRef.current.uniforms.uRange.value.set(rangeMin, rangeMax);
    }

    // Update plane position with momentum
    if (meshRef.current) {
      planePositionCurrent.current.lerp(
        planePositionTarget.current,
        smoothing * 0.8
      );
      meshRef.current.position.copy(planePositionCurrent.current);
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={[scaleX, scaleY, 1]}
      onPointerMove={(e) => {
        const normalizedX = (e.point.x / scaleX) * 2;
        const normalizedY = (e.point.y / scaleY) * 2;

        // Update depth effect mouse
        mouseTarget.current.set(normalizedX, normalizedY);

        // Update plane position target (inverted for natural feel)
        planePositionTarget.current.set(
          -normalizedX * planeMovement * viewport.width,
          -normalizedY * planeMovement * viewport.height,
          0
        );
      }}
      onPointerLeave={() => {
        mouseTarget.current.set(0, 0);
        planePositionTarget.current.set(0, 0, 0);
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

function Scene() {
  const { image } = useControls("Image", {
    image: {
      value: "Girl" as ImageOption,
      options: ["Girl", "Cat"] as ImageOption[],
      label: "Select Image",
    },
  });

  // Key prop forces complete re-mount when image changes
  return <DepthImage key={image} selectedImage={image} />;
}

export default function DepthMapScene() {
  return (
    <div className="absolute w-full h-full scale-105">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100] }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
