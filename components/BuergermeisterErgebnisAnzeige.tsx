import React, { useMemo } from 'react';
import { BerechnungsErgebnis } from '../types';

interface BuergermeisterErgebnisAnzeigeProps {
  results: BerechnungsErgebnis[];
  anzahlStellvertreter: number;
}

const BuergermeisterErgebnisAnzeige: React.FC<BuergermeisterErgebnisAnzeigeProps> = ({ results, anzahlStellvertreter }) => {
    
  const displayGroups = useMemo(() => {
    if (!results.length || !anzahlStellvertreter) return [];
    
    const groups: { position: number, parties: BerechnungsErgebnis[], isLottery: boolean }[] = [];
    let i = 0;
    let positionCounter = 1;

    while (positionCounter <= anzahlStellvertreter && i < results.length) {
      const currentResult = results[i];
      const tieValue = currentResult.value;

      // Find all parties with the same value (the tie group)
      const tieGroup = results.filter(r => r.value === tieValue);
      const spotsLeft = anzahlStellvertreter - positionCounter + 1;

      if (tieGroup.length > spotsLeft) {
        // Lottery case: More parties in the tie group than spots available.
        groups.push({
          position: positionCounter,
          parties: tieGroup,
          isLottery: true,
        });
        // This lottery decides all remaining spots, so we're done.
        positionCounter = anzahlStellvertreter + 1; 
      } else {
        // No lottery: The entire tie group gets a spot each.
        tieGroup.forEach(partyResult => {
          if (positionCounter <= anzahlStellvertreter) {
            groups.push({
              position: positionCounter,
              parties: [partyResult],
              isLottery: false,
            });
            positionCounter++;
          }
        });
      }
      // Advance index past the processed group
      i += tieGroup.length;
    }
    return groups;

  }, [results, anzahlStellvertreter]);

  if (results.length === 0) {
    return (
        <section className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">2. Ergebnis (Zuteilung)</h2>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">Geben Sie oben Fraktionen ein und klicken Sie auf "Berechnen", um die Verteilung anzuzeigen.</p>
            </div>
        </section>
    )
  }

  return (
    <section className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">2. Ergebnis (Zuteilung)</h2>
      <div className="space-y-3">
        {displayGroups.map((group) => (
          <div 
            key={group.position} 
            className={`p-4 rounded-lg flex items-center justify-between shadow-sm transition-all duration-300 ${group.isLottery ? 'bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500' : 'bg-gray-50 dark:bg-gray-700/50 border-l-4 border-blue-500'}`}
          >
            <div className="flex items-center gap-4">
                <span className="font-bold text-gray-500 dark:text-gray-400 text-lg w-28">
                 {group.position}. Stellvertreter:
                </span>
                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                 {group.parties.map(p => p.partyName).join(' oder ')}
                </span>
            </div>
             <div className="text-right">
                <div className="text-sm text-gray-700 dark:text-gray-200" title={`Rang ${group.parties[0].rank} mit Höchstzahl ${group.parties[0].value.toFixed(2)}`}>
                    Rang {group.parties[0].rank}
                </div>
                 {group.isLottery && (
                    <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                        Losentscheid
                    </div>
                 )}
            </div>
          </div>
        ))}
      </div>
      {displayGroups.some(g => g.isLottery) && (
        <p className="mt-4 text-sm text-yellow-800 dark:text-yellow-200 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            <span className="font-bold">Hinweis zum Losentscheid:</span> Bei Rängen mit gleicher Höchstzahl entscheidet das Los über die Zuteilung des Postens. Alternativ können sich die beteiligten Fraktionen einigen, um einen Losentscheid zu vermeiden (§ 67 Abs. 5 S. 2 i.V.m. § 50 Abs. 3 S. 3 GO NRW).
        </p>
      )}
    </section>
  );
};

export default BuergermeisterErgebnisAnzeige;