import { MedicineBoxOutlined, ArrowLeftOutlined, FormOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Descriptions, Divider, Row, Skeleton, Space, Tag, Timeline, Typography, Collapse } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export const EncounterDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate("/encounters")}>就诊列表</a> },
          { title: `就诊详情 (${id || 'enc-101'})` },
        ]}
        style={{ marginBottom: 16 }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ArrowLeftOutlined onClick={() => navigate("/encounters")} style={{ cursor: 'pointer', marginRight: 12 }} />
          患者就诊详情
        </Title>
        <Space>
          <Button icon={<FormOutlined />} onClick={() => navigate(`/emr/${id || 'enc-101'}`)}>
            书写病历
          </Button>
          <Button type="primary" icon={<MedicineBoxOutlined />} onClick={() => navigate(`/prescriptions/${id || 'enc-101'}`)}>
            开具处方
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title={<Space><MedicineBoxOutlined /> AI 智能病情摘要</Space>} bordered={false} style={{ height: "100%" }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <>
                <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
                  <Descriptions.Item label={<Text strong>主诉 (Chief Complaint)</Text>}>
                    反复胸痛3天，加重伴心悸1小时。
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>现病史 (History of Present Illness)</Text>}>
                    患者3天前无明显诱因出现心前区疼痛，呈压榨样，向左肩背部放射，持续约3-5分钟，休息后可自行缓解。1小时前突发胸痛加重，伴大汗、心悸、胸闷，无恶心呕吐，无黑朦晕厥。
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>AI 风险评估 (Risk Assessment)</Text>}>
                    <Tag color="error">高风险 (HIGH RISK)</Tag> - 疑似急性冠脉综合征 (ACS)，建议立即行心电图及心肌酶谱检查。
                  </Descriptions.Item>
                </Descriptions>
                
                <Collapse ghost>
                  <Panel header="查看完整 AI 对话记录 (Raw Transcript)" key="1">
                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 6, maxHeight: 300, overflowY: 'auto' }}>
                      <p><strong>AI:</strong> 您好，请问哪里不舒服？</p>
                      <p><strong>患者:</strong> 我最近几天总是胸口痛，今天特别严重。</p>
                      <p><strong>AI:</strong> 胸痛具体在哪个位置？会牵扯到后背或肩膀吗？每次痛多久？</p>
                      <p><strong>患者:</strong> 在心脏这个位置，好像左边肩膀也会痛。之前痛几分钟就好了，一小时前突然很痛，还出汗，心跳很快。</p>
                      <p><strong>AI:</strong> 您有高血压、糖尿病或者心脏病史吗？</p>
                      <p><strong>患者:</strong> 我有高血压好几年了，一直在吃药。</p>
                      <p><strong>AI:</strong> 这可能是比较危险的情况，我建议您尽快去急诊科就诊，我已经为您挂了心内科号，请在到达医院后立即联系医生。</p>
                    </div>
                  </Panel>
                </Collapse>
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
                <Descriptions.Item label="姓名">张三</Descriptions.Item>
                <Descriptions.Item label="性别/年龄">男 / 45岁</Descriptions.Item>
                <Descriptions.Item label="就诊科室">心血管内科</Descriptions.Item>
                <Descriptions.Item label="挂号时间">2026-04-04 10:05</Descriptions.Item>
                <Descriptions.Item label="既往史">高血压病史 5 年</Descriptions.Item>
                <Descriptions.Item label="过敏史">无</Descriptions.Item>
              </Descriptions>
            )}
          </Card>
          
          <Card title="就诊时间线" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: 'AI 线上问诊完成 (09:45)',
                  },
                  {
                    color: 'green',
                    children: '智能导诊 & 挂号完成 (09:50)',
                  },
                  {
                    color: 'blue',
                    dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                    children: '患者签到，等待医生接诊 (10:05)',
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
