import { Card, DatePicker, Input, Select, Space, Table, Tabs, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

const { RangePicker } = DatePicker;

export const AuditPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const eventColumns: ColumnsType<any> = [
    { title: "事件ID", dataIndex: "eventId", key: "eventId", width: 120 },
    { title: "发生时间", dataIndex: "timestamp", key: "timestamp", width: 180 },
    { title: "操作人(User ID)", dataIndex: "userId", key: "userId", width: 150 },
    { title: "操作类型(Action)", dataIndex: "action", key: "action", width: 180,
      render: (text) => <Tag color="blue">{text}</Tag> },
    { title: "关联资源(Resource)", dataIndex: "resource", key: "resource", width: 180 },
    { title: "执行状态(Status)", dataIndex: "status", key: "status", width: 100,
      render: (s) => (s === 'SUCCESS' ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>) },
  ];

  const accessColumns: ColumnsType<any> = [
    { title: "日志ID", dataIndex: "logId", key: "logId", width: 120 },
    { title: "访问时间", dataIndex: "timestamp", key: "timestamp", width: 180 },
    { title: "访问者(Accessor)", dataIndex: "accessorId", key: "accessorId", width: 150 },
    { title: "患者(Patient ID)", dataIndex: "patientId", key: "patientId", width: 150 },
    { title: "数据类型(Data Type)", dataIndex: "dataType", key: "dataType", width: 150,
      render: (t) => <Tag color="purple">{t}</Tag> },
    { title: "访问目的(Purpose)", dataIndex: "purpose", key: "purpose", width: 200 },
  ];

  const mockEvents = [
    { eventId: "evt-1", timestamp: "2026-04-04 10:15:33", userId: "dr_smith", action: "CREATE_EMR", resource: "enc-101", status: "SUCCESS" },
    { eventId: "evt-2", timestamp: "2026-04-04 10:12:01", userId: "dr_smith", action: "VIEW_AI_SUMMARY", resource: "enc-101", status: "SUCCESS" },
    { eventId: "evt-3", timestamp: "2026-04-04 09:50:22", userId: "system", action: "AUTO_TRIAGE", resource: "session-90", status: "SUCCESS" },
  ];

  const mockAccessLogs = [
    { logId: "al-1", timestamp: "2026-04-04 10:12:01", accessorId: "dr_smith", patientId: "pat-502", dataType: "AI_CONSULTATION", purpose: "CLINICAL_CARE" },
    { logId: "al-2", timestamp: "2026-04-04 09:00:15", accessorId: "admin_01", patientId: "pat-109", dataType: "EMR_RECORD", purpose: "AUDIT_REVIEW" },
  ];

  return (
    <Card bordered={false} styles={{ body: { padding: "20px 24px" } }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 600 }}>系统审计与数据访问日志</h2>
        <Space>
          <RangePicker style={{ width: 300 }} />
          <Select defaultValue="all" style={{ width: 150 }} placeholder="操作类型">
            <Select.Option value="all">所有操作类型</Select.Option>
            <Select.Option value="CREATE_EMR">病历创建</Select.Option>
            <Select.Option value="VIEW_AI_SUMMARY">查看 AI 摘要</Select.Option>
          </Select>
          <Input placeholder="操作人 ID / 事件 ID" style={{ width: 250 }} />
        </Space>
      </div>

      <Tabs
        defaultActiveKey="events"
        items={[
          {
            key: "events",
            label: "系统操作事件 (Audit Events)",
            children: (
              <Table
                columns={eventColumns}
                dataSource={mockEvents}
                rowKey="eventId"
                loading={loading}
                size="middle"
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: "access",
            label: "数据访问日志 (Data Access Logs)",
            children: (
              <Table
                columns={accessColumns}
                dataSource={mockAccessLogs}
                rowKey="logId"
                loading={loading}
                size="middle"
                pagination={{ pageSize: 10 }}
              />
            ),
          },
        ]}
      />
    </Card>
  );
};
