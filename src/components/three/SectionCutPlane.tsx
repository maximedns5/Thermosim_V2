// Plan de coupe — clipping plane
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';

export function SectionCutPlane() {
  const { gl, scene } = useThree();
  const { showSectionCut, sectionCutY } = useUIStore();

  useEffect(() => {
    if (showSectionCut) {
      gl.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), sectionCutY)];
      gl.localClippingEnabled = true;
    } else {
      gl.clippingPlanes = [];
      gl.localClippingEnabled = false;
    }
    return () => {
      gl.clippingPlanes = [];
      gl.localClippingEnabled = false;
    };
  }, [showSectionCut, sectionCutY, gl]);

  return null;
}
