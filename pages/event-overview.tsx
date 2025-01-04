'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Edit, Grid, List, Plus, Clock, DollarSign, X, Eye, Download, Trash2 } from 'lucide-react'
import { Toggle } from "@/components/ui/toggle"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import config from '@/config'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useEventContext } from '@/components/contexts/EventContext'
import { useUserContext } from '@/components/contexts/UserContext'

type Coordinator = {
  name: string;
  role: string;
  email: string;
  phone: string;
}

type Program = {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  time: string;
  regFee: number;
  image: string;
  rulesRegulations: string;
  rulesRegulationsFile: string;
  isTeamEvent: boolean;
  minParticipants?: number;
  maxParticipants?: number;
  coordinators: Coordinator[];
  status: 'open' | 'closed';
}

type Event = {
  id: string;
  title: string;
  description: string;
  image: string;
  eventType: string;
  date: string;
  location: string;
  coordinators: Coordinator[];
  programs: Program[];
  status: 'scheduled' | 'commencing' | 'concluded' | 'cancelled';
  view: 'staged' | 'published';
}

const ImageFile = 'files/imgs/defaults/events/'

const eventbase: Event = {
  id: '1',
  title: 'Tech Innovation Summit 2023',
  description: 'Join us for a day of cutting-edge technology discussions and networking opportunities with industry leaders.',
  image: `${config.api.host}${ImageFile}ai.jpg?height=400&width=800`,
  eventType: 'Conference',
  date: '2023-09-15T09:00:00',
  location: 'San Francisco Convention Center, CA',
  coordinators: [
    { name: 'John Doe', role: 'Event Manager', email: 'john@example.com', phone: '+1 123-456-7890' },
    { name: 'Jane Smith', role: 'Technical Coordinator', email: 'jane@example.com', phone: '+1 098-765-4321' },
  ],
  programs: [
    {
      id: '1',
      name: 'AI in Healthcare',
      type: 'Workshop',
      date: '2023-09-15',
      venue: 'Main Hall',
      time: '10:00 - 11:30',
      regFee: 50,
      image: `${config.api.host}${ImageFile}ai-health.jpg?height=200&width=200`,
      rulesRegulations: 'Participants must bring their own laptops. No prior experience required.',
      rulesRegulationsFile: '/ai-workshop-rules.pdf',
      isTeamEvent: false,
      coordinators: [
        { name: 'Dr. Alice Johnson', role: 'AI Specialist', email: 'alice@example.com', phone: '+1 111-222-3333' },
      ],
      status: 'open',
    },
    {
      id: '2',
      name: 'Future of Blockchain',
      type: 'Panel Discussion',
      date: '2023-09-15',
      venue: 'Workshop Room A',
      time: '13:00 - 14:30',
      regFee: 75,
      image: `${config.api.host}${ImageFile}blockchain.jpeg?height=200&width=200`,
      rulesRegulations: 'Open to all attendees. Q&A session included.',
      rulesRegulationsFile: '/blockchain-panel-rules.pdf',
      isTeamEvent: false,
      coordinators: [
        { name: 'Bob Smith', role: 'Blockchain Expert', email: 'bob@example.com', phone: '+1 444-555-6666' },
      ],
      status: 'open',
    },
    {
      id: '3',
      name: 'Cybersecurity Challenge',
      type: 'Team Competition',
      date: '2023-09-15',
      venue: 'Conference Room B',
      time: '15:00 - 16:30',
      regFee: 60,
      image: `${config.api.host}${ImageFile}cyber.png?height=200&width=200`,
      rulesRegulations: 'Teams of 2-4 members. Basic coding knowledge required.',
      rulesRegulationsFile: '/cybersecurity-challenge-rules.pdf',
      isTeamEvent: true,
      minParticipants: 2,
      maxParticipants: 4,
      coordinators: [
        { name: 'Charlie Brown', role: 'Security Expert', email: 'charlie@example.com', phone: '+1 777-888-9999' },
      ],
      status: 'open',
    },
  ],
  status: 'scheduled',
  view: 'staged',
}

const fetchData = async (table: string, id: string, columnIdentifier: string, columnTargets: string[]) => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.save_fetch}`, {
      params: { table, id, columnIdentifier, columnTargets: columnTargets.join(',') }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

const deleteData = async (table: string, id: string, column: string) => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.delete}`, {
      params: { table, id, column}
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

const getEventOverviewData = async (id: string) => {
  try{
    const response = await axios.get(`${config.api.host}${config.api.routes.event_overview}`,{
      params:{id}
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}


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

export default function EventOverview() {
  const [isGridView, setIsGridView] = useState(true)
  const [currentEvent, setCurrentEvent] = useState<Event>(eventbase)
  const { eventId, programId, setEventId, setProgramId } = useEventContext();
  const {userId, usertype, setUserId, setUsertype} = useUserContext();
  const router = useRouter()


  useEffect(() => {
    setUserId('1')
    setEventId('7')
    // setUsertype('participant')
}, [])

useEffect(() =>{
  const getEventData = async () => {
    if (eventId){
      const data = await getEventOverviewData(eventId)
      setCurrentEvent(data)
    }
  }

  getEventData()
},[eventId])

useEffect(() => {
  if(eventId){
    const fetchStatus = async () =>{
      const data = await fetchData("events", eventId, "EID", ["Published"])
      if(data.Published == '0'){
        setCurrentEvent(prev => ({ ...prev, view: 'staged' }))
      }
      if(data.Published == '1'){
        setCurrentEvent(prev => ({ ...prev, view: 'published' }))
      }

      currentEvent.programs.map(async (program)=>{
        const pstatus = await fetchData("programs", program.id, "PID", ["Open"])
        program.status = pstatus.Open == 1 ? 'open' : "closed";
        // console.log(program.id, program.status, pstatus.Open)
      })
    }
  
    fetchStatus()
  }
}, [eventId])

  const handleClose = () => {
    router.push('/dashboard/organizer')
  }

  const handlePublish = () => {
    setCurrentEvent(prev => ({ ...prev, view: 'published' }))
    const request = async () =>{
      await saveData("events", currentEvent.id, "EID","Published", "1")
    } 

    request()
  }

  const handleUnpublish = () => {
    setCurrentEvent(prev => ({ ...prev, view: 'staged' }))
    const request = async () =>{
      await saveData("events", currentEvent.id, "EID","Published", "0")
    } 

    request()
  }

  const handleCancel = () => {
    setCurrentEvent(prev => ({ ...prev, status: 'cancelled' }))
    const request = async () =>{
      await saveData("events", eventId, "EID","Cancelled", "1")
    } 

    request()
  }

  const handleRemoveProgram = (programId: string) => {
    const deleteProgram = async () => {
      await deleteData("programs", programId, "PID")
    }
    deleteProgram();
    setCurrentEvent(prev => ({
      ...prev,
      programs: prev.programs.filter(program => program.id !== programId)
    }))
  }

  const toggleProgramStatus = (programId: string) => {
    setCurrentEvent(prev => ({
      ...prev,
      programs: prev.programs.map(program => 
        program.id === programId 
          ? { ...program, status: program.status === 'open' ? 'closed' : 'open' }
          : program
      )
    }));
    currentEvent.programs.map(program =>{
      if(program.id == programId)
        if(program.status == 'open'){
          const status = async () => {
            await saveData("programs", programId, "PID", "Open", 0)
          }
          status()
          // console.log("send closed")
        }else{
          const status = async () => {
            await saveData("programs", programId, "PID", "Open", 1)
          }
          status()
          // console.log("send open")
        }
    })
  };

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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Overview</h1>
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="mb-8">
        <img 
          src={currentEvent.image} 
          alt={currentEvent.title} 
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-4"
        />
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{currentEvent.title}</h2>
            <p className="text-gray-600 mb-4">{currentEvent.description}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getStatusColor(currentEvent.status)} bg-opacity-20 mb-2`}>
              {currentEvent.status.charAt(0).toUpperCase() + currentEvent.status.slice(1)}
            </span>
            {currentEvent.status !== 'cancelled' && (
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-blue-500 text-white bg-opacity-20">
                {currentEvent.view.charAt(0).toUpperCase() + currentEvent.view.slice(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-gray-500" />
            <span>{new Date(currentEvent.date).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-gray-500" />
            <span>{currentEvent.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-gray-500" />
            <span>{currentEvent.eventType}</span>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Coordinators</h3>
          <ul className="space-y-2">
            {currentEvent.coordinators.map((coordinator, index) => (
              <li key={index}>
                <div className="font-medium">{coordinator.name} - {coordinator.role}</div>
                <div className="text-sm text-gray-600">
                  {coordinator.email} | {coordinator.phone}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between items-center">
          <Button>
            <Edit className="mr-2 h-4 w-4" /> Edit Event
          </Button>
          {currentEvent.status !== 'cancelled' && (
            currentEvent.view === 'staged' ? (
              <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                Publish
              </Button>
            ) : (
              <Button onClick={handleUnpublish} variant="destructive">
                Unpublish
              </Button>
            )
          )}
        </div>
      </div>

      <Separator className="my-8" />

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Programs</h2>
        <div className="flex items-center space-x-2">
          <Toggle
            pressed={isGridView}
            onPressedChange={setIsGridView}
            aria-label="Toggle grid view"
          >
            <Grid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={!isGridView}
            onPressedChange={(pressed) => setIsGridView(!pressed)}
            aria-label="Toggle list view"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Program
          </Button>
        </div>
      </div>

      <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {currentEvent.programs.map((program) => (
          <Card key={program.id} className={isGridView ? "" : "flex"}>
            <CardContent className={`p-4 ${isGridView ? "" : "flex-grow flex"}`}>
              <div className={`${isGridView ? "mb-4" : "flex-shrink-0 mr-4"}`}>
                <img 
                  src={program.image} 
                  alt={program.name} 
                  className={`rounded ${isGridView ? "w-full h-40 object-cover" : "w-24 h-24 object-cover"}`}
                />
              </div>
              <div className={isGridView ? "" : "flex-grow"}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{program.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${program.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                      {program.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                    <Switch
                      checked={program.status === 'open'}
                      onCheckedChange={() => toggleProgramStatus(program.id)}
                      className={program.status === 'open' ? 'bg-green-600' : 'bg-red-600'}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to remove this program?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the program from the event.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveProgram(program.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{program.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{program.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{program.time}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Registration Fee: ${program.regFee}</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{program.name}</DialogTitle>
                        <DialogDescription>{program.type}</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh]">
                        <div className="grid gap-4 py-4">
                          <img src={program.image} alt={program.name} className="w-full h-64 object-cover rounded-lg" />
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold">Date & Time</h4>
                              <p>{program.date} | {program.time}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Venue</h4>
                              <p>{program.venue}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Registration Fee</h4>
                              <p>${program.regFee}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Event Type</h4>
                              <p>{program.isTeamEvent ? 'Team Event' : 'Individual Event'}</p>
                            </div>
                            {program.isTeamEvent && (
                              <div>
                                <h4 className="font-semibold">Team Size</h4>
                                <p>{program.minParticipants} - {program.maxParticipants} participants</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">Rules and Regulations</h4>
                            <p>{program.rulesRegulations}</p>
                            <Button variant="outline" className="mt-2">
                              <Download className="mr-2 h-4 w-4" /> Download Rules PDF
                            </Button>
                          </div>
                          <div>
                            <h4 className="font-semibold">Coordinators</h4>
                            <ul className="space-y-2">
                              {program.coordinators.map((coordinator, index) => (
                                <li key={index}>
                                  <div>{coordinator.name} - {coordinator.role}</div>
                                  <div className="text-sm text-gray-600">
                                    {coordinator.email} | {coordinator.phone}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Cancel Event</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to cancel this event?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will cancel the event and remove it from public view.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep event</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>
                Yes, cancel event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

