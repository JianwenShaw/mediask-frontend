import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Form, Input, message, Row, Skeleton, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const EmrPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { encounterId } = useParams<{ encounterId: string }>();
  const [form] = Form.useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock pre-filling form from AI summary
      form.setFieldsValue({
        chiefComplaint: "反复胸痛3天，加重伴心悸1小时。",
        historyOfPresentIllness: "患者3天前无明显诱因出现心前区疼痛，呈压榨样，向左肩背部放射，持续约3-5分钟，休息后可自行缓解。1小时前突发胸痛加重，伴大汗、心悸、胸闷，无恶心呕吐，无黑朦晕厥。",
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [form]);

  const onFinish = (values: any) => {
    setSubmitting(true);
    setTimeout(() => {
      message.success("病历保存成功！");
      setSubmitting(false);
      navigate(`/encounters/${encounterId}`);
    }, 800);
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate("/encounters")}>就诊列表</a> },
          { title: <a onClick={() => navigate(`/encounters/${encounterId}`)}>就诊详情</a> },
          { title: `书写病历 (${encounterId || 'enc-101'})` },
        ]}
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ArrowLeftOutlined onClick={() => navigate(`/encounters/${encounterId}`)} style={{ cursor: 'pointer', marginRight: 12 }} />
          电子病历 (EMR)
        </Title>
        <Space>
          <Button onClick={() => navigate(`/encounters/${encounterId}`)}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={submitting}>
            保存病历
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 10 }} />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ physicalExamination: "神清，精神可，心音纯，律齐，各瓣膜听诊区未闻及病理性杂音。" }}
              >
                <Form.Item label="主诉 (Chief Complaint)" name="chiefComplaint" rules={[{ required: true, message: '请填写主诉' }]}>
                  <TextArea rows={2} placeholder="一句话描述主要症状及持续时间" />
                </Form.Item>
                <Form.Item label="现病史 (History of Present Illness)" name="historyOfPresentIllness" rules={[{ required: true, message: '请填写现病史' }]}>
                  <TextArea rows={4} placeholder="详细描述疾病发生、发展、演变及诊治经过" />
                </Form.Item>
                <Form.Item label="既往史 (Past Medical History)" name="pastHistory">
                  <TextArea rows={2} placeholder="既往健康状况、疾病史、手术史等" />
                </Form.Item>
                <Form.Item label="体格检查 (Physical Examination)" name="physicalExamination">
                  <TextArea rows={3} placeholder="生命体征及专科检查情况" />
                </Form.Item>
                <Form.Item label="初步诊断 (Preliminary Diagnosis)" name="diagnosis" rules={[{ required: true, message: '请填写初步诊断' }]}>
                  <Input placeholder="例如：急性冠脉综合征" />
                </Form.Item>
                <Form.Item label="处理意见 (Treatment Plan)" name="treatment">
                  <TextArea rows={3} placeholder="检查、用药、生活建议等" />
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="AI 辅助信息参考" bordered={false} style={{ background: '#f5f8ff' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" strong>提取的症状关键词：</Text>
                  <div style={{ marginTop: 8, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Tag color="blue">胸痛</Tag>
                    <Tag color="blue">心悸</Tag>
                    <Tag color="blue">大汗</Tag>
                    <Tag color="blue">左肩背放射痛</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" strong>AI 建议初步诊断：</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    根据患者症状及既往高血压病史，高度怀疑 <strong>急性冠脉综合征 (ACS)</strong>，需紧急排查心肌梗死。
                  </Paragraph>
                </div>
                <div>
                  <Text type="secondary" strong>建议检查项目：</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>12导联心电图</li>
                    <li>心肌损伤标志物 (肌钙蛋白、CK-MB)</li>
                    <li>心脏彩超</li>
                  </ul>
                </div>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
