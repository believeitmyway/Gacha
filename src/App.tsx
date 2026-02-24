import React, { useState } from 'react';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import GachaScene from './components/GachaScene';
import ParentMode from './components/ParentMode';
import { GameProvider, useGame } from './context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const GameContent = () => {
  const { currentUser } = useGame();
  const [currentView, setCurrentView] = useState<'dashboard' | 'gacha'>('dashboard');

  if (!currentUser) {
    return (
      <Layout showHeader={false}>
        <LoginScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full min-h-[85vh]">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6 bg-rpg-dark/50 p-2 rounded-full border border-white/10 w-fit mx-auto backdrop-blur-sm">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-6 py-2 rounded-full transition-all text-sm font-bold uppercase tracking-wide
              ${currentView === 'dashboard' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}
            `}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('gacha')}
            className={`px-6 py-2 rounded-full transition-all text-sm font-bold uppercase tracking-wide
              ${currentView === 'gacha' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}
            `}
          >
            Summon
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow flex flex-col w-full"
            >
              <Dashboard />
            </motion.div>
          )}

          {currentView === 'gacha' && (
            <motion.div
              key="gacha"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow flex flex-col w-full items-center"
            >
              <GachaScene />
            </motion.div>
          )}
        </AnimatePresence>

        <ParentMode />
      </div>
    </Layout>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
