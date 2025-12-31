
import React, { useState } from 'react';
import { ContractTemplate } from '../types';

interface LibraryProps {
  templates: ContractTemplate[];
  onSelect: (t: ContractTemplate) => void;
  onAdd: () => void;
  onTogglePin: (id: string) => void;
  onDuplicate: (id: string) => void;
  t: any;
  theme: string;
}

export const Library = ({ templates, onSelect, onAdd, onTogglePin, onDuplicate, t, theme }: LibraryProps) => {
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);

  const pinnedTemplates = templates.filter(template => template.isPinned);
  const otherTemplates = templates.filter(template => !template.isPinned);

  // Added key property to the destructured props of TemplateCard to satisfy TypeScript's check when the component is rendered in a list
  const TemplateCard = ({ tpl }: { tpl: ContractTemplate; key?: string }) => (
    <div 
      onClick={() => setPreviewTemplate(tpl)}
      className={`group relative rounded-3xl border transition-all duration-500 cursor-pointer shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col h-[380px] md:h-[420px] overflow-hidden ${
        theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50' : 'bg-white border-zinc-100 hover:border-orange-500/30'
      }`}
    >
      <div className={`h-32 md:h-40 border-b overflow-hidden relative p-4 group-hover:bg-orange-50/5 transition-colors ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
        <div className={`absolute inset-x-4 top-4 bottom-[-100px] rounded-t-xl shadow-sm border origin-top transform group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden opacity-80 group-hover:opacity-100 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
           <div 
             className="text-[6px] p-4 pointer-events-none select-none" 
             style={{ zoom: 0.5 }}
             dangerouslySetInnerHTML={{ __html: tpl.content.substring(0, 800) }}
           ></div>
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent z-10 ${theme === 'dark' ? 'from-zinc-950/80' : 'from-zinc-50/80'}`}></div>
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20">
            {tpl.category}
          </span>
        </div>
      </div>

      <div className={`p-6 md:p-8 flex flex-col flex-1 relative z-20 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-2 md:mb-4">
          <h3 className={`text-base md:text-lg font-extrabold group-hover:text-orange-500 transition-colors leading-tight line-clamp-2 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {tpl.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onDuplicate(tpl.id); }}
              title={t.lib_duplicate}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${
                theme === 'dark' ? 'text-zinc-600 hover:text-orange-500 bg-zinc-800' : 'text-zinc-200 hover:text-orange-500 bg-zinc-50'
              }`}
            >
              <i className="fas fa-copy text-[10px]"></i>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onTogglePin(tpl.id); }}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${
                tpl.isPinned 
                  ? 'text-orange-500 bg-orange-500/10' 
                  : theme === 'dark' ? 'text-zinc-600 hover:text-zinc-400 bg-zinc-800' : 'text-zinc-200 hover:text-zinc-400 bg-zinc-50'
              }`}
            >
              <i className={`${tpl.isPinned ? 'fas' : 'far'} fa-bookmark text-[10px]`}></i>
            </button>
          </div>
        </div>
        
        <p className={`text-[10px] md:text-xs line-clamp-2 mb-4 md:mb-6 font-medium leading-relaxed ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
          {tpl.description}
        </p>

        <div className={`mt-auto pt-4 md:pt-6 border-t flex items-center justify-between ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-50'}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1">
              <i className="far fa-keyboard text-[10px] text-zinc-500"></i>
              <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {tpl.placeholders.length} {t.lib_vars}
              </span>
            </div>
            <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-100'}`}></div>
            <span className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">v1.2</span>
          </div>
          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ${theme === 'dark' ? 'bg-orange-500 text-white' : 'bg-black text-white'}`}>
            <i className="fas fa-arrow-right text-[10px]"></i>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-16 px-4 md:px-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 mb-12 md:mb-20">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 md:mb-6">
            <i className="fas fa-shield-halved text-orange-500"></i> {t.lib_hero_badge}
          </div>
          <h1 className={`text-4xl md:text-6xl font-black tracking-tight mb-4 md:mb-6 leading-[1] ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {t.lib_hero_title_1} <span className="text-orange-500">{t.lib_hero_title_2}</span>.
          </h1>
          <p className="text-zinc-500 font-medium text-base md:text-lg leading-relaxed">
            {t.lib_hero_desc}
          </p>
        </div>
        <div className="w-full md:w-auto">
          <button onClick={onAdd} className="w-full md:w-auto bg-orange-500 text-white px-8 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
            <i className="fas fa-plus text-[10px]"></i> {t.lib_btn_new}
          </button>
        </div>
      </div>

      {pinnedTemplates.length > 0 && (
        <section className="mb-12 md:mb-20">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-orange-500">{t.lib_priority}</h2>
            <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-orange-100'}`}></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {pinnedTemplates.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} />)}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">{t.lib_library}</h2>
          <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`}></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {otherTemplates.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} />)}
          <div 
            onClick={onAdd}
            className={`group rounded-3xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all duration-500 cursor-pointer min-h-[380px] md:min-h-[420px] ${
              theme === 'dark' ? 'border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-orange-500/50 hover:bg-orange-50/50'
            }`}
          >
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-sm ${
              theme === 'dark' ? 'bg-zinc-800 text-zinc-500 group-hover:bg-orange-500 group-hover:text-white' : 'bg-zinc-50 group-hover:bg-orange-500 group-hover:text-white'
            }`}>
              <i className="fas fa-plus text-lg md:text-xl"></i>
            </div>
            <span className="font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] text-zinc-400 group-hover:text-orange-600 transition-colors">
              {t.lib_custom}
            </span>
          </div>
        </div>
      </section>

      {previewTemplate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div 
            className={`w-full max-w-5xl md:h-[90vh] rounded-3xl md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative border ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-white/20'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-4 right-4 md:top-10 md:right-10 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black text-white hover:bg-orange-500 transition-all z-20 flex items-center justify-center"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              <div className={`w-full md:w-80 lg:w-[400px] p-8 md:p-12 flex flex-col border-r ${
                theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="mb-6 md:mb-8">
                  <span className="bg-orange-500 text-white text-[8px] md:text-[9px] font-black px-3 py-1 rounded uppercase tracking-[0.2em] mb-3 md:mb-4 inline-block">
                    {previewTemplate.category}
                  </span>
                  <h3 className={`text-2xl md:text-4xl font-black mb-4 md:mb-6 leading-[1.1] tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                    {previewTemplate.title}
                  </h3>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium leading-relaxed">
                    {previewTemplate.description}
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.lib_preview_mapping}</span>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {previewTemplate.placeholders.slice(0, 3).map(p => (
                          <span key={p} className={`px-2 py-1 rounded text-[8px] md:text-[9px] font-bold border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                            {p.replace('xxxx_', '')}
                          </span>
                        ))}
                        {previewTemplate.placeholders.length > 3 && <span className="text-[8px] md:text-[9px] font-bold text-orange-500">+{previewTemplate.placeholders.length - 3}</span>}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => { onSelect(previewTemplate); setPreviewTemplate(null); }}
                  className="w-full mt-auto bg-orange-500 text-white py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3"
                >
                  {t.lib_preview_confirm} <i className="fas fa-bolt text-[9px] md:text-[10px]"></i>
                </button>
              </div>

              <div className={`flex-1 p-6 md:p-16 overflow-y-auto hidden md:block ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white/50'}`}>
                <div className={`rounded-2xl p-8 md:p-16 shadow-lg border min-h-full max-w-[800px] mx-auto ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100'}`}>
                  <div className="opacity-60 select-none pointer-events-none text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: previewTemplate.content }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
