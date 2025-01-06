'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, MapPin, ExternalLink, Download, Phone, Mail, Bookmark } from 'lucide-react'
import Link from 'next/link'
import config from '@/config'
import { useEventContext } from '@/components/contexts/EventContext'
import { Toaster,toast} from 'sonner'
import { useUserContext } from '@/components/contexts/UserContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Coordinator {
  name: string
  email: string
  phone: string
  isFaculty: boolean
}

interface Program {
  id: string
  name: string
  category: string
  date: string
  pdf:string
  time: string
  image: string
  rules: string
  regFees: number
  isTeamEvent: boolean
  minParticipants: number
  maxParticipants: number
  coordinators: Coordinator[]
  registrationOpen: boolean
}

interface Event {
  id: string
  name: string
  institution: string
  category: string
  location: string
  gpsLink: string
  description: string
  duration: string
  coordinators: Coordinator[]
  image: string
  programs: Program[]
}


const ImageFile = 'files/imgs/defaults/events/'

const eventbase: Event = {
  id: "",
  name: "",
  institution: "",
  category: "",
  location: "",
  gpsLink: "",
  description: "",
  duration: "",
  coordinators: [],
  image: "",
  programs: []
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

const getEventProgramData = async (id: string) => {
  try{
    const response = await axios.get(`${config.api.host}${config.api.routes.event_program_view}`,{
      params:{id}
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

export default function Component() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [bookmarkedPrograms, setBookmarkedPrograms] = useState<Set<string>>(new Set())
  const [isEventBookmarked, setIsEventBookmarked] = useState(false)
  const selectedProgramRef = useRef<HTMLDivElement>(null)
  const {setEventId, setProgramId, programId, eventId} = useEventContext();
  const {setUserId, setUsertype, userId, usertype} = useUserContext();
  const [event, setEvent] = useState<Event>(eventbase);
  const [orgwebsite, setOrgWebsite] = useState("");
  const router = useRouter()

  useEffect(() => {
    // setEventId('7')
    // setProgramId('1')
    // setUserId('1')
    // setUsertype('participant')
  }, [])
  
  useEffect(() => {
    // console.log(eventId)
    const fillEventData = async () =>{
      if(eventId){
        const data = await getEventProgramData(eventId)
        console.log(data)
        setOrgWebsite(data.organizer.website)
        setEvent(data);
        if(programId){
          console.log(programId)
          setSelectedProgram(data.programs.find(program => program.id === programId))
        }
      }
    }

    fillEventData()
  }, [eventId,programId])


  useEffect(() => {
    const updateBookmarks = async () => {
      // Check event bookmark status
      const eventBookmarkStatus = await setBookMark(userId, "event", "check", eventId);
      if (eventBookmarkStatus?.success) {
        setIsEventBookmarked(eventBookmarkStatus.isBookmarked);
        // console.log(eventBookmarkStatus.isBookmarked)
      }

      const newBookmarks = new Set<string>()
      // Check programs bookmark status
      await Promise.all(
        event.programs.map(async (program) => {
          const programBookmarkStatus = await setBookMark(userId, "program", "check", program.id);
          if (programBookmarkStatus?.success) {
            if(programBookmarkStatus.isBookmarked){
              newBookmarks.add(program.id)
            }
          }
        })
      );
      // console.log(newBookmarks)
      setBookmarkedPrograms(newBookmarks);

      // Update state
    };

    updateBookmarks();
  }, [userId]);



  // Toggle this variable to enable/disable auto-scrolling
  const enableAutoScroll = true

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(prevProgram => prevProgram?.id === program.id ? null : program)
  }

  const toggleProgramBookmark = (programId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setBookmarkedPrograms(prevBookmarks => {
      const newBookmarks = new Set(prevBookmarks)
      if (newBookmarks.has(programId)) {
        newBookmarks.delete(programId)
        setBookMark(userId, "program", "remove", programId)
      } else {
        newBookmarks.add(programId)
        setBookMark(userId, "program", "add", programId)
      }
      console.log(newBookmarks)
      return newBookmarks
    })
  }

  const toggleEventBookmark = () => {
    setIsEventBookmarked(prev => !prev)
    console.log(!isEventBookmarked)
    setBookMark(userId, "event", !isEventBookmarked ? "add": "remove", eventId)
  }

  useEffect(() => {
    if (selectedProgram && selectedProgramRef.current && enableAutoScroll) {
      selectedProgramRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedProgram])

  const handleRegister = (programId: string) => {
    const checkFullProfile = async () => {
      const data = await fetchData("participants", userId, "PID", ["PInstitute"])
      // console.log(data)
      if(!data.PInstitute){
        toast.error("Plese Complete You Profile In Order To Register")
        return false
      }
      setProgramId(programId)
      router.push('/event/reg')
      return true
    }
    checkFullProfile()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 bg-white text-black flex justify-between items-center border-b">
            <h1 className="text-2xl font-bold">Program Details</h1>
            <div className="flex items-center space-x-4">
              { usertype == 'participant' &&
              <button
                onClick={toggleEventBookmark}
                className={`p-2 rounded-full ${isEventBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'} hover:bg-yellow-200 transition-colors`}
                aria-label={isEventBookmarked ? "Remove event bookmark" : "Bookmark event"}
              >
                <Bookmark size={20} className={isEventBookmarked ? "fill-current" : ""} />
              </button>
              }
              <Link href="/" className="text-black hover:text-gray-600">
                <X size={24} />
                <span className="sr-only">Close</span>
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8 md:flex md:items-start md:space-x-6">
              <img
                src={event.image}
                alt={event.name}
                className="w-full md:w-1/2 h-64 object-cover rounded-lg mb-4 md:mb-0"
              />
              <div>
                <h2 className="text-3xl font-bold mb-2">{event.name}</h2>
                <a
                    href={orgwebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <p className="text-xl font-bold text-blue-600 mb-2">{event.institution}</p>
                </a>
                <p className="text-lg text-gray-600 mb-4">{event.category}</p>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="mr-2" /> {event.location}
                  <a
                    href={event.gpsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={16} />
                    <span className="sr-only">View on Map</span>
                  </a>
                </div>
                <p className="text-gray-700 mb-2">{event.description}</p>
                <p className="text-gray-600">Duration: {event.duration}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">Event Coordinators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.coordinators.map((coordinator, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">{coordinator.name} {coordinator.isFaculty && <span className="text-sm font-normal text-gray-500">(Faculty)</span>}</p>
                    <p className="text-gray-600 flex items-center"><Mail size={16} className="mr-2" /> {coordinator.email}</p>
                    <p className="text-gray-600 flex items-center"><Phone size={16} className="mr-2" /> {coordinator.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedProgram && (
              <div ref={selectedProgramRef} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold">Selected Program</h3>
                  <button
                    onClick={() => setSelectedProgram(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={selectedProgram.image}
                      alt={selectedProgram.name}
                      className="w-full md:w-1/3 h-48 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-semibold">{selectedProgram.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedProgram.registrationOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedProgram.registrationOpen ? 'Registration Open' : 'Registration Closed'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">Category: {selectedProgram.category}</p>
                      <p className="text-gray-600 mb-2">Date: {selectedProgram.date}</p>
                      <p className="text-gray-600 mb-2">Time: {selectedProgram.time}</p>
                      <p className="text-gray-700 mb-2">{selectedProgram.rules}</p>
                      <a
                        href={selectedProgram.pdf} target="_blank"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2"
                      >
                        Download Rules PDF <Download className="ml-1" size={16} />
                      </a>
                      <p className="mb-2">Registration Fee: ${selectedProgram.regFees}</p>
                      <p className="mb-4">
                        {selectedProgram.isTeamEvent ? 'Team Event' : 'Solo Event'} (
                        {selectedProgram.minParticipants}-{selectedProgram.maxParticipants} participants)
                      </p>
                    </div>
                  </div>
                  {usertype == 'participant' &&
                  <button onClick={() => handleRegister(selectedProgram.id)}
                    className="w-full mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    disabled={!selectedProgram.registrationOpen}
                  >
                    Register Now
                  </button>}
                </div>

                <div className="mt-8">
                  <h4 className="text-xl font-semibold mb-2">Program Coordinators</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProgram.coordinators.map((coordinator, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">{coordinator.name} {coordinator.isFaculty && <span className="text-sm font-normal text-gray-500">(Faculty)</span>}</p>
                        <p className="text-gray-600 flex items-center"><Mail size={16} className="mr-2" /> {coordinator.email}</p>
                        <p className="text-gray-600 flex items-center"><Phone size={16} className="mr-2" /> {coordinator.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-2xl font-semibold mb-4">All Programs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.programs.map((program) => (
                  <div
                    key={program.id}
                    className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${selectedProgram?.id === program.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleProgramClick(program)}
                  >
                    <div className="relative">
                      <img
                        src={program.image}
                        alt={program.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      {usertype == 'participant' &&
                      <button
                        onClick={(e) => toggleProgramBookmark(program.id, e)}
                        className={`absolute top-2 right-2 p-2 rounded-full ${bookmarkedPrograms.has(program.id) ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'} hover:bg-yellow-200 transition-colors`}
                        aria-label={bookmarkedPrograms.has(program.id) ? "Remove bookmark" : "Bookmark program"}
                      >
                        <Bookmark size={16} className={bookmarkedPrograms.has(program.id) ? "fill-current" : ""} />
                      </button>
                      }
                    </div>
                    <h3 className="font-semibold mb-1">{program.name}</h3>
                    <p className="text-sm text-gray-600">{program.date}</p>
                    <p className="text-sm text-gray-600">{program.category}</p>
                    <p className="text-sm text-gray-600">Registration Fee: ${program.regFees}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${program.registrationOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {program.registrationOpen ? 'Registration Open' : 'Registration Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}