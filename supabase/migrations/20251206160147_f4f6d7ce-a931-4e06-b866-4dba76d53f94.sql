-- Create function to assign default published flows to new contacts
CREATE OR REPLACE FUNCTION public.assign_default_flows_to_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert all published flows as contact_flows for the new contact
  INSERT INTO crm_contact_flows (contact_id, flow_id, is_enabled, priority)
  SELECT 
    NEW.id, 
    id, 
    true, 
    (ROW_NUMBER() OVER (ORDER BY created_at))::integer - 1
  FROM crm_agentic_flows
  WHERE status = 'published';
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign flows on contact creation
DROP TRIGGER IF EXISTS auto_assign_flows_to_contact ON crm_contacts;
CREATE TRIGGER auto_assign_flows_to_contact
AFTER INSERT ON crm_contacts
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_flows_to_contact();