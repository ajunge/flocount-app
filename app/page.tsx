'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Person {
  name: string;
  count: number;
}

const defaultPeople: Person[] = [
  { name: 'Flo', count: 0 },
  { name: 'Ara', count: 0 },
  { name: 'Anto', count: 0 },
  { name: 'Isi', count: 0 },
];

export default function Home() {
  const [people, setPeople] = useState<Person[]>(defaultPeople);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastUpdateId = useRef<string | null>(null);

  // Load data from API or localStorage on mount
  useEffect(() => {
    async function loadCounters() {
      try {
        // Try to load from API first
        const response = await fetch('/api/counters');
        if (response.ok) {
          const result = await response.json();

          // If API says to use localStorage (no KV database), load from localStorage
          if (result.useLocalStorage) {
            const stored = localStorage.getItem('asistencia-counters');
            if (stored) {
              setPeople(JSON.parse(stored));
            }
          } else if (Array.isArray(result)) {
            // Use data from API (production with KV)
            setPeople(result);
          } else if (result.data) {
            // Handle wrapped data format
            setPeople(result.data);
          }

          setIsLoaded(true);
          return;
        }
      } catch (e) {
        console.error('Failed to load from API, falling back to localStorage:', e);
      }

      // Fallback to localStorage if API fails
      try {
        const stored = localStorage.getItem('asistencia-counters');
        if (stored) {
          setPeople(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }

      setIsLoaded(true);
    }
    loadCounters();
  }, []);

  // Save to API and localStorage whenever people changes
  const saveCounters = useCallback(async (data: Person[]) => {
    if (!isLoaded) return;

    // Generate a unique ID for this update
    const updateId = `${Date.now()}-${Math.random()}`;
    lastUpdateId.current = updateId;

    console.log('Saving counters with updateId:', updateId);

    // Save to localStorage immediately for local dev
    try {
      localStorage.setItem('asistencia-counters', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // Also try to save to API for production, include the update ID
    try {
      const response = await fetch('/api/counters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, updateId }),
      });
      console.log('Save response:', await response.json());
    } catch (e) {
      console.error('Failed to save to API:', e);
    }
  }, [isLoaded]);

  // Don't auto-save on every change - only save when user clicks

  // Connect to SSE for real-time updates (development) or polling (production)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let lastSeenUpdateId: string | null = lastUpdateId.current;

    async function connectSSE() {
      try {
        console.log('Attempting SSE connection...');
        eventSource = new EventSource('/api/events');

        let sseConnected = false;

        eventSource.onopen = () => {
          console.log('SSE connected successfully');
          sseConnected = true;
        };

        eventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            // Ignore our own updates by checking the update ID
            if (message.updateId && message.updateId === lastUpdateId.current) {
              return;
            }

            setPeople(message.data || message);
            lastSeenUpdateId = message.updateId;
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        };

        eventSource.onerror = (error) => {
          console.log('SSE error:', error, 'Connected:', sseConnected);
          if (!sseConnected) {
            console.log('SSE failed to connect, falling back to polling');
            eventSource?.close();
            startPolling();
          }
        };

        // If SSE doesn't connect within 3 seconds, fall back to polling
        setTimeout(() => {
          if (!sseConnected) {
            console.log('SSE timeout, falling back to polling');
            eventSource?.close();
            startPolling();
          }
        }, 3000);
      } catch (e) {
        console.log('SSE not available, starting polling:', e);
        startPolling();
      }
    }

    function startPolling() {
      if (pollInterval) {
        console.log('Polling already started, skipping');
        return;
      }

      console.log('Starting polling mode for real-time updates');
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/poll?lastUpdateId=${lastSeenUpdateId || ''}`);
          const result = await response.json();

          console.log('Poll result:', result, 'My updateId:', lastUpdateId.current);

          if (result.hasUpdate && result.updateId !== lastUpdateId.current) {
            console.log('Updating people from poll:', result.data);
            setPeople(result.data);
            lastSeenUpdateId = result.updateId;
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 2000); // Poll every 2 seconds
    }

    // Only connect after initial load
    if (isLoaded) {
      connectSSE();
    }

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isLoaded]);

  const updateCount = (index: number, delta: number) => {
    const updatedPeople = people.map((person, i) =>
      i === index ? { ...person, count: person.count + delta } : person
    );
    setPeople(updatedPeople);
    saveCounters(updatedPeople);
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
