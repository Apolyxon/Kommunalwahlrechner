
import React, { useState, useMemo } from 'react';
import { Fraktion, Zaehlgemeinschaft } from '../types';
import TrashIcon from './icons/TrashIcon';

interface ZGManagerProps {
  fraktionen: Fraktion[];
  zaehlgemeinschaften: Zaehlgemeinschaft[];
  onAdd: (name: string, memberIds: string[]) => void;
  onRemove: (id: string) => void;
}

const ZaehlgemeinschaftenManager: React.FC<ZGManagerProps> = ({ fraktionen, zaehlgemeinschaften, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const fraktionenInUse = useMemo(() => {
    const usedIds = new Set<string>();
    zaehlgemeinschaften.forEach(zg => {
      zg.memberIds.forEach(id => usedIds.add(id));
    });
    return usedIds;
  }, [zaehlgemeinschaften]);
  
  const availableFraktionen = useMemo(() => {
    return fraktionen.filter(f => !fraktionenInUse.has(f.id));
  }, [fraktionen, fraktionenInUse]);

  const handleCheckboxChange = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Der Name der Zählgemeinschaft darf nicht leer sein.');
      return;
    }
    if (zaehlgemeinschaften.some(zg => zg.name.toLowerCase() === name.trim().toLowerCase())) {
        setError('Eine Zählgemeinschaft mit diesem Namen existiert bereits.');
        return;
    }
    if (selectedIds.size < 2) {
      setError('Eine Zählgemeinschaft muss aus mindestens zwei Fraktionen bestehen.');
      return;
    }

    onAdd(name.trim(), Array.from(selectedIds));
    setName('');
    setSelectedIds(new Set());
  };
  
  const fraktionenMap = new Map(fraktionen.map(f => [f.id, f.name]));


  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">1b. Zählgemeinschaften (optional)</h2>
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
        <form onSubmit={handleAddClick} className="space-y-4">
          <div>
            <label htmlFor="zg-name" className="sr-only">Name der Zählgemeinschaft</label>
            <input
              id="zg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name der Zählgemeinschaft"
              className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Fraktionen auswählen:</p>
              {availableFraktionen.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                    {availableFraktionen.map(f => (
                    <label key={f.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={selectedIds.has(f.id)}
                        onChange={() => handleCheckboxChange(f.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{f.name}</span>
                    </label>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Keine weiteren Fraktionen verfügbar.</p>
              )}
          </div>
          
          <button type="submit" className="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors">
            Zählgemeinschaft bilden
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="space-y-3">
        {zaehlgemeinschaften.map(zg => (
          <div key={zg.id} className="flex items-center justify-between gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md animate-fade-in">
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{zg.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {zg.memberIds.map(id => fraktionenMap.get(id) || '?').join(', ')}
                </p>
            </div>
            <button
              onClick={() => onRemove(zg.id)}
              className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Zählgemeinschaft ${zg.name} entfernen`}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {zaehlgemeinschaften.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Noch keine Zählgemeinschaften gebildet.</p>
        )}
      </div>
    </section>
  );
};

export default ZaehlgemeinschaftenManager;