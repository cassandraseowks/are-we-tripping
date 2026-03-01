import { NextResponse } from 'next/server'

interface OEmbedResponse {
  title?: string
  thumbnail_url?: string
  author_name?: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Try TikTok oEmbed
  if (url.includes('tiktok.com')) {
    try {
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      if (res.ok) {
        const data = (await res.json()) as OEmbedResponse
        return NextResponse.json({
          title: data.title ?? '',
          thumbnail_url: data.thumbnail_url ?? null,
          author_name: data.author_name ?? null,
        })
      }
    } catch {
      // Fall through
    }
  }

  // Try Instagram oEmbed (public endpoint, no auth required for public posts)
  if (url.includes('instagram.com')) {
    try {
      const res = await fetch(
        `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TravelPlanner/1.0)',
          },
        }
      )
      if (res.ok) {
        const data = (await res.json()) as OEmbedResponse
        return NextResponse.json({
          title: data.title ?? '',
          thumbnail_url: data.thumbnail_url ?? null,
          author_name: data.author_name ?? null,
        })
      }
    } catch {
      // Fall through
    }
  }

  // Return null meta — user will fill in manually
  return NextResponse.json({
    title: '',
    thumbnail_url: null,
    author_name: null,
  })
}
