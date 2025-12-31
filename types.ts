
export interface ContractTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  placeholders: string[];
  isPinned?: boolean;
}

export interface WizardData {
  object: string;
  purpose: string;
  context: string;
  clientName: string;
  format: string;
  dynamicQuestions: string[];
  dynamicAnswers: Record<number, string>;
}

export type ViewState = 'library' | 'wizard' | 'prefill' | 'editor' | 'upload' | 'choice';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'fr';
