export type InputType = 'address' | 'tiktok' | 'instagram'
export type ContributionCategory = 'place' | 'food' | 'activity'
export type ItineraryItemType = 'food' | 'activity' | 'travel' | 'rest'
export type BudgetCategory = 'flights' | 'accommodation' | 'food' | 'activities' | 'transport' | 'other'

export type GeoLocation = {
  lat: number
  lng: number
  address: string
}

export type Contribution = {
  id: string
  user: string
  inputType: InputType
  rawInput: string
  name: string
  description?: string
  category: ContributionCategory
  location?: GeoLocation
  thumbnail?: string
  votes: string[]
  timestamp: number
}

export type ItineraryItem = {
  time: string
  name: string
  description: string
  type: ItineraryItemType
  location?: GeoLocation
  contributedBy: string[]
  tips?: string
}

export type ItineraryDay = {
  day: number
  date?: string
  theme?: string
  items: ItineraryItem[]
}

export type Accommodation = {
  id: string
  name: string
  address: string
  checkIn: string
  checkOut: string
  pricePerNight: number
  currency: string
  link?: string
  notes?: string
}

export type FlightInfo = {
  id: string
  airline: string
  flightNumber: string
  from: string
  to: string
  departure: string
  arrival: string
  price: number
  currency: string
  bookedBy: string
  confirmationCode?: string
}

export type BudgetItem = {
  id: string
  category: BudgetCategory
  label: string
  amount: number
  currency: string
  paidBy?: string
}

export type TripSheetActivity = {
  title: string
  details: string[]
}

export type TripSheetDay = {
  id: string
  date?: string
  dayOfWeek?: string
  city?: string
  accommodationId?: string
  activities: TripSheetActivity[]
  notes?: string
}

export type Trip = {
  id: string
  name: string
  country: string
  startDate?: string
  endDate?: string
  currentUser: string
  members: string[]
  contributions: Contribution[]
  itinerary?: ItineraryDay[]
  itineraryUpdatedAt?: number
  tripSheet?: TripSheetDay[]
  accommodation: Accommodation[]
  flights: FlightInfo[]
  budget: BudgetItem[]
  createdAt: number
}
