import React from 'react';
import './App.css';

/**
 * A simple counter component for the Corpo incremental game.
 * Displays the current count and a button to increment it, persisted in localStorage.
 */
export default function App() {
  // Initialize count from localStorage, defaulting to 0
  const [count, setCount] = React.useState(() => {
    const saved = localStorage.getItem('counter');
    return saved !== null ? Number(saved) : 0;
  });

  // Whenever count changes, save it to localStorage
  React.useEffect(() => {
    localStorage.setItem('counter', count.toString());
  }, [count]);

  return (
    <div className="app-container">
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>
        Increment
      </button>
    </div>
  );
}
