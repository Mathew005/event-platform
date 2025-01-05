'use client'

import React, { useEffect, useState } from 'react'
import { use } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, ArrowLeft, Eye, History, Calendar, MapPin, Plus, BarChart2 ,Text } from 'lucide-react'
import { useRouter } from 'next/navigation'
import config from '@/config'
import axios from 'axios'
import { useEventContext } from '@/components/contexts/EventContext'
import { useUserContext } from '@/components/contexts/UserContext'

const ImageFile = 'files/imgs/defaults/events/'

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

const eventsBase: Event[] = [
  {
    id: '1',
    name: 'Tech Conference 2023',
    date: '2023-09-15T09:00:00',
    location: 'San Francisco Convention Center, CA',
    status: 'scheduled',
    view: 'published',
    image: `${config.api.host}${ImageFile}tech_confernce.jpg?height=200&width=200`,
    description: 'Annual tech conference featuring the latest in AI and machine learning.'
  },
  {
    id: '2',
    name: 'Annual Charity Gala',
    date: '2023-08-20T19:00:00',
    location: 'Ritz-Carlton, New York, NY',
    status: 'commencing',
    view: 'published',
    image: `${config.api.host}${ImageFile}charoty.jpg?height=200&width=200`,
    description: 'Elegant evening supporting local charities with dinner and silent auction.'
  },
  {
    id: '3',
    name: 'Summer Music Festival',
    date: '2023-07-01T12:00:00',
    location: 'Griffith Park, Los Angeles, CA',
    status: 'concluded',
    view: 'published',
    image: `${config.api.host}${ImageFile}sumer.jpg?height=200&width=200`,
    description: 'Three-day outdoor music festival featuring top artists across multiple genres.'
  },
  {
    id: '4',
    name: 'AI Workshop',
    date: '2023-10-05T10:00:00',
    location: 'MIT Campus, Boston, MA',
    status: 'scheduled',
    view: 'staged',
    image: `${config.api.host}${ImageFile}ai.jpg?height=200&width=200`,
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


const saveData = async (
  table: string,
  identifier: string,
  identifierColumn: string,
  target: string,
  data: any
) => {
  if (data === undefined || data === null) {
    console.error(`Attempted to update ${target} with undefined or null value`)
    return false
  }

  try {
    const response = await axios.post(
      `${config.api.host}${config.api.routes.save_fetch}`,
      { table, identifier, identifierColumn, target, data },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const result = response.data

    if (result.success) {
      console.log(`Successfully updated ${target}`)
      return true
    } else {
      console.error(`Failed to update ${target}: ${result.message}`)
      return false
    }
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}

const getOrganizerDashboard = async () => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.organizer_dashboard}`);
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const getPublished = async (table:string, columns:string[]) =>{
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.organizer_dashboard}`,{
      params:{
        table, columns : columns.join(',')
      }}
    );
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export default function Component() {
  const [publishedEvents, setPublishedEvents] = useState<Set<string>>(new Set())
  // const publishedEvents = use(publishedEventsPromise)
  const [localPublishedEvents, setLocalPublishedEvents] = React.useState(publishedEvents)
  const [events, setEvents] = useState(eventsBase);
  const router = useRouter();
  const { eventId, setProgramId, setEventId } = useEventContext()
  const { userId, setUserId, setUsertype } = useUserContext()



  useEffect(() => {
    // returnPublished()
    const fillDashBoard = async () => {
      const data = await getOrganizerDashboard();

      setEvents(data);
      const publishedEventIds = new Set(data.filter((event: Event) => event.view === 'published').map((event: Event) => event.id))
      setPublishedEvents(publishedEventIds)
      setLocalPublishedEvents(publishedEventIds)
    }

    fillDashBoard()
    }, [])

    const fetchPublishedEvents = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulating network delay
      return new Set(events.filter(event => event.view === 'published').map(event => event.id))
    }
    
const publishedEventsPromise = fetchPublishedEvents()

  const onClose = () => {
    router.push('/home');
  };

  const handleCreateEvent = () => {
    router.push('/dashboard/organizer/create/event')
  }

  const handlePreview = (eventId: string) => {
    setEventId(eventId)
    setProgramId('')
    setUsertype('organizer')
    router.push('/event')
    // console.log(eventId)
  }

  const handleAnalysis = (eventId: string) => {
    setEventId(eventId)
    router.push('/dashboard/organizer/analysis')
    console.log(eventId)
  }

  const handleEvent = (id: string) =>{
    if(id){
      setEventId(id)
      router.push('/dashboard/organizer/overview')
    }
  }

  const togglePublish = (event: Event) => {
    const id = event.id
    setLocalPublishedEvents(prev => {
      const event = events.find((e) => e.id === id);
      if(event){
        event.view = event.view === 'staged' ? 'published' : 'staged';
      }
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        handleUnpublish(event)
        // console.log(id, "unpublish set to 0")
      } else {
        newSet.add(id)
        handlePublish(event)
        // console.log(id, "publish set to 1")
      }
      return newSet
    })
  }

  const handlePublish = (event: Event) => {
    // console.log("Set",event.id,"to Published")
    saveData('events', event.id, 'EID', 'Published', '1')
    setEvents((prev) => {
      const updatedEvents = [...prev]
      const eventIndex = updatedEvents.findIndex((e) => e.id === event.id)
      if (eventIndex !== -1) {
        updatedEvents[eventIndex].view = 'published'
      }
      return updatedEvents
    })
  }

  const handleUnpublish = (event: Event) => {
    // console.log("Set",event.id,"to Staged")
    saveData('events', event.id, 'EID', 'Published', '0')
    setEvents((prev) => {
      const updatedEvents = [...prev]
      const eventIndex = updatedEvents.findIndex((e) => e.id === event.id)
      if (eventIndex !== -1) {
        updatedEvents[eventIndex].view = 'staged'
      }
      return updatedEvents
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
                          
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${event.view == 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {event.view == 'published' ? 'Published' : 'Staged'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 sm:self-start w-full sm:w-auto">
                        {!isHistoryEvent(event) && (
                          <Button
                            size="sm"
                            variant={event.view == 'published' ? "destructive" : "default"}
                            onClick={() => togglePublish(event)}
                            className="w-full sm:w-auto text-xs"
                          >
                            {event.view == 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                        )}
                        <Button onClick={() => {handleEvent(event.id)}} size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                          <Text className="h-3 w-3 mr-1" />
                          Overview
                        </Button>
                        <Button onClick={() => {handlePreview(event.id)}} size="sm" variant="outline" className="w-full sm:w-auto text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button onClick={() => {handleAnalysis(event.id)}} size="sm" variant="outline" className="w-full sm:w-auto text-xs">
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