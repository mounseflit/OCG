
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ViewState, ContractTemplate, Theme, Language } from './types';
import { translations } from './translations';
import { Navigation } from './components/Navigation';
import { Library } from './components/Library';
import { Wizard } from './components/Wizard';
import { Prefill } from './components/Prefill';
import { Editor } from './components/Editor';
import { OCRUpload } from './components/OCRUpload';
import { Choice } from './components/Choice';

const INITIAL_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Global Connectivity Master Agreement',
    description: 'Comprehensive framework for international network infrastructure, SD-WAN deployments, and multi-region service level agreements.',
    category: 'Network Services',
    content: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #FF7900; font-size: 18pt; margin-bottom: 20px;">MASTER SERVICES AGREEMENT</h1>
        <p>This agreement is made on <span class="placeholder-highlight">xxxx_DATE</span> between <strong>Orange Business</strong> and <span class="placeholder-highlight">xxxx_CLIENT_NAME</span>.</p>
        <h2 style="font-size: 14pt; margin-top: 20px;">1. Scope of Work</h2>
        <p><span class="placeholder-highlight">xxxx_SERVICE_SCOPE</span></p>
        <p>The Service Provider shall deliver the connectivity solutions defined in Annex A, ensuring compliance with global standards.</p>
      </div>
    `,
    placeholders: ['xxxx_DATE', 'xxxx_CLIENT_NAME', 'xxxx_SERVICE_SCOPE'],
    isPinned: true
  },
  {
    id: 'tpl-2',
    title: 'Managed Security & SOC',
    description: 'Standard agreement for CyberSoc services, perimeter defense, and continuous threat monitoring for enterprise cloud environments.',
    category: 'Security',
    content: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #FF7900; font-size: 18pt; margin-bottom: 20px;">SECURITY SERVICES ORDER</h1>
        <p>Managed Security services provisioned for <span class="placeholder-highlight">xxxx_CLIENT_NAME</span> starting <span class="placeholder-highlight">xxxx_START_DATE</span>.</p>
        <h2 style="font-size: 14pt; margin-top: 20px;">2. Confidentiality</h2>
        <p>The Parties agree to maintain strict confidentiality regarding threat intelligence data and internal security protocols.</p>
      </div>
    `,
    placeholders: ['xxxx_CLIENT_NAME', 'xxxx_START_DATE'],
    isPinned: false
  }
];

const App = () => {
  const [view, setView] = useState<ViewState>('library');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [templates, setTemplates] = useState<ContractTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [currentHtml, setCurrentHtml] = useState('');
  const [prefillValues, setPrefillValues] = useState<Record<string, string>>({});

  const t = translations[lang];

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const handleTemplateSelect = (tpl: ContractTemplate, directToEditor: boolean = false) => {
    setSelectedTemplate(tpl);
    const initialValues: Record<string, string> = {};
    tpl.placeholders.forEach(p => initialValues[p] = '');
    setPrefillValues(initialValues);
    
    if (directToEditor) {
      // For legacy imports, we might want to skip prefill if we just want to edit the raw HTML copy
      // But usually, we still want to map variables. For this enhancement, let's go to prefill.
      setView('prefill');
    } else {
      setView('prefill');
    }
  };

  const handleLaunchEditor = (finalHtml: string) => {
    setCurrentHtml(finalHtml);
    setView('editor');
  };

  const handleAddTemplate = (tpl: ContractTemplate, openImmediately: boolean = false) => {
    setTemplates([tpl, ...templates]);
    if (openImmediately) {
      handleTemplateSelect(tpl);
    } else {
      setView('library');
    }
  };

  const handleTogglePin = (id: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  const handleDuplicateTemplate = (id: string) => {
    const target = templates.find(t => t.id === id);
    if (!target) return;
    
    const copy: ContractTemplate = {
      ...target,
      id: `copy-${Date.now()}`,
      title: `${target.title} - Copy`,
      isPinned: false
    };
    
    setTemplates([copy, ...templates]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col selection:bg-orange-500 selection:text-white ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <Navigation 
        currentView={view} 
        setView={setView} 
        theme={theme} 
        toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        lang={lang}
        setLang={setLang}
        t={t}
      />
      
      <main className="flex-1">
        {view === 'library' && (
          <Library 
            templates={templates} 
            onSelect={handleTemplateSelect} 
            onAdd={() => setView('choice')}
            onTogglePin={handleTogglePin}
            onDuplicate={handleDuplicateTemplate}
            t={t}
            theme={theme}
          />
        )}
        
        {view === 'choice' && (
          <Choice 
            onSelectForm={() => setView('wizard')} 
            onSelectUpload={() => setView('upload')} 
            onCancel={() => setView('library')} 
            t={t}
          />
        )}

        {view === 'wizard' && (
          <Wizard onComplete={handleAddTemplate} t={t} />
        )}

        {view === 'prefill' && selectedTemplate && (
          <Prefill 
            template={selectedTemplate} 
            values={prefillValues} 
            onChange={setPrefillValues} 
            onConfirm={handleLaunchEditor} 
            t={t}
          />
        )}

        {view === 'editor' && (
          <Editor 
            initialHtml={currentHtml} 
            template={selectedTemplate} 
            onReset={() => handleTemplateSelect(selectedTemplate!)} 
            t={t}
            theme={theme}
          />
        )}

        {view === 'upload' && (
          <OCRUpload onComplete={handleAddTemplate} onCancel={() => setView('library')} t={t} />
        )}
      </main>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
