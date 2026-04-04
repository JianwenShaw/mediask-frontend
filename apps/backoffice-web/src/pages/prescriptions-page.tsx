import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Table, Typography, message } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

const { Title, Text } = Typography;
const { Option } = Select;

export const PrescriptionsPage = () => {
  const navigate = useNavigate();
  const { encounterId } = useParams<{ encounterId: string }>();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = (values: any) => {
    setSubmitting(true);
    setTimeout(() => {
      message.success("处方开具成功！");
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
          { title: `开具处方 (${encounterId || 'enc-101'})` },
        ]}
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ArrowLeftOutlined onClick={() => navigate(`/encounters/${encounterId}`)} style={{ cursor: 'pointer', marginRight: 12 }} />
          开具电子处方
        </Title>
        <Space>
          <Button onClick={() => navigate(`/encounters/${encounterId}`)}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={submitting}>
            提交处方
          </Button>
        </Space>
      </div>

      <Card bordered={false}>
        <div style={{ marginBottom: 24 }}>
          <Text strong>诊断：</Text> <span>急性冠脉综合征 (ACS)</span>
        </div>

        <Form form={form} name="prescription_form" onFinish={onFinish} autoComplete="off">
          <Form.List name="medications" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                <Row gutter={16} style={{ marginBottom: 8, fontWeight: 'bold' }}>
                  <Col span={6}>药品名称/规格</Col>
                  <Col span={4}>单次剂量</Col>
                  <Col span={4}>用药频次</Col>
                  <Col span={4}>给药途径</Col>
                  <Col span={4}>开药总量</Col>
                  <Col span={2}>操作</Col>
                </Row>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} style={{ marginBottom: 8 }}>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入药品名称' }]}
                      >
                        <Input placeholder="阿司匹林肠溶片 100mg" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'dose']}
                        rules={[{ required: true, message: '输入单次剂量' }]}
                      >
                        <Input placeholder="100mg/次" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'frequency']}
                        rules={[{ required: true, message: '选择频次' }]}
                      >
                        <Select placeholder="如 qd, bid">
                          <Option value="qd">qd (每日一次)</Option>
                          <Option value="bid">bid (每日两次)</Option>
                          <Option value="tid">tid (每日三次)</Option>
                          <Option value="qid">qid (每日四次)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'route']}
                        rules={[{ required: true, message: '选择途径' }]}
                      >
                        <Select placeholder="口服、静脉等">
                          <Option value="po">口服 (po)</Option>
                          <Option value="iv">静注 (iv)</Option>
                          <Option value="im">肌注 (im)</Option>
                          <Option value="sc">皮下 (sc)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: '输入总量' }]}
                      >
                        <Input placeholder="例如: 1盒" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      {fields.length > 1 ? (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      ) : null}
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加药品
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <Form.Item label="医嘱及注意事项" name="instructions">
            <Input.TextArea rows={3} placeholder="如：清淡饮食，避免剧烈运动等。" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
