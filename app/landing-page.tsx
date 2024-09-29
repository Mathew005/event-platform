'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MapPin, Clock, Filter, ChevronLeft, ChevronRight, User, LogOut, Settings, UserPlus, Menu, Plus } from 'lucide-react'

// Mock data for events
const events = [
  { id: 1, title: "Summer Music Festival", image: "/placeholder.svg?height=400&width=800", date: "2023-07-15", time: "14:00", location: "Central Park, NY", category: "Music" },
  { id: 2, title: "Tech Conference 2023", image: "/placeholder.svg?height=400&width=800", date: "2023-08-22", time: "09:00", location: "Convention Center, SF", category: "Technology" },
  { id: 3, title: "Food & Wine Expo", image: "/placeholder.svg?height=400&width=800", date: "2023-09-10", time: "11:00", location: "Expo Hall, Chicago", category: "Food" },
  { id: 4, title: "Art Gallery Opening", image: "/placeholder.svg?height=400&width=800", date: "2023-10-05", time: "19:00", location: "Downtown Gallery, LA", category: "Art" },
  { id: 5, title: "Marathon 2023", image: "/placeholder.svg?height=400&width=800", date: "2023-11-12", time: "07:00", location: "City Center, Boston", category: "Sports" },
]

const categories = ['Music', 'Technology', 'Food', 'Sports', 'Art', 'Business', 'Health', 'Education']

export default function Component() {
  const [activeTab, setActiveTab] = useState("all")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length)
  } 

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${currentSlide * 100}%)`
    }
  }, [currentSlide])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">CFC</Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="#events" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Events
              </Link>
              <Link href="#categories" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Categories
              </Link>
              <Link href="#popular" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Popular
              </Link>
            </div>
            <div className="flex items-center">
              <Button variant="default" className="mr-2">
                    Dashboard
              </Button>
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
                <DropdownMenuContent align="end">
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
              <Button
                variant="ghost"
                className="ml-2 md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#events" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Events
              </Link>
              <Link href="#categories" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Categories
              </Link>
              <Link href="#popular" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Popular
              </Link>
            </div>
          </div>
        )}
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
              style={{ width: `${events.length * 100}%` }}
            >
              {events.map((event) => (
                <div key={event.id} className="w-full flex-shrink-0 relative">
                  <div 
                    className="w-full h-[400px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image})` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md inline-block mb-2 w-fit">
                        {event.category}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">{event.title}</h3>
                      <div className="flex items-center text-white mb-1">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-white">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
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
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </section>

        {/* All Events with Filters */}
        <section id="events" className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">All Events</h2>
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
                    <h4 className="font-medium leading-none">Date</h4>
                    <Input type="date" id="date" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Venue</h4>
                    <Select>
                      <SelectTrigger id="venue">
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="central-park">Central Park, NY</SelectItem>
                        <SelectItem value="convention-center">Convention Center, SF</SelectItem>
                        <Select value="expo-hall">Expo Hall, Chicago</Select>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Event Type</h4>
                    <Select>
                      <SelectTrigger id="event-type">
                        <SelectValue placeholder="Select an event type" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Apply Filters</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader className="p-0">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center mt-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
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

        {/* Categories and Popular Events */}
        <Tabs defaultValue="categories" className="mb-12">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
          <TabsContent value="categories">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>
          <TabsContent value="popular">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event) => (
                <Card key={event.id}>
                  <CardHeader className="p-0">
                    <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center mt-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}