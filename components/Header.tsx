
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
        Ausschussvorsitz-Rechner
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Für Stadträte in Nordrhein-Westfalen
      </p>
    </header>
  );
};

export default Header;
