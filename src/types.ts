export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NatureItem {
  id: string;
  name: string;
  scientificName: string;
  fibonacciNumbers: string;
  description: string;
  mathematicalReason: string;
  iconType: 'sunflower' | 'pinecone' | 'pineapple' | 'romanesco' | 'flower' | 'leaf';
}

export interface TimelineEvent {
  year: string;
  era: string;
  title: string;
  figure: string;
  description: string;
  keyWork?: string;
  significance: string;
}

export interface ApplicationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  mathDetail: string;
  caveat?: string;
}

export interface FactItem {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  detail: string;
  equation?: string;
}
