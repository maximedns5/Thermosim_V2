// ScenarioList — liste des scénarios prédéfinis avec application au store
import React from 'react';
import { SCENARIOS } from '../../engine/data/scenarios';
import { useBuildingStore } from '../../store/buildingStore';

export function ScenarioList() {
  const applyScenario = useBuildingStore((s) => s.applyScenario);

  return (
    <div className="flex flex-col gap-1 p-2">
      {Object.values(SCENARIOS).map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => applyScenario(scenario)}
          className={[
            'w-full text-left px-3 py-2',
            'border border-[#D9D7D2] hover:border-[#0A0A0A]',
            'transition-colors duration-100',
          ].join(' ')}
        >
          <div className="font-mono text-xs font-medium text-[#0A0A0A]">
            {scenario.name}
          </div>
          <div className="font-sans text-[9px] text-[#6B6560] mt-0.5">
            {scenario.hint}
          </div>
        </button>
      ))}
    </div>
  );
}
