import React, { useState } from 'react';
import { Fraktion } from '../types';
import TrashIcon from './icons/TrashIcon';

interface FraktionenManagerProps {
  fraktionen: Fraktion[];
  onAdd: (name: string, seats: number) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string, seats: number) => void;
  onToggleColor: (id: string) => void;
  title?: string;
  description?: string;
}

const getColorClass = (color?: string) => {
    switch (color) {
        case 'red': return 'bg-red-500';
        case 'blue': return 'bg-blue-500';
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-400';
        default: return 'bg-transparent border-2 border-dashed border-gray-400';
    }
}

const FraktionenManager: React.FC<FraktionenManagerProps> = ({ 
    fraktionen, 
    onAdd, 
    onRemove, 
    onUpdate, 
    onToggleColor,
    title,
    description 
}) => {
  const [newName, setNewName] = useState('');
  const [newSeats, setNewSeats] = useState('');
  const [error, setError] = useState('');

  const handleAddClick = (e: React.FormEvent) => {
    e.preventDefault();
    const seatsNumber = parseInt(newSeats, 10);
    if (!newName.trim()) {
        setError('Der Name der Fraktion darf nicht leer sein.');
        return;
    }
    if (isNaN(seatsNumber) || seatsNumber <= 0) {
        setError('Die Anzahl der Sitze muss eine positive Zahl sein.');
        return;
    }
    if (fraktionen.some(f => f.name.toLowerCase() === newName.trim().toLowerCase())) {
        setError('Eine Fraktion mit diesem Namen existiert bereits.');
        return;
    }

    onAdd(newName.trim(), seatsNumber);
    setNewName('');
    setNewSeats('');
    setError('');
  };

  const effectiveTitle = title || 'Fraktionen & Zählgemeinschaften';
  const effectiveDescription = description || 'Fraktionen hinzufügen und optional über den Farbknopf zu Zählgemeinschaften zusammenfassen. Fraktionen mit der gleichen Farbe werden gemeinsam berechnet.';

  return (
    <section>
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">{effectiveTitle}</h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {effectiveDescription}
      </p>
      <form onSubmit={handleAddClick} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="w-full sm:w-1/2">
            <label htmlFor="fraktion-name" className="sr-only">Name der Fraktion</label>
            <input
                id="fraktion-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name der Fraktion"
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="w-full sm:w-1/4">
             <label htmlFor="fraktion-sitze" className="sr-only">Anzahl Sitze</label>
            <input
                id="fraktion-sitze"
                type="number"
                value={newSeats}
                onChange={(e) => setNewSeats(e.target.value)}
                placeholder="Sitze"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors">
          Hinzufügen
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4 -mt-2">{error}</p>}

      <div className="space-y-3">
        {fraktionen.map((fraktion) => (
          <div key={fraktion.id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md animate-fade-in">
            <button
              onClick={() => onToggleColor(fraktion.id)}
              className="flex-shrink-0 w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-700 focus:ring-gray-400 border border-gray-300 dark:border-gray-500 flex items-center justify-center transition-transform transform hover:scale-110"
              aria-label={`Farbe für ${fraktion.name} ändern`}
            >
                <div className={`w-full h-full rounded-full ${getColorClass(fraktion.color)}`}></div>
            </button>
            <input
              type="text"
              value={fraktion.name}
              onChange={(e) => onUpdate(fraktion.id, e.target.value, fraktion.seats)}
              className="flex-grow px-3 py-1 border-b-2 border-transparent bg-transparent focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="number"
              value={fraktion.seats}
              onChange={(e) => onUpdate(fraktion.id, fraktion.name, parseInt(e.target.value, 10) || 0)}
              className="w-20 px-3 py-1 border-b-2 border-transparent bg-transparent text-right focus:outline-none focus:border-blue-500 transition-colors"
              min="0"
            />
            <button
              onClick={() => onRemove(fraktion.id)}
              className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Fraktion ${fraktion.name} entfernen`}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {fraktionen.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Noch keine Fraktionen hinzugefügt.</p>
        )}
      </div>
    </section>
  );
};

export default FraktionenManager;