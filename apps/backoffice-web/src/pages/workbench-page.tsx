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
  message,
} from "antd";
import type { Encounter, EncounterAiSummary, RiskLevel } from "@mediask/shared-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { backofficeApi } from "../lib/api";

const { Title, Text } = Typography;
const { Content } = Layout;

type EncounterWithDetail = Encounter & {
  patientSummary?: Record<string, unknown>;
  aiSummary?: EncounterAiSummary;
};

export const WorkbenchPage = () => {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<EncounterWithDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [startEncounterLoading, setStartEncounterLoading] = useState(false);
  const navigate = useNavigate();

  // 加载待接诊队列
  useEffect(() => {
    const loadEncounters = async () => {
      setLoading(true);
      try {
        const result = await backofficeApi.getEncounters({ status: "SCHEDULED" });
        setEncounters(result.data.items);
        if (result.data.items.length > 0) {
          setSelectedId(result.data.items[0].encounterId);
        }
      } catch (error) {
        const errorText = error instanceof Error ? error.message : "候诊队列加载失败";
        void message.error(errorText);
      } finally {
        setLoading(false);
      }
    };

    void loadEncounters();
  }, []);

  // 加载选中患者的详细信息
  useEffect(() => {
    if (!selectedId) {
      setSelectedDetail(null);
      return;
    }

    let mounted = true;

    const loadDetail = async () => {
      setDetailLoading(true);
      try {
        const [encounterResult, aiSummaryResult] = await Promise.all([
          backofficeApi.getEncounter(selectedId),
          backofficeApi.getEncounterAiSummary(selectedId),
        ]);

        if (!mounted) {
          return;
        }

        setSelectedDetail({ ...encounterResult.data, aiSummary: aiSummaryResult.data });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setSelectedDetail(null);
        const errorText = error instanceof Error ? error.message : "患者详情加载失败";
        void message.error(errorText);
      } finally {
        if (mounted) {
          setDetailLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const selectedPatient = selectedDetail;

  const readPatientSummaryText = (
    patientSummary: EncounterWithDetail["patientSummary"],
    key: string,
  ): string | null => {
    const value = patientSummary?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }

    return null;
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'high': return '#FF4D4F';
      case 'medium': return '#FAAD14';
      case 'low': return '#52C41A';
      default: return '#d9d9d9';
    }
  };

  const getGenderTag = (gender: string | null) => {
    const genderMap: Record<string, { text: string; color: string }> = {
      MALE: { text: '男', color: 'blue' },
      FEMALE: { text: '女', color: 'pink' },
      OTHER: { text: '未知', color: 'default' },
    };
    const g = genderMap[gender ?? ''] || { text: '-', color: 'default' };
    return <Tag color={g.color} style={{ marginRight: 0 }}>{g.text}</Tag>;
  };

  const handleStartEncounter = async () => {
    if (!selectedDetail) return;

    setStartEncounterLoading(true);
    try {
      await backofficeApi.updateEncounter(selectedDetail.encounterId, { action: "START" });
      navigate(`/encounters/${selectedDetail.encounterId}`);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "开始接诊失败";
      void message.error(errorText);
    } finally {
      setStartEncounterLoading(false);
    }
  };

  const formatSessionTime = (date: string, periodCode: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const timeStr = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    const periodMap: Record<string, string> = {
      'MORNING': '上午',
      'AFTERNOON': '下午',
      'EVENING': '晚上',
      'ALL_DAY': '全天',
    };
    return `${timeStr} ${periodMap[periodCode] || periodCode}`;
  };

  return (
    <Layout style={{ height: "100vh", backgroundColor: "#fff", overflow: 'hidden' }}>
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
        
        <Space split={<Divider type="vertical" />} style={{ fontSize: 13, color: '#595959' }}>
          <span>今日接诊 <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#1f1f1f', marginLeft: 4 }}>12</strong></span>
          <span>当前候诊 <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#1f1f1f', marginLeft: 4 }}>4</strong></span>
          <span>高危预警 <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#FF4D4F', marginLeft: 4 }}>1</strong></span>
        </Space>
      </div>

      <Content style={{ display: 'flex', height: 'calc(100vh - 53px)' }}>
        
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
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>加载中...</div>
            ) : encounters.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无待接诊患者</div>
            ) : (
              encounters.map((item) => {
                const isActive = item.encounterId === selectedId;
                // 从 encounters 列表暂时无法获取风险评估，显示默认颜色
                const riskLevel = 'low';
                return (
                  <div
                    key={item.encounterId}
                    onClick={() => setSelectedId(item.encounterId)}
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
                      <Badge color={getRiskColor(riskLevel)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text strong style={{ color: isActive ? '#1677FF' : '#262626', fontSize: 15 }}>{item.patientName}</Text>
                        <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 500 }}>{item.registrationId.slice(-6)}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>{item.departmentName}</Text>
                        <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {formatSessionTime(item.sessionDate, item.periodCode)}
                        </Text>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa', position: 'relative' }}>
          {selectedPatient ? (
            <>
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

              <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
                {detailLoading ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载患者详情中...</div>
                ) : (
                  <Row gutter={48}>
                    <Col span={16}>
                      <div style={{ marginBottom: 24 }}>
                        <Space align="center" size="middle" style={{ marginBottom: 12 }}>
                          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>{selectedPatient.patientName}</Title>
                          {getGenderTag(readPatientSummaryText(selectedPatient.patientSummary, 'gender'))}
                          <Text type="secondary" style={{ fontSize: 15 }}>
                            {readPatientSummaryText(selectedPatient.patientSummary, 'age') || '-'} 岁
                          </Text>
                        </Space>
                        <Space size="small" wrap>
                          <Tag>就诊日期: {selectedPatient.sessionDate}</Tag>
                          <Tag>时段: {selectedPatient.periodCode}</Tag>
                          <Tag>科室: {selectedPatient.departmentName}</Tag>
                        </Space>
                      </div>

                      {selectedPatient.aiSummary && (
                        <div style={{
                          backgroundColor: '#f0f5ff',
                          border: '1px solid #d6e4ff',
                          borderRadius: 6,
                          padding: '16px',
                          marginBottom: 32
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <RobotOutlined style={{ color: '#1677FF' }} />
                            <Text strong style={{ color: '#1677FF', fontSize: 13 }}>AI 智能病情摘要</Text>
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>主诉 (Chief Complaint)</Text>
                            <Text style={{ fontSize: 14 }}>{selectedPatient.aiSummary.chiefComplaintSummary || '-'}</Text>
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>结构化摘要 (Structured Summary)</Text>
                            <Text style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{selectedPatient.aiSummary.structuredSummary || '-'}</Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>AI 风险评估</Text>
                            <Tag color={getRiskColor(selectedPatient.aiSummary.riskLevel)}>
                              {selectedPatient.aiSummary.riskLevel.toUpperCase()}
                            </Tag>
                          </div>
                        </div>
                      )}

                      {/* 患者摘要 */}
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, color: '#8c8c8c', marginBottom: 12, display: 'block' }}>患者基本信息摘要</Text>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px' }}>
                          <Row gutter={[24, 16]}>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>患者用户 ID</Text>
                              <Text style={{ fontSize: 14, color: '#262626' }}>{selectedPatient.patientUserId || '-'}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>过敏史</Text>
                              <Text style={{ fontSize: 14, color: '#262626' }}>{readPatientSummaryText(selectedPatient.patientSummary, 'allergySummary') || '-'}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>病史摘要</Text>
                              <Text style={{ fontSize: 14, color: '#262626' }}>{readPatientSummaryText(selectedPatient.patientSummary, 'historySummary') || '-'}</Text>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Col>

                    <Col span={8}>
                      <div style={{ paddingLeft: 24, borderLeft: '1px solid #e8e8e8', height: '100%' }}>
                        {selectedPatient.aiSummary && selectedPatient.aiSummary.latestCitations.length > 0 ? (
                          <div>
                            <Space align="center" style={{ marginBottom: 12 }}>
                              <ExperimentOutlined style={{ color: '#1677FF' }} />
                              <Text strong style={{ fontSize: 13 }}>AI 引用片段</Text>
                            </Space>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {selectedPatient.aiSummary.latestCitations.map((citation, idx) => (
                                <div key={citation.chunkId} style={{ backgroundColor: '#fff', padding: '10px 12px', border: '1px solid #f0f0f0', borderRadius: 4 }}>
                                  <div style={{ marginBottom: 4 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>#{citation.retrievalRank}</Text>
                                  </div>
                                  <Text style={{ fontSize: 13, color: '#262626' }}>{citation.snippet}</Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Text type="secondary" style={{ fontSize: 13 }}>暂无 AI 引用片段</Text>
                        )}
                      </div>
                    </Col>
                  </Row>
                )}
              </div>

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
                  loading={startEncounterLoading}
                  onClick={handleStartEncounter}
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
