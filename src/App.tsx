import React from 'react';
import './App.css';

// Worker interface
type Worker = {
  id: number;
  workPower: number;     // units per tick
  efficiency: number;    // fraction to materials
  support: number;       // fraction bonus to others
  wage: number;          // cost per tick
};

export default function App() {
  // Core state
  const [workBuffer, setWorkBuffer] = React.useState<number>(() => {
    const saved = localStorage.getItem('workBuffer');
    return saved ? Number(saved) : 0;
  });
  const [money, setMoney] = React.useState<number>(() => {
    const saved = localStorage.getItem('money');
    return saved ? Number(saved) : 0;
  });
  const [adminFees, setAdminFees] = React.useState<number>(() => {
    const saved = localStorage.getItem('adminFees');
    return saved ? Number(saved) : 0;
  });
  const [workers, setWorkers] = React.useState<Worker[]>(() => {
    const saved = localStorage.getItem('workers');
    return saved ? JSON.parse(saved) as Worker[] : [];
  });

  // Persist to localStorage
  React.useEffect(() => { localStorage.setItem('workBuffer', workBuffer.toString()); }, [workBuffer]);
  React.useEffect(() => { localStorage.setItem('money', money.toString()); }, [money]);
  React.useEffect(() => { localStorage.setItem('adminFees', adminFees.toString()); }, [adminFees]);
  React.useEffect(() => { localStorage.setItem('workers', JSON.stringify(workers)); }, [workers]);

  // Constants
  const pricePerMaterial = 1;   // money per material unit
  const hireCost = 10;
  const defaultWorker: Omit<Worker,'id'> = {
    workPower: 1,
    efficiency: 0.6,
    support: 0.1,
    wage: 0.2  // set lower than production so workers generate net profit
  };

  // Tick loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Calculate total work
      let totalWork = workBuffer;
      // support bonus sum
      const totalSupport = workers.reduce((sum, w) => sum + w.support, 0);
      // each worker contributes workPower * (1 + totalSupport from others)
      workers.forEach(w => {
        const bonus = (totalSupport - w.support);
        totalWork += w.workPower * (1 + bonus);
      });

      if (totalWork > 0) {
        // materials & admin
        const avgEfficiency = workers.length > 0
          ? workers.reduce((sum, w) => sum + w.efficiency, 0) / workers.length
          : 0.6;
        const materials = totalWork * avgEfficiency;
        const admin = totalWork * (1 - avgEfficiency);

        // money gain and admin fees
        const moneyGain = materials * pricePerMaterial;
        setMoney(prev => Math.round((prev + moneyGain) * 100) / 100);
        setAdminFees(prev => Math.round((prev + admin) * 100) / 100);

        // pay wages
        const wageBill = workers.reduce((sum, w) => sum + w.wage, 0);
        setMoney(prev => Math.round((prev - wageBill) * 100) / 100);

        // reset buffer
        setWorkBuffer(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [workBuffer, workers]);

  // Handlers
  const doWork = () => setWorkBuffer(prev => prev + 1);
  const hireWorker = () => {
    if (money >= hireCost) {
      setMoney(prev => prev - hireCost);
      const id = Date.now();
      setWorkers(prev => [...prev, { id, ...defaultWorker }]);
    }
  };

  return (
    <div className="app-container">
      <h1>Corpo Incremental Game</h1>
      <div className="stats">
        <p><strong>Work Buffer:</strong> {Math.round(workBuffer)}</p>
        <p><strong>Money:</strong> {money.toFixed(2)}</p>
        <p><strong>Admin Fees:</strong> {adminFees.toFixed(2)}</p>
        <p><strong>Workers:</strong> {workers.length}</p>
      </div>
      <div className="actions">
        <button onClick={doWork}>Work +1</button>
        <button onClick={hireWorker} disabled={money < hireCost}>
          Hire Worker (Cost {hireCost})
        </button>
      </div>
      <ul className="worker-list">
        {workers.map(w => (
          <li key={w.id}>
            #{w.id}: power={w.workPower}, eff={w.efficiency}, support={w.support}, wage={w.wage}
          </li>
        ))}
      </ul>
    </div>
  );
}
