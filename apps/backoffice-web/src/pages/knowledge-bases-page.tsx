import type {
  KnowledgeBase,
  KnowledgeBaseCreateRequest,
  KnowledgeBaseOwnerType,
  KnowledgeBaseStatus,
  KnowledgeBaseUpdateRequest,
} from "@mediask/shared-types";
import {
  AppstoreOutlined,
  BookOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FormOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { backofficeApi } from "../lib/api";

const { Title, Text } = Typography;

type KnowledgeBaseFormValues = {
  name: string;
  kbCode?: string;
  ownerType: KnowledgeBaseOwnerType;
  ownerDeptId?: string | null;
  visibility: string;
  status?: KnowledgeBaseStatus;
};

const ownerTypeOptions: { label: string; value: KnowledgeBaseOwnerType }[] = [
  { label: "系统", value: "SYSTEM" },
  { label: "科室", value: "DEPARTMENT" },
  { label: "专题", value: "TOPIC" },
];

const visibilityOptions = [
  { label: "公开", value: "PUBLIC" },
  { label: "部门可见", value: "DEPT" },
  { label: "私有", value: "PRIVATE" },
];

const statusOptions: { label: string; value: KnowledgeBaseStatus }[] = [
  { label: "启用", value: "ENABLED" },
  { label: "停用", value: "DISABLED" },
];

const normalizeOwnerDeptId = (ownerType: KnowledgeBaseOwnerType, ownerDeptId?: string | null) => {
  if (ownerType !== "DEPARTMENT" || ownerDeptId == null) {
    return undefined;
  }

  return ownerDeptId;
};

const buildKnowledgeBaseUpdatePayload = (
  current: KnowledgeBase,
  values: KnowledgeBaseFormValues,
): KnowledgeBaseUpdateRequest => {
  const nextOwnerDeptId = normalizeOwnerDeptId(values.ownerType, values.ownerDeptId);
  const payload: KnowledgeBaseUpdateRequest = {};

  if (values.name !== current.name) {
    payload.name = values.name;
  }

  if (values.ownerType !== current.ownerType) {
    payload.ownerType = values.ownerType;
    payload.ownerDeptId = nextOwnerDeptId;
  } else if (values.ownerType === "DEPARTMENT" && nextOwnerDeptId !== current.ownerDeptId) {
    payload.ownerDeptId = nextOwnerDeptId;
  }

  if (values.visibility !== current.visibility) {
    payload.visibility = values.visibility;
  }

  if (values.status && values.status !== current.status) {
    payload.status = values.status;
  }

  return payload;
};

export const KnowledgeBasesPage = () => {
  const [form] = Form.useForm<KnowledgeBaseFormValues>();
  const [data, setData] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KnowledgeBase | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const loadKnowledgeBases = async (nextPageNum = pageNum, nextPageSize = pageSize, nextKeyword = keyword) => {
    setLoading(true);

    try {
      const result = await backofficeApi.listKnowledgeBases({
        pageNum: nextPageNum,
        pageSize: nextPageSize,
        keyword: nextKeyword || undefined,
      });

      setData(result.data.items);
      setTotal(result.data.total);
      setPageNum(result.data.pageNum);
      setPageSize(result.data.pageSize);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "知识库列表加载失败";
      void message.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKnowledgeBases(1, pageSize, keyword);
  }, [keyword]);

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      ownerType: "SYSTEM",
      visibility: "PUBLIC",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: KnowledgeBase) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      kbCode: record.kbCode,
      ownerType: record.ownerType,
      ownerDeptId: record.ownerDeptId,
      visibility: record.visibility,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSubmit = async (values: KnowledgeBaseFormValues) => {
    setSubmitting(true);

    try {
      if (editingRecord) {
        const body = buildKnowledgeBaseUpdatePayload(editingRecord, values);

        if (Object.keys(body).length > 0) {
          await backofficeApi.updateKnowledgeBase(editingRecord.id, body);
        }

        void message.success("知识库更新成功");
      } else {
        const body: KnowledgeBaseCreateRequest = {
          name: values.name,
          kbCode: values.kbCode!.trim(),
          ownerType: values.ownerType,
          ownerDeptId: normalizeOwnerDeptId(values.ownerType, values.ownerDeptId),
          visibility: values.visibility,
        };

        await backofficeApi.createKnowledgeBase(body);
        void message.success("知识库创建成功");
      }

      closeModal();
      void loadKnowledgeBases(editingRecord ? pageNum : 1, pageSize, keyword);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "知识库保存失败";
      void message.error(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (record: KnowledgeBase) => {
    const nextStatus: KnowledgeBaseStatus = record.status === "ENABLED" ? "DISABLED" : "ENABLED";

    try {
      await backofficeApi.updateKnowledgeBase(record.id, { status: nextStatus });

      void message.success(nextStatus === "ENABLED" ? "知识库已启用" : "知识库已停用");
      void loadKnowledgeBases();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "知识库状态更新失败";
      void message.error(errorText);
    }
  };

  const handleDelete = async (record: KnowledgeBase) => {
    try {
      await backofficeApi.deleteKnowledgeBase(record.id);
      void message.success("知识库删除成功");

      const nextPageNum = data.length === 1 && pageNum > 1 ? pageNum - 1 : pageNum;
      void loadKnowledgeBases(nextPageNum, pageSize, keyword);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "知识库删除失败";
      void message.error(errorText);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const nextPageNum = pagination.current ?? 1;
    const nextPageSize = pagination.pageSize ?? pageSize;
    void loadKnowledgeBases(nextPageNum, nextPageSize, keyword);
  };

  const columns: ColumnsType<KnowledgeBase> = [
    {
      title: "知识库名称",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>
            {record.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.kbCode}
          </Text>
        </Space>
      ),
    },
    {
      title: "归属",
      dataIndex: "ownerType",
      key: "ownerType",
      render: (value: KnowledgeBaseOwnerType) => {
        const colorMap: Record<KnowledgeBaseOwnerType, string> = {
          SYSTEM: "purple",
          DEPARTMENT: "blue",
          TOPIC: "cyan",
        };

        return <Tag color={colorMap[value]}>{value}</Tag>;
      },
    },
    {
      title: "可见性",
      dataIndex: "visibility",
      key: "visibility",
      render: (value: string) => {
        const colorMap: Record<string, string> = {
          PUBLIC: "success",
          DEPT: "warning",
          PRIVATE: "default",
        };

        return <Tag color={colorMap[value] ?? "default"}>{value}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value: KnowledgeBaseStatus) => (
        <Tag color={value === "ENABLED" ? "processing" : "default"} bordered={false}>
          {value === "ENABLED" ? "已启用" : "已停用"}
        </Tag>
      ),
    },
    {
      title: "文档数量",
      dataIndex: "docCount",
      key: "docCount",
      render: (value: number) => (
        <Space size={4}>
          <FileTextOutlined style={{ color: "#8c8c8c" }} />
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/knowledge-bases/${record.id}`} style={{ fontWeight: 500 }}>
            管理
          </Link>
          <Button type="link" style={{ padding: 0 }} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button type="link" style={{ padding: 0 }} onClick={() => void handleToggleStatus(record)}>
            {record.status === "ENABLED" ? "停用" : "启用"}
          </Button>
          <Popconfirm
            title="删除该知识库？"
            description="软删除后该知识库及其文档数据将不再显示。"
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDelete(record)}
          >
            <Button danger type="link" style={{ padding: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalDocs = data.reduce((sum, item) => sum + item.docCount, 0);
  const activeKBs = data.filter((item) => item.status === "ENABLED").length;

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center" size="middle">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "rgba(22, 119, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DatabaseOutlined style={{ fontSize: 20, color: "#1677FF" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                RAG 知识库管理
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                管理和维护用于增强生成大模型的专业医疗知识库
              </Text>
            </div>
          </Space>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false} size="small" style={{ borderRadius: 6 }}>
            <Statistic title="当前页知识库" value={data.length} prefix={<BookOutlined style={{ color: "#1677FF" }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} size="small" style={{ borderRadius: 6 }}>
            <Statistic
              title="当前页活跃知识库"
              value={activeKBs}
              suffix={`/ ${data.length}`}
              prefix={<AppstoreOutlined style={{ color: "#52C41A" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} size="small" style={{ borderRadius: 6 }}>
            <Statistic title="当前页文档总数" value={totalDocs} prefix={<FileTextOutlined style={{ color: "#FAAD14" }} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 6 }}>
        <Row justify="space-between" style={{ marginBottom: 16 }} gutter={16}>
          <Col flex="auto">
            <Input.Search
              placeholder="搜索知识库名称或编码"
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={keywordInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                setKeywordInput(nextValue);

                if (!nextValue) {
                  setKeyword("");
                }
              }}
              onSearch={(value) => {
                setKeywordInput(value);
                setKeyword(value.trim());
              }}
              allowClear
              style={{ width: 300, borderRadius: 6 }}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ borderRadius: 6 }}>
              新建知识库
            </Button>
          </Col>
        </Row>

        <Table<KnowledgeBase>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: <Empty description="暂无知识库数据" /> }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={
          <Space>
            {editingRecord ? <FormOutlined /> : <PlusOutlined />}
            <span>{editingRecord ? "编辑知识库" : "新建知识库"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => void form.submit()}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form<KnowledgeBaseFormValues> form={form} layout="vertical" onFinish={(values) => void handleSubmit(values)}>
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: "请输入知识库名称" }]}
          >
            <Input placeholder="例如：糖尿病专科指南知识库" />
          </Form.Item>

          <Form.Item
            name="kbCode"
            label="知识库编码"
            rules={editingRecord ? [] : [{ required: true, message: "请输入知识库编码" }]}
          >
            <Input placeholder="例如：KB_DIABETES" disabled={Boolean(editingRecord)} />
          </Form.Item>

          <Form.Item
            name="ownerType"
            label="归属类型"
            rules={[{ required: true, message: "请选择归属类型" }]}
          >
            <Select options={ownerTypeOptions} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, next) => prev.ownerType !== next.ownerType}>
            {({ getFieldValue }) =>
              getFieldValue("ownerType") === "DEPARTMENT" ? (
                <Form.Item
                  name="ownerDeptId"
                  label="归属科室 ID"
                  rules={[{ required: true, message: "请输入归属科室 ID" }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} placeholder="请输入科室 ID" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="visibility"
            label="可见性"
            rules={[{ required: true, message: "请选择可见性" }]}
          >
            <Select options={visibilityOptions} />
          </Form.Item>

          {editingRecord ? (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: "请选择状态" }]}
            >
              <Select options={statusOptions} />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
};
