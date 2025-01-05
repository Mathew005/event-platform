"use client"

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, MapPin, ChevronRight, Download, X, Bookmark, BookOpen, History, Users, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import { useRouter } from 'next/navigation'
import config from '@/config'
import axios from 'axios'
import { useEventContext } from '@/components/contexts/EventContext'
import { useUserContext } from '@/components/contexts/UserContext'

const ImageFile = 'files/imgs/defaults/events/'

interface Program {
  id: number
  programId: string
  image: string
  programName: string
  eventName: string
  eventId: string
  institute: string
  date: string
  gpsLink: string
  pdf: string
  registrationId: string
  category: string
  rules: string
  location: string
  venue: string
  time: string
  members: string[]
  amountPaid: number
}

interface BookmarkedProgram {
  id: number
  programId: string
  image: string
  title: string
  location: string
  date: string
}

interface Event {
  id: number
  eventId: string
  image: string
  title: string
  date: string
  location: string
}

const participantDashboardDataBase = {
  registrations: [
    {
      id: 0,
      programId: 'P001',
      image: `${config.api.host}${ImageFile}ai.jpg`,
      programName: 'AI Workshop',
      eventName: 'Tech Summit 2024',
      institute: 'Tech Institute',
      date: '2025-09-20',
      registrationId: 'TS2024-001',
      eventID: "1",
      category: 'Workshop',
      gpsLink: "http://localhost:3000/profile",
      rules: 'Bring your own laptop. Prior programming experience required.',
      pdf: "http://localhost/cfc/files/docs/docs_67799c8d2cfde5.39975639.jpg",
      location: 'Tech Center',
      venue: 'Hall A',
      time: '10:00 AM - 4:00 PM',
      members: ['John Doe'],
      amountPaid: 50
    },
    {
      id: 1,
      programId: 'P002',
      image: `${config.api.host}${ImageFile}coding.jpg`,
      programName: 'Data Science Bootcamp',
      eventName: 'Data Analytics Conference',
      institute: 'Data Science Academy',
      date: '2025-09-25',
      eventID: "1",
      registrationId: 'DAC2024-002',
      category: 'Bootcamp',
      rules: 'Participants must have basic knowledge of statistics and programming.',
      gpsLink: "http://localhost:3000/profile",
      location: 'Data Science Campus',
      pdf: "http://localhost/cfc/files/docs/docs_67799c8d2cfde5.39975639.jpg",
      venue: 'Building B, Room 201',
      time: '9:00 AM - 5:00 PM',
      members: ['Jane Smith', 'Mike Johnson'],
      amountPaid: 150
    },
    {
      id: 2,
      programId: 'P003',
      image: `${config.api.host}${ImageFile}semi.png`,
      programName: 'Cybersecurity Seminar',
      eventName: 'InfoSec World 2024',
      institute: 'Cyber Defense Institute',
      date: '2024-09-30',
      eventID: "1",
      registrationId: 'ISW2024-003',
      category: 'Seminar',
      rules: 'Open to all IT professionals. NDA must be signed before attendance.',
      gpsLink: "http://localhost:3000/profile",
      pdf: "http://localhost/cfc/files/docs/docs_67799c8d2cfde5.39975639.jpg",
      location: 'Virtual Event',
      venue: 'Online Platform',
      time: '1:00 PM - 4:00 PM',
      members: ['Alice Cooper'],
      amountPaid: 75
    }
  ],
  bookmarkedPrograms: [
    {
      id: 0,
      programId: 'P004',
      image: `${config.api.host}${ImageFile}web designning.jpeg`,
      title: 'Web Development Workshop',
      location: 'Tech Hub',
      date: '2024-10-05',
    },
    {
      id: 1,
      programId: 'P005',
      image: `${config.api.host}${ImageFile}blockchain.jpeg`,
      title: 'Blockchain Fundamentals',
      location: 'Innovation Center',
      date: '2025-10-10',
    }
  ],
  bookmarkedEvents: [
    {
      id: 0,
      eventId: 'E001',
      image: `${config.api.host}${ImageFile}`,
      title: 'Tech Summit 2024',
      date: '2024-09-20',
      location: 'Tech Center'
    },
    {
      id: 1,
      eventId: 'E002',
      image: `${config.api.host}${ImageFile}`,
      title: 'Data Analytics Conference',
      date: '2024-09-25',
      location: 'Data Science Campus'
    },
    {
      id: 2,
      eventId: 'E003',
      image: `${config.api.host}${ImageFile}`,
      title: 'InfoSec World 2024',
      date: '2024-09-30',
      location: 'Virtual Event'
    }
  ]
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">{message}</p>
    </div>
  )
}


const getParticipantDashboard = async (id: string) => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.participant_dashboard}`, {
      params:{id}
    });
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default function ParticipantDashboard() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [participantDashboardData, setParticipantDashboardData] = useState(participantDashboardDataBase)
  const [bookmarkedPrograms, setBookmarkedPrograms] = useState<BookmarkedProgram[]>(participantDashboardData.bookmarkedPrograms)
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Event[]>(participantDashboardData.bookmarkedEvents)
  const router = useRouter();
  const { eventId, setEventId } = useEventContext()
  const { userId, setUserId, setUsertype } = useUserContext()

  useEffect(()=>{
    setUserId('1')
  },[])

  useEffect(() => {
    const getData = async () => {
      if(userId){
        const data = await getParticipantDashboard(userId)
        // console.log(data)
        setParticipantDashboardData(data)
        setBookmarkedEvents(data.bookmarkedEvents)
        setBookmarkedPrograms(data.bookmarkedPrograms)
    }
    }
    getData()
  }, [userId])

  const onClose = () => {
    router.push('/home');
  };


  const sortedRegistrations = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return participantDashboardData.registrations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [participantDashboardData.registrations])

  const toggleBookmark = (id: number, isEvent: boolean) => {
    if (isEvent) {
      setBookmarkedEvents(prev => prev.filter(event => event.id !== id))
      toast('Event Bookmark Removed');
    } else {
      setBookmarkedPrograms(prev => prev.filter(program => program.id !== id))
      toast('Program Bookmark Removed');
    }
  }

  const removeExpired = () => {
    const today = new Date()
    setBookmarkedPrograms(prev => prev.filter(program => new Date(program.date) >= today))
    setBookmarkedEvents(prev => prev.filter(event => new Date(event.date) >= today))
    toast.success('Expired events and programs were removed');
  }

  const openDialog = (program: Program) => {
    setSelectedProgram(program)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <header className="flex items-center justify-between p-6 border-b">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </header>

          <Tabs defaultValue="programs" className="p-6">
            <TabsList className="mb-4">
              <TabsTrigger value="programs" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Registrations
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex items-center">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="programs">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-4">Registered</h2>
                  <div className="space-y-4">
                    {sortedRegistrations.filter(p => new Date(p.date) >= new Date()).length > 0 ? (
                      sortedRegistrations.filter(p => new Date(p.date) >= new Date()).map((program) => (
                        <ProgramCard key={program.id} program={program} openDialog={openDialog} />
                      ))
                    ) : (
                      <EmptyState message="No registered programs" />
                    )}
                  </div>
                </section>
                <Separator />
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    History
                  </h2>
                  <div className="space-y-4">
                    {sortedRegistrations.filter(p => new Date(p.date) < new Date()).length > 0 ? (
                      sortedRegistrations.filter(p => new Date(p.date) < new Date()).map((program) => (
                        <ProgramCard key={program.id} program={program} openDialog={openDialog} />
                      ))
                    ) : (
                      <EmptyState message="No program history" />
                    )}
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="bookmarks">
              <Tabs defaultValue="programs">
                <TabsList className="mb-4">
                  <TabsTrigger value="programs" className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Programs
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="programs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {bookmarkedPrograms.length > 0 ? (
                      bookmarkedPrograms.map((program) => (
                        <BookmarkCard key={program.id} item={program} isEvent={false} onUnbookmark={() => toggleBookmark(program.id, false)} onViewDetails={() => {}} />
                      ))
                    ) : (
                      <EmptyState message="No bookmarked programs" />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="events">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {bookmarkedEvents.length > 0 ? (
                      bookmarkedEvents.map((event) => (
                        <BookmarkCard key={event.id} item={event} isEvent={true} onUnbookmark={() => toggleBookmark(event.id, true)} onViewDetails={() => {}} />
                      ))
                    ) : (
                      <EmptyState message="No bookmarked events" />
                    )}
                  </div>
                </TabsContent>

                <div className="mt-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Expired
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove all expired event and program bookmarks from your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={removeExpired}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Tabs>
            </TabsContent>
          </Tabs>

          <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
            <DialogContent className="max-w-md">
              <ScrollArea className="max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>{selectedProgram?.eventName}</DialogTitle>
                </DialogHeader>
                {selectedProgram && (
                  <div className="space-y-4 mt-4">
                    <img src={selectedProgram.image} alt={selectedProgram.programName} className="w-full h-48 object-cover rounded-lg" />
                    <p><strong>Program:</strong> {selectedProgram.programName}</p>
                    <p><strong>Registration ID:</strong> {selectedProgram.registrationId}</p>
                    <p><strong>Category:</strong> {selectedProgram.category}</p>
                    <p><strong>Rules:</strong> {selectedProgram.rules}</p>
                    <Button onClick={() => {window.open(selectedProgram.pdf)}} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <p><strong>Location:</strong> {selectedProgram.location}</p>
                    <p><strong>Venue:</strong> {selectedProgram.venue}</p>
                    <Button onClick={() => {window.open(selectedProgram.gpsLink)}} variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                    <p><strong>Date:</strong> {selectedProgram.date}</p>
                    <p><strong>Time:</strong> {selectedProgram.time}</p>
                    <p><strong>Members:</strong> {selectedProgram.members.join(', ')}</p>
                    <p><strong>Amount Paid:</strong> ${selectedProgram.amountPaid}</p>
                    <ProgramStatus date={selectedProgram.date} />
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

function ProgramCard({ program, openDialog}: { program: Program; openDialog: (program: Program) => void}) {
  
  const router = useRouter();
  const { eventId, setEventId , programId, setProgramId} = useEventContext()
  
  const handleView = (program: Program) => {
    // console.log(program)
    const pid = program.programId
    const eid = program.eventId
    if(pid && eid){
      setEventId(eid)
      setProgramId(pid)
      // console.log("Event: ", eid, "Program: ", pid)
      router.push('/event')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4 cursor-pointer">
      <img src={program.image} alt={program.programName} className="w-16 h-16 object-cover rounded" />
      <div className="flex-1">
        <h3 className="font-semibold">{program.programName}</h3>
        <p className="text-sm text-gray-600">{program.eventName}</p>
        <p className="text-sm text-gray-600">{program.institute}</p>
        <div className="flex items-center mt-2">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-sm text-gray-600">{program.date}</span>
        </div>
      </div>
      <div className="text-right">
        
          <Button onClick={()=>{handleView(program)}} variant="outline" size="sm" className="w-15 mr-2 md:w-24 bg-white text-black hover:bg-gray-200">View</Button>
        
        <div className="mt-2">
          <Button onClick={() => openDialog(program)} variant="outline" size="sm" className="w-14 mr-2 md:w-24 bg-black text-white hover:bg-gray-800">Details</Button>
        </div>
        <div className="mt-2">
          <ProgramStatus date={program.date} />
        </div>
      </div>
    </div>
  );
}

function BookmarkCard({ item, isEvent, onUnbookmark, onViewDetails }: { item: BookmarkedProgram | Event; isEvent: boolean; onUnbookmark: () => void; onViewDetails: () => void }) {
  const isExpired = new Date(item.date) < new Date()
  const router = useRouter()

  const handleViewDetails = () => {
    if (isEvent) {
      // Placeholder for event details navigation
      console.log('Navigate to event details')
      // router.push(`/event/${(item as Event).eventId}`)
    } else {
      // Placeholder for program details navigation
      console.log('Navigate to program details')
      router.push(`/program/${(item as BookmarkedProgram).programId}`)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${isExpired ? 'opacity-50' : ''}`}>
      <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold">{item.title}</h3>
        <div className="flex items-center mt-2">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-sm text-gray-600">{item.date}</span>
        </div>
        <div className="flex items-center mt-1">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-sm text-gray-600">{item.location}</span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black text-white hover:bg-gray-800" 
            disabled={isExpired} 
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button variant="ghost" size="sm" onClick={onUnbookmark}>
            <Bookmark className="h-4 w-4 fill-current" />
            <span className="sr-only">Unbookmark</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProgramStatus({ date }: { date: string }) {
  const programDate = new Date(date)
  programDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = programDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return <Badge variant="success" className="bg-green-500 text-white">Today</Badge>
  } else if (diffDays > 0) {
    return <p className="text-xs text-gray-400">{diffDays} days left</p>
  } else {
    return <p className="text-xs text-gray-400">{Math.abs(diffDays)} days ago</p>
  }
}

