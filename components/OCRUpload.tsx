
import React, { useState, useRef } from 'react';
import { aiService } from '../ai.service';
import { ContractTemplate } from '../types';

declare const pdfjsLib: any;

// Updated props to include 't' for translations
export const OCRUpload = ({ onComplete, onCancel, t }: { onComplete: (t: ContractTemplate) => void, onCancel: () => void, t: any }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('Initializing OCR engine...');
    setProgress(5);

    try {
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
          
          // Render chunk to images
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

          // Process the chunk content
          const resChunk = await aiService.analyzeDocumentChunk(chunkImages[0], 'image/jpeg', Math.floor(i / CHUNK_SIZE));
          chunks.push(resChunk);
          
          setProgress(Math.floor((endPage / totalPages) * 80));

          // Throttle requests slightly to respect rate limits
          if (i + CHUNK_SIZE <= totalPages) {
            setStatus('Pausing to respect rate limits...');
            await sleep(1500); 
          }
        }

        setStatus('Synthesizing final legal framework...');
        const finalTemplate = await aiService.synthesizeContract(chunks);
        
        onComplete({
          id: Date.now().toString(),
          title: finalTemplate.title || "Imported Framework",
          description: "Digitized contract architecture synthesized from multi-page legacy source.",
          category: "External",
          content: finalTemplate.html,
          placeholders: finalTemplate.html.match(/xxxx_[A-Z_0-9]+/g) || []
        });
      } else {
        // Simple Image Upload
        setStatus('Analyzing image structure...');
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const res = await aiService.processOCR(base64, file.type);
            onComplete({
              id: Date.now().toString(),
              title: res.title || "Imported Image",
              description: "Template extracted from static image document.",
              category: "External",
              content: res.html,
              placeholders: res.html.match(/xxxx_[A-Z_0-9]+/g) || []
            });
          } catch (err: any) {
            console.error(err);
            alert("Analysis failed. Quota might be exceeded. " + (err.message || ""));
            setLoading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error processing document. " + (err.message || "Verify your API quota and plan."));
    } finally {
      setLoading(false);
      setStatus('');
      setProgress(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-32 px-10">
      <div className="bg-white p-12 md:p-16 shadow-2xl rounded-[40px] text-center border border-zinc-100 flex flex-col items-center relative overflow-hidden">
        {loading && (
          <div className="absolute top-0 left-0 h-1 bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        )}
        
        <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-50 text-orange-500 rounded-3xl flex items-center justify-center mb-10 text-3xl md:text-4xl shadow-sm border border-zinc-100">
           <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-file-import'}`}></i>
        </div>

        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">{t.ocr_title_1} <span className="text-orange-500">{t.ocr_title_2}</span></h2>
        <p className="text-zinc-500 text-sm font-medium mb-12 max-w-xs mx-auto">
          {loading ? status : t.ocr_desc}
        </p>
        
        <label className="w-full">
           <div className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs cursor-pointer transition-all flex items-center justify-center gap-3 ${loading ? 'bg-zinc-100 text-zinc-400' : 'bg-black text-white hover:bg-orange-500'}`}>
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
