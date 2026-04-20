import { EyeOutlined } from "@ant-design/icons";
import type { Encounter, EncounterStatus } from "@mediask/shared-types";
import { Badge, Button, Card, Empty, Input, Select, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { backofficeApi } from "../lib/api";
import { formatApiDate } from "../lib/date-time";

type EncounterFilterStatus = "all" | EncounterStatus;

const statusLabelMap: Record<EncounterStatus, string> = {
  SCHEDULED: "待接诊",
  IN_PROGRESS: "接诊中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export const EncountersPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Encounter[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<EncounterFilterStatus>("all");
  const navigate = useNavigate();

  const loadEncounters = async (status: EncounterFilterStatus) => {
    setLoading(true);

    try {
      const result = await backofficeApi.getEncounters({
        status: status === "all" ? undefined : status,
      });
      setData(result.data.items);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "就诊列表加载失败";
      void message.error(errorText);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEncounters(statusFilter);
  }, [statusFilter]);

  const filteredData = keyword.trim()
    ? data.filter(
        (item) => item.patientName.includes(keyword.trim()) || item.encounterId.includes(keyword.trim()),
      )
    : data;

  const columns: ColumnsType<Encounter> = [
    {
      title: "患者姓名",
      dataIndex: "patientName",
      key: "patientName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "就诊时间",
      dataIndex: "sessionDate",
      key: "sessionDate",
      render: (value: string) => formatApiDate(value),
    },
    {
      title: "挂号科室",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "时段",
      dataIndex: "periodCode",
      key: "periodCode",
    },
    {
      title: "状态",
      dataIndex: "encounterStatus",
      key: "status",
      render: (status: EncounterStatus) => {
        if (status === "COMPLETED") return <Badge status="success" text={statusLabelMap[status]} />;
        if (status === "IN_PROGRESS") return <Badge status="processing" text={statusLabelMap[status]} />;
        if (status === "CANCELLED") return <Badge status="error" text={statusLabelMap[status]} />;
        return <Badge status="default" text={statusLabelMap[status]} />;
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
          onClick={() => navigate(`/encounters/${record.encounterId}`)}
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
          <Input
            placeholder="搜索患者姓名/接诊ID"
            style={{ width: 220 }}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
          />
          <Select value={statusFilter} style={{ width: 140 }} onChange={(value) => setStatusFilter(value)}>
            <Select.Option value="all">所有状态</Select.Option>
            <Select.Option value="SCHEDULED">待接诊</Select.Option>
            <Select.Option value="IN_PROGRESS">接诊中</Select.Option>
            <Select.Option value="COMPLETED">已完成</Select.Option>
            <Select.Option value="CANCELLED">已取消</Select.Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="encounterId"
        loading={loading}
        locale={{ emptyText: <Empty description="暂无就诊数据" /> }}
        size="middle"
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
};
