-- Add columns to voice_widget_calls for call tracking and analysis
ALTER TABLE voice_widget_calls ADD COLUMN ringg_call_id TEXT;
ALTER TABLE voice_widget_calls ADD COLUMN call_status TEXT DEFAULT 'initiated';
ALTER TABLE voice_widget_calls ADD COLUMN call_duration NUMERIC;
ALTER TABLE voice_widget_calls ADD COLUMN transcript JSONB;
ALTER TABLE voice_widget_calls ADD COLUMN platform_analysis JSONB;
ALTER TABLE voice_widget_calls ADD COLUMN client_analysis JSONB;
ALTER TABLE voice_widget_calls ADD COLUMN recording_url TEXT;
ALTER TABLE voice_widget_calls ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Create a trigger to update updated_at
CREATE TRIGGER update_voice_widget_calls_updated_at
  BEFORE UPDATE ON voice_widget_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add index for faster lookups by ringg_call_id
CREATE INDEX idx_voice_widget_calls_ringg_call_id ON voice_widget_calls(ringg_call_id);

-- Add policy for reading calls (for unauthenticated access to analysis page)
CREATE POLICY "Allow reading calls" ON voice_widget_calls 
  FOR SELECT USING (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE voice_widget_calls;