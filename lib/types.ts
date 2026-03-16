// Mirrors your Supabase tables exactly

export type Tag = 'Lead' | 'Paid' | 'Pending'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed'
export type BroadcastStatus = 'scheduled' | 'sending' | 'sent' | 'failed'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled'

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string
  tag: Tag
  notes?: string
  last_message_at?: string
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  customer_id: string
  body: string
  direction: MessageDirection
  status: MessageStatus
  twilio_sid?: string
  created_at: string
  // joined
  customer?: Customer
}

export interface Template {
  id: string
  user_id: string
  name: string
  trigger_keywords: string[]
  reply_body: string
  is_active: boolean
  created_at: string
}

export interface Broadcast {
  id: string
  user_id: string
  name: string
  message_body: string
  scheduled_at: string
  target_tags?: Tag[]
  status: BroadcastStatus
  sent_count: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: SubscriptionStatus
  plan: string
  current_period_end?: string
  created_at: string
}
