import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Typography, message } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = (values: any) => {
    setLoading(true);
    // Simulate API call for login
    setTimeout(() => {
      setLoading(false);
      if (values.username && values.password) {
        // Mock successful login by setting a token
        localStorage.setItem("backoffice_token", "mock-jwt-token");
        localStorage.setItem("backoffice_user", values.username);
        message.success("登录成功！欢迎回来。");

        // Redirect to intended page or workbench
        const from = location.state?.from?.pathname || "/workbench";
        navigate(from, { replace: true });
      } else {
        message.error("用户名或密码错误，请重试。");
      }
    }, 800);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Left Pane - Branding & Visuals */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #1677FF 0%, #0958d9 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Abstract Background Shapes for Enterprise Feel */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "50%",
            height: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: "20%",
            height: "20%",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />

        {/* Branding Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "white" }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <span style={{ fontSize: 40, fontWeight: "bold", color: "white" }}>M</span>
          </div>
          <Title level={1} style={{ color: "white", marginBottom: 16, letterSpacing: 1 }}>
            MediAsk
          </Title>
          <Title level={3} style={{ color: "rgba(255,255,255,0.8)", marginTop: 0, fontWeight: "normal" }}>
            智能医疗中枢
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 16,
              display: "block",
              maxWidth: 400,
              margin: "32px auto 0",
              lineHeight: 1.6,
            }}
          >
            AI 驱动，赋能医疗。
            <br />
            为医生提供高效、精准的诊疗管理体验。
          </Text>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
            {/* Form Header */}
            <div style={{ marginBottom: 40 }}>
              <Title level={2} style={{ margin: "0 0 12px 0", fontWeight: 600 }}>
                欢迎登录
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                登录 MediAsk Backoffice 管理系统
              </Text>
            </div>

            {/* Login Form */}
            <Form
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "请输入您的工号或用户名！" }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="工号 / 用户名 (如: admin)"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入您的密码！" }]}
                style={{ marginBottom: 16 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="密码 (随便输即可登录)"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>自动登录</Checkbox>
                </Form.Item>
                <a
                  href="#"
                  style={{ color: "#1677FF", fontSize: 14 }}
                  onClick={(e) => e.preventDefault()}
                >
                  忘记密码？
                </a>
              </div>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{ height: 44, fontSize: 16, borderRadius: 6, fontWeight: 500 }}
                >
                  登录系统
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px", color: "rgba(0,0,0,0.45)" }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} MediAsk. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  );
};
