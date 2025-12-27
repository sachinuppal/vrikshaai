# Vriksha AI CRM Knowledge Base

## Executive Summary

Vriksha AI CRM represents a paradigm shift from traditional Customer Relationship Management systems. Instead of passive data repositories that require human operators to extract insights and take action, Vriksha AI CRM deploys **one dedicated AI agent per contact** that autonomously learns, predicts, and acts to **maximize Customer Lifetime Value (LTV)**.

### Core Philosophy

> "Every contact deserves their own AI agent—one that remembers everything, predicts what's next, and takes action at the perfect moment."

Traditional CRMs are databases with dashboards. Vriksha AI CRM is an army of intelligent agents, each dedicated to nurturing a single relationship toward maximum value.

---

## 1. The One-AI-Agent-Per-Contact Architecture

### What This Means

Each contact in your CRM gets assigned a dedicated AI agent that:

1. **Learns continuously** from every interaction (calls, emails, WhatsApp, SMS)
2. **Computes real-time scores** using machine learning algorithms
3. **Predicts future behaviors** with confidence levels
4. **Executes automated actions** through agentic flows
5. **Optimizes its own strategies** based on outcomes

### How It Differs from Traditional CRMs

| Traditional CRM | Vriksha AI CRM |
|-----------------|----------------|
| Stores data passively | Acts on data autonomously |
| Requires manual analysis | Provides predictive insights |
| Rule-based automation | ML-driven intelligent flows |
| Same treatment for all contacts | Personalized AI agent per contact |
| Historical reporting | Future-predictive timeline |
| Human-initiated actions | AI-initiated optimal actions |

---

## 2. The 5-Pillar ML Scoring Engine

Every contact is continuously scored across five dimensions using machine learning algorithms. These scores drive all automation and predictions.

### 2.1 Intent Score (0-100)

**What it measures:** How likely is this contact to make a purchase/convert?

**Factors computed:**
- Recent interaction frequency and recency
- Sentiment analysis of conversations
- Purchase intent signals detected in transcripts
- Budget mentions (keywords: "budget", "lakhs", "crores", "₹")
- Timeline mentions (keywords: "urgent", "this week", "immediately")
- Explicit interest expressions

**Algorithm highlights:**
```
Base Score = 30
+ Recent positive interactions (up to +20)
+ Sentiment boost (positive = +15, neutral = +5)
+ Purchase signals detected (+25)
+ Budget mentioned (+20)
+ Timeline urgency (+20)
```

### 2.2 Engagement Score (0-100)

**What it measures:** How actively is this contact engaging with your brand?

**Factors computed:**
- Total interaction count
- Recency of last interaction (decay function)
- Response rate to outreach
- Channel diversity (multi-channel = higher engagement)

**Algorithm highlights:**
```
Base Score = min(total_interactions × 5, 40)
+ Recency bonus (last 24h = +25, last 7d = +15, last 30d = +5)
+ Response rate × 20
+ Channel diversity bonus (up to +15)
```

### 2.3 Urgency Score (0-100)

**What it measures:** How quickly does this contact need attention?

**Factors computed:**
- Volume of recent interactions
- Number of channels used
- Inbound vs outbound ratio (high inbound = urgent)
- Timeline keywords in conversations

**Algorithm highlights:**
```
Base Score = min(recent_interactions × 8, 30)
+ Multi-channel contact (+20)
+ High inbound ratio (+25)
+ Timeline urgency keywords (+25)
```

### 2.4 Churn Risk (0-100)

**What it measures:** How likely is this contact to disengage or leave?

**Factors computed:**
- Days since last interaction
- Recent negative sentiment
- Complaint frequency
- Declining engagement trend

**Algorithm highlights:**
```
Base Score from inactivity:
  - 30+ days = 40 base
  - 14-30 days = 25 base
  - 7-14 days = 10 base
  - <7 days = 0 base
+ Negative sentiment (+30)
+ Complaint ratio × 40
- Engagement score offset (−engagement × 0.2)
```

### 2.5 LTV Prediction (₹)

**What it measures:** Estimated lifetime value of this customer relationship.

**Factors computed:**
- Stated or detected budget
- User type multiplier (Enterprise = 3x, Business = 2x, Individual = 1x)
- Industry multiplier (Finance = 1.5x, Healthcare = 1.3x, etc.)
- Historical transaction data

**Algorithm highlights:**
```
Base LTV = stated_budget OR default (₹50,000)
× User Type Multiplier
× Industry Multiplier
= Predicted LTV
```

---

## 3. The Predictive Timeline

The Predictive Timeline is the visual manifestation of each contact's AI agent's understanding. It shows three temporal dimensions:

### 3.1 Past (Historical Interactions)

Every touchpoint is recorded with:
- Channel (Voice, WhatsApp, Email, SMS, Web)
- Direction (Inbound vs Outbound)
- Sentiment analysis
- Key entities extracted
- AI-generated summary

### 3.2 Present (Current State)

Real-time dashboard showing:
- All 5 ML scores with trend indicators
- Active automation flows
- Pending tasks
- Current lifecycle stage
- Tags and segments

### 3.3 Future (AI Predictions)

AI-generated predictions with:
- **Action type** (Call, WhatsApp, Email, Meeting)
- **Optimal timing** (specific date/time)
- **Confidence level** (percentage)
- **Reasoning** (why this action is recommended)
- **One-click execution** (immediately trigger the action)

Example predictions:
- "Schedule follow-up call in 2 days" (87% confidence)
- "Send WhatsApp reminder about brochure" (92% confidence)
- "High churn risk - immediate intervention needed" (78% confidence)

---

## 4. Agentic Flow Builder

The Agentic Flow Builder allows you to create complex automation workflows using natural language or visual drag-and-drop.

### 4.1 AI-Powered Flow Generation

Simply describe what you want:
> "Create a flow that qualifies leads using BANT methodology, schedules appointments for qualified leads, and nurtures unqualified ones with educational content."

The AI will generate a complete flow with:
- Trigger conditions
- Conditional routing
- Channel actions
- AI conversation nodes
- Error handling
- Endpoint actions

### 4.2 Node Types Reference

#### Triggers (Flow Entry Points)
| Node | Description |
|------|-------------|
| `api_trigger` | External API webhook trigger |
| `schedule_trigger` | Time-based recurring trigger |
| `event_trigger` | Internal event (score change, interaction, etc.) |

#### Routers (Decision Points)
| Node | Description |
|------|-------------|
| `channel_router` | Route based on preferred channel |
| `conditional` | If/else logic based on any condition |
| `score_router` | Route based on ML score thresholds |
| `intent_classifier` | AI-powered intent classification |

#### Channel Actions (Outreach)
| Node | Description |
|------|-------------|
| `voice_call` | Initiate AI voice call |
| `sms_message` | Send SMS message |
| `whatsapp_message` | Send WhatsApp message |
| `email_action` | Send email |

#### AI Nodes (Intelligence)
| Node | Description |
|------|-------------|
| `ai_conversation` | Multi-turn AI conversation |
| `ai_action` | AI decision-making action |
| `ai_classify` | Classify input into categories |
| `ai_extract` | Extract entities from text |
| `ai_summarize` | Summarize conversation |

#### Data Operations
| Node | Description |
|------|-------------|
| `update_contact` | Update contact fields |
| `create_task` | Create a follow-up task |
| `add_tag` | Add tags to contact |
| `update_score` | Manually adjust scores |
| `log_interaction` | Record an interaction |

#### Utilities
| Node | Description |
|------|-------------|
| `delay` | Wait for specified duration |
| `counter` | Increment/check counters |
| `http_request` | Call external API |
| `webhook` | Send webhook notification |

#### Endpoints (Flow Exit Points)
| Node | Description |
|------|-------------|
| `end_conversation` | End with disposition |
| `queue_transfer` | Transfer to human agent |
| `escalate` | Escalate to supervisor |

### 4.3 Flow Templates

Pre-built templates for common use cases:

1. **Lead Qualification (BANT)**
   - Budget → Authority → Need → Timeline
   - Auto-qualify or nurture based on responses

2. **Appointment Booking**
   - Check availability
   - Propose times
   - Confirm and send reminders

3. **Payment Reminder**
   - Multi-stage reminders (gentle → firm → urgent)
   - Payment link generation
   - Confirmation handling

4. **Re-engagement Campaign**
   - Identify dormant contacts
   - Personalized outreach
   - Interest recapture

5. **Post-Sale Nurturing**
   - Thank you message
   - Onboarding assistance
   - Upsell/cross-sell triggers

---

## 5. Data Model Architecture

### Core Tables

#### crm_contacts
The central entity representing each contact.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| full_name | TEXT | Contact's name |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| company_name | TEXT | Associated company |
| intent_score | INT | 0-100 purchase intent |
| engagement_score | INT | 0-100 engagement level |
| urgency_score | INT | 0-100 urgency level |
| churn_risk | INT | 0-100 churn probability |
| ltv_prediction | DECIMAL | Predicted lifetime value |
| lifecycle_stage | TEXT | lead/prospect/customer/churned |
| primary_industry | TEXT | Industry classification |
| tags | TEXT[] | Array of tags |
| preferred_channel | TEXT | Best channel to reach |
| optimal_contact_time | TEXT | Best time to contact |

#### crm_interactions
Every touchpoint with a contact.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| contact_id | UUID | Reference to contact |
| channel | TEXT | voice/whatsapp/email/sms/web |
| direction | TEXT | inbound/outbound |
| summary | TEXT | AI-generated summary |
| sentiment | TEXT | positive/neutral/negative |
| sentiment_score | DECIMAL | -1 to +1 sentiment |
| intent_detected | TEXT[] | Detected intents |
| entities_extracted | JSONB | Extracted entities |
| recording_url | TEXT | Call recording if applicable |

#### crm_variables
AI-extracted information from conversations.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| contact_id | UUID | Reference to contact |
| variable_name | TEXT | e.g., "budget", "timeline" |
| variable_value | TEXT | Extracted value |
| confidence | DECIMAL | Extraction confidence |
| source_channel | TEXT | Where it was extracted |
| is_current | BOOLEAN | Latest value flag |

#### crm_agentic_flows
Flow definitions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | TEXT | Flow name |
| description | TEXT | Flow description |
| flow_json | JSONB | Complete flow definition |
| global_prompt | TEXT | AI context for the flow |
| status | TEXT | draft/published/archived |

#### crm_flow_executions
Execution history for audit and optimization.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| flow_id | UUID | Reference to flow |
| contact_id | UUID | Contact being processed |
| status | TEXT | running/completed/failed |
| nodes_executed | JSONB | Execution trace |
| triggered_by | TEXT | manual/automated/api |

---

## 6. Industry Applications

### 6.1 Real Estate

**Use Cases:**
- BANT qualification for property inquiries
- Automated site visit scheduling
- Allied industry triggers (home loan, interior design, moving services)
- Post-sale documentation follow-up

**Key Flows:**
1. Property Inquiry → Qualification → Site Visit Booking
2. Site Visit Completed → Loan Assistance Offer
3. Booking Done → Interior Designer Introduction

### 6.2 Financial Services

**Use Cases:**
- KYC document collection
- Risk-based product recommendations
- Policy renewal reminders
- Claims status updates

**Key Flows:**
1. Lead → KYC Collection → Product Matching
2. Policy Expiry Approaching → Renewal Campaign
3. Claim Filed → Status Updates → Resolution

### 6.3 Healthcare

**Use Cases:**
- Appointment booking and reminders
- Post-consultation follow-up
- Prescription refill reminders
- Health check-up campaigns

**Key Flows:**
1. Inquiry → Appointment Booking → Reminder Sequence
2. Consultation Done → Prescription Follow-up
3. Annual Check-up Due → Campaign Trigger

### 6.4 E-commerce

**Use Cases:**
- Abandoned cart recovery
- Order status updates
- Return/refund processing
- Loyalty program engagement

**Key Flows:**
1. Cart Abandoned → Recovery Sequence (WhatsApp → SMS → Call)
2. Order Placed → Shipping Updates → Delivery Confirmation
3. High LTV Customer → Exclusive Offer Trigger

### 6.5 Education

**Use Cases:**
- Admission inquiry handling
- Course counseling
- Fee payment reminders
- Alumni engagement

**Key Flows:**
1. Inquiry → Counseling Session → Application Assistance
2. Enrolled → Onboarding → Regular Check-ins
3. Course Completion → Placement Assistance → Alumni Network

---

## 7. Integration Capabilities

### 7.1 Native Integrations

| Platform | Capabilities |
|----------|--------------|
| WhatsApp Business | Send/receive messages, templates, media |
| Voice (Ringg) | AI voice calls, recording, transcription |
| Email SMTP | Transactional and marketing emails |
| SMS Gateways | Multi-provider SMS delivery |

### 7.2 API & Webhooks

**Inbound:**
- REST API for contact creation/updates
- Webhook receivers for external events
- Bulk import capabilities

**Outbound:**
- Webhook notifications for all events
- Real-time score change notifications
- Flow execution callbacks

### 7.3 Enterprise Connectors

- Salesforce (bidirectional sync)
- HubSpot (contact sync)
- Zoho CRM (import/export)
- Custom ERP integrations

---

## 8. Best Practices for LTV Maximization

### 8.1 Score-Based Segmentation

Create dynamic segments based on score combinations:

| Segment | Criteria | Action |
|---------|----------|--------|
| Hot Leads | Intent > 70, Urgency > 50 | Immediate call |
| Nurture Pool | Intent 30-70, Engagement > 40 | Educational drip |
| At Risk | Churn Risk > 60 | Retention campaign |
| Champions | LTV > ₹5L, Engagement > 80 | VIP treatment |

### 8.2 Optimal Timing

Leverage the AI's optimal contact time predictions:
- Schedule outreach during predicted high-response windows
- Avoid contact during low-engagement periods
- Use timezone-aware scheduling

### 8.3 Channel Orchestration

Use the right channel for the right purpose:
- **Voice:** Complex discussions, objection handling, closing
- **WhatsApp:** Quick updates, document sharing, reminders
- **Email:** Detailed information, formal communications
- **SMS:** Urgent alerts, OTPs, brief reminders

### 8.4 Continuous Learning

The AI agent improves over time:
- Every interaction teaches it about the contact's preferences
- Successful actions reinforce effective strategies
- Failed attempts inform future approach adjustments

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Agentic Flow** | An AI-driven automation workflow that can make decisions |
| **BANT** | Budget, Authority, Need, Timeline - qualification framework |
| **Churn Risk** | Probability of a contact disengaging |
| **Contact 360** | Complete view of a contact including all interactions and scores |
| **Engagement Score** | Measure of how actively a contact interacts |
| **Intent Score** | Measure of purchase/conversion likelihood |
| **LTV** | Lifetime Value - total predicted revenue from a contact |
| **Predictive Timeline** | AI-generated future action recommendations |
| **Score Router** | Flow node that routes based on ML scores |
| **Urgency Score** | Measure of how quickly a contact needs attention |

---

## 10. Getting Started

### Quick Start Checklist

1. ✅ Import your contacts (CSV or API)
2. ✅ Configure your channels (WhatsApp, Voice, Email)
3. ✅ Create your first flow using templates
4. ✅ Assign flows to contacts or segments
5. ✅ Monitor the dashboard for insights
6. ✅ Review AI predictions and take action
7. ✅ Analyze flow performance and optimize

### Support Resources

- **Documentation:** `/crm/docs`
- **Flow Builder:** `/crm/flow-builder`
- **Dashboard:** `/crm/dashboard`
- **Settings:** `/crm/settings`

---

*Last Updated: December 2024*
*Version: 1.0*
