import React from 'react';
import { BerechnungsErgebnis, BerechnungsPartei } from '../types';

interface ErgebnisAnzeigeProps {
  results: BerechnungsErgebnis[];
  parteien: BerechnungsPartei[];
  title?: string;
}

const getBorderColorClass = (color?: string) => {
    switch (color) {
        case 'red': return 'border-red-500';
        case 'blue': return 'border-blue-500';
        case 'green': return 'border-green-500';
        case 'yellow': return 'border-yellow-400';
        default: return 'border-transparent';
    }
}

const ErgebnisAnzeige: React.FC<ErgebnisAnzeigeProps> = ({ results, parteien, title }) => {

  const formatNumber = (num: number) => {
    if (num % 1 === 0) {
      return num.toString();
    }
    const fixed = num.toFixed(2);
    return parseFloat(fixed).toString();
  };
    
  if (parteien.length === 0) {
    return (
        <section className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title || '2. Ergebnis der Berechnung'}</h2>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">Geben Sie oben Fraktionen und deren Sitze ein, um die Berechnung zu starten.</p>
            </div>
        </section>
    )
  }
  
  if (results.length === 0) {
    return (
        <section className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title || '2. Ergebnis der Berechnung'}</h2>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">Klicken Sie auf "Berechnen", um die Verteilungstabelle anzuzeigen.</p>
            </div>
        </section>
    )
  }

  const maxDivisor = results.length > 0
    ? results.reduce((max, r) => Math.max(max, r.divisor), 0)
    : Math.max(10, parteien.length);
  const divisorHeaders = Array.from({ length: maxDivisor }, (_, i) => i + 1);

  const resultLookup = new Map<string, BerechnungsErgebnis>();
  results.forEach(r => {
    resultLookup.set(`${r.partyName}-${r.divisor}`, r);
  });


  return (
    <section className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title || "2. Ergebnis als D'Hondt-Tabelle (Ausschüsse)"}</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Die folgende Tabelle zeigt die Verteilung der Zugriffsrechte. Die farbig markierten Zellen mit einer Rangnummer stellen die errechneten Höchstzahlen in absteigender Reihenfolge dar.
      </p>
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700/80 backdrop-blur-sm">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-gray-100 dark:bg-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Partei / Divisor
              </th>
              {divisorHeaders.map(divisor => (
                <th key={divisor} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {divisor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {parteien.map((partei) => (
              <tr key={partei.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <th scope="row" className={`sticky left-0 px-4 py-3 text-left font-medium text-gray-900 dark:text-white whitespace-nowrap bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 ${getBorderColorClass(partei.color)}`}>
                  <div>{partei.name} ({partei.seats})</div>
                  {partei.members && (
                    <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      ({partei.members.join(', ')})
                    </div>
                  )}
                </th>
                {divisorHeaders.map(divisor => {
                  const value = partei.seats / divisor;
                  const result = resultLookup.get(`${partei.name}-${divisor}`);
                  
                  const cellBaseClass = "px-4 py-3 whitespace-nowrap text-right transition-colors duration-200";
                  let cellBgClass = '';
                  if (result) {
                    cellBgClass = result.isTie ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-blue-50 dark:bg-blue-900/40';
                  }

                  return (
                    <td key={divisor} className={`${cellBaseClass} ${cellBgClass}`}>
                      {result ? (
                        <div className="flex items-center justify-end gap-2" title={`Rang ${result.rank}`}>
                          <span className="font-mono font-bold text-gray-900 dark:text-white">{formatNumber(value)}</span>
                          <span className={`flex-shrink-0 inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold text-white shadow-md ${result.isTie ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                            {result.rank}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-gray-400 dark:text-gray-500">{formatNumber(value)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {results.some(r => r.isTie) && (
        <p className="mt-4 text-sm text-yellow-800 dark:text-yellow-200 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            <span className="font-bold">Hinweis zum Losentscheid:</span> Bei Rängen mit gleicher Höchstzahl (gelb markiert) entscheidet das Los über die genaue Reihenfolge. Die Fraktionen können sich jedoch auch untereinander einigen, um einen Losentscheid zu umgehen (§ 50 Abs. 3 S. 3 GO NRW).
        </p>
      )}
    </section>
  );
};

export default ErgebnisAnzeige;