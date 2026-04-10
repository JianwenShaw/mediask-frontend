export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface TriageResult {
  riskLevel: "low" | "medium" | "high";
  nextAction: "VIEW_TRIAGE_RESULT" | "GO_REGISTRATION" | "EMERGENCY_OFFLINE" | "MANUAL_SUPPORT";
  recommendedDepartments: string[];
  careAdvice: string;
  citations: string[];
}

export const mockLogin = async () => {
  await delay(1000);
  const data = { token: "mock-token", user: { id: "1", name: "张三", phone: "13800138000" } };
  localStorage.setItem("mediask_token", data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem("mediask_token");
};

export const mockGetTriageResult = async (sessionId: string, risk?: 'high'): Promise<TriageResult> => {
  await delay(800);
  if (risk === 'high') {
    return {
      riskLevel: "high",
      nextAction: "EMERGENCY_OFFLINE",
      recommendedDepartments: ["急诊科"],
      careAdvice: "您目前的症状提示可能存在严重急性病变，建议立即停止当前操作，拨打120急救电话或前往最近的医院急诊就医。",
      citations: ["根据《胸痛急诊分诊指南》，突发剧烈胸痛伴大汗属于高危症状。"]
    };
  }
  return {
    riskLevel: "medium",
    nextAction: "GO_REGISTRATION",
    recommendedDepartments: ["呼吸内科", "普通内科"],
    careAdvice: "注意休息，多喝水。如果症状加重或持续不缓解，请尽快就诊。外出请佩戴口罩。",
    citations: ["上呼吸道感染常见症状处理原则", "发热患者就诊指引"]
  };
};
