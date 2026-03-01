import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Contribution, ItineraryDay } from '@/lib/types'

const client = new Anthropic()

interface RequestBody {
  contributions: Contribution[]
  country: string
  startDate?: string
  endDate?: string
  days: number
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody
    const { contributions, country, startDate, endDate, days } = body

    const contributionList = contributions
      .map((c) => {
        const loc = c.location?.address ? ` (${c.location.address})` : ''
        return `- ${c.name}${loc} [${c.category}] — added by ${c.user}`
      })
      .join('\n')

    const dateContext =
      startDate && endDate
        ? `The trip runs from ${startDate} to ${endDate}.`
        : `Plan for ${days} days.`

    const userPrompt = `Plan a ${days}-day trip to ${country}. ${dateContext}

The group wants to visit:
${contributionList}

Create a logical day-by-day itinerary that:
- Incorporates as many of these wishes as possible
- Groups nearby locations on the same day
- Includes breakfast, lunch, and dinner slots
- Adds travel time between distant spots
- Suggests realistic timings

Return ONLY valid JSON in this exact format:
{
  "itinerary": [
    {
      "day": 1,
      "date": "optional ISO date string",
      "theme": "short theme for the day e.g. 'Temples & Street Food'",
      "items": [
        {
          "time": "09:00",
          "name": "Place or activity name",
          "description": "1-2 sentence description",
          "type": "food | activity | travel | rest",
          "contributedBy": ["member name if from wishlist, else empty array"],
          "tips": "optional practical tip"
        }
      ]
    }
  ]
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'You are an expert travel planner. Return only valid JSON, no markdown, no commentary.',
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const parsed = JSON.parse(cleaned) as { itinerary: ItineraryDay[] }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('generate-itinerary error:', err)
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    )
  }
}
