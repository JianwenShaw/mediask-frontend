import { Button, Result } from "antd";
import { useNavigate } from "react-router";

import { useAuth } from "../auth/auth-context";

export const AccessDenied = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="403"
        title="无权访问"
        subTitle="当前账号没有访问此页面所需的角色权限。"
        extra={
          <Button
            type="primary"
            onClick={() => {
              auth.logout();
              navigate("/login", { replace: true });
            }}
          >
            退出登录
          </Button>
        }
      />
    </div>
  );
};
