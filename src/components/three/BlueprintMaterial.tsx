// BlueprintMaterial — shader GLSL hachures screen-space
import { useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, type ThreeElement } from '@react-three/fiber';
import * as THREE from 'three';

// Patterns: 0=none, 1=concrete, 2=brick, 3=insulation, 4=plaster, 5=glass, 6=metal
const vertexShader = /* glsl */`
  varying vec2 vScreenPos;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vScreenPos = (clip.xy / clip.w) * 0.5 + 0.5;
    vNormal = normalize(normalMatrix * normal);
    vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = clip;
  }
`;

const fragmentShader = /* glsl */`
  uniform vec3 uBaseColor;
  uniform vec3 uLineColor;
  uniform int uPattern;
  uniform float uLineWidth;
  uniform float uDensity;
  uniform float uResolution;
  uniform float uOpacity;
  uniform bool uWireframe;
  varying vec2 vScreenPos;
  varying vec3 vNormal;

  float line45(vec2 p, float spacing) {
    float d = (p.x + p.y) / spacing;
    return smoothstep(0.4, 0.6, fract(d));
  }
  float line90(vec2 p, float spacing) {
    return smoothstep(0.4, 0.6, fract(p.y / spacing));
  }
  float line0(vec2 p, float spacing) {
    return smoothstep(0.4, 0.6, fract(p.x / spacing));
  }
  float grid(vec2 p, float spacing) {
    return min(line0(p, spacing), line90(p, spacing));
  }

  void main() {
    vec2 px = vScreenPos * uResolution;
    float sp = uDensity;

    float hatch = 0.0;
    if (uPattern == 1) {
      // béton — grille serrée diagonale
      hatch = 1.0 - line45(px, sp * 0.7);
    } else if (uPattern == 2) {
      // brique — horizontal + vertical espacé
      hatch = 1.0 - min(line90(px, sp), line0(px, sp * 2.5));
    } else if (uPattern == 3) {
      // isolant — zigzag ~ double 45 dégradé
      hatch = 1.0 - line45(px, sp * 1.4) * line45(vec2(px.x, -px.y), sp * 1.4);
    } else if (uPattern == 4) {
      // plâtre — lignes horizontales légères
      hatch = 1.0 - line90(px, sp * 0.5);
    } else if (uPattern == 5) {
      // verre — diagonal fine
      hatch = 1.0 - line45(px, sp * 1.8);
    } else if (uPattern == 6) {
      // métal — grille dense
      hatch = 1.0 - grid(px, sp * 0.5);
    }

    // Éclairage Lambertien simplifié
    vec3 light = normalize(vec3(0.5, 1.0, 0.8));
    float diff = max(dot(vNormal, light), 0.0) * 0.35 + 0.65;

    vec3 col = mix(uBaseColor, uLineColor, hatch * uLineWidth) * diff;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const BlueprintShaderMaterial = shaderMaterial(
  {
    uBaseColor:  new THREE.Color('#C9C4BB'), // pierre gris chaud (architectural)
    uLineColor:  new THREE.Color('#28231E'), // brun-noir profond
    uPattern:    0,
    uLineWidth:  0.55,
    uDensity:    10.0,
    uResolution: 1024.0,
    uOpacity:    1.0,
    uWireframe:  false,
  },
  vertexShader,
  fragmentShader,
);

extend({ BlueprintShaderMaterial });

// TypeScript declaration
declare module '@react-three/fiber' {
  interface ThreeElements {
    blueprintShaderMaterial: ThreeElement<typeof BlueprintShaderMaterial>;
  }
}

export { BlueprintShaderMaterial };

export interface BlueprintMaterialProps {
  pattern?: number;
  opacity?: number;
  lineWidth?: number;
  density?: number;
  resolution?: number;
  baseColor?: string;   // couleur de fond (pierre, verre, etc.)
  lineColor?: string;   // couleur des hachures
}

export function BlueprintMaterial({
  pattern = 0,
  opacity = 1,
  lineWidth = 0.55,
  density = 10,
  resolution = 1024,
  baseColor,
  lineColor,
}: BlueprintMaterialProps) {
  const bc = useMemo(() => new THREE.Color(baseColor ?? '#C9C4BB'), [baseColor]);
  const lc = useMemo(() => new THREE.Color(lineColor ?? '#28231E'), [lineColor]);
  return (
    <blueprintShaderMaterial
      uPattern={pattern}
      uBaseColor={bc}
      uLineColor={lc}
      uOpacity={opacity}
      uLineWidth={lineWidth}
      uDensity={density}
      uResolution={resolution}
      transparent={opacity < 1}
      depthWrite={opacity >= 1}
    />
  );
}
