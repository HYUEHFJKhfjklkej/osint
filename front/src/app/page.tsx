"use client";

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  List,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

import { request } from "@/lib/api";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

type TokenResponse = { access_token: string };
type Greeting = { id: number; name: string; created_at: string };
type Person = {
  id: number;
  full_name: string;
  telegram?: string | null;
  photo_url?: string | null;
  note?: string | null;
  created_at: string;
};
type LoginFormValues = { username: string; password: string };
type HelloFormValues = { name: string };
type PersonFormValues = {
  full_name: string;
  telegram?: string;
  photo_url?: string;
  note?: string;
};

export default function HomePage() {
  const queryClient = useQueryClient();
  const [token, setToken] = React.useState<string | null>(null);
  const isAuthed = Boolean(token);

  const handleLogout = () => {
    setToken(null);
    queryClient.clear();
  };

  const contentStyle: React.CSSProperties = {
    padding: "24px 16px 48px",
    display: "flex",
    justifyContent: "center",
  };
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderColor: "#f0f0f0",
    color: "#141414",
  };
  const headerStyle: React.CSSProperties = {
    background: "#fff",
    borderBottom: "1px solid #f0f0f0",
  };
  const titleStyle: React.CSSProperties = { margin: 0, color: "#141414" };

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) =>
      request<TokenResponse>("/login", { method: "POST", body: data }),
    onSuccess: (data) => {
      setToken(data.access_token);
      message.success("Logged in");
      queryClient.invalidateQueries({ queryKey: ["greetings"] });
    },
    onError: (err: unknown) => {
      message.error((err as Error).message || "Login failed");
    },
  });

  const helloMutation = useMutation({
    mutationFn: (data: HelloFormValues) =>
      request<{ message: string }>("/hello", {
        method: "POST",
        body: data,
        token,
      }),
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["greetings"] });
    },
    onError: (err: unknown) => {
      message.error((err as Error).message || "Hello failed");
    },
  });

  const { data: greetings, isLoading } = useQuery({
    queryKey: ["greetings", token],
    queryFn: () =>
      request<Greeting[]>("/greetings", {
        method: "GET",
        token,
      }),
    enabled: Boolean(token),
  });

  const { data: people, isLoading: isLoadingPeople } = useQuery({
    queryKey: ["people", token],
    queryFn: () =>
      request<Person[]>("/people", {
        method: "GET",
        token,
      }),
    enabled: Boolean(token),
  });

  const createPersonMutation = useMutation({
    mutationFn: (data: PersonFormValues) =>
      request<Person>("/people", {
        method: "POST",
        body: data,
        token,
      }),
    onSuccess: () => {
      message.success("Человек добавлен");
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
    onError: (err: unknown) => {
      message.error((err as Error).message || "Не удалось добавить");
    },
  });

  const loginCard = (
    <Card title="1. Login">
      <Form<LoginFormValues> layout="vertical" onFinish={(values) => loginMutation.mutate(values)}>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true }]}
          initialValue="admin"
        >
          <Input placeholder="admin" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true }]}
          initialValue="admin"
        >
          <Input.Password placeholder="admin" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loginMutation.isPending} block>
          Get token
        </Button>
        {token && (
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            Token saved in memory for this session.
          </Text>
        )}
      </Form>
    </Card>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header style={headerStyle}>
        <Title level={3} style={titleStyle}>
          OSINT Dashboard
        </Title>
      </Header>
      <Content style={contentStyle}>
        <div style={{ width: "100%", maxWidth: 1200 }}>
          {!isAuthed ? (
            <Row justify="center">
              <Col xs={24} sm={20} md={14} lg={12}>
                <Card style={cardStyle} title="1. Login">
                  <Form<LoginFormValues>
                    layout="vertical"
                    onFinish={(values) => loginMutation.mutate(values)}
                  >
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{ required: true }]}
                      initialValue="admin"
                    >
                      <Input placeholder="admin" />
                    </Form.Item>
                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[{ required: true }]}
                      initialValue="admin"
                    >
                      <Input.Password placeholder="admin" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loginMutation.isPending} block>
                      Войти
                    </Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={10}>
                  <Card
                    style={cardStyle}
                    title="Профиль"
                    extra={
                      <Button type="link" onClick={handleLogout} style={{ padding: 0 }}>
                        Выйти
                      </Button>
                    }
                  >
                    <Text type="secondary">Токен получен, можно работать с API.</Text>
                  </Card>

                  <Card title="2. Hello" style={{ marginTop: 16, ...cardStyle }}>
                    <Form<HelloFormValues>
                      layout="vertical"
                      onFinish={(values) => helloMutation.mutate({ name: values.name })}
                    >
                      <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: "Введите имя" }]}
                        initialValue="World"
                      >
                        <Input placeholder="World" />
                      </Form.Item>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={helloMutation.isPending}
                          block
                        >
                          Say hello
                        </Button>
                      </Space>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} md={14}>
                  <Card title="3. Greetings history" style={cardStyle}>
                    <List
                      loading={isLoading && Boolean(token)}
                      dataSource={greetings || []}
                      locale={{
                        emptyText: token ? "Пока нет записей" : "Нужен токен",
                      }}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            title={item.name}
                            description={new Date(item.created_at).toLocaleString()}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col xs={24} md={10}>
                  <Card title="4. Добавить человека" style={cardStyle}>
                    <Form<PersonFormValues>
                      layout="vertical"
                      onFinish={(values) => createPersonMutation.mutate(values)}
                    >
                      <Form.Item
                        label="ФИО"
                        name="full_name"
                        rules={[{ required: true, message: "Введите имя" }]}
                      >
                        <Input placeholder="Иван Иванов" />
                      </Form.Item>
                      <Form.Item label="Telegram" name="telegram">
                        <Input placeholder="@username" />
                      </Form.Item>
                      <Form.Item label="Фото (URL)" name="photo_url">
                        <Input placeholder="https://example.com/photo.jpg" />
                      </Form.Item>
                      <Form.Item label="Заметка" name="note">
                        <Input.TextArea placeholder="Комментарий" rows={2} />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={createPersonMutation.isPending}
                        block
                      >
                        Сохранить
                      </Button>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} md={14}>
                  <Card title="5. Список людей" style={cardStyle}>
                    <List
                      loading={isLoadingPeople && Boolean(token)}
                      dataSource={people || []}
                      locale={{
                        emptyText: token ? "Пусто" : "Нужен токен",
                      }}
                      renderItem={(item) => (
                        <List.Item style={{ alignItems: "flex-start" }}>
                          <List.Item.Meta
                            avatar={
                              item.photo_url ? (
                                <img
                                  src={item.photo_url}
                                  alt={item.full_name}
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    background: "#243042",
                                    color: "#f8f9fa",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.full_name[0]?.toUpperCase() || "?"}
                                </div>
                              )
                            }
                            title={<Text strong>{item.full_name}</Text>}
                            description={
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {item.telegram && (
                                  <Text type="secondary">Telegram: {item.telegram}</Text>
                                )}
                                {item.note && <Text>{item.note}</Text>}
                                <Text type="secondary">
                                  Создано: {new Date(item.created_at).toLocaleString()}
                                </Text>
                              </div>
                            }
                          />
                          {item.photo_url && (
                            <a href={item.photo_url} target="_blank" rel="noreferrer">
                              Фото
                            </a>
                          )}
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <Space direction="vertical">
          <Text>API base: {process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}</Text>
          <Text type="secondary">
            Uses Ant Design components, TanStack Query for data fetching, and the backend auth flow.
          </Text>
        </Space>
      </Footer>
    </Layout>
  );
}
