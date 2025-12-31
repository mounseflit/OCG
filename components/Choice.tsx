
import React from 'react';

export const Choice = ({ onSelectForm, onSelectUpload, onCancel, t }: { 
  onSelectForm: () => void, 
  onSelectUpload: () => void, 
  onCancel: () => void,
  t: any
}) => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-4 md:gap-8">
        
        {/* Smart Form Option */}
        <button 
          onClick={onSelectForm}
          className="group relative bg-white dark:bg-zinc-900 rounded-[24px] md:rounded-[40px] p-8 md:p-12 text-left border-2 border-transparent hover:border-orange-500 transition-all duration-500 shadow-xl md:shadow-2xl overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 p-4 md:p-8 text-orange-500 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-magic text-6xl md:text-9xl"></i>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-10 shadow-lg shadow-orange-500/20">
            <i className="fas fa-wand-sparkles text-xl md:text-2xl"></i>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white mb-2 md:mb-4 uppercase tracking-tighter">{t.choice_builder_title}</h3>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium mb-8 md:mb-12">{t.choice_builder_desc}</p>
          <div className="flex items-center gap-2 text-orange-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
            {t.choice_builder_btn} <i className="fas fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i>
          </div>
        </button>

        {/* Upload Option */}
        <button 
          onClick={onSelectUpload}
          className="group relative bg-zinc-900 dark:bg-zinc-800 rounded-[24px] md:rounded-[40px] p-8 md:p-12 text-left border-2 border-transparent hover:border-orange-500 transition-all duration-500 shadow-xl md:shadow-2xl overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 p-4 md:p-8 text-white opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-file-pdf text-6xl md:text-9xl"></i>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-zinc-900 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-10 shadow-lg shadow-white/5">
            <i className="fas fa-upload text-xl md:text-2xl"></i>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-4 uppercase tracking-tighter">{t.choice_import_title}</h3>
          <p className="text-sm md:text-base text-zinc-400 dark:text-zinc-500 font-medium mb-8 md:mb-12">{t.choice_import_desc}</p>
          <div className="flex items-center gap-2 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest">
            {t.choice_import_btn} <i className="fas fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i>
          </div>
        </button>

        <div className="md:col-span-2 flex justify-center mt-2 md:mt-4">
          <button onClick={onCancel} className="text-zinc-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:text-orange-500 transition-colors">
            <i className="fas fa-times mr-2"></i> {t.choice_cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
