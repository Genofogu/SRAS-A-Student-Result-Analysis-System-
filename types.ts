export interface ProjectFile {
  name: string;
  content: string;
  language: 'python' | 'markdown' | 'csv' | 'text';
}

export enum AppMode {
  EDITOR = 'EDITOR',
  TUTOR = 'TUTOR'
}

export interface AiResponse {
  text: string;
  type: 'code' | 'explanation' | 'error';
}