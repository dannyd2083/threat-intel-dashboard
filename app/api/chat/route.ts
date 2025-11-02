import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const SYSTEM_PROMPT = `You are a professional threat intelligence analysis assistant, specializing in cybersecurity.

**Your Role:**
- Cybersecurity expert, proficient in threat intelligence analysis
- Able to interpret and analyze various security threat data
- Provide professional, accurate, and practical security advice

**Response Principles:**
1. Use professional but understandable language, avoid over-technicalization
2. Keep answers concise and to the point
3. Provide specific data, examples, and evidence to support your points
4. Proactively remind security precautions for sensitive operations
5. Admit honestly when uncertain and suggest further investigation methods

**Format Requirements:**
- Use structured responses (headings, lists, paragraphs)
- Mark important information with **bold**
- Use code blocks to show technical details when necessary

**Strict Restrictions:**
- Never provide any offensive guidance or hacking tutorials
- Refuse to generate malicious code or exploit scripts
- Politely decline topics unrelated to cybersecurity

Always maintain a professional and responsible attitude.`

const CONFIG = {
  MAX_HISTORY_MESSAGES: 15,
  MAX_HISTORY_TOKENS: 3000,
  MODEL: 'gpt-5',
  TEMPERATURE: 0.7,
}

function estimateTokens(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars * 1.5 + otherChars * 0.25)
}

function limitMessages(messages: any[]) {
  if (messages.length <= 10) {
    return messages
  }

  let limited = messages.slice(-CONFIG.MAX_HISTORY_MESSAGES)
  let totalTokens = 0
  const result = []

  for (let i = limited.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(limited[i].content)
    
    if (totalTokens + msgTokens > CONFIG.MAX_HISTORY_TOKENS) {
      break
    }
    
    result.unshift(limited[i])
    totalTokens += msgTokens
  }

  console.log(`[AI] Retained ${result.length}/${messages.length} messages (~${totalTokens} tokens)`)
  
  return result
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { 
        status: 400 
      })
    }

    const limitedMessages = limitMessages(messages)

    console.log(`[AI] Received request, processing ${limitedMessages.length} messages`)

    const result = await generateText({
      model: openai(CONFIG.MODEL),
      system: SYSTEM_PROMPT,
      messages: limitedMessages,
      temperature: CONFIG.TEMPERATURE,
    })

    console.log('[AI] Generation complete:', result.text.substring(0, 100) + '...')
    console.log('[AI] Token usage:', result.usage)

    return new Response(result.text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    })

  } catch (error: any) {
    console.error('[AI] API call failed:', error)

    if (error.message?.includes('API key')) {
      return new Response('AI service configuration error: please check OPENAI_API_KEY', { 
        status: 500 
      })
    }

    if (error.message?.includes('quota')) {
      return new Response('AI service quota exceeded, please contact administrator', { 
        status: 429 
      })
    }

    return new Response('AI service temporarily unavailable, please try again later', { 
      status: 500 
    })
  }
}

