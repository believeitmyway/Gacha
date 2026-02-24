import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-rpg-black text-white font-sans selection:bg-gold selection:text-black overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2544&auto=format&fit=crop')] bg-cover bg-center opacity-20 filter blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-rpg-black/80 via-rpg-black/90 to-rpg-black"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {showHeader && (
          <header className="flex justify-between items-center mb-8 border-b border-gold/20 pb-4">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-fantasy text-gradient-gold tracking-wider drop-shadow-md"
            >
              GACHA QUEST
            </motion.h1>
            {/* User info will go here if logged in, handled by specific components */}
          </header>
        )}

        <main className="flex-grow flex flex-col">
          {children}
        </main>

        <footer className="mt-auto pt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Family Gacha RPG. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
