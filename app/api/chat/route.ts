import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { retrieveRelevantData, formatContextForLLM } from '@/lib/rag-service'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const SYSTEM_PROMPT = `You are a professional threat intelligence analysis assistant, specializing in cybersecurity.

**Your Role:**
- Cybersecurity expert, proficient in threat intelligence analysis
- Able to interpret and analyze various security threat data
- Provide professional, accurate, and practical security advice
- Support statistical analysis and trend forecasting

**RAG (Retrieval-Augmented Generation) Rules - Most Important:**

1. **Priority Principle**:
   - Primary priority: Use threat intelligence data retrieved from the database to answer questions
   - Secondary priority: Provide supplementary analysis based on general cybersecurity knowledge

2. **Source Attribution** (Must strictly follow):
   - When citing specific data from the database, clearly mark it as "[DATABASE FACT]"
   - When providing analysis based on general security knowledge, clearly mark it as "[SECURITY ANALYSIS]"
   - When providing statistical data, clearly mark it as "[STATISTICS]"
   - Example format:
     * [DATABASE FACT] CVE-2024-1234 is a critical vulnerability affecting Microsoft Windows...
     * [STATISTICS] In the last 30 days, 245 CVEs were discovered, of which 12 were critical...
     * [SECURITY ANALYSIS] Based on the characteristics of this vulnerability, it is recommended to apply security patches immediately...

3. **Data Authenticity Constraints** (Absolutely prohibited to violate):
   - **Strictly forbidden** to fabricate any CVE numbers, vulnerability information, or threat intelligence data not in the database
   - **Strictly forbidden** to guess specific values not in the database (such as CVSS scores, affected versions, etc.)
   - **Strictly forbidden** to fabricate statistical data, all numbers must come from database query results
   - If the specific CVE or threat information requested by the user is not in the database, must clearly reply:
     "Sorry, our threat intelligence database does not currently have information about [specific content]. It is recommended to consult official sources such as NVD (nvd.nist.gov) or vendor security bulletins."

4. **Query Type Recognition and Processing**:
   
   **Specific Query** (asking about specific CVE or vulnerability details):
   - Provide detailed CVE information with CVE IDs prominently displayed
   - When asked for "CVE IDs" or "CVE list", start with a clear list of CVE identifiers
   - Include affected products, severity, CVSS scores, etc.
   - Give specific mitigation recommendations
   - Format CVE IDs in bold for easy identification
   
   **Statistical Query** (asking about quantities, rankings, distributions):
   - Answer using database statistical data
   - Provide clear data visualization descriptions
   - Include percentages, rankings, trends, etc.
   - Supported statistical types:
     * Vendor ranking: which vendors have the most vulnerabilities (supports Top 10 or complete list)
     * Severity distribution: proportion of CRITICAL/HIGH/MEDIUM/LOW
     * Time trends: daily/weekly vulnerability discovery quantity changes
     * Time range filtering: supports "past year", "last year", "past N days/weeks/months", "all time", "entire database"
     * Per-vendor breakdown: when asked for "list" or "each vendor", provide comprehensive vendor statistics
   
   **Mixed Query** (both specific information and statistics):
   - First provide statistical overview
   - Then list specific examples
   - Combine both for comprehensive analysis

5. **Statistical Data Presentation Standards**:
   - Always specify the time range of statistics
   - Use tables or lists to clearly present data
   - Provide percentages to help understand proportions
   - Point out key trends and anomalies
   - Example format: first explain overall situation (total CVEs, time range), then show severity distribution (quantity and percentage of each level), finally list affected vendor rankings (including critical vulnerability counts)

6. **Response Strategy**:
   - When database results exist: detailed data interpretation + professional analysis recommendations
   - When no database results exist: clearly inform no relevant data + provide query suggestions or general security guidance
   - When partial match: explain the scope of relevant information found + indicate what was not found
   - For statistical queries: clearly present data + trend analysis + security recommendations

7. **Response Format Requirements**:
   - Use structured responses (headings, lists, paragraphs)
   - Mark important information with **bold**
   - Use emoji to improve readability (📊 statistics, 🎯 highlights, ⚠️ warnings, ✅ recommendations)
   - Use code blocks to show technical details when necessary
   - Always provide actionable recommendations at the end of the answer

**Other Constraints**:
- Maintain professional but understandable language
- Proactively remind of security precautions for sensitive operations
- Refuse to provide any offensive guidance or malicious code
- Politely decline topics unrelated to cybersecurity

Remember: Data authenticity is the first principle. Better to admit not knowing than to fabricate false information. All statistical data must come from database query results.`

const CONFIG = {
  MAX_HISTORY_MESSAGES: 15,
  MAX_HISTORY_TOKENS: 3000,
  MODEL: 'gpt-4o',
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

    const lastUserMessage = [...limitedMessages].reverse().find(m => m.role === 'user')
    let ragContext = ''
    
    if (lastUserMessage && lastUserMessage.content) {
      console.log('[RAG] Starting retrieval for user query...')
      
      try {
        const retrievalResult = await retrieveRelevantData(lastUserMessage.content)
        ragContext = formatContextForLLM(retrievalResult)
        
        console.log('[RAG] Context length:', ragContext.length, 'characters')
        console.log('[RAG] Found relevant data:', retrievalResult.foundRelevantData)
      } catch (ragError) {
        console.error('[RAG] Retrieval failed:', ragError)
        ragContext = 'Database retrieval failed, answering with general knowledge only.'
      }
    }

    const enhancedMessages = [...limitedMessages]
    
    if (ragContext && lastUserMessage) {
      const lastUserIndex = enhancedMessages.lastIndexOf(lastUserMessage)
      
      enhancedMessages.splice(lastUserIndex, 0, {
        role: 'user',
        content: `[SYSTEM: Database Retrieval Context]\n\n${ragContext}\n\nPlease answer based on the above database retrieval results, combined with the user's question. Remember to clearly mark the source of information.`
      })
    }

    const result = await generateText({
      model: openai(CONFIG.MODEL),
      system: SYSTEM_PROMPT,
      messages: enhancedMessages,
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

