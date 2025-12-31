
import React from 'react';
import { ContractTemplate } from '../types';

// Updated props to include 't' for translations
export const Prefill = ({ template, values, onChange, onConfirm, t }: { 
  template: ContractTemplate, 
  values: Record<string, string>,
  onChange: (v: Record<string, string>) => void,
  onConfirm: (html: string) => void,
  t: any
}) => {
  const handleLaunch = () => {
    let finalHtml = template.content;
    Object.entries(values).forEach(([key, val]) => {
      const regex = new RegExp(key, 'g');
      const replacement = `<span class="placeholder-highlight">${val || key}</span>`;
      finalHtml = finalHtml.replace(regex, replacement);
    });
    onConfirm(finalHtml);
  };

  return (
    <div className="max-w-2xl mx-auto py-24 px-6 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="bg-white rounded-[32px] p-14 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-zinc-50 relative overflow-hidden">
        
        <div className="mb-14">
          <div className="inline-block bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            {t.pre_badge}
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">{t.pre_title_1} <span className="text-orange-500">{t.pre_title_2}</span></h2>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest leading-relaxed">{t.pre_desc}</p>
        </div>
        
        <div className="space-y-8">
          {template.placeholders.map(p => (
            <div key={p} className="group animate-fade-in">
              <label className="block text-[9px] font-black text-zinc-400 group-focus-within:text-orange-500 uppercase tracking-[0.2em] mb-2 transition-colors">
                {p.replace('xxxx_', '').replace(/_/g, ' ')}
              </label>
              <div className="relative">
                <input 
                  className="w-full bg-zinc-50/50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl px-6 py-4.5 focus:outline-none text-base font-semibold text-zinc-800 transition-all duration-300 placeholder:text-zinc-300"
                  value={values[p]}
                  onChange={e => onChange({...values, [p]: e.target.value})}
                  placeholder={t.pre_input}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-100 group-focus-within:text-orange-100 transition-colors">
                  <i className="fas fa-pen-nib text-sm"></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4">
          <button 
            onClick={handleLaunch} 
            className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-zinc-900/10 hover:bg-orange-500 transition-all duration-300 active:scale-[0.98]"
          >
            {t.pre_launch}
          </button>
          <p className="text-center text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{t.pre_audit}</p>
        </div>
      </div>
    </div>
  );
};
