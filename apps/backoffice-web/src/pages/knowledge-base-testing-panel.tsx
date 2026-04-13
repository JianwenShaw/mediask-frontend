import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  List,
  Slider,
  Form,
  Typography,
  Badge,
  Space,
  Avatar,
  Divider,
  message
} from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, LinkOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { backofficeApi } from "../lib/api";

const { Text, Paragraph } = Typography;

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Chunk = { id: string; score: number; document_name: string; content: string };

const remarkPlugins = [remarkGfm];
const markdownComponents: any = {
  p: ({ node, ...props }: any) => <p style={{ margin: '0 0 8px 0', lineHeight: 1.6 }} {...props} />,
  ul: ({ node, ...props }: any) => <ul style={{ paddingLeft: '20px', margin: '0 0 8px 0', listStyleType: 'disc' }} {...props} />,
  ol: ({ node, ...props }: any) => <ol style={{ paddingLeft: '20px', margin: '0 0 8px 0', listStyleType: 'decimal' }} {...props} />,
  li: ({ node, ...props }: any) => <li style={{ marginBottom: '4px' }} {...props} />,
  strong: ({ node, ...props }: any) => <strong style={{ fontWeight: 600 }} {...props} />,
  a: ({ node, ...props }: any) => <a style={{ color: '#1677ff', textDecoration: 'underline' }} {...props} />,
  h1: ({ node, ...props }: any) => <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '16px 0 8px' }} {...props} />,
  h2: ({ node, ...props }: any) => <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '16px 0 8px' }} {...props} />,
  h3: ({ node, ...props }: any) => <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '16px 0 8px' }} {...props} />,
  table: ({ node, ...props }: any) => <table style={{ width: '100%', margin: '0 0 8px 0', borderCollapse: 'collapse', border: '1px solid #d9d9d9' }} {...props} />,
  th: ({ node, ...props }: any) => <th style={{ border: '1px solid #d9d9d9', padding: '8px', background: '#fafafa', textAlign: 'left' }} {...props} />,
  td: ({ node, ...props }: any) => <td style={{ border: '1px solid #d9d9d9', padding: '8px' }} {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote style={{ margin: '0 0 8px 0', padding: '4px 12px', borderLeft: '4px solid #1677ff', background: '#e6f4ff', color: '#595959' }} {...props} />
};

export const KnowledgeBaseTestingPanel = ({ knowledgeBaseId }: { knowledgeBaseId: string }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [topK, setTopK] = useState<number | null>(5);
  const [threshold, setThreshold] = useState<number | null>(0.6);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMsg: ChatMessage = { role: 'user', content: inputValue };
    setChatHistory((prev) => [...prev, newMsg]);
    const currentInput = inputValue;
    setInputValue('');
    setIsSearching(true);

    try {
      // TODO: Pass test parameters (`knowledgeBaseId`, `topK`, `threshold`) when backend supports them in the AiChatRequest
      const result = await backofficeApi.sendAiChat({
        sessionId,
        message: currentInput,
        departmentId: null,
        sceneType: "PRE_CONSULTATION",
        useStream: false
      });

      const { data } = result;
      setSessionId(data.sessionId);
      
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer }
      ]);

      const mappedChunks = data.triageResult?.citations?.map(citation => ({
        id: citation.chunkId,
        score: citation.fusionScore,
        document_name: `片段 ${citation.chunkId}`, // Using chunkId as fallback since document_name might not be in citation
        content: citation.snippet
      })) || [];

      setChunks(mappedChunks);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "请求失败";
      void message.error(errorText);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: "请求发生错误，请稍后重试或检查配置。" }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderScoreBadge = (score: number) => {
    let color = '#ff4d4f'; // red
    if (score >= 0.8) color = '#52c41a'; // green
    else if (score >= 0.6) color = '#faad14'; // orange

    return <Badge count={score.toFixed(2)} style={{ backgroundColor: color }} />;
  };

  return (
    <Row gutter={24}>
      {/* 左侧：问答调试区 */}
      <Col span={14}>
        <Card
          title="问答调试区 (Chat & QA)"
          bodyStyle={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0 }}
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 24, display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />} style={{ backgroundColor: msg.role === 'user' ? '#1677ff' : '#52c41a' }} />
                <div style={{ maxWidth: '85%', backgroundColor: msg.role === 'user' ? '#e6f4ff' : '#f5f5f5', padding: '12px 16px', borderRadius: 8 }}>
                  {msg.role === 'user' ? (
                    <Text>{msg.content}</Text>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={remarkPlugins}
                      components={markdownComponents}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isSearching && (
              <div style={{ display: 'flex', gap: 12 }}>
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#f5f5f5' }}>
                  <Text type="secondary">检索并生成中...</Text>
                </div>
              </div>
            )}
          </div>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
            <Input.TextArea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="输入测试问题..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} style={{ height: 'auto' }} loading={isSearching}>
              发送
            </Button>
          </div>
        </Card>
      </Col>

      {/* 右侧：召回参数控制与结果区 */}
      <Col span={10}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 参数配置 */}
          <Card title="检索参数配置" size="small">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={`Top-K (召回数量): ${topK}`} style={{ marginBottom: 0 }}>
                    <Slider
                      min={1}
                      max={20}
                      value={typeof topK === 'number' ? topK : 0}
                      onChange={(val) => setTopK(val)}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={`相似度阈值 (Threshold): ${threshold}`} style={{ marginBottom: 0 }}>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={typeof threshold === 'number' ? threshold : 0}
                      onChange={(val) => setThreshold(val)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* 召回结果 */}
          <Card
            title="召回片段结果"
            size="small"
            bodyStyle={{ height: '416px', overflowY: 'auto', padding: 0 }}
          >
            <List
              dataSource={chunks}
              renderItem={item => (
                <List.Item style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Space>
                        {renderScoreBadge(item.score)}
                        <Button type="link" size="small" icon={<LinkOutlined />} style={{ padding: 0 }}>
                          {item.document_name}
                        </Button>
                      </Space>
                    </div>
                    <Paragraph
                      ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                      style={{ marginBottom: 0, fontSize: '13px', color: '#595959' }}
                    >
                      {item.content}
                    </Paragraph>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </Col>
    </Row>
  );
};
