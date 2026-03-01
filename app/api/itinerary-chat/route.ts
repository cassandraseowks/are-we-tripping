import Anthropic from '@anthropic-ai/sdk'
import type { Contribution, ItineraryDay, TripSheetDay } from '@/lib/types'

const client = new Anthropic()

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
  contributions: Contribution[]
  country: string
  tripName: string
  startDate?: string
  endDate?: string
  days: number
  members: string[]
  existingItinerary?: ItineraryDay[]
  existingTripSheet?: TripSheetDay[]
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody
    const { messages, contributions, country, tripName, startDate, endDate, days, members, existingItinerary, existingTripSheet } = body

    const contributionList =
      contributions.length > 0
        ? contributions
            .map((c) => {
              const loc = c.location?.address ? ` at ${c.location.address}` : ''
              const votes =
                c.votes.length > 0
                  ? ` (${c.votes.length} vote${c.votes.length !== 1 ? 's' : ''})`
                  : ''
              return `• ${c.name}${loc} [${c.category}] — added by ${c.user}${votes}`
            })
            .join('\n')
        : 'No wishlist items added yet.'

    const dateContext =
      startDate && endDate ? `${startDate} to ${endDate} (${days} days)` : `${days} days`

    const itineraryJsonFormat = `\`\`\`json
{
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "Short evocative theme for the day",
      "items": [
        {
          "time": "09:00",
          "name": "Place or activity name",
          "description": "1–2 sentence description of what to do/expect",
          "type": "food|activity|travel|rest",
          "contributedBy": ["member name if this came from the wishlist, else empty array"],
          "tips": "Optional practical tip (omit if nothing useful to add)"
        }
      ]
    }
  ]
}
\`\`\`

IMPORTANT: You MUST always output the trip sheet block every time you output an itinerary. Immediately after the itinerary JSON block, with no prose between them, output the trip sheet in this exact format:
\`\`\`tripsheet
{
  "tripSheet": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "Monday",
      "city": "City name — use 'City A → City B' only if the group physically travels between cities that day",
      "activities": [
        {
          "title": "Short label e.g. 'Lunch at Ichiran Ramen' or 'TeamLab Planets'",
          "details": ["Practical tip or note", "another if needed"]
        }
      ],
      "notes": "Any day-level notes, e.g. 'Book tickets in advance'. Empty string if none."
    }
  ]
}
\`\`\`

Then end with exactly this sentence on its own line: "I've also drafted a Trip Sheet summary — shall I push it to your Trip Sheet tab?"

IMPORTANT: If the user's message is simply confirming or acknowledging a push (e.g. "yes", "push it", "go ahead", "looks good", "ok"), respond with one short sentence only (e.g. "Great, pushed!") and do NOT output any JSON blocks.`

    const tripSheetContext = existingTripSheet && existingTripSheet.length > 0
      ? `\n\nEXISTING TRIP SHEET:\n${JSON.stringify(existingTripSheet.map(d => ({
          date: d.date,
          dayOfWeek: d.dayOfWeek,
          city: d.city,
          activities: d.activities.map(a => ({ title: a.title, details: a.details })),
          notes: d.notes,
        })), null, 2)}\n\nYou can reference, update, add to, or clarify any part of this Trip Sheet based on the conversation. If the user asks you to change something specific (e.g. swap a city, add an activity, fill in a blank), output an updated tripsheet JSON block with the FULL sheet (all days, not just changed ones), then ask if they'd like to push the update.`
      : ''

    const baseContext = `TRIP DETAILS:
- Trip: ${tripName}
- Destination: ${country}
- Duration: ${dateContext}
- Travellers: ${members.join(', ')} (${members.length} ${members.length === 1 ? 'person' : 'people'})

WISHLIST ITEMS:
${contributionList}${tripSheetContext}`

    const systemPrompt = existingItinerary
      ? `You are an expert travel planner helping a group modify their existing trip itinerary.

${baseContext}

CURRENT ITINERARY (modify this):
${JSON.stringify({ itinerary: existingItinerary }, null, 2)}

The user wants a change. Output a brief acknowledgement (1–2 sentences), then the FULL updated itinerary JSON block (all days, not just changed days), then a short closing note (1 sentence).

Output the JSON in exactly this format:
${itineraryJsonFormat}

STYLE NOTES:
- Be brief and direct — the itinerary is the main output.
- Don't use heavy markdown (no headers with #, no excessive bold).
- Dates: if the trip has specific dates, use them. Otherwise omit the "date" field.`
      : `You are a warm, expert travel planner helping a group design their trip itinerary.

${baseContext}

YOUR APPROACH:
1. When the conversation starts, greet the group and ask 2–3 targeted questions to understand their preferences — things like travel pace (relaxed vs packed), transport (car vs public transit), cuisine preferences, accessibility needs, or which wishlist items they're most excited about. Keep it short and friendly.
2. After they respond, ask one quick follow-up if something critical is missing. Otherwise, start building the plan.
3. Create a detailed day-by-day itinerary that incorporates as many wishlist items as possible. Group geographically nearby spots on the same day. Include meals, realistic timings, and travel transitions.

WHEN YOU'RE READY TO OUTPUT THE ITINERARY:
Write a brief intro, then embed the itinerary as a JSON code block, then add a short closing note with any tips.

Output the JSON in exactly this format:
${itineraryJsonFormat}

STYLE NOTES:
- Be conversational and enthusiastic, not robotic.
- Don't use heavy markdown (no headers with #, no excessive bold).
- Keep conversational responses concise — 3–5 sentences for questions, a brief paragraph for the intro/outro around the itinerary.
- Dates: if the trip has specific dates, use them. Otherwise omit the "date" field.`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 10000,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('itinerary-chat error:', err)
    return new Response('Something went wrong', { status: 500 })
  }
}
