import {
  AlertOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  RobotOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Divider,
  Empty,
  Layout,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;
const { Content } = Layout;

interface PendingEncounter {
  id: string;
  queueNo: string;
  patientName: string;
  age: number;
  gender: string;
  time: string;
  waitingTime: string;
  department: string;
  riskLevel: "low" | "medium" | "high";
  chiefComplaint: string;
  allergies: string[];
  bloodType: string;
  height: number; // cm
  weight: number; // kg
  chronicDiseases: string[];
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
    pain: number;
  };
  pastMedicalHistory: {
    conditions: string;
    surgeries: string;
    family: string;
    medications: string;
  };
  aiSummary: {
    onset: string;
    accompanying: string;
    medication: string;
  };
  recentLabs: { name: string; value: string; status: "high" | "low"; date: string }[];
  history: { date: string; dept: string; diagnosis: string }[];
}

const mockEncounters: PendingEncounter[] = [
  {
    id: "enc-101", queueNo: "A012", patientName: "张三", age: 45, gender: "男", time: "10:05", waitingTime: "25分钟", department: "心血管内科", riskLevel: "high",
    chiefComplaint: "突发胸闷、心前区压迫感伴大汗 2 小时",
    allergies: ["青霉素"],
    bloodType: "A 型",
    height: 175, weight: 82,
    chronicDiseases: ["高血压 (10年)", "高脂血症"],
    vitals: { bp: "165/100", hr: 115, temp: 36.5, spo2: 94, pain: 8 },
    pastMedicalHistory: {
      conditions: "高血压 (10年，最高 180/110 mmHg)、高脂血症",
      surgeries: "2018年阑尾切除术，无重大外伤",
      family: "父亲有早发冠心病史",
      medications: "阿司匹林肠溶片 100mg qd, 阿托伐他汀 20mg qn",
    },
    aiSummary: {
      onset: "2小时前静息状态下突发，呈持续性压迫感",
      accompanying: "伴大汗淋漓、恶心，无呕吐，无放射痛",
      medication: "发作后自行含服硝酸甘油 1 片，症状未见明显缓解"
    },
    recentLabs: [
      { name: "肌钙蛋白 I (cTnI)", value: "0.85 ng/mL", status: "high", date: "急诊 1小时前" },
      { name: "低密度脂蛋白 (LDL-C)", value: "4.2 mmol/L", status: "high", date: "2023-05-12" }
    ],
    history: [
      { date: "2023-05-12", dept: "心内科", diagnosis: "原发性高血压 2级" },
      { date: "2021-11-05", dept: "急诊", diagnosis: "急性胃肠炎" }
    ]
  },
  {
    id: "enc-102", queueNo: "A013", patientName: "李四", age: 28, gender: "女", time: "10:15", waitingTime: "15分钟", department: "心血管内科", riskLevel: "medium",
    chiefComplaint: "偶发心悸，伴头晕 3 天",
    allergies: ["无"],
    bloodType: "O 型",
    height: 162, weight: 50,
    chronicDiseases: ["甲状腺功能亢进"],
    vitals: { bp: "110/70", hr: 105, temp: 36.8, spo2: 99, pain: 1 },
    pastMedicalHistory: {
      conditions: "甲状腺功能亢进 (2年，近期控制不佳)",
      surgeries: "否认重大手术及外伤史",
      family: "母亲患有自身免疫性甲状腺病",
      medications: "甲巯咪唑 10mg qd (近期自行停药)",
    },
    aiSummary: {
      onset: "3天前活动后出现心悸，每次持续约数分钟可自行缓解",
      accompanying: "伴轻度头晕、乏力，夜间睡眠差",
      medication: "未服用特殊药物"
    },
    recentLabs: [
      { name: "游离 T3 (FT3)", value: "8.5 pmol/L", status: "high", date: "2023-09-01" }
    ],
    history: [
      { date: "2023-09-01", dept: "内分泌科", diagnosis: "甲状腺功能亢进" }
    ]
  },
  {
    id: "enc-103", queueNo: "A014", patientName: "王五", age: 60, gender: "男", time: "10:30", waitingTime: "0分钟", department: "心血管内科", riskLevel: "low",
    chiefComplaint: "高血压常规复诊，要求开药",
    allergies: ["无"],
    bloodType: "B 型",
    height: 170, weight: 75,
    chronicDiseases: ["高血压 (5年)"],
    vitals: { bp: "135/85", hr: 72, temp: 36.6, spo2: 98, pain: 0 },
    pastMedicalHistory: {
      conditions: "原发性高血压 (5年，控制良好)",
      surgeries: "否认手术外伤史",
      family: "否认高血压家族史",
      medications: "氨氯地平 5mg qd, 替米沙坦 40mg qn",
    },
    aiSummary: {
      onset: "长期规律服药，近期血压控制平稳，无不适",
      accompanying: "无明显阳性伴随症状",
      medication: "氨氯地平 5mg qd，阿托伐他汀 20mg qn"
    },
    recentLabs: [],
    history: [
      { date: "2023-08-15", dept: "心内科", diagnosis: "原发性高血压" }
    ]
  }
];

export const WorkbenchPage = () => {
  const [encounters, setEncounters] = useState<PendingEncounter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setEncounters(mockEncounters);
      setSelectedId(mockEncounters[0].id); // 默认选中第一个
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const selectedPatient = encounters.find(e => e.id === selectedId);

  // 风险颜色映射
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#FF4D4F';
      case 'medium': return '#FAAD14';
      case 'low': return '#52C41A';
      default: return '#d9d9d9';
    }
  };

  const calculateBMI = (h: number, w: number) => {
    const heightM = h / 100;
    return (w / (heightM * heightM)).toFixed(1);
  };

  const checkVitalsNormal = (type: string, value: number | string) => {
    if (type === 'bp') {
      const [sys, dia] = (value as string).split('/').map(Number);
      return sys <= 140 && dia <= 90;
    }
    if (type === 'hr') return (value as number) >= 60 && (value as number) <= 100;
    if (type === 'spo2') return (value as number) >= 95;
    if (type === 'pain') return (value as number) <= 3;
    return true;
  };

  return (
    <Layout style={{ height: "100vh", backgroundColor: "#fff", overflow: 'hidden' }}>
      {/* 极简全局头部 (Inline Header) */}
      <div style={{ 
        padding: "12px 24px", 
        borderBottom: "1px solid #e8e8e8",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: '#fafafa'
      }}>
        <Space size="middle">
          <Title level={5} style={{ margin: 0, fontWeight: 600, color: '#262626' }}>门诊医生工作台</Title>
          <Tag bordered={false} color="processing" style={{ borderRadius: 4 }}>心血管内科</Tag>
        </Space>
        
        {/* KPI 状态栏 (等宽字体增强数据感) */}
        <Space split={<Divider type="vertical" />} style={{ fontSize: 13, color: '#595959' }}>
          <span>今日接诊 <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#1f1f1f', marginLeft: 4 }}>12</strong></span>
          <span>当前候诊 <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#1f1f1f', marginLeft: 4 }}>4</strong></span>
          <span>高危预警 <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#FF4D4F', marginLeft: 4 }}>1</strong></span>
        </Space>
      </div>

      {/* 核心工作区 (非对称双栏布局) */}
      <Content style={{ display: 'flex', height: 'calc(100vh - 53px)' }}>
        
        {/* 左栏：动态候诊流 (The Pipeline) */}
        <div style={{ 
          width: '320px', 
          borderRight: '1px solid #e8e8e8', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#fff' 
        }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>候诊队列 (PIPELINE)</Text>
            <SearchOutlined style={{ color: '#bfbfbf', cursor: 'pointer' }} />
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {encounters.map((item) => {
              const isActive = item.id === selectedId;
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f0f0f0',
                    borderLeft: isActive ? '3px solid #1677FF' : '3px solid transparent',
                    backgroundColor: isActive ? '#e6f4ff' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    transition: 'all 0.1s'
                  }}
                >
                  <div style={{ paddingTop: 2 }}>
                    <Badge color={getRiskColor(item.riskLevel)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text strong style={{ color: isActive ? '#1677FF' : '#262626', fontSize: 15 }}>{item.patientName}</Text>
                      <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 500 }}>{item.queueNo}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 13 }}>{item.gender} {item.age}岁</Text>
                      <Text style={{ fontSize: 12, color: item.waitingTime.includes('分钟') && !isActive ? '#FAAD14' : '#8c8c8c' }}>
                        等 {item.waitingTime}
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右栏：主操作聚焦区 (The Focus Stage) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa', position: 'relative' }}>
          {selectedPatient ? (
            <>
              {/* 致密化工具栏 (Toolbar) */}
              <div style={{ 
                padding: '8px 24px', 
                backgroundColor: '#fff', 
                borderBottom: '1px solid #e8e8e8',
                display: 'flex',
                gap: '8px'
              }}>
                <Button type="text" size="small" icon={<MedicineBoxOutlined />} style={{ color: '#595959', fontSize: 13 }}>新建处方</Button>
                <Button type="text" size="small" icon={<FileSearchOutlined />} style={{ color: '#595959', fontSize: 13 }}>开立检查</Button>
                <Divider type="vertical" style={{ height: 20, margin: '2px 8px 0' }} />
                <Button type="text" size="small" icon={<UserOutlined />} style={{ color: '#595959', fontSize: 13 }}>患者档案</Button>
                <Button type="text" size="small" icon={<HistoryOutlined />} style={{ color: '#595959', fontSize: 13 }}>历史病历</Button>
              </div>

              {/* 核心信息滚动区 */}
              <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
                <Row gutter={48}>
                  {/* 左侧主视区：体征、主诉、AI摘要 */}
                  <Col span={16}>
                    {/* 基础信息与标签墙 */}
                    <div style={{ marginBottom: 24 }}>
                      <Space align="center" size="middle" style={{ marginBottom: 12 }}>
                        <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>{selectedPatient.patientName}</Title>
                        <Text type="secondary" style={{ fontSize: 15 }}>{selectedPatient.gender} | {selectedPatient.age} 岁 | {selectedPatient.bloodType}</Text>
                        <Divider type="vertical" />
                        <Text type="secondary" style={{ fontSize: 13 }}>BMI {calculateBMI(selectedPatient.height, selectedPatient.weight)}</Text>
                        <Divider type="vertical" />
                        <Text type="secondary" style={{ fontSize: 13 }}>BP: <Text strong style={{ color: checkVitalsNormal('bp', selectedPatient.vitals.bp) ? 'inherit' : '#FF4D4F' }}>{selectedPatient.vitals.bp}</Text> mmHg</Text>
                        <Divider type="vertical" />
                        <Text type="secondary" style={{ fontSize: 13 }}>HR: <Text strong style={{ color: checkVitalsNormal('hr', selectedPatient.vitals.hr) ? 'inherit' : '#FF4D4F' }}>{selectedPatient.vitals.hr}</Text> bpm</Text>
                      </Space>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedPatient.allergies.includes('无') ? null : (
                          selectedPatient.allergies.map(a => <Tag key={a} color="error" icon={<AlertOutlined />}>过敏：{a}</Tag>)
                        )}
                        {selectedPatient.chronicDiseases.map(c => <Tag key={c} color="default">{c}</Tag>)}
                      </div>
                    </div>

                    {/* 分诊主诉 */}
                    <div style={{ marginBottom: 20 }}>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, color: '#8c8c8c', marginBottom: 6, display: 'block' }}>分诊主诉 (CHIEF COMPLAINT)</Text>
                      <Text strong style={{ fontSize: 16, color: '#262626' }}>{selectedPatient.chiefComplaint}</Text>
                    </div>

                    {/* AI 问诊摘要 (高亮区域) */}
                    <div style={{ 
                      backgroundColor: '#f0f5ff', 
                      border: '1px solid #d6e4ff', 
                      borderRadius: 6, 
                      padding: '16px',
                      marginBottom: 32 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <RobotOutlined style={{ color: '#1677FF' }} />
                        <Text strong style={{ color: '#1677FF', fontSize: 13 }}>AI 问诊摘要</Text>
                      </div>
                      <Row gutter={[16, 12]}>
                        <Col span={24}>
                          <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>起病与性质:</Text>
                          <Text style={{ fontSize: 14 }}>{selectedPatient.aiSummary.onset}</Text>
                        </Col>
                        <Col span={24}>
                          <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>伴随症状:</Text>
                          <Text style={{ fontSize: 14 }}>{selectedPatient.aiSummary.accompanying}</Text>
                        </Col>
                        <Col span={24}>
                          <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>用药情况:</Text>
                          <Text style={{ fontSize: 14 }}>{selectedPatient.aiSummary.medication}</Text>
                        </Col>
                      </Row>
                    </div>

                    {/* 既往史摘要 (Past Medical History) */}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, color: '#8c8c8c', marginBottom: 12, display: 'block' }}>既往史摘要 (PAST MEDICAL HISTORY)</Text>
                      <div style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px' }}>
                        <Row gutter={[24, 16]}>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>基础疾病 (Conditions)</Text>
                            <Text style={{ fontSize: 14, color: '#262626' }}>{selectedPatient.pastMedicalHistory.conditions}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>长期用药 (Current Medications)</Text>
                            <Text strong style={{ fontSize: 14, color: '#1677FF' }}>{selectedPatient.pastMedicalHistory.medications}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>手术/外伤史 (Surgeries/Injuries)</Text>
                            <Text style={{ fontSize: 14, color: '#262626' }}>{selectedPatient.pastMedicalHistory.surgeries}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>家族史 (Family History)</Text>
                            <Text style={{ fontSize: 14, color: '#262626' }}>{selectedPatient.pastMedicalHistory.family}</Text>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Col>

                  {/* 右侧辅助区：异常指标与历史 */}
                  <Col span={8}>
                    <div style={{ paddingLeft: 24, borderLeft: '1px solid #e8e8e8', height: '100%' }}>
                      
                      {/* 近期阳性结果 */}
                      {selectedPatient.recentLabs.length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                          <Space align="center" style={{ marginBottom: 12 }}>
                            <ExperimentOutlined style={{ color: '#FAAD14' }} />
                            <Text strong style={{ fontSize: 13 }}>近期异常指标</Text>
                          </Space>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {selectedPatient.recentLabs.map((lab, idx) => (
                              <div key={idx} style={{ backgroundColor: '#fff', padding: '10px 12px', border: '1px solid #ffd8bf', borderRadius: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <Text style={{ fontSize: 13, color: '#595959' }}>{lab.name}</Text>
                                  <Text type="danger" strong style={{ fontSize: 13 }}>{lab.value} ↑</Text>
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>{lab.date}</Text>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 历史就诊 */}
                      <div>
                        <Space align="center" style={{ marginBottom: 12 }}>
                          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                          <Text strong style={{ fontSize: 13 }}>既往就诊简史</Text>
                        </Space>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {selectedPatient.history.map((hist, idx) => (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 13 }}>{hist.dept}</Text>
                                <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>{hist.date}</Text>
                              </div>
                              <Text type="secondary" style={{ fontSize: 13 }}>诊断: {hist.diagnosis}</Text>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </Col>
                </Row>
              </div>

              {/* 固定底部操作栏 (Sticky Action Bar) */}
              <div style={{ 
                padding: '16px 32px', 
                backgroundColor: '#fff', 
                borderTop: '1px solid #e8e8e8',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Space size="middle">
                  <Button style={{ borderRadius: 6 }}>过号</Button>
                  <Button danger style={{ borderRadius: 6 }}>退号</Button>
                  <Divider type="vertical" />
                  <Button type="link" style={{ padding: 0 }}>查看完整病历档案</Button>
                </Space>
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ borderRadius: 6, padding: '0 40px', fontWeight: 500 }}
                  onClick={() => navigate(`/encounters/${selectedPatient.id}`)}
                >
                  立即接诊
                </Button>
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty description="请从左侧队列中选择患者" />
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};
