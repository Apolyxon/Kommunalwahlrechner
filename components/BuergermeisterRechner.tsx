
import React from 'react';
import { Fraktion, BerechnungsErgebnis, BerechnungsPartei } from '../types.ts';
import FraktionenManager from './FraktionenManager.tsx';
import BuergermeisterErgebnisAnzeige from './BuergermeisterErgebnisAnzeige.tsx';
import ErgebnisAnzeige from './ErgebnisAnzeige.tsx';

interface BuergermeisterRechnerProps {
    fraktionen: Fraktion[];
    onAddFraktion: (name: string, seats: number) => void;
    onRemoveFraktion: (id: string) => void;
    onUpdateFraktion: (id: string, name: string, seats: number) => void;
    onToggleFraktionColor: (id: string) => void;
    onClearAll: () => void;
    onCalculate: () => void;
    results: BerechnungsErgebnis[];
    tableResults: BerechnungsErgebnis[];
    parteien: BerechnungsPartei[];
    showResults: boolean;
    anzahlStellvertreter: number;
    setAnzahlStellvertreter: (n: number) => void;
}

const BuergermeisterRechner: React.FC<BuergermeisterRechnerProps> = ({
    fraktionen,
    onAddFraktion,
    onRemoveFraktion,
    onUpdateFraktion,
    onToggleFraktionColor,
    onClearAll,
    onCalculate,
    results,
    tableResults,
    parteien,
    showResults,
    anzahlStellvertreter,
    setAnzahlStellvertreter
}) => {
    return (
        <div className="space-y-8">
            <div>
                 <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">1. Anzahl der Stellvertreter</h2>
                 <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Geben Sie an, wie viele stellvertretende Bürgermeister gewählt werden sollen (üblich sind 2).
                 </p>
                 <div className="max-w-xs">
                     <label htmlFor="anzahl-stellvertreter" className="sr-only">Anzahl der Stellvertreter</label>
                     <input
                        id="anzahl-stellvertreter"
                        type="number"
                        value={anzahlStellvertreter}
                        onChange={(e) => setAnzahlStellvertreter(parseInt(e.target.value, 10) || 0)}
                        placeholder="Anzahl"
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                 </div>
            </div>

            <FraktionenManager
              fraktionen={fraktionen}
              onAdd={onAddFraktion}
              onRemove={onRemoveFraktion}
              onUpdate={onUpdateFraktion}
              onToggleColor={onToggleFraktionColor}
              title="Fraktionen & Listenfarben"
              description="Fraktionen hinzufügen und optional über den Farbknopf zu Listenfarben zusammenfassen. Fraktionen mit der gleichen Farbe werden für die Vergabe der Stellvertreterposten als eine Liste gezählt."
            />
        
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onCalculate}
                className="w-full sm:w-auto flex-grow bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 transform hover:scale-105"
              >
                Stellv. Bürgermeister berechnen
              </button>
              <button
                onClick={onClearAll}
                className="w-full sm:w-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors duration-300"
                >
                Alle zurücksetzen
                </button>
            </div>

            {showResults && (
                <>
                    <BuergermeisterErgebnisAnzeige results={results} anzahlStellvertreter={anzahlStellvertreter} />
                    <ErgebnisAnzeige results={tableResults} parteien={parteien} title="3. D'Hondt-Tabelle (Detailberechnung)" />
                </>
            )}
      </div>
    );
};

export default BuergermeisterRechner;