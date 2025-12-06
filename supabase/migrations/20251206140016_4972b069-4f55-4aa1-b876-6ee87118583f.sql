-- Insert default triggers for auto-generating tasks
INSERT INTO crm_triggers (name, description, trigger_event, conditions, actions, priority, is_active, cooldown_minutes, max_executions_per_contact)
VALUES 
(
  'Hot Lead Alert',
  'Create urgent follow-up task when intent score exceeds 70%',
  'score_update',
  '{"operator": "and", "conditions": [{"field": "intent_score", "operator": ">=", "value": 70}]}'::jsonb,
  '[{"type": "create_task", "config": {"title": "Follow up with hot lead", "description": "This contact has shown high purchase intent. Reach out immediately.", "priority": "urgent", "task_type": "follow_up", "suggested_channel": "phone"}}]'::jsonb,
  100,
  true,
  1440,
  3
),
(
  'Churn Risk Alert',
  'Create re-engagement task when churn risk exceeds 60%',
  'score_update',
  '{"operator": "and", "conditions": [{"field": "churn_risk", "operator": ">=", "value": 60}]}'::jsonb,
  '[{"type": "create_task", "config": {"title": "Re-engage at-risk customer", "description": "This customer shows high churn risk. Schedule a check-in call.", "priority": "high", "task_type": "retention", "suggested_channel": "phone"}}]'::jsonb,
  90,
  true,
  2880,
  2
),
(
  'New Lead Welcome',
  'Create welcome task for new contacts',
  'new_contact',
  '{"operator": "and", "conditions": [{"field": "lifecycle_stage", "operator": "==", "value": "lead"}]}'::jsonb,
  '[{"type": "create_task", "config": {"title": "Send welcome message", "description": "New lead added. Send a personalized welcome message.", "priority": "medium", "task_type": "outreach", "suggested_channel": "email"}}]'::jsonb,
  50,
  true,
  0,
  1
),
(
  'High Engagement Follow-up',
  'Schedule demo when engagement score is high',
  'score_update',
  '{"operator": "and", "conditions": [{"field": "engagement_score", "operator": ">=", "value": 80}]}'::jsonb,
  '[{"type": "create_task", "config": {"title": "Schedule product demo", "description": "Contact is highly engaged. Perfect time to schedule a demo.", "priority": "high", "task_type": "demo", "suggested_channel": "phone"}}]'::jsonb,
  80,
  true,
  4320,
  1
),
(
  'Negative Sentiment Alert',
  'Address concerns when negative sentiment is detected',
  'new_interaction',
  '{"operator": "and", "conditions": [{"field": "sentiment", "operator": "==", "value": "negative"}]}'::jsonb,
  '[{"type": "create_task", "config": {"title": "Address customer concerns", "description": "Negative sentiment detected in recent interaction. Review and respond.", "priority": "urgent", "task_type": "support", "suggested_channel": "phone"}}]'::jsonb,
  95,
  true,
  60,
  5
)
ON CONFLICT DO NOTHING;