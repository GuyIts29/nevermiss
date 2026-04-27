// PayMe payment integration — placeholder for v2
// When ready: integrate with https://payme.io API

export interface PayMePaymentRequest {
  amount: number
  currency: 'ILS'
  description: string
  buyerName: string
  buyerEmail: string
}

export async function createPaymentLink(_req: PayMePaymentRequest): Promise<string> {
  throw new Error('PayMe integration not yet enabled')
}
