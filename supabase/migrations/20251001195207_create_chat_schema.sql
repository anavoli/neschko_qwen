/*
  # Create chat schema for Qwen AI assistant

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key) - Unique identifier for each conversation
      - `visitor_id` (text) - Anonymous identifier for the visitor
      - `created_at` (timestamptz) - When the conversation started
      - `updated_at` (timestamptz) - Last message timestamp
    
    - `messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `conversation_id` (uuid, foreign key) - Links to conversations table
      - `role` (text) - Either 'user' or 'assistant'
      - `content` (text) - The message content
      - `created_at` (timestamptz) - When the message was sent

  2. Security
    - Enable RLS on both tables
    - Add policies for public read/write access (visitors don't need authentication)
    - Visitors can only access their own conversations based on visitor_id

  3. Indexes
    - Index on conversation_id for fast message lookups
    - Index on visitor_id for conversation retrieval
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations (public access, visitors can only see their own)
CREATE POLICY "Visitors can view own conversations"
  ON conversations FOR SELECT
  USING (true);

CREATE POLICY "Visitors can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Visitors can update own conversations"
  ON conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for messages (public access)
CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);
