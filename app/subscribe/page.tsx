import { createClient } from '@/lib/supabase/server'
import SubscribeButton from './SubscribeButton'
import CancelButton from './CancelButton'

export default async function SubscribePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const isActive = subscription?.status === 'active'
  const isTrialing = subscription?.status === 'trialing'
  const isCanceled = subscription?.status === 'canceled'

  let trialDaysLeft = 0
  if (isTrialing && subscription?.trial_ends_at) {
    const trialEnd = new Date(subscription.trial_ends_at)
    trialDaysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Subscription</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: '2rem' }}>
        Manage your WA Booster plan
      </p>

      {isTrialing && (
        <div style={{ background: '#e6f1fb', border: '1px solid #85b7eb', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: 13, color: '#0c447c' }}>
          <p style={{ fontWeight: 500, marginBottom: 2 }}>
            🎉 Free trial active — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining
          </p>
          <p style={{ opacity: 0.8 }}>
            Your trial ends on {new Date(subscription.trial_ends_at).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}. After that, $15/month kicks in automatically.
          </p>
        </div>
      )}

      {isActive && (
        <div style={{ background: '#eaf3de', border: '1px solid #97c459', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: 13, color: '#27500a' }}>
          <p style={{ fontWeight: 500, marginBottom: 2 }}>✓ Active subscription</p>
          <p style={{ opacity: 0.8 }}>
            Next billing date: {subscription?.current_period_end
              ? new Date(subscription.current_period_end).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
              : 'monthly'}
          </p>
        </div>
      )}

      {isCanceled && (
        <div style={{ background: '#fcebeb', border: '1px solid #f09595', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: 13, color: '#a32d2d' }}>
          <p style={{ fontWeight: 500 }}>Subscription canceled</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 18 }}>Starter Plan</p>
            <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Everything you need to automate WhatsApp</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 24, fontWeight: 500 }}>$15</p>
            <p style={{ fontSize: 12, color: '#aaa' }}>per month</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f0f0ee', paddingTop: 16, marginBottom: 20 }}>
          {[
            '7-day free trial — no charge until trial ends',
            'Up to 500 contacts',
            'Unlimited keyword auto-replies',
            'Scheduled broadcasts',
            'Basic analytics dashboard',
            'WhatsApp webhook integration',
          ].map(feature => (
            <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#639922', fontSize: 16, flexShrink: 0 }}>✓</span>
              {feature}
            </div>
          ))}
        </div>

        {!subscription || isCanceled ? (
          <SubscribeButton userEmail={user!.email!} userId={user!.id} />
        ) : isTrialing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ textAlign: 'center', padding: '0.5rem', color: '#0c447c', fontSize: 14, fontWeight: 500 }}>
              🎉 Trial active — enjoy your free week!
            </div>
            <CancelButton subscriptionId={subscription.id} />
          </div>
        ) : isActive ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ textAlign: 'center', padding: '0.5rem', color: '#639922', fontSize: 14, fontWeight: 500 }}>
              ✓ You are on this plan
            </div>
            <CancelButton subscriptionId={subscription.id} />
          </div>
        ) : null}
      </div>

      <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>
        Secured by Paystack · Cancel anytime · Supports NGN and USD
      </p>
    </div>
  )
}
