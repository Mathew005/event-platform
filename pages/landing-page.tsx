'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, MapPin, Clock, Filter, ChevronLeft, ChevronRight, User, LogOut, Settings } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useRouter } from 'next/navigation'
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Calendar as DateCalendar } from "@/components/ui/calendar"
import config from '@/config'
import { useUserContext } from '@/components/contexts/UserContext'
import axios from 'axios'
import { useEventContext } from '@/components/contexts/EventContext'

const districts = {
  "thiruvananthapuram": "Thiruvananthapuram",
  "kollam": "Kollam",
  "pathanamthitta": "Pathanamthitta",
  "alappuzha": "Alappuzha",
  "kottayam": "Kottayam",
  "idukki": "Idukki",
  "ernakulam": "Ernakulam",
  "thrissur": "Thrissur",
  "palakkad": "Palakkad",
  "malappuram": "Malappuram",
  "kozhikode": "Kozhikode",
  "wayanad": "Wayanad",
  "kannur": "Kannur",
  "kasaragod": "Kasaragod",
}

const categoriesAndSubs = {
  "technology": ["coding", "web design", "ai", "cybersec", "blockchain", "data", "cloud", "iot", "ar/vr"],
  "culture": ["art", "music", "dance", "books", "langs", "film", "theater", "food traditions", "cultural heritage"],
  "commerce": ["marketing", "finance", "startups", "e-commerce", "supply chain", "social biz"],
  "science": ["physics", "chem", "bio", "space", "enviro science", "psych", "genetics", "geology"],
  "sports": ["soccer", "basketball", "tennis", "swim", "yoga", "running", "martial arts", "extreme sports"],
  "lifestyle": ["fashion", "cooking", "travel", "photo", "fitness trends", "home decor", "gardening", "mindfulness"],
  "health": ["mental health", "nutrition", "holistic", "meditation", "wellness", "fitness"],
  "environment": ["renewables", "conservation", "urban garden", "eco living", "waste reduction", "sustainable fashion"],
  "education": ["workshops", "lifelong learning", "stem", "languages", "online courses", "skills"],
  "social": ["service", "activism", "nonprofit", "social justice", "volunteering", "civic duty"],
  "gaming": ["video games", "board games", "game dev", "vr", "streaming", "game design"],
  "food": ["culinary", "wine", "food trucks", "global cuisine", "food fests", "sustainable eating"],
  "travel": ["adventure", "cultural exchange", "travel photo", "eco tourism", "road trips", "backpacking"],
  "crafts": ["handmade", "diy", "upcycling", "markets", "craft fairs", "sewing"],
  "film": ["documentaries", "filmmaking", "animation", "storytelling", "film fests", "podcasting"],
  "history": ["reenactments", "genealogy", "local history", "preservation", "archaeology"],
  "themes": ["innovation", "cultures", "future work", "digital nomads", "diversity", "nature", "art-tech fusion", "tradition", "mindfulness", "local talent"]
}


const eventsAndProgram = [
  // { id: 1, type: 'event', title: "Summer Music Festival", image: `${config.api.host}${ImageFile}dance.jpg`, date: "2024-07-15", time: "2:00 PM", location: "thiruvananthapuram", categories: ["culture", "music"], institute: "Kerala Music Institute" },
  // { id: 2, type: 'event', title: "Tech Conference 2024", image: `${config.api.host}${ImageFile}tech_confernce.jpg`, date: "2024-08-22", time: "9:00 AM", location: "palakkad", categories: ["technology", "education"], institute: "Tech Innovators Association" },
  // { id: 3, type: 'event', title: "Food & Wine Expo", image: `${config.api.host}${ImageFile}wine_tasting.jpg`, date: "2024-09-10", time: "11:00 AM", location: "kozhikode", categories: ["food", "culture"], institute: "Culinary Arts Foundation" },
  // { id: 4, type: 'event', title: "Art Gallery Opening", image: `${config.api.host}${ImageFile}art-gallery.jpg`, date: "2024-10-05", time: "7:00 PM", location: "malappuram", categories: ["culture", "art"], institute: "Kerala Arts Council" },
  // { id: 5, type: 'event', title: "Marathon 2024", image: `${config.api.host}${ImageFile}marathon.webp`, date: "2024-11-12", time: "7:00 AM", location: "ernakulam", categories: ["sports", "health"], institute: "Kerala Athletics Association" },
  // { id: 1, type: 'program', eventId: 1, title: "Classical Music Concert", image: `${config.api.host}${ImageFile}classical_music.jpg`, date: "2024-07-16", time: "6:00 PM", venue: "Town Hall Auditorium", category: "culture", subcategory: "music", event: "Summer Music Festival" },
  // { id: 2, type: 'program', eventId: 1, title: "Folk Dance Workshop", image: `${config.api.host}${ImageFile}dance.jpg`, date: "2024-07-17", time: "10:00 AM", venue: "Cultural Center", category: "culture", subcategory: "dance", event: "Summer Music Festival" },
  // { id: 3, type: 'program', eventId: 2, title: "AI in Healthcare Seminar", image: `${config.api.host}${ImageFile}ai.jpg`, date: "2024-08-23", time: "10:00 AM", venue: "Tech Center", category: "technology", subcategory: "ai", event: "Tech Conference 2024" },
  // { id: 4, type: 'program', eventId: 2, title: "Blockchain Workshop", image: `${config.api.host}${ImageFile}blockchain.jpg`, date: "2024-08-24", time: "2:00 PM", venue: "Innovation Hub", category: "technology", subcategory: "blockchain", event: "Tech Conference 2024" },
  // { id: 5, type: 'program', eventId: 3, title: "Wine Tasting Session", image: `${config.api.host}${ImageFile}wine_tasting2.jpg`, date: "2024-09-11", time: "2:00 PM", venue: "Grand Hotel", category: "food", subcategory: "wine", event: "Food & Wine Expo" },
]

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

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

const getData = async () => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.landing}`);
    // console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};


export default function Component() {
  const {
    userId,
    setUserId,
    username,
    setUsername,
    usertype,
    setUsertype,
  } = useUserContext();
  const { eventId, programId, setEventId, setProgramId } = useEventContext();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [showType, setShowType] = useState("all");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [avatar, setAvatar] = useState("")
  const [eventsAndPrograms, setEventsAndPrograms] = useState(
    eventsAndProgram
  );
  const [eventLength, setEventLength] = useState(0)

  useEffect(() => {
    // setUserId('1')
    // setUsertype('participant')
  }, [])

  useEffect(() => {
    const fetchEventAndPrograms = async () => {
        const data = await getData();
        setEventsAndPrograms(data);
        setEventLength(data.filter(item => item.type === 'event').length)
    };
  
    fetchEventAndPrograms();
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userId) {
        const table = usertype === 'participant' ? 'Participants' : 'Organizers'
        const CID = usertype === 'participant' ? 'PID' : 'OID'
        const CTarget = usertype === 'participant' ? 'PImage' : 'OImage'
        const data = await fetchData(table, userId, CID, [CTarget]);
        setAvatar(`${config.api.host}${data[CTarget]}`);
      }
    };
  
    setIsLoggedIn(userId !== undefined && userId !== '');
  
    fetchAvatar();
  }, [userId]);
  
  const handleDashboard = () => {
    router.push(`/dashboard/${usertype}`);
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      (prev + 1) % eventLength
    );
    resetTimer(8000); 
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      (prev - 1 + eventLength) % 
    eventLength
    );
    resetTimer(8000);
  };

  const resetTimer = (timeout: number) => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current); 
    }
    slideIntervalRef.current = setInterval(nextSlide, timeout); 
  };

  useEffect(() => {
    resetTimer(5000);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${currentSlide * 100}%)`
    }
  }, [currentSlide])

  const handleLogin = () => {
    router.push('/auth/login');
  }

  const handleSignup = () => {
    router.push('/auth/register')
  }

  const handleProfile = () => {
    router.push('/profile')
  }
  
  const handleLogOut = () => {
    setUserId('');
    setUsername('');
    setUsertype('');
    setIsLoggedIn(false);
  };

  const handleCardClick = (item: any) => {
    console.log(item)
    if (item.type === 'program') {
      console.log('Event clicked:', item.eventId, 'Program clicked:', item.id);
      setEventId(item.eventId)
      setProgramId(item.id)
      router.push('/event')
      return
      // Add your event handling logic here
    } 
    if(item.type == 'event') {
      console.log('Event clicked:', item.id);
      setEventId(item.id)
      router.push('/event')
      return
      // Add your program handling logic here
    }
  };
  
  function getInitials(fullName: string): string {
    const names = fullName.trim().split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
  }

  const filteredItems = eventsAndPrograms.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.type === 'event' ? item.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) : item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.venue && item.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.institute && item.institute.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.event && item.event.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || 
                            (item.type === 'event' ? item.categories.includes(selectedCategory.toLowerCase()) : item.category === selectedCategory.toLowerCase())
    const matchesDistrict = selectedDistrict === "all" || 
                            (item.type === 'event' && item.location === selectedDistrict) ||
                            (item.type === 'program' && eventsAndPrograms.find(event => event.type === 'event' && event.id === item.eventId)?.location === selectedDistrict)
    const matchesType = showType === "all" || item.type === showType
    const matchesDate = !dateRange || (dateRange?.from && dateRange?.to &&  new Date(item.date) >= new Date(dateRange.from) &&   new Date(item.date) <= new Date(dateRange.to))
    return matchesSearch && matchesCategory && matchesDistrict && matchesType && matchesDate
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">CFC</Link>
            </div>
            <div className="flex items-center">
              {isLoggedIn ? (
                <>
                  <Button variant="default" className="mr-2" onClick={handleDashboard}>Dashboard</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <Avatar>
                          <AvatarImage src={avatar} alt="@shadcn" />
                          <AvatarFallback>{getInitials(username)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-lg">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuItem onClick={handleProfile}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem> */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" className="mr-2" onClick={handleLogin}>Login</Button>
                  <Button variant="default" onClick={handleSignup}>Sign Up</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        <section className="mb-12 relative">
          <h2 className="text-2xl font-bold mb-4">Featured Events</h2>
          {eventsAndPrograms.filter(item => item.type === 'event').length > 0 ? (
          <div className="overflow-hidden rounded-lg">
            <div
              ref={carouselRef}
              className="flex transition-transform duration-300 ease-in-out"
              style={{ width: `${eventsAndPrograms.filter(item => item.type === 'event').length * 100}%` }}
            >
              {eventsAndPrograms.filter(item => item.type === 'event').map((event) => (
                <div key={event.id} className="w-full flex-shrink-0 relative cursor-pointer" onClick={() => handleCardClick(event)}>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-[300px] sm:h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 sm:p-6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {event.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                          {capitalize(category)}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2">{event.title}</h3>
                    <div className="flex items-center text-white mb-1 text-xs sm:text-base">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-white mb-1 text-xs sm:text-base">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span>{districts[event.location]}</span>
                    </div>
                    <div className="flex items-center text-white text-xs sm:text-base">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span>{event.institute}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          ):(
            <p>No featured events available at the moment.</p>)
          }
          {eventLength > 0 && 
          <Button
          variant="outline"
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          onClick={prevSlide}
          aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        }
        {eventLength > 0 && 
          <Button
          variant="outline"
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          onClick={nextSlide}
          aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          }
        </section>

        <section id="events" className="mb-12">
                
          <div className="sticky top-16 z-20">
            <div className="bg-gray-100 w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-wrap justify-between items-center">
                  <h2 className="text-2xl font-bold">Programs & Events</h2>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Category</h4>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.keys(categoriesAndSubs).map((category) => (
                              <SelectItem key={category} value={category}>{capitalize(category)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">District</h4>
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {Object.entries(districts).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Type</h4>
                        <Select value={showType} onValueChange={setShowType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Show type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="event">Events Only</SelectItem>
                            <SelectItem value="program">Programs Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Date</h4>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(dateRange.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <DateCalendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateRange?.from}
                              selected={dateRange}
                              onSelect={setDateRange}
                              numberOfMonths={2}
                              disabled={{ before: new Date() }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={`${item.type}-${item.id}`} className="transition-transform">
                <CardHeader className="p-0 relative">
                  <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                  <CardDescription suppressHydrationWarning={true}>
                    <div className="flex items-center mt-2" >
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {item.type === 'event' 
                          ? districts[item.location] 
                          : `${item.venue} (${districts[eventsAndPrograms.find(event => event.type === 'event' && event.id === item.eventId)?.location || '']})`}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <User className="w-4 h-4 mr-2" />
                      <span>{item.type === 'event' ? item.institute : `Part of: ${item.event}`}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={item.type === 'event' ? 'default' : 'secondary'}>
                        {capitalize(item.type)}
                      </Badge>
                      {item.type === 'event' 
                        ? item.categories.map((category, index) => (
                            <Badge key={index} variant="outline">{capitalize(category)}</Badge>
                          ))
                        : (
                          <>
                            <Badge variant="outline">{capitalize(item.category)}</Badge>
                            <Badge variant="outline">{capitalize(item.subcategory)}</Badge>
                          </>
                        )
                      }
                    </div>
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => {handleCardClick(item)}}>View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          ) : (
          <p>No events or programs match your current filters.</p>
        )}
        </section>
      </main>
    </div>
  )
}