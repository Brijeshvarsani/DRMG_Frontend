import React from "react";

export default function MoneySaverRegionTable({ months, regions, selectedTypes, selectedRegions, moneySaverFlags, onRegionToggle, adSizeSelectedFlags }) {
  return (
    <div className="table-responsive mt-4">
      <table className="table table-bordered text-center align-middle small">
        <thead>
          <tr>
            <th>Region</th>
            {months.map((month, idx) => (
              <th key={idx}>{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region, rIdx) => (
            <tr key={rIdx}>
              <td>{region.REGION} <span className="text-muted">({region.QUANTITY})</span></td>
              
              {months.map((_, mIdx) => {
                const isMoneySaver = moneySaverFlags[mIdx] && adSizeSelectedFlags[mIdx];
                const isChecked = selectedRegions[mIdx]?.includes(region.REGION);
                return (
                  <td key={mIdx} className={isMoneySaver ? "" : "bg-light text-muted"}>
                    {isMoneySaver ? (
                    <input
                        type="checkbox"
                        checked={selectedRegions[mIdx]?.includes(region.REGION)}
                        onChange={e => onRegionToggle(mIdx, region, e.target.checked)}
                        />
                    ) : (
                      "-"
                    )}
                    
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
