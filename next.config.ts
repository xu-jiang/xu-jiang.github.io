import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.102"],
  // ↑ 新增这一行（如果原来有其他配置，保留它们，加个逗号即可）

  // reactStrictMode: true,  ← 原来的配置保留
};

export default nextConfig;