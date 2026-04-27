// Claude AI integration — placeholder for v2
// When ready: npm install @anthropic-ai/sdk

export interface GreetingEnhancementRequest {
  draft: string
  contactName: string
  language: string
  tone: string
}

export async function enhanceGreeting(_req: GreetingEnhancementRequest): Promise<string> {
  throw new Error('Claude AI integration not yet enabled')
}
