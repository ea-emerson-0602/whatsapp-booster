import twilio from 'twilio'

// Twilio client — only used server-side in API routes
export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_NUMBER!

// Send a WhatsApp message to a phone number
// phone should be in format: +2348012345678
export async function sendWhatsAppMessage(to: string, body: string) {
  const message = await twilioClient.messages.create({
    from: WHATSAPP_FROM,
    to: `whatsapp:${to}`,
    body,
  })
  return message
}

// Validate that a webhook request genuinely came from Twilio
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
) {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  )
}
