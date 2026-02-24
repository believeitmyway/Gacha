import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Shield, Sword, Sparkles, UserPlus, KeyRound, LogIn } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login, register } = useGame();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (isRegistering) {
      const success = register(username, password);
      if (!success) setError('Username already taken.');
    } else {
      const success = login(username, password);
      if (!success) setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto relative z-20">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-rpg-dark/90 backdrop-blur-md p-8 rounded-2xl border border-gold/30 shadow-2xl shadow-gold/10"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-gold-dark to-rpg-black border border-gold mb-4 shadow-lg shadow-gold/20">
            <Sword className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-3xl font-fantasy text-gradient-gold mb-2">
            {isRegistering ? 'Join the Guild' : 'Resume Quest'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isRegistering
              ? 'Create your adventurer profile to begin.'
              : 'Welcome back, brave hero.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gold/50 group-focus-within:text-gold transition-colors" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-rpg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              placeholder="Adventurer Name"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-gold/50 group-focus-within:text-gold transition-colors" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-rpg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              placeholder="Secret Code"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded border border-red-500/30"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02, brightness: 1.1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full btn-primary flex justify-center items-center gap-2 group"
          >
            {isRegistering ? (
              <>
                <span>Begin Adventure</span>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </>
            ) : (
              <>
                <span>Enter World</span>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm mb-4">
            {isRegistering ? 'Already have a character?' : 'New to this realm?'}
          </p>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-gold hover:text-white transition-colors text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 mx-auto"
          >
            {isRegistering ? (
              <>
                <LogIn className="w-4 h-4" /> Login Instead
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Create Account
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
