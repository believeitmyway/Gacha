import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Shield, PlusCircle, Check, X } from 'lucide-react';

const ParentMode: React.FC = () => {
  const { users, addGold } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [amount, setAmount] = useState<number>(100);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hardcoded simple PIN for demonstration
  const PARENT_PIN = '1234';

  const handleAuth = () => {
    if (pin === PARENT_PIN) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect PIN');
    }
  };

  const handleAddGold = () => {
    if (selectedUser && amount > 0) {
      addGold(selectedUser, amount);
      setSuccess(`Added ${amount}G to user.`);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 bg-rpg-dark border border-gold/40 p-6 rounded-lg shadow-2xl w-80 backdrop-blur-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-fantasy text-gold">Guardian Vault</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter Guardian PIN"
                  className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleAuth}
                  className="w-full bg-gold/20 hover:bg-gold/40 text-gold border border-gold/50 rounded py-2 transition-colors"
                >
                  Access
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Select Hero</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white"
                  >
                    <option value="">-- Choose --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.gold}G)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Grant Gold</label>
                  <div className="flex gap-2">
                    {[100, 500, 1000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`flex-1 text-xs py-1 rounded border ${
                          amount === val
                            ? 'bg-gold text-black border-gold'
                            : 'bg-transparent text-gray-400 border-gray-600 hover:border-gold/50'
                        }`}
                      >
                        {val}G
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white mt-2"
                  />
                </div>

                {success && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 p-2 rounded"
                  >
                    <Check size={16} /> {success}
                  </motion.div>
                )}

                <button
                  onClick={handleAddGold}
                  disabled={!selectedUser}
                  className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle size={16} /> Grant Funds
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-rpg-dark border-2 border-gold/30 text-gold p-3 rounded-full shadow-lg hover:shadow-gold/20 hover:border-gold transition-all"
        title="Parent Mode"
      >
        <Shield size={24} />
      </motion.button>
    </div>
  );
};

export default ParentMode;
