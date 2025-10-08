'use client';

import { useState, useEffect } from 'react';

interface Person {
  name: string;
  count: number;
}

const STORAGE_KEY = 'asistencia-counters';
const defaultPeople: Person[] = [
  { name: 'Flo', count: 0 },
  { name: 'Ara', count: 0 },
  { name: 'Anto', count: 0 },
  { name: 'Isi', count: 0 },
];

export default function Home() {
  const [people, setPeople] = useState<Person[]>(defaultPeople);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPeople(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever people changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    }
  }, [people, isLoaded]);

  const updateCount = (index: number, delta: number) => {
    setPeople(prev => prev.map((person, i) =>
      i === index ? { ...person, count: person.count + delta } : person
    ));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
          Asistencia
        </h1>

        <div className="space-y-4">
          {people.map((person, index) => (
            <div
              key={person.name}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 flex-1">
                {person.name}
              </h2>

              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => updateCount(index, -1)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex items-center justify-center transition-colors shadow-md"
                  aria-label={`Decrease count for ${person.name}`}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>

                <span className="text-2xl sm:text-3xl font-bold text-gray-800 min-w-[3rem] text-center">
                  {person.count}
                </span>

                <button
                  onClick={() => updateCount(index, 1)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white flex items-center justify-center transition-colors shadow-md"
                  aria-label={`Increase count for ${person.name}`}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
