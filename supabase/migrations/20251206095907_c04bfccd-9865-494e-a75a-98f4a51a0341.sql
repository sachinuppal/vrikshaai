-- Add user_id column to voice_widget_calls for linking authenticated users
ALTER TABLE voice_widget_calls 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_voice_widget_calls_user_id ON voice_widget_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_widget_calls_full_phone ON voice_widget_calls(full_phone);

-- Update RLS policies to allow authenticated users to view their own calls
-- Drop the existing admin-only policy first
DROP POLICY IF EXISTS "Admins can view all calls" ON voice_widget_calls;

-- Create policy for admins to view all calls
CREATE POLICY "Admins can view all calls" 
ON voice_widget_calls 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create policy for users to view their own calls (by user_id or phone match)
CREATE POLICY "Users can view their own calls" 
ON voice_widget_calls 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR full_phone = (
    SELECT phone FROM profiles WHERE id = auth.uid()
  )
);

-- Allow authenticated users to update their own calls (for linking)
CREATE POLICY "Users can update their own calls by phone" 
ON voice_widget_calls 
FOR UPDATE 
TO authenticated
USING (
  full_phone = (
    SELECT phone FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  full_phone = (
    SELECT phone FROM profiles WHERE id = auth.uid()
  )
);