
import { GoogleGenAI, Modality } from "@google/genai";

export class AudioService {
  private ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  private stream: MediaStream | null = null;

  async startTranscription(onText: (text: string) => void, onEnd: () => void) {
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(this.stream!);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            const bytes = new Uint8Array(int16.buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: (msg) => {
          if (msg.serverContent?.inputTranscription) {
            onText(msg.serverContent.inputTranscription.text);
          }
        },
        onclose: onEnd,
        onerror: onEnd
      },
      config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {} }
    });

    return () => {
      this.stream?.getTracks().forEach(t => t.stop());
      onEnd();
    };
  }
}

export const audioService = new AudioService();
