import { MedicineBoxOutlined, ArrowLeftOutlined, FormOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { Encounter, EncounterAiSummary } from "@mediask/shared-types";
import { Badge, Breadcrumb, Button, Card, Col, Descriptions, Empty, Row, Skeleton, Space, Tag, Typography, message } from "antd";
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

export const EncounterDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [encounter, setEncounter] = useState<EncounterDetail | null>(null);
  const [aiSummary, setAiSummary] = useState<EncounterAiSummary | null>(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
        const [encounterResult, aiSummaryResult] = await Promise.all([
          backofficeApi.getEncounter(id),
          backofficeApi.getEncounterAiSummary(id),
        ]);

        if (!mounted) {
          return;
        }

        setEncounter(encounterResult.data);
        setAiSummary(aiSummaryResult.data);
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

  return (
    <div>
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate("/encounters")}>就诊列表</a> },
          { title: `就诊详情 (${encounterId || "-"})` },
        ]}
        style={{ marginBottom: 16 }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ArrowLeftOutlined onClick={() => navigate("/encounters")} style={{ cursor: 'pointer', marginRight: 12 }} />
          患者就诊详情
        </Title>
        <Space>
          {encounter?.encounterStatus === "IN_PROGRESS" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={completeLoading}
              onClick={handleCompleteEncounter}
            >
              完成接诊
            </Button>
          )}
          <Button icon={<FormOutlined />} onClick={() => navigate(`/emr/${encounterId}`)} disabled={!encounterId}>
            书写病历
          </Button>
          <Button type="primary" icon={<MedicineBoxOutlined />} onClick={() => navigate(`/prescriptions/${encounterId}`)} disabled={!encounterId}>
            开具处方
          </Button>
        </Space>
      </div>

      {!loading && (!encounter || !aiSummary) ? (
        <Card bordered={false}>
          <Empty description="未获取到真实接诊数据" />
        </Card>
      ) : null}

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title={<Space><MedicineBoxOutlined /> AI 智能病情摘要</Space>} bordered={false} style={{ height: "100%" }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <>
                <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
                  <Descriptions.Item label={<Text strong>主诉 (Chief Complaint)</Text>}>
                    {aiSummary?.chiefComplaintSummary || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>结构化摘要 (Structured Summary)</Text>}>
                    <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                      {aiSummary?.structuredSummary || "-"}
                    </Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>AI 风险评估 (Risk Assessment)</Text>}>
                    {riskTag ? <Tag color={riskTag.color}>{riskTag.text}</Tag> : null}
                    {aiSummary ? (
                      <Text style={{ marginLeft: 8 }}>{aiSummary.riskLevel.toUpperCase()}</Text>
                    ) : (
                      <Text>-</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>推荐科室 (Recommended Departments)</Text>}>
                    {aiSummary && aiSummary.recommendedDepartments.length > 0 ? (
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

                <Card type="inner" title="AI 引用片段" bordered={false} style={{ background: "#fafafa" }}>
                  {aiSummary && aiSummary.latestCitations.length > 0 ? (
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      {aiSummary.latestCitations.map((citation) => (
                        <div key={citation.chunkId}>
                          <Text type="secondary">#{citation.retrievalRank}</Text>
                          <Paragraph style={{ margin: 0 }}>{citation.snippet}</Paragraph>
                        </div>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">暂无引用片段</Text>
                  )}
                </Card>
              </>
            )}
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="患者基本信息" bordered={false} style={{ marginBottom: 24 }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="接诊 ID">{encounter?.encounterId ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="患者姓名">{encounter?.patientName ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="患者用户 ID">{encounter?.patientUserId ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="性别/年龄">
                  {patientGender || patientAge ? `${patientGender ?? "-"} / ${patientAge ?? "-"}` : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="就诊科室">{encounter?.departmentName ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="就诊日期">{formatApiDate(encounter?.sessionDate)}</Descriptions.Item>
                <Descriptions.Item label="就诊时段">{encounter?.periodCode ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="接诊状态">
                  {encounter?.encounterStatus === "SCHEDULED" && <Badge status="default" text="待接诊" />}
                  {encounter?.encounterStatus === "IN_PROGRESS" && <Badge status="processing" text="接诊中" />}
                  {encounter?.encounterStatus === "COMPLETED" && <Badge status="success" text="已完成" />}
                  {encounter?.encounterStatus === "CANCELLED" && <Badge status="error" text="已取消" />}
                  {!encounter?.encounterStatus && "-"}
                </Descriptions.Item>
                <Descriptions.Item label="过敏史">{allergySummary ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="病史摘要">{historySummary ?? "-"}</Descriptions.Item>
              </Descriptions>
            )}
          </Card>
          
          <Card title="就诊时间" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="开始时间">
                  <Space>
                    <ClockCircleOutlined />
                    <Text>{startedAt.date} {startedAt.time}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="结束时间">
                  <Space>
                    <ClockCircleOutlined />
                    <Text>{endedAt.date} {endedAt.time}</Text>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
