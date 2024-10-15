'use client'

import React from 'react'
import { use } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, ArrowLeft, Eye, History, Calendar, MapPin, Plus, BarChart2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import config from '@/config'

const ImageFile = 'files/imgs/events/placeholder.svg'

type Event = {
  id: string
  name: string
  date: string
  location: string
  status: 'commencing' | 'concluded' | 'scheduled' | 'cancelled'
  view: 'published' | 'staged'
  image: string
  description: string
}

const events: Event[] = [
  {
    id: '1',
    name: 'Tech Conference 2023',
    date: '2023-09-15T09:00:00',
    location: 'San Francisco Convention Center, CA',
    status: 'scheduled',
    view: 'published',
    image: `${config.api.host}${ImageFile}?height=200&width=200`,
    description: 'Annual tech conference featuring the latest in AI and machine learning.'
  },
  {
    id: '2',
    name: 'Annual Charity Gala',
    date: '2023-08-20T19:00:00',
    location: 'Ritz-Carlton, New York, NY',
    status: 'commencing',
    view: 'published',
    image: `${config.api.host}${ImageFile}?height=200&width=200`,
    description: 'Elegant evening supporting local charities with dinner and silent auction.'
  },
  {
    id: '3',
    name: 'Summer Music Festival',
    date: '2023-07-01T12:00:00',
    location: 'Griffith Park, Los Angeles, CA',
    status: 'concluded',
    view: 'published',
    image: `${config.api.host}${ImageFile}?height=200&width=200`,
    description: 'Three-day outdoor music festival featuring top artists across multiple genres.'
  },
  {
    id: '4',
    name: 'AI Workshop',
    date: '2023-10-05T10:00:00',
    location: 'MIT Campus, Boston, MA',
    status: 'scheduled',
    view: 'staged',
    image: `${config.api.host}${ImageFile}?height=200&width=200`,
    description: 'Hands-on workshop exploring practical applications of artificial intelligence.'
  },
  {
    id: '5',
    name: 'Startup Pitch Night',
    date: '2023-06-30T18:00:00',
    location: 'Capital Factory, Austin, TX',
    status: 'cancelled',
    view: 'staged',
    image: `${config.api.host}${ImageFile}?height=200&width=200`,
    description: 'Evening showcase of innovative startups pitching to potential investors.'
  }
]

// Simulating an async function to fetch published events
const fetchPublishedEvents = async () => {
  await new Promise(resolve => setTimeout(resolve, 100)) // Simulating network delay
  return new Set(events.filter(event => event.view === 'published').map(event => event.id))
}

const publishedEventsPromise = fetchPublishedEvents()

export default function Component() {
  const publishedEvents = use(publishedEventsPromise)
  const [localPublishedEvents, setLocalPublishedEvents] = React.useState(publishedEvents)
  const router = useRouter();

  const onClose = () => {
    router.push('/home');
  };

  const handleCreateEvent = () => {
    router.push('/create/event')
  }

  const togglePublish = (id: string) => {
    setLocalPublishedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'commencing':
        return 'text-yellow-500'
      case 'concluded':
        return 'text-gray-500'
      case 'scheduled':
        return 'text-green-500'
      case 'cancelled':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }).replace(/(\w+),\s(\d+)\s(\w+)\s(\d+)/, '$1 $2 $3 $4'); // Adjust comma placement
  }

  const isHistoryEvent = (event: Event) => event.status === 'concluded' || event.status === 'cancelled'

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="container mx-auto max-w-7xl bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex justify-between items-center w-full sm:w-auto">
            <h1 className="text-2xl font-bold">Event Dashboard</h1>
            <Button variant="ghost" size="icon" onClick={onClose} className="sm:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button 
              variant="default" 
              size="sm"
              className="bg-black text-white font-bold text-sm hover:bg-gray-800 px-3 py-1 h-8"
              onClick={handleCreateEvent}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Event
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hidden sm:inline-flex">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          {sortedEvents.map((event, index) => {
            const isFirstHistory = isHistoryEvent(event) && (index === 0 || !isHistoryEvent(sortedEvents[index - 1]))
            return (
              <React.Fragment key={event.id}>
                {isFirstHistory && (
                  <div className="flex items-center space-x-2 my-4">
                    <History className="h-5 w-5" />
                    <span className="text-lg font-semibold">History</span>
                    <Separator className="flex-grow" />
                  </div>
                )}
                <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <img src={event.image} alt={event.name} className="w-full sm:w-40 h-40 object-cover rounded" />
                      <div className="flex-grow space-y-2">
                        <h2 className="text-xl font-semibold">{event.name}</h2>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(event.status)} bg-opacity-20`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${localPublishedEvents.has(event.id) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {localPublishedEvents.has(event.id) ? 'Published' : 'Staged'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 sm:self-start w-full sm:w-auto">
                        {!isHistoryEvent(event) && (
                          <Button
                            size="sm"
                            variant={localPublishedEvents.has(event.id) ? "destructive" : "default"}
                            onClick={() => togglePublish(event.id)}
                            className="w-full sm:w-auto text-xs"
                          >
                            {localPublishedEvents.has(event.id) ? 'Unpublish' : 'Publish'}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                          <BarChart2 className="h-3 w-3 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </React.Fragment>
            )
          })}
        </ScrollArea>
      </div>
    </div>
  )
}