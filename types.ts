export enum Category {
  COUPLET = 'COUPLET',
  IP_FIGURE = 'IP_FIGURE',
  FORTUNE = 'FORTUNE'
}

export enum AppState {
  IDLE = 'IDLE',
  CONFIGURING = 'CONFIGURING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface UserInput {
  category: Category;
  textPrompt: string;
  imagePart?: string; // Base64
}

export interface CoupletResult {
  upper: string;
  lower: string;
  horizontal: string;
  explanation: string;
}

export interface FortuneResult {
  level: string; // e.g. 上上籤
  title: string; // e.g. 桃園結義
  poem: string[]; // 4 lines of poetry
  explanation: string;
}

export interface GeneratedResult {
  category: Category;
  couplet?: CoupletResult;
  imageUrl?: string;
  fortune?: FortuneResult;
  refinedPrompt?: string;
}