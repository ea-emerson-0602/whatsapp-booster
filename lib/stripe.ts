import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 15,
    priceId: 'price_1TBMRYQ63KkKYlQQ85Yw82Q4', // replace after creating in Stripe dashboard
    features: [
      'Up to 500 contacts',
      'Unlimited auto-replies',
      'Scheduled broadcasts',
      'Basic analytics',
    ],
  },
}
