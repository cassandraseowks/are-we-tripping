import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface ExtractResult {
  name: string
  description: string
  category: 'place' | 'food' | 'activity'
  locationHint: string
}

export async function POST(req: Request) {
  try {
    const { caption, author } = (await req.json()) as { caption: string; author?: string }

    if (!caption?.trim()) {
      return NextResponse.json({ name: '', description: '', category: 'place', locationHint: '' })
    }

    const prompt = `You are analysing a TikTok or Instagram video caption to extract travel wishlist info.

Caption: "${caption}"
${author ? `Creator: @${author}` : ''}

Extract the following and return ONLY valid JSON:
{
  "name": "The specific place, restaurant, or activity name shown (short, 3-6 words max)",
  "description": "1-2 sentence summary of what this video is about and why it's worth visiting",
  "category": "food | place | activity",
  "locationHint": "City, neighbourhood, or country if mentioned — empty string if not clear"
}

Rules:
- name: be specific (e.g. "Ichiran Ramen Shibuya", not "a ramen place")
- description: focus on what makes it special or worth visiting
- category: food = restaurants/cafes/street food, place = landmarks/attractions/scenery, activity = experiences/tours/things to do
- If you can't determine something clearly, use sensible defaults`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const parsed = JSON.parse(cleaned) as ExtractResult

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('extract-social error:', err)
    return NextResponse.json({ name: '', description: '', category: 'place', locationHint: '' })
  }
}
