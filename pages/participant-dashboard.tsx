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
  registrations: [],
  bookmarkedPrograms: [],
  bookmarkedEvents: []
}

const setBookMark = async (userId: string, type: string, action: string, bookMarkId: string) => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.bookmark}`, {
      params: { userId, type, action, bookMarkId}
    })
    return response.data
  } catch (error) {
    console.error('Error saving bookmarks data:', error)
    return null
  }
}

function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="text-center py-8">
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

const getParticipantDashboard = async (id: string) => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.participant_dashboard}`, {
      params:{id}
    });
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
    // setUserId('1')
  },[])

  useEffect(() => {
    // console.log
    const getData = async () => {
      if(userId){
        const data = await getParticipantDashboard(userId)
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
    if(participantDashboardData.registrations){
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return participantDashboardData.registrations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
    else{
      return []
    }
  }, [participantDashboardData.registrations])

  const toggleBookmark = (id: number, isEvent: boolean) => {
    if (isEvent) {
      setBookmarkedEvents(prev => prev.filter(event => event.id !== id))
      const resposne = async () => {
        await setBookMark(userId, "event", "remove", id.toString())
      }
      resposne()
      toast('Event Bookmark Removed');
    } else {
      setBookmarkedPrograms(prev => prev.filter(program => program.id !== id))
      const resposne = async () => {
        await setBookMark(userId, "program", "remove", id.toString())
      }
      resposne()
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
                      <EmptyState message="No registered programs" icon={Calendar} />
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
                      <EmptyState message="No program history" icon={History} />
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
                      <EmptyState message="No bookmarked programs" icon={Bookmark} />
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
                      <EmptyState message="No bookmarked events" icon={Calendar} />
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
    const pid = program.programId
    const eid = program.eventId
    if(pid && eid){
      setEventId(eid)
      setProgramId(pid)
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
        <Button onClick={() => handleView(program)} variant="outline" size="sm" className="w-15 mr-2 md:w-24 bg-white text-black hover:bg-gray-200">View</Button>
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
      console.log('Navigate to event details')
    } else {
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

