import { useState } from 'react';

export const ServiceMode = ({ onConfirm }: { onConfirm: (mode: string, table?: string) => void }) => {
  const [mode, setMode] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [table, setTable] = useState('');

  return (
    <div className="p-6 bg-white rounded-t-3xl shadow-xl fixed bottom-0 left-0 w-full z-50 animate-in slide-in-from-bottom">
      <h2 className="text-xl font-bold mb-4 text-center">How can we serve you today?</h2>
      <div className="flex gap-2 mb-4">
        {['dine_in', 'takeaway', 'delivery'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as any)}
            className={`flex-1 py-3 rounded-xl capitalize font-medium transition-colors ${
              mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {m.replace('_', ' ')}
          </button>
        ))}
      </div>
      
      {mode === 'dine_in' && (
        <input
          type="text"
          placeholder="Table Number (Optional)"
          className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          value={table}
          onChange={(e) => setTable(e.target.value)}
        />
      )}

      <button
        onClick={() => onConfirm(mode, table)}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
      >
        Start Ordering
      </button>
    </div>
  );
};
