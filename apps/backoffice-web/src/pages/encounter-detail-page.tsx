import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FormOutlined,
  MedicineBoxOutlined,
  RobotOutlined,
  UserOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import type { Encounter, EncounterAiSummary } from "@mediask/shared-types";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Empty,
  Row,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { backofficeApi } from "../lib/api";
import { formatApiDate, formatApiDateTime } from "../lib/date-time";

const { Title, Paragraph, Text } = Typography;

type EncounterDetail = Encounter & {
  patientSummary?: Record<string, unknown>;
};

const readPatientSummaryText = (
  patientSummary: EncounterDetail["patientSummary"],
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

const riskLevelTagMap: Record<string, { color: string; text: string }> = {
  low: { color: "success", text: "低风险" },
  medium: { color: "warning", text: "中风险" },
  high: { color: "error", text: "高风险" },
};

const statusLabelMap: Record<string, string> = {
  SCHEDULED: "待接诊",
  IN_PROGRESS: "接诊中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

const statusColorMap: Record<string, string> = {
  SCHEDULED: "default",
  IN_PROGRESS: "processing",
  COMPLETED: "success",
  CANCELLED: "error",
};

const genderMap: Record<string, string> = {
  MALE: "男",
  FEMALE: "女",
  OTHER: "其他",
};

const periodMap: Record<string, string> = {
  MORNING: "上午",
  AFTERNOON: "下午",
  EVENING: "晚上",
};

export const EncounterDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [encounter, setEncounter] = useState<EncounterDetail | null>(null);
  const [aiSummary, setAiSummary] = useState<EncounterAiSummary | null>(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleStartEncounter = async () => {
    if (!id) return;

    setStartLoading(true);
    try {
      await backofficeApi.updateEncounter(id, { action: "START" });
      void message.success("已开始接诊");
      // Refresh data
      const encounterResult = await backofficeApi.getEncounter(id);
      setEncounter(encounterResult.data);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "开始接诊失败";
      void message.error(errorText);
    } finally {
      setStartLoading(false);
    }
  };

  const handleCompleteEncounter = async () => {
    if (!id) return;

    setCompleteLoading(true);
    try {
      await backofficeApi.updateEncounter(id, { action: "COMPLETE" });
      void message.success("接诊已完成");
      navigate("/encounters");
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "完成接诊失败";
      void message.error(errorText);
    } finally {
      setCompleteLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadDetail = async () => {
      setLoading(true);

      try {
        // Decouple data fetching: Encounter first
        const encounterResult = await backofficeApi.getEncounter(id);
        
        if (!mounted) {
          return;
        }

        setEncounter(encounterResult.data);

        // Fetch AI Summary separately, allow failure (graceful degradation)
        try {
          const aiSummaryResult = await backofficeApi.getEncounterAiSummary(id);
          if (mounted) {
            setAiSummary(aiSummaryResult.data);
          }
        } catch (aiError) {
          console.warn("No AI summary found or error fetching:", aiError);
          if (mounted) {
            setAiSummary(null);
          }
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        setEncounter(null);
        setAiSummary(null);
        const errorText = error instanceof Error ? error.message : "就诊详情加载失败";
        void message.error(errorText);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  const encounterId = id ?? "";
  const patientGender = readPatientSummaryText(encounter?.patientSummary, "gender");
  const patientAge = readPatientSummaryText(encounter?.patientSummary, "age");
  const allergySummary = readPatientSummaryText(encounter?.patientSummary, "allergySummary");
  const historySummary = readPatientSummaryText(encounter?.patientSummary, "historySummary");
  const riskTag = aiSummary ? riskLevelTagMap[aiSummary.riskLevel] ?? null : null;
  const startedAt = formatApiDateTime(encounter?.startedAt);
  const endedAt = formatApiDateTime(encounter?.endedAt);

  const displayGender = patientGender ? (genderMap[patientGender] || patientGender) : null;
  const displayAge = patientAge ? `${patientAge}岁` : null;
  const displayGenderAge = (displayGender || displayAge) 
    ? `${displayGender ?? "-"} / ${displayAge ?? "-"}` 
    : "-";

  const displayPeriod = encounter?.periodCode ? (periodMap[encounter.periodCode] || encounter.periodCode) : "-";

  if (loading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
        <Row gutter={[24, 24]}>
          <Col span={16}><Skeleton active paragraph={{ rows: 8 }} /></Col>
          <Col span={8}><Skeleton active paragraph={{ rows: 8 }} /></Col>
        </Row>
      </div>
    );
  }

  if (!encounter) {
    return (
      <Card bordered={false}>
        <Empty description="未获取到真实接诊数据" />
      </Card>
    );
  }

  const timelineItems = [
    {
      color: "blue",
      dot: <FileTextOutlined style={{ fontSize: '14px' }} />,
      children: (
        <>
          <div>挂号时间 / 计划就诊</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatApiDate(encounter.sessionDate)} {displayPeriod}
          </Text>
        </>
      ),
    },
    {
      color: startedAt.date ? "green" : "gray",
      dot: <MedicineBoxOutlined style={{ fontSize: '14px', color: startedAt.date ? '#52c41a' : '#d9d9d9' }} />,
      children: (
        <>
          <div>开始接诊</div>
          {startedAt.date ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {startedAt.date} {startedAt.time}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>等待接诊</Text>
          )}
        </>
      ),
    },
    {
      color: endedAt.date ? "green" : "gray",
      dot: <CheckCircleOutlined style={{ fontSize: '14px', color: endedAt.date ? '#52c41a' : '#d9d9d9' }} />,
      children: (
        <>
          <div>完成接诊</div>
          {endedAt.date ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {endedAt.date} {endedAt.time}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>尚未完成</Text>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      {/* Top Banner: Patient Profile */}
      <Card bordered={false} style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <Space align="center" style={{ marginBottom: 12 }}>
              <ArrowLeftOutlined onClick={() => navigate("/encounters")} style={{ cursor: 'pointer', fontSize: 18, color: '#666' }} />
              <Title level={4} style={{ margin: 0 }}>
                {encounter.patientName ?? "-"}
              </Title>
              <Tag color={statusColorMap[encounter.encounterStatus || ""]} style={{ margin: 0 }}>
                {statusLabelMap[encounter.encounterStatus || ""] ?? encounter.encounterStatus}
              </Tag>
            </Space>
            <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} style={{ marginBottom: 0 }}>
              <Descriptions.Item label="性别/年龄">
                {displayGenderAge}
              </Descriptions.Item>
              <Descriptions.Item label="挂号科室">{encounter.departmentName ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="预约时间">{formatApiDate(encounter.sessionDate)} {displayPeriod}</Descriptions.Item>
            </Descriptions>
          </div>
          
          <Space>
            {encounter.encounterStatus === "SCHEDULED" && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={startLoading}
                onClick={handleStartEncounter}
              >
                开始接诊
              </Button>
            )}

            {encounter.encounterStatus === "IN_PROGRESS" && (
              <>
                <Button 
                  icon={<FormOutlined />} 
                  onClick={() => navigate(`/emr/${encounterId}`)}
                >
                  书写病历
                </Button>
                <Button 
                  icon={<MedicineBoxOutlined />} 
                  onClick={() => navigate(`/prescriptions/${encounterId}`)}
                >
                  开具处方
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={completeLoading}
                  onClick={handleCompleteEncounter}
                  style={{ marginLeft: 8 }}
                >
                  完成接诊
                </Button>
              </>
            )}

            {(encounter.encounterStatus === "COMPLETED" || encounter.encounterStatus === "CANCELLED") && (
              <>
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={() => navigate(`/emr/${encounterId}`)}
                >
                  查看病历
                </Button>
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={() => navigate(`/prescriptions/${encounterId}`)}
                >
                  查看处方
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Main Area: Core Business */}
        <Col span={16}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            
            {/* Module A: Patient Condition */}
            <Card title={<Space><UserOutlined /> 患者基础病况</Space>} bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
              {allergySummary ? (
                <Alert
                  type="error"
                  showIcon
                  message="过敏史"
                  description={allergySummary}
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Alert
                  type="success"
                  showIcon
                  message="过敏史"
                  description="无或未提供"
                  style={{ marginBottom: 16 }}
                />
              )}
              <Descriptions column={1} size="small" layout="vertical">
                <Descriptions.Item label={<Text strong>病史摘要</Text>}>
                  {historySummary ? <Paragraph style={{ whiteSpace: "pre-wrap" }}>{historySummary}</Paragraph> : "暂无"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Module B: AI Summary */}
            <Card title={<Space><RobotOutlined /> AI 智能预问诊分析</Space>} bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
              {!aiSummary ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="该患者未进行 AI 预问诊，无智能摘要数据"
                />
              ) : (
                <>
                  <div style={{ background: "#fafafa", padding: 16, borderRadius: 8, marginBottom: 24 }}>
                    <Descriptions column={1} size="small" layout="vertical">
                      <Descriptions.Item label={<Text strong>主诉</Text>}>
                        {aiSummary.chiefComplaintSummary || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>结构化摘要</Text>} style={{ paddingBottom: 0 }}>
                        <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                          {aiSummary.structuredSummary || "-"}
                        </Paragraph>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>

                  <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
                    <Descriptions.Item label={<Text strong>AI 风险评估</Text>}>
                      {riskTag ? <Tag color={riskTag.color} style={{ margin: 0 }}>{riskTag.text}</Tag> : null}
                      <Text style={{ marginLeft: 8 }} type="secondary">{aiSummary.riskLevel.toUpperCase()}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>推荐科室</Text>}>
                      {aiSummary.recommendedDepartments.length > 0 ? (
                        <Space wrap>
                          {aiSummary.recommendedDepartments.map((department) => (
                            <Tag key={`${department.departmentId}-${department.priority}`} color="processing">
                              {department.departmentName}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        "-"
                      )}
                    </Descriptions.Item>
                  </Descriptions>

                  {aiSummary.latestCitations.length > 0 && (
                    <Collapse
                      ghost
                      items={[
                        {
                          key: '1',
                          label: '查看 AI 引用片段',
                          children: (
                            <Space direction="vertical" size={12} style={{ width: "100%" }}>
                              {aiSummary.latestCitations.map((citation) => (
                                <div key={citation.chunkId} style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #f0f0f0' }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>#{citation.retrievalRank}</Text>
                                  <Paragraph style={{ margin: 0, fontSize: 13 }}>{citation.snippet}</Paragraph>
                                </div>
                              ))}
                            </Space>
                          ),
                        },
                      ]}
                    />
                  )}
                </>
              )}
            </Card>
          </Space>
        </Col>
        
        {/* Right Sidebar: Timeline & Metadata */}
        <Col span={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            
            {/* Module C: Timeline */}
            <Card title={<Space><ClockCircleOutlined /> 就诊进度</Space>} bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
              <Timeline items={timelineItems} style={{ marginTop: 12 }} />
            </Card>
            
            {/* Module D: Metadata - Weakened Card */}
            <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }} styles={{ body: { padding: '16px' } }}>
              <Descriptions column={1} size="small" layout="vertical" colon={false} style={{ marginBottom: 0 }}>
                <Descriptions.Item label={<span style={{ color: '#8c8c8c', fontSize: 12 }}>接诊 ID</span>} style={{ paddingBottom: 8 }}>
                  <Text style={{ color: '#8c8c8c', fontSize: 12 }} copyable={{ text: encounter.encounterId }}>
                    {encounter.encounterId}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: '#8c8c8c', fontSize: 12 }}>患者用户 ID</span>} style={{ paddingBottom: 0 }}>
                  <Text style={{ color: '#8c8c8c', fontSize: 12 }} copyable={{ text: encounter.patientUserId ?? "" }}>
                    {encounter.patientUserId ?? "-"}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

          </Space>
        </Col>
      </Row>
    </div>
  );
};
