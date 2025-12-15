-- Drop existing restrictive admin-only policies for agent_scripts
DROP POLICY IF EXISTS "Admins can manage scripts" ON agent_scripts;
DROP POLICY IF EXISTS "Anyone can view active scripts" ON agent_scripts;

-- Create new policies for agent_scripts that allow authenticated users
CREATE POLICY "Users can create own scripts"
ON agent_scripts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own scripts or active"
ON agent_scripts FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR status = 'active' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own scripts"
ON agent_scripts FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own scripts"
ON agent_scripts FOR DELETE
TO authenticated
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Drop existing restrictive admin-only policies for agent_script_versions
DROP POLICY IF EXISTS "Admins can manage script versions" ON agent_script_versions;
DROP POLICY IF EXISTS "Admins can view script versions" ON agent_script_versions;

-- Create new policies for agent_script_versions
CREATE POLICY "Users can create script versions"
ON agent_script_versions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agent_scripts 
    WHERE id = script_id 
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can view script versions"
ON agent_script_versions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agent_scripts 
    WHERE id = script_id 
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Drop existing restrictive admin-only policies for script_chat_messages
DROP POLICY IF EXISTS "Admins can manage chat messages" ON script_chat_messages;
DROP POLICY IF EXISTS "Admins can view chat messages" ON script_chat_messages;

-- Create new policies for script_chat_messages
CREATE POLICY "Users can create chat messages"
ON script_chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  script_id IS NULL OR EXISTS (
    SELECT 1 FROM agent_scripts 
    WHERE id = script_id 
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can view chat messages"
ON script_chat_messages FOR SELECT
TO authenticated
USING (
  script_id IS NULL OR EXISTS (
    SELECT 1 FROM agent_scripts 
    WHERE id = script_id 
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);