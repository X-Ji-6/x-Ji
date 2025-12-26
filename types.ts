
export enum RiskLevel {
  LOW = '低风险',
  MEDIUM = '中风险',
  HIGH = '高风险'
}

export interface Nodule {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  radius: number; // 0-20 scale
  intensity: number; // 0-1
  risk: RiskLevel;
  size_mm: number;
  description: string;
}

export interface AnalysisResult {
  nodules: Nodule[];
  summary: string;
  totalRisk: RiskLevel;
  recommendation: string;
}
