// useCameraPreset — hook pour déclencher des presets de caméra depuis n'importe quel composant
// Expose la liste des presets et une fonction pour en appliquer un
// La caméra elle-même est gérée par OrbitCameraRig dans le canvas Three.js

import { useCallback, useRef } from 'react';

export type CameraPreset = 'isometric' | 'south_facade' | 'section' | 'top';

export const CAMERA_PRESET_LABELS: Record<CameraPreset, string> = {
  isometric:    'ISO',
  south_facade: 'SUD',
  section:      'COUPE',
  top:          'PLAN',
};

export const CAMERA_PRESETS: CameraPreset[] = ['isometric', 'south_facade', 'section', 'top'];

/**
 * useCameraPreset
 *
 * Permet aux composants UI (boutons, raccourcis) de piloter la caméra Three.js.
 * Utilise un callback ref partagé pour communiquer avec OrbitCameraRig.
 *
 * Pattern: enregistrer une fonction via registerApplyFn depuis OrbitCameraRig,
 * puis l'appeler via applyPreset depuis les composants UI.
 */

type ApplyFn = (preset: CameraPreset) => void;

// Singleton ref partagé entre le hook et OrbitCameraRig
let _applyFn: ApplyFn | null = null;

export function registerCameraApplyFn(fn: ApplyFn): void {
  _applyFn = fn;
}

export function unregisterCameraApplyFn(): void {
  _applyFn = null;
}

export function useCameraPreset() {
  const current = useRef<CameraPreset>('isometric');

  const applyPreset = useCallback((preset: CameraPreset) => {
    current.current = preset;
    if (_applyFn) {
      _applyFn(preset);
    }
  }, []);

  return {
    presets: CAMERA_PRESETS,
    labels: CAMERA_PRESET_LABELS,
    currentPreset: current,
    applyPreset,
  };
}
