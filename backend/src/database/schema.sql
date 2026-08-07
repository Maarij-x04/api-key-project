
-- API Key Management Platform — Full Schema


CREATE TABLE users (
  id            bigserial PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at    timestamp DEFAULT now(),
  updated_at    timestamp DEFAULT now(),
  role text NOT NULL DEFAULT 'user'
);

CREATE TABLE applications (
  id          bigserial PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  environment text DEFAULT 'production',
  status      text DEFAULT 'active',
  created_at  timestamp DEFAULT now(),
  updated_at  timestamp DEFAULT now()
);

CREATE TABLE api_keys (
  id             bigserial PRIMARY KEY,
  application_id bigint NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name           text NOT NULL,
  key_prefix     text NOT NULL,
  key_hash       text NOT NULL UNIQUE,
  scopes         text[] DEFAULT '{read}', 
  rate_limit     integer DEFAULT 60,
  expires_at     timestamp,
  last_used_at   timestamp,
  revoked_at     timestamp,
  created_at     timestamp DEFAULT now()
);

CREATE TABLE api_usage (
  id                bigserial PRIMARY KEY,
  api_key_id        bigint REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint          text,
  method            text,
  status_code       integer,
  response_time_ms  integer,
  ip_address        text,
  user_agent        text,
  created_at        timestamp DEFAULT now()
);

CREATE TABLE audit_logs (
  id             bigserial PRIMARY KEY,
  user_id        bigint REFERENCES users(id),
  application_id bigint REFERENCES applications(id) ON DELETE SET NULL,
  entity_type    text,
  entity_id      bigint,
  action         text,
  old_values     jsonb,
  new_values     jsonb,
  ip_address     text,
  created_at     timestamp DEFAULT now()
);

CREATE TABLE products (
  id             bigserial PRIMARY KEY,
  application_id bigint NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  title          text NOT NULL,
  category       text,
  price          float NOT NULL,
  quantity       int DEFAULT 0,
  vendor         text,
  created_at     timestamp DEFAULT now()
);

CREATE TABLE orders (
  id             bigserial PRIMARY KEY,
  application_id bigint NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  product_id     bigint REFERENCES products(id) ON DELETE SET NULL,
  quantity       int NOT NULL,
  subtotal       float NOT NULL,
  tax            float DEFAULT 0,
  total          float NOT NULL,
  created_at     timestamp DEFAULT now()
);

CREATE INDEX idx_products_application ON products(application_id);
CREATE INDEX idx_orders_application ON orders(application_id);
-- Indexes for the query patterns this platform actually needs
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_keys_application ON api_keys(application_id);
CREATE INDEX idx_usage_key_time ON api_usage(api_key_id, created_at);
CREATE INDEX idx_usage_endpoint ON api_usage(endpoint);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_application ON audit_logs(application_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);