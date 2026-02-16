
export enum Grade {
  K4 = '4',
  K5 = '5',
  K6 = '6'
}

export enum Theme {
  Matcha = 'Matcha Clean',
  Pink = 'Pink Cream',
  Gold = 'Gold Elegant',
  Purple = 'Purple Pop',
  Mono = 'Mono Modern',
  SkyCandy = 'Sky Candy',
  SunnyLemon = 'Sunny Lemon',
  MintOcean = 'Mint Ocean',
  PeachSoda = 'Peach Soda',
  LavenderMilk = 'Lavender Milk',
  AquaRobot = 'Aqua Robot',
  ForestKids = 'Forest Kids',
  RedHero = 'Red Hero'
}

export enum Difficulty {
  Santai = 'Santai',
  Serius = 'Serius',
  Ujian = 'Ujian'
}

export interface StudentProfile {
  name: string;
  grade: Grade;
  school: string;
  city: string;
  idNumber?: string;
}

export interface Question {
  id: string;
  text: string;
  answer: string; // "A", "B", "C", or "D"
  answer_text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  hint: string[];
  explanation: string;
  topic: string;
  difficulty: Difficulty;
  type: 'choice';
}

export interface PracticeSession {
  questions: Question[];
  currentIdx: number;
  userAnswers: Record<string, string>;
  results: {
    correct: string[];
    wrong: string[];
    startTime: number;
    endTime?: number;
  };
}

export interface TkaAnalysisData {
  userAnswers: Record<number, string>;
  startTime: number;
  endTime?: number;
}

export interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
}

export type PrintType = 'rumus' | 'hasil' | 'sertifikat' | 'ramadan' | 'materi' | 'ramadan_rewards' | 'ramadan_report';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
}

export interface DiagramSpec {
  type: "diagram_spec";
  title: string;
  topic: string;
  svg: string;
  caption: string;
  printable: boolean;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  desc: string;
  earnedAtDate?: string;
}

export interface RamadanLevel {
  id: number;
  name: string;
  minPoints: number;
  maxPoints: number | null;
}

export interface DailyStat {
  wajibDone: number;
  wajibTotal: number;
  targetDone: number;
  targetTotal: number;
  dailyPoints: number;
  bonusPoints: number;
  isWajibPerfect: boolean;
  isTargetBonus: boolean;
}

export type RamadanStartMode = 'Pemerintah' | 'Ortu' | 'Custom';

export interface RamadanConfig {
  startDate: string;
  startMode: RamadanStartMode;
}

export interface AppState {
  view: 'home' | 'profile' | 'theme' | 'material' | 'practice' | 'tryout' | 'print' | 'certificate' | 'ramadan' | 'result' | 'chat_matika' | 'printPreview' | 'ramadan_rewards';
  profile: StudentProfile;
  theme: Theme;
  ramadanConfig: RamadanConfig;
  lastTryOutResult?: PracticeSession;
  tkaData?: TkaAnalysisData;
  printType?: PrintType;
  printPayload?: any;
}
