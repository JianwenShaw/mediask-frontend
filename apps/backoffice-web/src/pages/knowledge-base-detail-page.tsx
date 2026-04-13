import type { KnowledgeBase, KnowledgeDocument, KnowledgeBaseOwnerType } from "@mediask/shared-types";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { UploadProps } from "antd/es/upload";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { backofficeApi } from "../lib/api";
import { KnowledgeBaseTestingPanel } from "./knowledge-base-testing-panel";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ownerTypeColorMap: Record<KnowledgeBaseOwnerType, string> = {
  SYSTEM: "purple",
  DEPARTMENT: "blue",
  TOPIC: "cyan",
};

const loadKnowledgeBaseById = async (knowledgeBaseId: string) => {
  let currentPage = 1;

  while (true) {
    const result = await backofficeApi.listKnowledgeBases({
      pageNum: currentPage,
      pageSize: 100,
    });
    const matched = result.data.items.find((item) => item.id === knowledgeBaseId);

    if (matched) {
      return matched;
    }

    if (!result.data.hasNext) {
      return null;
    }

    currentPage += 1;
  }
};

const renderDocumentStatus = (status: string) => {
  if (status === "ACTIVE") {
    return <Tag color="success" icon={<CheckCircleOutlined />}>已就绪</Tag>;
  }

  if (status === "FAILED") {
    return <Tag color="error" icon={<CloseCircleOutlined />}>失败</Tag>;
  }

  const textMap: Record<string, string> = {
    UPLOADED: "已上传",
    PARSING: "解析中",
    CHUNKED: "已分块",
    INDEXING: "索引中",
  };

  return <Tag color="processing" icon={<LoadingOutlined />}>{textMap[status] ?? status}</Tag>;
};

export const KnowledgeBaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const knowledgeBaseId = id || "";

  const [activeTab, setActiveTab] = useState("overview");
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [kbLoading, setKbLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docPageNum, setDocPageNum] = useState(1);
  const [docPageSize, setDocPageSize] = useState(10);
  const [docTotal, setDocTotal] = useState(0);

  const isValidKnowledgeBaseId = Boolean(knowledgeBaseId);

  const loadKnowledgeBase = async () => {
    if (!isValidKnowledgeBaseId) {
      setKnowledgeBase(null);
      return;
    }

    setKbLoading(true);

    try {
      const result = await loadKnowledgeBaseById(knowledgeBaseId);
      setKnowledgeBase(result);
    } catch (error) {
      setKnowledgeBase(null);
      const errorText = error instanceof Error ? error.message : "知识库信息加载失败";
      void message.error(errorText);
    } finally {
      setKbLoading(false);
    }
  };

  const loadDocuments = async (nextPageNum = docPageNum, nextPageSize = docPageSize) => {
    if (!isValidKnowledgeBaseId) {
      setDocuments([]);
      setDocTotal(0);
      return;
    }

    setDocLoading(true);

    try {
      const result = await backofficeApi.listKnowledgeDocuments({
        knowledgeBaseId,
        pageNum: nextPageNum,
        pageSize: nextPageSize,
      });

      setDocuments(result.data.items);
      setDocPageNum(result.data.pageNum);
      setDocPageSize(result.data.pageSize);
      setDocTotal(result.data.total);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "知识文档加载失败";
      void message.error(errorText);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    void loadKnowledgeBase();
    void loadDocuments(1, docPageSize);
  }, [knowledgeBaseId]);

  const handleDocumentTableChange = (pagination: TablePaginationConfig) => {
    void loadDocuments(pagination.current ?? 1, pagination.pageSize ?? docPageSize);
  };

  const handleDeleteKnowledgeBase = async () => {
    if (!knowledgeBase) {
      return;
    }

    try {
      await backofficeApi.deleteKnowledgeBase(knowledgeBase.id);
      void message.success("知识库删除成功");
      navigate("/knowledge-bases", { replace: true });
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "知识库删除失败";
      void message.error(errorText);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await backofficeApi.deleteKnowledgeDocument(documentId);
      void message.success("文档删除成功");

      const nextPageNum = documents.length === 1 && docPageNum > 1 ? docPageNum - 1 : docPageNum;
      await Promise.all([loadKnowledgeBase(), loadDocuments(nextPageNum, docPageSize)]);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "文档删除失败";
      void message.error(errorText);
    }
  };

  const uploadProps: UploadProps = useMemo(
    () => ({
      accept: ".pdf,.docx,.md",
      multiple: false,
      maxCount: 1,
      showUploadList: false,
      customRequest: async (options) => {
        if (!isValidKnowledgeBaseId) {
          options.onError?.(new Error("非法知识库 ID"));
          return;
        }

        setUploading(true);

        try {
          const formData = new FormData();
          formData.append("knowledgeBaseId", String(knowledgeBaseId));
          formData.append("file", options.file as File);

          await backofficeApi.importKnowledgeDocument(formData);
          options.onSuccess?.({}, undefined as never);
          void message.success("文档导入成功");
          setIsUploadModalOpen(false);
          await Promise.all([loadKnowledgeBase(), loadDocuments(1, docPageSize)]);
        } catch (error) {
          const uploadError = error instanceof Error ? error : new Error("文档导入失败");
          options.onError?.(uploadError);
          void message.error(uploadError.message);
        } finally {
          setUploading(false);
        }
      },
    }),
    [docPageSize, knowledgeBaseId, isValidKnowledgeBaseId],
  );

  const documentColumns = [
    {
      title: "文档名称",
      dataIndex: "title",
      key: "title",
      render: (_: string, record: KnowledgeDocument) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          <Tag style={{ marginTop: 4, fontSize: 10 }} bordered={false}>
            {record.sourceType}
          </Tag>
        </Space>
      ),
    },
    {
      title: "处理状态",
      dataIndex: "documentStatus",
      key: "documentStatus",
      width: 180,
      render: (value: string) => renderDocumentStatus(value),
    },
    {
      title: "片段数",
      dataIndex: "chunkCount",
      key: "chunkCount",
      width: 120,
      render: (value: number) => <Text>{value > 0 ? `${value} 块` : "-"}</Text>,
    },
    {
      title: "文档标识",
      dataIndex: "documentUuid",
      key: "documentUuid",
      render: (value: string) => <Text type="secondary">{value}</Text>,
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_: unknown, record: KnowledgeDocument) => (
        <Popconfirm
          title="删除该文档？"
          description="软删除后该文档及其分块数据将不再显示。"
          okText="确认删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => void handleDeleteDocument(record.id)}
        >
          <Button danger type="link" style={{ padding: 0 }}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (!isValidKnowledgeBaseId) {
    return (
      <Card bordered={false} style={{ margin: 24 }}>
        <Empty description="无效的知识库 ID" />
      </Card>
    );
  }

  if (!kbLoading && !knowledgeBase) {
    return (
      <Card bordered={false} style={{ margin: 24 }}>
        <Empty description="未找到该知识库" />
      </Card>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center" size="middle">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/knowledge-bases")}
              type="text"
              style={{ padding: 0, width: 32, height: 32 }}
            />
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "#1677FF",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DatabaseOutlined style={{ fontSize: 16 }} />
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>
                {knowledgeBase?.name ?? "知识库"}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ID: {knowledgeBaseId}
              </Text>
            </Space>
          </Space>
        </Col>
        <Col>
          <Badge status={knowledgeBase?.status === "ENABLED" ? "success" : "default"} text={knowledgeBase?.status ?? "UNKNOWN"} />
        </Col>
      </Row>

      <Card bordered={false} bodyStyle={{ padding: "0 24px" }} style={{ borderRadius: 6 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "overview",
              label: "概览与设置",
              children: (
                <div style={{ padding: "24px 0" }}>
                  <Descriptions title="基础信息" bordered column={2} size="middle">
                    <Descriptions.Item label="知识库名称">{knowledgeBase?.name}</Descriptions.Item>
                    <Descriptions.Item label="唯一编码">{knowledgeBase?.kbCode}</Descriptions.Item>
                    <Descriptions.Item label="归属类型">
                      {knowledgeBase ? <Tag color={ownerTypeColorMap[knowledgeBase.ownerType]}>{knowledgeBase.ownerType}</Tag> : null}
                    </Descriptions.Item>
                    <Descriptions.Item label="可见性">
                      {knowledgeBase ? <Tag color="success">{knowledgeBase.visibility}</Tag> : null}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {knowledgeBase ? (
                        <Tag color={knowledgeBase.status === "ENABLED" ? "processing" : "default"}>{knowledgeBase.status}</Tag>
                      ) : null}
                    </Descriptions.Item>
                    <Descriptions.Item label="文档总数">{knowledgeBase?.docCount ?? 0}</Descriptions.Item>
                    <Descriptions.Item label="归属科室 ID">
                      {knowledgeBase?.ownerDeptId ?? "-"}
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5} style={{ color: "#FF4D4F", marginTop: 24 }}>
                    危险操作
                  </Title>
                  <Card size="small" bordered style={{ borderColor: "#FFCCC7", background: "#FFF1F0" }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong>删除该知识库</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          软删除后该知识库及其下游文档与分块数据将不再显示。
                        </Text>
                      </Col>
                      <Col>
                        <Popconfirm
                          title="删除该知识库？"
                          description="该操作会将知识库标记为删除状态。"
                          okText="确认删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => void handleDeleteKnowledgeBase()}
                        >
                          <Button danger icon={<DeleteOutlined />}>
                            删除知识库
                          </Button>
                        </Popconfirm>
                      </Col>
                    </Row>
                  </Card>
                </div>
              ),
            },
            {
              key: "documents",
              label: "文档管理",
              children: (
                <div style={{ padding: "24px 0" }}>
                  <Row justify="space-between" style={{ marginBottom: 16 }}>
                    <Col>
                      <Space>
                        <Text strong>已导入文档 ({docTotal})</Text>
                        <Tooltip title="只有真实已落库的文档状态会在这里展示。">
                          <InfoCircleOutlined style={{ color: "#bfbfbf" }} />
                        </Tooltip>
                      </Space>
                    </Col>
                    <Col>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsUploadModalOpen(true)}>
                        导入新文档
                      </Button>
                    </Col>
                  </Row>

                  <Table<KnowledgeDocument>
                    columns={documentColumns}
                    dataSource={documents}
                    rowKey="id"
                    loading={docLoading}
                    bordered
                    locale={{ emptyText: <Empty description="暂无文档数据" /> }}
                    pagination={{
                      current: docPageNum,
                      pageSize: docPageSize,
                      total: docTotal,
                      showSizeChanger: true,
                      showTotal: (count) => `共 ${count} 条`,
                    }}
                    onChange={handleDocumentTableChange}
                  />
                </div>
              ),
            },
            {
              key: "testing",
              label: "命中测试 (Playground)",
              children: (
                <div style={{ padding: "24px 0" }}>
                  <KnowledgeBaseTestingPanel knowledgeBaseId={knowledgeBaseId} />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={
          <Space>
            <InboxOutlined />
            <span>导入源文档</span>
          </Space>
        }
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={null}
        width={560}
        centered
        destroyOnClose
      >
        <div style={{ marginTop: 24 }}>
          <Dragger {...uploadProps} disabled={uploading} style={{ padding: "32px 0", background: "#FAFAFA", borderRadius: 8 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#1677FF" }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
              点击或将文件拖拽到这里上传
            </p>
            <p className="ant-upload-hint" style={{ color: "#8c8c8c", padding: "0 24px" }}>
              支持单次上传。格式限制：PDF、DOCX、MD。
              <br />
              导入后由后端触发解析、分块与索引链路。
            </p>
          </Dragger>
        </div>
      </Modal>
    </div>
  );
};
