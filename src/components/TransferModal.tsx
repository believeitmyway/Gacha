import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Coins, Send, ArrowRight, User } from 'lucide-react';

const TransferModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, users, transferGold } = useGame();
  const [targetUserId, setTargetUserId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleTransfer = () => {
    setError('');
    setSuccess('');

    if (!targetUserId) {
      setError('Select a recipient.');
      return;
    }
    if (amount <= 0) {
      setError('Amount must be positive.');
      return;
    }
    if (currentUser && amount > currentUser.gold) {
      setError('Insufficient funds.');
      return;
    }

    const result = transferGold(targetUserId, amount);
    if (result) {
      setSuccess(`Sent ${amount}G successfully!`);
      setTimeout(() => {
        setSuccess('');
        onClose();
        setAmount(0);
        setTargetUserId('');
      }, 1500);
    } else {
      setError('Transfer failed.');
    }
  };

  const recipients = users.filter(u => u.id !== currentUser?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-rpg-dark border border-gold/40 w-full max-w-md p-6 rounded-xl shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-fantasy text-gold mb-6 flex items-center gap-2">
          <Send className="w-6 h-6" /> Send Gold
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Recipient</label>
            <div className="relative">
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white appearance-none focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              >
                <option value="">Select a fellow adventurer...</option>
                {recipients.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (G)</label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50 w-5 h-5" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                placeholder="0"
                min="1"
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              Available: <span className="text-gold">{currentUser?.gold || 0}G</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/20">{error}</p>}
          {success && <p className="text-green-400 text-sm bg-green-900/20 p-2 rounded border border-green-500/20">{success}</p>}

          <button
            onClick={handleTransfer}
            className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
          >
            Confirm Transfer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TransferModal;
