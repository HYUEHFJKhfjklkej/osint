"use client";

import { ConfigProvider, theme } from "antd";
import React from "react";

import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: "#1677ff", borderRadius: 8 },
      }}
    >
      <QueryProvider>{children}</QueryProvider>
    </ConfigProvider>
  );
}
