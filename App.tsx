import React, { useState, useCallback } from 'react';
import { Fraktion, BerechnungsErgebnis, BerechnungsPartei } from './types';
import Header from './components/Header';
import FraktionenManager from './components/FraktionenManager';
import ErgebnisAnzeige from './components/ErgebnisAnzeige';
import BuergermeisterRechner from './components/BuergermeisterRechner';
import Tabs from './components/Tabs';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_STATES = [undefined, ...COLORS];
const COLOR_NAME_MAP: { [key: string]: string } = {
    red: 'Rot',
    blue: 'Blau',
    green: 'Grün',
    yellow: 'Gelb',
};


const App: React.FC = () => {
  const [fraktionen, setFraktionen] = useState<Fraktion[]>([
    { id: '1', name: 'CDU', seats: 14 },
    { id: '2', name: 'AFD', seats: 7 },
    { id: '3', name: 'SPD', seats: 5 },
    { id: '4', name: 'GRÜNE', seats: 3 },
    { id: '5', name: 'ÖDP', seats: 2 },
    { id: '6', name: 'UWG', seats: 2 },
    { id: '7', name: 'FDP', seats: 1 },
  ]);
  const [ausschussResults, setAusschussResults] = useState<BerechnungsErgebnis[]>([]);
  const [buergermeisterResults, setBuergermeisterResults] = useState<BerechnungsErgebnis[]>([]);
  const [buergermeisterTableResults, setBuergermeisterTableResults] = useState<BerechnungsErgebnis[]>([]);
  const [berechnungsParteien, setBerechnungsParteien] = useState<BerechnungsPartei[]>([]);
  const [showAusschussResults, setShowAusschussResults] = useState(false);
  const [showBuergermeisterResults, setShowBuergermeisterResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'ausschuss' | 'buergermeister'>('ausschuss');
  const [anzahlStellvertreter, setAnzahlStellvertreter] = useState<number>(2);
  const [minSitzeFraktion, setMinSitzeFraktion] = useState<number>(2);


  const handleAddFraktion = (name: string, seats: number) => {
    const newFraktion: Fraktion = {
      id: new Date().getTime().toString(),
      name,
      seats,
    };
    setFraktionen([...fraktionen, newFraktion]);
  };

  const handleRemoveFraktion = (id: string) => {
    setFraktionen(fraktionen.filter((f) => f.id !== id));
  };

  const handleUpdateFraktion = (id: string, name: string, seats: number) => {
    setFraktionen(
      fraktionen.map((f) => (f.id === id ? { ...f, name, seats } : f))
    );
  };

  const handleToggleFraktionColor = (id: string) => {
    setFraktionen(fraktionen.map(f => {
      if (f.id === id) {
        const currentStateIndex = COLOR_STATES.findIndex(c => c === f.color);
        const nextStateIndex = (currentStateIndex + 1) % COLOR_STATES.length;
        const nextColor = COLOR_STATES[nextStateIndex];
        
        if (nextColor === undefined) {
          const { color, ...rest } = f;
          return rest;
        }
        return { ...f, color: nextColor };
      }
      return f;
    }));
  };
  
  const handleClearAll = () => {
    setFraktionen([]);
    setAusschussResults([]);
    setBuergermeisterResults([]);
    setBuergermeisterTableResults([]);
    setShowAusschussResults(false);
    setShowBuergermeisterResults(false);
  }
  
  const getBerechnungsParteien = useCallback((minSeats: number = 1, zgNameTemplate: string = 'Zählgemeinschaft') => {
    const parteienFuerBerechnung: BerechnungsPartei[] = [];
    const coloredGroups = new Map<string, { totalSeats: number, members: Fraktion[] }>();

    const relevanteFraktionen = fraktionen.filter(f => f.seats >= minSeats);

    relevanteFraktionen.forEach(f => {
      if (f.color) {
        if (!coloredGroups.has(f.color)) {
          coloredGroups.set(f.color, { totalSeats: 0, members: [] });
        }
        const group = coloredGroups.get(f.color)!;
        group.totalSeats += f.seats;
        group.members.push(f);
      } else {
        parteienFuerBerechnung.push({ ...f });
      }
    });

    coloredGroups.forEach((group, color) => {
      if (group.members.length > 0) {
          const colorName = COLOR_NAME_MAP[color] || color.charAt(0).toUpperCase() + color.slice(1);
          parteienFuerBerechnung.push({
            id: `zg-${color}`,
            name: `${zgNameTemplate} ${colorName}`,
            seats: group.totalSeats,
            members: group.members.map(m => m.name).sort(),
            color: color
          });
      }
    });
    
    return parteienFuerBerechnung;
  }, [fraktionen]);

  const runDHondtCalculation = useCallback((parteien: BerechnungsPartei[]) => {
      const allDivisions: { partyName: string; value: number; divisor: number }[] = [];

    parteien.forEach((p) => {
      if (p.seats > 0) {
        for (let i = 1; i <= Math.max(p.seats, fraktionen.length * 2, 20); i++) {
          allDivisions.push({
            partyName: p.name,
            value: p.seats / i,
            divisor: i,
          });
        }
      }
    });

    allDivisions.sort((a, b) => {
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      const partyA = parteien.find(p => p.name === a.partyName);
      const partyB = parteien.find(p => p.name === b.partyName);
      return (partyB?.seats || 0) - (partyA?.seats || 0);
    });
    
    return allDivisions.map((item, index, arr) => {
      const isTieForward = index + 1 < arr.length && arr[index + 1].value === item.value;
      const isTieBackward = index - 1 >= 0 && arr[index - 1].value === item.value;
      return {
        rank: index + 1,
        partyName: item.partyName,
        value: item.value,
        divisor: item.divisor,
        isTie: isTieForward || isTieBackward,
      }
    });
  }, [fraktionen]);

  const handleCalculateAusschuss = useCallback(() => {
    const parteien = getBerechnungsParteien(minSitzeFraktion);
    if (parteien.length === 0) {
        setAusschussResults([]);
        setBerechnungsParteien([]);
        setShowAusschussResults(true);
        return;
    }
    
    setBerechnungsParteien(parteien);
    const finalResults = runDHondtCalculation(parteien);
    setAusschussResults(finalResults.slice(0, Math.max(fraktionen.length * 2, 20)));
    setShowAusschussResults(true);
  }, [getBerechnungsParteien, runDHondtCalculation, fraktionen, minSitzeFraktion]);
  
  const handleCalculateBuergermeister = useCallback(() => {
    const parteien = getBerechnungsParteien(1, 'Liste Farbe');
    if (parteien.length === 0 || anzahlStellvertreter <= 0) {
        setBuergermeisterResults([]);
        setBuergermeisterTableResults([]);
        setBerechnungsParteien([]);
        setShowBuergermeisterResults(true);
        return;
    }
    
    setBerechnungsParteien(parteien);
    const allResults = runDHondtCalculation(parteien);
    setBuergermeisterTableResults(allResults.slice(0, Math.max(fraktionen.length * 2, 20)));
    
    const lastWinner = allResults[anzahlStellvertreter - 1];
    if (lastWinner && lastWinner.isTie) {
        const tieValue = lastWinner.value;
        
        let lastIndex = -1;
        for (let i = allResults.length - 1; i >= 0; i--) {
            if (allResults[i].value === tieValue) {
                lastIndex = i;
                break;
            }
        }
        const endIndex = lastIndex + 1;

        setBuergermeisterResults(allResults.slice(0, Math.max(anzahlStellvertreter, endIndex)));
    } else {
        setBuergermeisterResults(allResults.slice(0, anzahlStellvertreter));
    }

    setShowBuergermeisterResults(true);
  }, [getBerechnungsParteien, runDHondtCalculation, anzahlStellvertreter, fraktionen.length]);

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <Header />
        <main>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 space-y-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === 'ausschuss' && (
              <>
                <FraktionenManager
                  fraktionen={fraktionen}
                  onAdd={handleAddFraktion}
                  onRemove={handleRemoveFraktion}
                  onUpdate={handleUpdateFraktion}
                  onToggleColor={handleToggleFraktionColor}
                />
                 <div className="pt-8 border-t border-gray-200 dark:border-gray-700 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">Berechnungseinstellungen</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Legen Sie die Mindestsitzzahl für den Fraktionsstatus fest. Nur Fraktionen mit dieser oder mehr Sitzen werden bei der Vergabe der Ausschussvorsitze berücksichtigt (gem. § 57 Abs. 1 S. 1 GO NRW).
                        </p>
                        <div className="max-w-xs">
                            <label htmlFor="min-sitze-fraktion" className="font-medium text-gray-700 dark:text-gray-300">Mindestsitzzahl für Fraktionsstatus</label>
                            <input
                               id="min-sitze-fraktion"
                               type="number"
                               value={minSitzeFraktion}
                               onChange={(e) => setMinSitzeFraktion(parseInt(e.target.value, 10) || 0)}
                               min="1"
                               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleCalculateAusschuss}
                            className="w-full sm:w-auto flex-grow bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 transform hover:scale-105"
                        >
                            Ausschussvorsitze berechnen
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="w-full sm:w-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors duration-300"
                            >
                            Alle zurücksetzen
                        </button>
                    </div>
                 </div>

                {showAusschussResults && <ErgebnisAnzeige results={ausschussResults} parteien={berechnungsParteien} />}
              </>
            )}
            
            {activeTab === 'buergermeister' && (
              <BuergermeisterRechner 
                fraktionen={fraktionen}
                onAddFraktion={handleAddFraktion}
                onRemoveFraktion={handleRemoveFraktion}
                onUpdateFraktion={handleUpdateFraktion}
                onToggleFraktionColor={handleToggleFraktionColor}
                onClearAll={handleClearAll}
                onCalculate={handleCalculateBuergermeister}
                results={buergermeisterResults}
                tableResults={buergermeisterTableResults}
                parteien={berechnungsParteien}
                showResults={showBuergermeisterResults}
                anzahlStellvertreter={anzahlStellvertreter}
                setAnzahlStellvertreter={setAnzahlStellvertreter}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;