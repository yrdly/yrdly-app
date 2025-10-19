-- Create typing status table for real-time typing indicators
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_typing_status_conversation ON typing_status(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_user ON typing_status(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_updated ON typing_status(updated_at);

-- Enable Row Level Security
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create policies for typing status
CREATE POLICY "Users can view typing status in their conversations" ON typing_status
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE participant_ids @> ARRAY[auth.uid()]
    )
  );

CREATE POLICY "Users can update their own typing status" ON typing_status
  FOR ALL USING (user_id = auth.uid());

-- Create function to clean up old typing status entries
CREATE OR REPLACE FUNCTION cleanup_old_typing_status()
RETURNS void AS $$
BEGIN
  -- Delete typing status entries older than 1 hour
  DELETE FROM typing_status 
  WHERE updated_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up old entries
CREATE OR REPLACE FUNCTION trigger_cleanup_typing_status()
RETURNS trigger AS $$
BEGIN
  -- Clean up old entries when new ones are inserted
  PERFORM cleanup_old_typing_status();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_typing_status_trigger
  AFTER INSERT ON typing_status
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_typing_status();
