"use client"

import { useState, useMemo } from 'react'
import { ArrowLeft, Calendar, Clock, MapPin, ChevronRight, Download, X, Bookmark, BookOpen, History, Users, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from 'next/link'

interface Program {
  id: string
  image: string
  programName: string
  eventName: string
  institute: string
  date: string
  registrationId: string
  category: string
  description: string
  rules: string
  location: string
  venue: string
  time: string
  members: string[]
  amountPaid: number
}

interface Event {
  id: string
  image: string
  title: string
  date: string
  location: string
}

const programs: Program[] = [
  {
    id: '1',
    image: '/placeholder.svg',
    programName: 'AI Workshop',
    eventName: 'Tech Summit 2024',
    institute: 'Tech Institute',
    date: '2024-09-20',
    registrationId: 'TS2024-001',
    category: 'Workshop',
    description: 'Learn about the latest AI technologies and their applications.',
    rules: 'Bring your own laptop. Prior programming experience required.',
    location: 'Tech Center',
    venue: 'Hall A',
    time: '10:00 AM - 4:00 PM',
    members: ['John Doe'],
    amountPaid: 50
  },
  {
    id: '2',
    image: '/placeholder.svg',
    programName: 'Data Science Bootcamp',
    eventName: 'Data Analytics Conference',
    institute: 'Data Science Academy',
    date: '2024-09-25',
    registrationId: 'DAC2024-002',
    category: 'Bootcamp',
    description: 'Intensive 3-day bootcamp covering data analysis, machine learning, and visualization.',
    rules: 'Participants must have basic knowledge of statistics and programming.',
    location: 'Data Science Campus',
    venue: 'Building B, Room 201',
    time: '9:00 AM - 5:00 PM',
    members: ['Jane Smith', 'Mike Johnson'],
    amountPaid: 150
  },
  {
    id: '3',
    image: '/placeholder.svg',
    programName: 'Cybersecurity Seminar',
    eventName: 'InfoSec World 2024',
    institute: 'Cyber Defense Institute',
    date: '2024-09-30',
    registrationId: 'ISW2024-003',
    category: 'Seminar',
    description: 'Learn about the latest trends and threats in cybersecurity.',
    rules: 'Open to all IT professionals. NDA must be signed before attendance.',
    location: 'Virtual Event',
    venue: 'Online Platform',
    time: '1:00 PM - 4:00 PM',
    members: ['Alice Cooper'],
    amountPaid: 75
  },
  {
    id: '4',
    image: '/placeholder.svg',
    programName: 'Web Development Workshop',
    eventName: 'Frontend Masters Conference',
    institute: 'Code Academy',
    date: '2024-10-05',
    registrationId: 'FMC2024-004',
    category: 'Workshop',
    description: 'Hands-on workshop on modern web development techniques and frameworks.',
    rules: 'Basic knowledge of HTML, CSS, and JavaScript required.',
    location: 'Tech Hub',
    venue: 'Conference Room 3',
    time: '9:00 AM - 6:00 PM',
    members: ['Emma Watson', 'Daniel Radcliffe'],
    amountPaid: 100
  },
  {
    id: '5',
    image: '/placeholder.svg',
    programName: 'Blockchain Fundamentals',
    eventName: 'Crypto Expo 2024',
    institute: 'Blockchain Institute',
    date: '2024-10-10',
    registrationId: 'CE2024-005',
    category: 'Course',
    description: 'Comprehensive course on blockchain technology and its applications.',
    rules: 'No prior knowledge required. Bring a laptop for practical sessions.',
    location: 'Innovation Center',
    venue: 'Auditorium',
    time: '10:00 AM - 3:00 PM',
    members: ['Robert Downey Jr.'],
    amountPaid: 200
  }
]

const events: Event[] = [
  {
    id: '1',
    image: '/placeholder.svg',
    title: 'Tech Summit 2024',
    date: '2024-09-20',
    location: 'Tech Center'
  },
  {
    id: '2',
    image: '/placeholder.svg',
    title: 'Data Analytics Conference',
    date: '2024-09-25',
    location: 'Data Science Campus'
  },
  {
    id: '3',
    image: '/placeholder.svg',
    title: 'InfoSec World 2024',
    date: '2024-09-30',
    location: 'Virtual Event'
  },
  {
    id: '4',
    image: '/placeholder.svg',
    title: 'Frontend Masters Conference',
    date: '2024-10-05',
    location: 'Tech Hub'
  },
  {
    id: '5',
    image: '/placeholder.svg',
    title: 'Crypto Expo 2024',
    date: '2024-10-10',
    location: 'Innovation Center'
  },
  {
    id: '6',
    image: '/placeholder.svg',
    title: 'AI and Ethics Symposium',
    date: '2024-09-15',
    location: 'University Auditorium'
  }
]

export default function ParticipantDashboard() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [bookmarkedPrograms, setBookmarkedPrograms] = useState<Set<string>>(new Set(programs.map(p => p.id)))
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(new Set(events.map(e => e.id)))

  const sortedPrograms = useMemo(() => {
    const today = new Date('2024-10-02')
    today.setHours(0, 0, 0, 0)
    return programs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [])

  const toggleBookmark = (id: string, isEvent: boolean) => {
    if (isEvent) {
      setBookmarkedEvents(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    } else {
      setBookmarkedPrograms(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    }
  }

  const removeExpired = () => {
    const today = new Date('2024-10-02')
    setBookmarkedPrograms(prev => {
      const newSet = new Set(prev)
      programs.forEach(program => {
        if (new Date(program.date) < today) {
          newSet.delete(program.id)
        }
      })
      return newSet
    })
    setBookmarkedEvents(prev => {
      const newSet = new Set(prev)
      events.forEach(event => {
        if (new Date(event.date) < today) {
          newSet.delete(event.id)
        }
      })
      return newSet
    })
  }

  const openDialog = (program: Program) => {
    setSelectedProgram(program)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <header className="flex items-center justify-between p-6 border-b">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Button variant="ghost" size="icon">
              <X className="h-6 w-6" />
            </Button>
          </header>

          <Tabs defaultValue="programs" className="p-6">
            <TabsList className="mb-4">
              <TabsTrigger value="programs" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Programs
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
                    {sortedPrograms.filter(p => new Date(p.date) >= new Date('2024-10-02')).map((program) => (
                      <ProgramCard key={program.id} program={program} onClick={() => openDialog(program)} />
                    ))}
                  </div>
                </section>
                <Separator />
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    History
                  </h2>
                  <div className="space-y-4">
                    {sortedPrograms.filter(p => new Date(p.date) < new Date('2024-10-02')).map((program) => (
                      <ProgramCard key={program.id} program={program} onClick={() => openDialog(program)} />
                    ))}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {programs.filter(program => bookmarkedPrograms.has(program.id)).map((program) => (
                      <BookmarkCard key={program.id} item={program} isEvent={false} onUnbookmark={() => toggleBookmark(program.id, false)} onViewDetails={() => openDialog(program)} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="events">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {events.filter(event => bookmarkedEvents.has(event.id)).map((event) => (
                      <BookmarkCard key={event.id} item={event} isEvent={true} onUnbookmark={() => toggleBookmark(event.id, true)} onViewDetails={() => {}} />
                    ))}
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
                          This action cannot be undone. This will permanently remove all expired bookmarks from your account.
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
                    <p><strong>Description:</strong> {selectedProgram.description}</p>
                    <p><strong>Rules:</strong> {selectedProgram.rules}</p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <p><strong>Location:</strong> {selectedProgram.location}</p>
                    <p><strong>Venue:</strong> {selectedProgram.venue}</p>
                    <Button variant="outline" size="sm">
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

function ProgramCard({ program, onClick }: { program: Program; onClick: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4 cursor-pointer" onClick={onClick}>
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
        <Link href={`/program/${program.id}`} passHref>
          <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800">View</Button>
        </Link>
        <div className="mt-2">
          <ProgramStatus date={program.date} />
        </div>
      </div>
    </div>
  )
}

function BookmarkCard({ item, isEvent, onUnbookmark, onViewDetails }: { item: Event | Program; isEvent: boolean; onUnbookmark: () => void; onViewDetails: () => void }) {
  const isExpired = new Date(item.date) < new Date('2024-10-02')

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${isExpired ? 'opacity-50' : ''}`}>
      <img src={item.image} alt={isEvent ? item.title : (item as Program).programName} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold">{isEvent ? item.title : (item as Program).programName}</h3>
        <div className="flex items-center mt-2">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-sm text-gray-600">{item.date}</span>
        </div>
        <div className="flex items-center mt-1">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-sm text-gray-600">{item.location}</span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800" disabled={isExpired} onClick={onViewDetails}>
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
  const today = new Date('2024-10-02')
  today.setHours(0, 0, 0, 0)
  const diffTime = programDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return <Badge className="bg-green-500 text-white">Today</Badge>
  } else if (diffDays > 0) {
    return <p className="text-xs text-gray-400">{diffDays} days left</p>
  } else {
    return <p className="text-xs text-gray-400">{Math.abs(diffDays)} days ago</p>
  }
}