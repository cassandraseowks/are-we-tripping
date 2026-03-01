'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import CreateTripModal from './CreateTripModal'
import JoinTripModal from './JoinTripModal'
import TripsList from './TripsList'

export default function LandingHero() {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
        {/* Nav */}
        <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-base">✈</span>
            <span className="font-display italic font-bold text-stone-900 text-lg tracking-tight">
              Are We Tripping?
            </span>
          </div>
          <button
            onClick={() => setShowJoin(true)}
            className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            Join a trip →
          </button>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-20 pt-8">
          <div className="max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-stone-400 border border-stone-200 bg-white px-4 py-2 rounded-full mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Group travel planner
            </div>

            {/* Headline */}
            <h1 className="font-display text-6xl md:text-7xl text-stone-900 leading-[1.05] mb-6 tracking-tight">
              <span className="italic font-normal">Everyone's</span>
              <br />
              <span className="not-italic font-bold">dream trip,</span>
              <br />
              <span className="italic font-normal">one plan.</span>
            </h1>

            <p className="text-stone-400 text-lg leading-relaxed mb-10 max-w-md mx-auto font-light">
              Drop places, TikToks, or Instagram links. Your crew votes on their favourites.
              AI turns it all into a day-by-day itinerary.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowCreate(true)}
                className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium px-8 py-3 rounded-full transition-colors"
              >
                Start a trip
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 text-sm font-medium px-8 py-3 rounded-full transition-colors"
              >
                Join with a code
              </button>
            </div>

            {/* Previous trips */}
            <TripsList />
          </div>

          {/* How it works */}
          <div className="mt-24 max-w-3xl mx-auto w-full">
            <p className="font-display italic text-2xl text-stone-400 mb-8">How it works</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                {
                  num: '01',
                  title: 'Drop a wish',
                  desc: 'Add places via address, TikTok, or Instagram link. Names and photos are pulled in automatically.',
                },
                {
                  num: '02',
                  title: 'Vote together',
                  desc: 'Everyone upvotes their favourite picks. The best spots rise to the top.',
                },
                {
                  num: '03',
                  title: 'AI builds the plan',
                  desc: 'Claude clusters nearby spots, balances the day, and writes a detailed itinerary your group will love.',
                },
              ].map((f) => (
                <div
                  key={f.num}
                  className="bg-white rounded-2xl p-6 border border-stone-100 text-left"
                >
                  <p className="font-display italic text-3xl text-stone-200 mb-3 leading-none">{f.num}</p>
                  <h3 className="font-semibold text-stone-900 mb-1.5 text-sm">{f.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <CreateTripModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinTripModal open={showJoin} onClose={() => setShowJoin(false)} />
    </>
  )
}
