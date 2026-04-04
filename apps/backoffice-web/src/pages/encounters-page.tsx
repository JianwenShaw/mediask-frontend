import { EyeOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface Encounter {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  time: string;
  department: string;
  riskLevel: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
}

const mockData: Encounter[] = [
  { id: "enc-101", patientName: "张三", age: 45, gender: "男", time: "10:05", department: "心内科", riskLevel: "high", status: "pending" },
  { id: "enc-102", patientName: "李四", age: 28, gender: "女", time: "10:15", department: "呼吸科", riskLevel: "medium", status: "pending" },
  { id: "enc-103", patientName: "王五", age: 60, gender: "男", time: "10:30", department: "消化内科", riskLevel: "low", status: "pending" },
  { id: "enc-104", patientName: "赵六", age: 34, gender: "女", time: "09:00", department: "内分泌科", riskLevel: "low", status: "completed" },
  { id: "enc-105", patientName: "孙七", age: 50, gender: "男", time: "09:30", department: "骨科", riskLevel: "medium", status: "in_progress" },
];

export const EncountersPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Encounter[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const columns: ColumnsType<Encounter> = [
    {
      title: "患者姓名",
      dataIndex: "patientName",
      key: "patientName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "性别/年龄",
      key: "age",
      render: (_, record) => `${record.gender} • ${record.age}岁`,
    },
    {
      title: "就诊时间",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "挂号科室",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "风险评估",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (riskLevel) => {
        let color = "success";
        let text = "低风险";
        if (riskLevel === "high") {
          color = "error";
          text = "高风险";
        } else if (riskLevel === "medium") {
          color = "warning";
          text = "中风险";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "completed") return <Badge status="success" text="已完成" />;
        if (status === "in_progress") return <Badge status="processing" text="接诊中" />;
        return <Badge status="default" text="待接诊" />;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/encounters/${record.id}`)}
        >
          查看 / 接诊
        </Button>
      ),
    },
  ];

  return (
    <Card bordered={false} styles={{ body: { padding: "20px 24px" } }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>就诊列表</h2>
        <Space>
          <Input placeholder="搜索患者姓名/编号" style={{ width: 220 }} />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">所有状态</Select.Option>
            <Select.Option value="pending">待接诊</Select.Option>
            <Select.Option value="in_progress">接诊中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
          </Select>
          <Button type="primary">筛选</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="middle" // 增加表格密度
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
};
