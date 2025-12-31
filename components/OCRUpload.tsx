
import React, { useState, useRef } from 'react';
import { aiService } from '../ai.service';
import { ContractTemplate } from '../types';

declare const pdfjsLib: any;

export const OCRUpload = ({ onComplete, onCancel, t }: { 
  onComplete: (t: ContractTemplate, openNow?: boolean) => void, 
  onCancel: () => void, 
  t: any 
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [successTemplate, setSuccessTemplate] = useState<ContractTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('Initializing OCR engine...');
    setProgress(5);

    try {
      let finalData: { title: string, html: string };

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const totalPages = pdf.numPages;
        const chunks: string[] = [];
        const CHUNK_SIZE = 3;

        for (let i = 1; i <= totalPages; i += CHUNK_SIZE) {
          const endPage = Math.min(i + CHUNK_SIZE - 1, totalPages);
          setStatus(`Analyzing pages ${i}-${endPage} of ${totalPages}...`);
          
          const chunkImages: string[] = [];
          for (let pageNum = i; pageNum <= endPage; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            chunkImages.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
          }

          const resChunk = await aiService.analyzeDocumentChunk(chunkImages[0], 'image/jpeg', Math.floor(i / CHUNK_SIZE));
          chunks.push(resChunk);
          setProgress(Math.floor((endPage / totalPages) * 80));

          if (i + CHUNK_SIZE <= totalPages) {
            setStatus('Pausing for accuracy...');
            await sleep(1500); 
          }
        }

        setStatus('Synthesizing final legal framework...');
        finalData = await aiService.synthesizeContract(chunks);
      } else {
        setStatus('Analyzing image structure...');
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        finalData = await aiService.processOCR(base64, file.type);
      }

      const template: ContractTemplate = {
        id: `ocr-${Date.now()}`,
        title: finalData.title || "Imported Framework",
        description: "Digitized contract architecture synthesized from legacy source.",
        category: "External",
        content: finalData.html,
        placeholders: finalData.html.match(/xxxx_[A-Z_0-9]+/g) || []
      };

      setSuccessTemplate(template);
      setCustomTitle(template.title);
    } catch (err: any) {
      console.error(err);
      alert("Error processing document. " + (err.message || "Verify your API quota and plan."));
    } finally {
      setLoading(false);
      setStatus('');
      setProgress(0);
    }
  };

  const handleFinalize = (openNow: boolean) => {
    if (!successTemplate) return;
    const finalTpl = { ...successTemplate, title: customTitle };
    onComplete(finalTpl, openNow);
  };

  if (successTemplate) {
    return (
      <div className="max-w-xl mx-auto py-32 px-10 animate-fade-in">
        <div className="bg-white dark:bg-zinc-900 p-12 md:p-16 shadow-2xl rounded-[40px] text-center border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-10 text-3xl md:text-4xl shadow-xl shadow-green-500/20 animate-bounce">
             <i className="fas fa-check"></i>
          </div>

          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 dark:text-white">
            {t.ocr_success_title}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-12 max-w-xs mx-auto">
            {t.ocr_success_desc}
          </p>

          <div className="w-full text-left mb-10">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">{t.ocr_field_title}</label>
            <input 
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-500 rounded-2xl p-5 focus:outline-none font-bold text-zinc-800 dark:text-white transition-all"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              placeholder="e.g. Service Agreement 2024"
            />
          </div>
          
          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={() => handleFinalize(true)}
              className="w-full py-5 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fas fa-magic"></i> {t.ocr_open_ed}
            </button>
            <button 
              onClick={() => handleFinalize(false)}
              className="w-full py-5 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-orange-500 transition-all active:scale-95"
            >
              {t.ocr_save_lib}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-32 px-10 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 p-12 md:p-16 shadow-2xl rounded-[40px] text-center border border-zinc-100 dark:border-zinc-800 flex flex-col items-center relative overflow-hidden">
        {loading && (
          <div className="absolute top-0 left-0 h-1 bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        )}
        
        <div className={`w-20 h-20 md:w-24 md:h-24 bg-zinc-50 dark:bg-zinc-800 text-orange-500 rounded-3xl flex items-center justify-center mb-10 text-3xl md:text-4xl shadow-sm border border-zinc-100 dark:border-zinc-700`}>
           <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-file-import'}`}></i>
        </div>

        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 dark:text-white">{t.ocr_title_1} <span className="text-orange-500">{t.ocr_title_2}</span></h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-12 max-w-xs mx-auto">
          {loading ? status : t.ocr_desc}
        </p>
        
        <label className="w-full">
           <div className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs cursor-pointer transition-all flex items-center justify-center gap-3 ${loading ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400' : 'bg-black text-white hover:bg-orange-500'}`}>
             {loading ? <i className="fas fa-brain fa-pulse"></i> : <i className="fas fa-cloud-upload-alt"></i>}
             {loading ? t.ocr_processing : t.ocr_btn}
           </div>
           <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={processFile} disabled={loading} />
        </label>
        
        {!loading && (
          <button onClick={onCancel} className="mt-8 text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:text-orange-500 transition">
            <i className="fas fa-times mr-2"></i> {t.ocr_cancel}
          </button>
        )}
      </div>
    </div>
  );
};
