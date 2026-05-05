// Hook simulation — lance steady (sync) + dynamic (worker)
import { useCallback, useEffect, useRef } from 'react';
import { proxy } from 'comlink';
import { useBuildingStore } from '../store/buildingStore';
import { useSimulationStore } from '../store/simulationStore';
import { useUIStore } from '../store/uiStore';
import { solveSteady } from '../engine/solver/steady';
import { getSimWorker } from '../worker/api';

export function useSimulation() {
  const config = useBuildingStore((s) => s.config);
  const loadClimateData = useBuildingStore((s) => s.loadClimateData);
  const { setSteadyResult, setAnnualResult, setProgress, setError, clearAnnualResult } = useSimulationStore();
  const { setIsSimRunning } = useUIStore();

  // Charge les données climatiques au démarrage et à chaque changement de ville
  const lastCity = useRef<string | null>(null);
  useEffect(() => {
    const city = config.terrain.climateCity;
    if (city && city !== lastCity.current) {
      lastCity.current = city;
      loadClimateData(city).catch((e) => {
        setError(`Erreur chargement climat ${city}: ${e instanceof Error ? e.message : String(e)}`);
      });
    }
  }, [config.terrain.climateCity, loadClimateData, setError]);

  // Solveur stationnaire — synchrone, instant
  useEffect(() => {
    try {
      const result = solveSteady(config);
      setSteadyResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [config, setSteadyResult, setError]);

  // Solveur dynamique — Web Worker 8760h
  const runDynamic = useCallback(async () => {
    if (!config.climate?.hourly) {
      setError('Données climatiques manquantes — chargez un fichier météo');
      return;
    }
    clearAnnualResult();
    setIsSimRunning(true);
    setProgress(0);
    try {
      const worker = getSimWorker();
      const result = await worker.runDynamic(config, proxy((pct) => setProgress(pct)));
      setAnnualResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSimRunning(false);
    }
  }, [config, clearAnnualResult, setIsSimRunning, setProgress, setAnnualResult, setError]);

  return { runDynamic };
}
