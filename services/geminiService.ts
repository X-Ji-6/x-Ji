
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeXRay(base64Image: string): Promise<AnalysisResult> {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    你是一位专业的放射科医生。请分析这张X光胸片，特别关注是否存在肺结节。
    请识别结节的位置（x, y 坐标，范围0-100，相对于图像宽高）、结节大小（毫米）、并评估其风险程度（低、中、高）。
    
    结节定义参考：
    - 低风险：边缘平滑，直径小于5mm。
    - 中风险：直径5-10mm，或者存在轻微分叶。
    - 高风险：直径大于10mm，存在明显分叶、毛刺征或胸膜牵拉。

    请严格按照JSON格式返回结果，包含结节列表、总体风险评估、简要描述和后续建议。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER, description: "x轴百分比位置 (0-100)" },
                y: { type: Type.NUMBER, description: "y轴百分比位置 (0-100)" },
                radius: { type: Type.NUMBER, description: "显示半径 (5-15)" },
                intensity: { type: Type.NUMBER, description: "热力强度 (0.5-1.0)" },
                risk: { type: Type.STRING, enum: ["低风险", "中风险", "高风险"] },
                size_mm: { type: Type.NUMBER, description: "结节直径(mm)" },
                description: { type: Type.STRING, description: "影像学描述" },
              },
              required: ["x", "y", "radius", "intensity", "risk", "size_mm", "description"],
            },
          },
          summary: { type: Type.STRING, description: "整体病情总结" },
          totalRisk: { type: Type.STRING, enum: ["低风险", "中风险", "高风险"] },
          recommendation: { type: Type.STRING, description: "医疗建议" },
        },
        required: ["nodules", "summary", "totalRisk", "recommendation"],
      },
    },
  });

  try {
    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("结果解析失败，请重试。");
  }
}
