-- =====================================================
-- Supabase SQL Editor - Futuristic AI Chatbot Schema
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Create ENUMs
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE thinking_status AS ENUM ('organizing', 'formulating', 'thinking', 'processing', 're-organizing', 'complete');
CREATE TYPE export_format AS ENUM ('pdf', 'markdown');

-- =====================================================
-- Users Table
-- =====================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- User Settings Table
-- =====================================================
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  temperature NUMERIC(3, 2) DEFAULT 0.7,
  top_p NUMERIC(3, 2) DEFAULT 0.9,
  top_k INTEGER DEFAULT 40,
  max_output_tokens INTEGER DEFAULT 2048,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Conversations Table
-- =====================================================
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'New Conversation',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Messages Table
-- =====================================================
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  
  -- Structured response data (for assistant messages)
  goals TEXT,
  constraints TEXT,
  output TEXT,
  formula TEXT,
  process TEXT,
  
  -- Metadata
  thinking_status thinking_status,
  is_voice_input BOOLEAN DEFAULT FALSE,
  voice_transcription TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Exports Table
-- =====================================================
CREATE TABLE exports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_exports_user_id ON exports(user_id);
CREATE INDEX idx_exports_conversation_id ON exports(conversation_id);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Grant access to authenticated users
-- =====================================================
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON exports TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
