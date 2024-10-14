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
import { Calendar, MapPin, Clock, Filter, ChevronLeft, ChevronRight, User, LogOut, Settings, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useRouter } from 'next/navigation'
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import config from '@/config'

const ImageFile = 'files/imgs/events/placeholder.svg'

// Mock data for events and programs
const eventsAndPrograms = [
  { id: 1, type: 'event', title: "Summer Music Festival", image: `${config.api.host}${ImageFile}`, date: "2024-07-15", time: "14:00", location: "Central Park, NY", category: "Music", institute: "NYC Music Institute" },
  { id: 2, type: 'event', title: "Tech Conference 2024", image: `${config.api.host}${ImageFile}`, date: "2024-08-22", time: "09:00", location: "Convention Center, SF", category: "Technology", institute: "Tech Innovators Association" },
  { id: 3, type: 'event', title: "Food & Wine Expo", image: `${config.api.host}${ImageFile}`, date: "2024-09-10", time: "11:00", location: "Expo Hall, Chicago", category: "Food", institute: "Culinary Arts Foundation" },
  { id: 4, type: 'event', title: "Art Gallery Opening", image: `${config.api.host}${ImageFile}`, date: "2024-10-05", time: "19:00", location: "Downtown Gallery, LA", category: "Art", institute: "LA Arts Council" },
  { id: 5, type: 'event', title: "Marathon 2024", image: `${config.api.host}${ImageFile}`, date: "2024-11-12", time: "07:00", location: "City Center, Boston", category: "Sports", institute: "Boston Athletics Association" },
  { id: 6, type: 'program', title: "AI Workshop", image: `${config.api.host}${ImageFile}`, date: "2024-08-23", time: "10:00", location: "Convention Center, SF", category: "Technology", event: "Tech Conference 2024" },
  { id: 7, type: 'program', title: "Wine Tasting Session", image: `${config.api.host}${ImageFile}`, date: "2024-09-11", time: "14:00", location: "Expo Hall, Chicago", category: "Food", event: "Food & Wine Expo" },
  { id: 8, type: 'program', title: "Live Music Performance", image: `${config.api.host}${ImageFile}`, date: "2024-07-16", time: "18:00", location: "Central Park, NY", category: "Music", event: "Summer Music Festival" },
]

const categories = ['Music', 'Technology', 'Food', 'Sports', 'Art', 'Business', 'Health', 'Education']
const districts = ['New York', 'San Francisco', 'Chicago', 'Los Angeles', 'Boston']

interface UserDetails {
  userType: string;
  userName: string;
  isLoggedIn: boolean;
}

export default function Component({ userType, userName, isLoggedIn }: UserDetails = { userType: '', userName: '', isLoggedIn: false }) {
  console.log(userName);

  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [showType, setShowType] = useState("all")
  const carouselRef = useRef<HTMLDivElement>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the interval

  const handleDashboard = () => {
      router.push(`/dashboard/${userType}`);
  }

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      (prev + 1) % eventsAndPrograms.filter(item => item.type === 'event').length
    );
    resetTimer(8000); 
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => 
      (prev - 1 + eventsAndPrograms.filter(item => item.type === 'event').length) % 
      eventsAndPrograms.filter(item => item.type === 'event').length
    );
    resetTimer(8000);
  };

  // Reset the interval and start a new one
  const resetTimer = (timeout: number) => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current); 
    }
    slideIntervalRef.current = setInterval(nextSlide, timeout); 
  };

  // Automatically move to the next slide every 5 seconds initially
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
  
  const filteredItems = eventsAndPrograms.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.institute && item.institute.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.event && item.event.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesDistrict = selectedDistrict === "all" || item.location.includes(selectedDistrict)
    const matchesType = showType === "all" || item.type === showType
    const matchesDate = !dateRange || (dateRange?.from && dateRange?.to &&  new Date(item.date) >= new Date(dateRange.from) &&   new Date(item.date) <= new Date(dateRange.to))
    return matchesSearch && matchesCategory && matchesDistrict && matchesType && matchesDate
  })


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
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
                  {/* Profile Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-lg">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Carousel */}
        <section className="mb-12 relative">
  <h2 className="text-2xl font-bold mb-4">Featured Events</h2>
  <div className="overflow-hidden rounded-lg">
    <div
      ref={carouselRef}
      className="flex transition-transform duration-300 ease-in-out"
      style={{ width: `${eventsAndPrograms.filter(item => item.type === 'event').length * 100}%` }}
    >
      {eventsAndPrograms.filter(item => item.type === 'event').map((event) => (
        <div key={event.id} className="w-full flex-shrink-0 relative">
          <div
            className="w-full h-[300px] sm:h-[400px]  bg-center"
            style={{ backgroundImage: `url(${event.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 sm:p-6">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md inline-block mb-1 sm:mb-2 w-fit text-xs sm:text-sm">
                {event.category}
              </div>
              <h3 className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2">{event.title}</h3>
              <div className="flex items-center text-white mb-1 text-xs sm:text-base">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center text-white mb-1 text-xs sm:text-base">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-white text-xs sm:text-base">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span>{event.institute}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  <Button
    variant="outline"
    className="absolute left-4 top-1/2 transform -translate-y-1/2"
    onClick={prevSlide}
    aria-label="Previous slide"
  >
    <ChevronLeft className="h-6 w-6" />
  </Button>
  <Button
    variant="outline"
    className="absolute right-4 top-1/2 transform -translate-y-1/2"
    onClick={nextSlide}
    aria-label="Next slide"
  >
    <ChevronRight className="h-6 w-6" />
  </Button>
</section>


        {/* Programs & Events with Filters */}
        <section id="events" className="mb-12">
          <div className="sticky top-16 bg-gray-100 z-10 py-4">
            <div className="flex flex-wrap justify-between items-center mb-4">
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
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
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
                            {districts.map((district) => (
                              <SelectItem key={district} value={district}>{district}</SelectItem>
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
                                                {format(
                                                    dateRange.from,
                                                    "LLL dd, y"
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                    dateRange.to,
                                                    "LLL dd, y"
                                                )}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <DateCalendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    disabled = {{ before: new Date()}}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} >
                <CardHeader className="p-0 relative">
                  <img src={`${item.image}?height=400&width=800`} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={item.type === 'event' ? 'default' : 'secondary'}>
                      {item.type === 'event' ? 'Event' : 'Program'}
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
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
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <User className="w-4 h-4 mr-2" />
                      <span>{item.type === 'event' ? item.institute : item.event}</span>
                    </div>
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}