-- Enable REPLICA IDENTITY FULL for real-time updates
ALTER TABLE crm_contacts REPLICA IDENTITY FULL;
ALTER TABLE crm_interactions REPLICA IDENTITY FULL;
ALTER TABLE crm_tasks REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE crm_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_tasks;