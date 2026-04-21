import {
  AuditOutlined,
  BellOutlined,
  DesktopOutlined,
  DownOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  UserOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Breadcrumb, Button, ConfigProvider, Dropdown, Input, Layout, Menu, Space, Typography, theme } from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import { useAuth } from "../auth/auth-context";

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

const roleLabels: Record<string, string> = {
  DOCTOR: "医生",
  ADMIN: "管理员",
  PATIENT: "患者",
};

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    auth.logout();
    navigate("/login", { replace: true });
  };

  const username = auth.user?.displayName || auth.user?.username || "未知用户";
  const roleText = (auth.user?.roles ?? []).map((role) => roleLabels[role] ?? role).join(" | ") || "未分配角色";
  const canAccessDoctorPages = auth.hasAnyRole(["DOCTOR"]);
  const canAccessAdminPages = auth.hasAnyRole(["ADMIN"]);
  const menuItems = [
    canAccessDoctorPages
      ? {
          key: "1",
          icon: <DesktopOutlined />,
          label: <Link to="/workbench">工作台</Link>,
        }
      : null,
    canAccessDoctorPages
      ? {
          key: "2",
          icon: <MedicineBoxOutlined />,
          label: <Link to="/encounters">就诊管理</Link>,
        }
      : null,
    canAccessAdminPages
      ? {
          key: "3",
          icon: <AuditOutlined />,
          label: <Link to="/audit">审计日志</Link>,
        }
      : null,
    canAccessAdminPages || canAccessDoctorPages
      ? {
          key: "4",
          icon: <DatabaseOutlined />,
          label: <Link to="/knowledge-bases">知识库管理</Link>,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  // Determine current active menu key based on pathname
  let selectedKey = "1";
  let breadcrumbName = "Workbench";
  if (location.pathname.startsWith("/workbench")) {
    selectedKey = "1";
    breadcrumbName = "工作台 (Workbench)";
  } else if (
    location.pathname.startsWith("/encounters") ||
    location.pathname.startsWith("/emr") ||
    location.pathname.startsWith("/prescriptions")
  ) {
    selectedKey = "2";
    breadcrumbName = "就诊管理 (Encounters)";
  } else if (location.pathname.startsWith("/audit")) {
    selectedKey = "3";
    breadcrumbName = "审计日志 (Audit)";
  } else if (location.pathname.startsWith("/knowledge-bases")) {
    selectedKey = "4";
    breadcrumbName = "知识库管理 (Knowledge Bases)";
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677FF",
          borderRadius: 6,
          // Dark sidebar specific overrides
        },
        components: {
          Menu: {
            darkItemSelectedBg: "#1677FF",
          },
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
          width={208} // 缩减侧边栏宽度
          style={{
            boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
            zIndex: 10,
          }}
        >
          {/* Logo Area */}
          <div
            style={{
              height: 56, // 缩小顶部高度
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? 0 : "0 16px",
              color: "#fff",
              fontSize: 18, // 缩小字号
              fontWeight: 600,
              letterSpacing: 1,
              transition: "all 0.3s",
              overflow: "hidden",
              borderBottom: "1px solid rgba(255,255,255,0.08)", // 增加分割线
            }}
          >
            <div
              style={{
                width: 28, // 缩小 Logo
                height: 28,
                background: "#1677FF",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: collapsed ? 0 : 10,
                flexShrink: 0,
                fontSize: 14,
              }}
            >
              M
            </div>
            {!collapsed && "MediAsk"}
          </div>

          {/* Navigation Menu */}
          <Menu
            theme="dark"
            selectedKeys={[selectedKey]}
            mode="inline"
            style={{ borderRight: 0, marginTop: 8 }} // 增加一点上边距
            items={menuItems}
          />
        </Sider>

        <Layout style={{ background: "#F0F2F5" }}>
          {/* Header Area */}
          <Header
            style={{
              padding: "0 20px 0 0", // 紧凑边距
              background: colorBgContainer,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 4px rgba(0, 21, 41, 0.04)", // 减弱阴影
              zIndex: 1,
              height: 56, // 降低高度，提升紧凑感
              lineHeight: "56px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 56,
                  height: 56,
                  borderRadius: 0,
                }}
              />
              <Input
                prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="搜索患者、就诊记录或处方..."
                bordered={false}
                style={{ 
                  width: 260, 
                  backgroundColor: "rgba(0,0,0,0.04)", 
                  borderRadius: 6, // 严谨的圆角
                  padding: "4px 12px",
                  height: 32 // 紧凑的输入框
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", paddingRight: "16px" }}>
              {/* Notifications */}
              <Badge count={3} size="small" offset={[-2, 2]}>
                <BellOutlined style={{ fontSize: 18, cursor: "pointer", color: "#595959" }} />
              </Badge>

              {/* User Profile Dropdown */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "profile",
                      icon: <UserOutlined />,
                      label: "个人设置",
                    },
                    { type: 'divider' },
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "退出登录",
                      danger: true,
                      onClick: handleLogout,
                    },
                  ],
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "0 8px" }}>
                  <Avatar
                    style={{ backgroundColor: "#1677FF" }}
                    icon={<UserOutlined />}
                    size={28} // 缩小头像
                  />
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                    <Text strong style={{ fontSize: 13 }}>{username}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{roleText}</Text>
                  </div>
                  <DownOutlined style={{ fontSize: 10, color: "#8c8c8c" }} />
                </div>
              </Dropdown>
            </div>
          </Header>

          {/* Main Content Area */}
          <Content
            style={{
              margin: "16px 20px 0", // 收紧边距
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Breadcrumbs */}
            <Breadcrumb
              style={{ marginBottom: 12, fontSize: 13 }} // 缩小字号和间距
              items={[
                { title: 'Home' },
                { title: breadcrumbName },
              ]}
            />
            
            {/* Page Container: 移除强制白底，让页面自己决定 */}
            <div
              style={{
                flex: 1,
                minHeight: 360,
                background: "transparent",
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </div>
          </Content>

          {/* Footer Area */}
          <Footer style={{ textAlign: "center", color: "#8c8c8c", fontSize: 12, padding: "16px 50px" }}>
            MediAsk Backoffice ©{new Date().getFullYear()}. All Rights Reserved. 内部系统，请注意数据保密。
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
