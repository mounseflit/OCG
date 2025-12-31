
import React from 'react';
import { ViewState, Theme, Language } from '../types';

const ORANGE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/2048px-Orange_logo.svg.png";

export const Navigation = ({ 
  currentView, 
  setView, 
  theme, 
  toggleTheme, 
  lang, 
  setLang,
  t 
}: { 
  currentView: ViewState, 
  setView: (v: ViewState) => void,
  theme: Theme,
  toggleTheme: () => void,
  lang: Language,
  setLang: (l: Language) => void,
  t: any
}) => (
  <nav className="h-20 bg-black text-white px-4 md:px-10 flex items-center justify-between sticky top-0 z-[100] border-b border-zinc-800">
    <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => setView('library')}>
      <img src={ORANGE_LOGO} className="w-8 h-8 md:w-10 md:h-10" alt="Logo" />
      <div className="flex flex-col">
        <span className="font-black text-lg md:text-xl tracking-tighter uppercase leading-none">Orange</span>
        <span className="text-[8px] md:text-[10px] font-bold text-orange-500 uppercase tracking-widest hidden sm:block">Contract Studio</span>
      </div>
    </div>

    <div className="flex gap-4 md:gap-8 items-center">
      <div className="hidden lg:flex gap-6 items-center text-[10px] md:text-xs font-black uppercase tracking-widest mr-4 border-r border-zinc-800 pr-8">
        <button onClick={() => setView('library')} className={currentView === 'library' ? 'text-orange-500' : 'hover:text-orange-500 transition'}>{t.nav_library}</button>
        <button onClick={() => setView('wizard')} className={currentView === 'wizard' ? 'text-orange-500' : 'hover:text-orange-500 transition'}>{t.nav_wizard}</button>
        <button onClick={() => setView('upload')} className={currentView === 'upload' ? 'text-orange-500' : 'hover:text-orange-500 transition'}>{t.nav_import}</button>
      </div>

      <div className="flex items-center gap-3 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
        <div className="flex items-center bg-black rounded-xl p-1">
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${lang === 'en' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('fr')}
            className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${lang === 'fr' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            FR
          </button>
        </div>

        <button 
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-black text-zinc-400 hover:text-orange-500 transition-colors border border-zinc-800"
        >
          <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-xs`}></i>
        </button>
      </div>
    </div>
  </nav>
);
