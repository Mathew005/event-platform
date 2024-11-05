'use client'

import React, { useState, useCallback, useEffect } from "react"
import { X, Check, ArrowUpRight, MapPin, Trash2, Loader2 } from "lucide-react"
import Cropper from "react-easy-crop"
import { format, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { getCroppedImg } from "@/lib/cropImage"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"
import axios from "axios"
import config from "@/config"
import { toast, Toaster } from "sonner"
import { useUserContext } from "@/components/contexts/UserContext"
import { useEventContext } from "@/components/contexts/EventContext"

const availableFestTypes = [
  { value: "technology", label: "Technology" },
  { value: "cultural", label: "Culture" },
  { value: "commerce", label: "Commerce" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "education", label: "Education" },
  { value: "social", label: "Social" },
  { value: "gaming", label: "Gaming" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "crafts", label: "Crafts" },
  { value: "film", label: "Film" },
  { value: "history", label: "History" },
  { value: "themes", label: "Themes" }
]

const districts = [
  { value: "thiruvananthapuram", label: "Thiruvananthapuram" },
  { value: "kollam", label: "Kollam" },
  { value: "pathanamthitta", label: "Pathanamthitta" },
  { value: "alappuzha", label: "Alappuzha" },
  { value: "kottayam", label: "Kottayam" },
  { value: "idukki", label: "Idukki" },
  { value: "ernakulam", label: "Ernakulam" },
  { value: "thrissur", label: "Thrissur" },
  { value: "palakkad", label: "Palakkad" },
  { value: "malappuram", label: "Malappuram" },
  { value: "kozhikode", label: "Kozhikode" },
  { value: "wayanad", label: "Wayanad" },
  { value: "kannur", label: "Kannur" },
  { value: "kasaragod", label: "Kasaragod" },
]

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

const insertData = async (table: string, data: any) => {
  if (!table || !data) {
    console.error('Table name and data must be provided')
    return false
  }

  try {
    const response = await axios.post(
      `${config.api.host}${config.api.routes.set}`,
      { table, data },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const result = response.data

    if (result.success) {
      console.log('Data inserted successfully')
      return result.insertId
    } else {
      console.error(`Failed to insert data: ${result.message}`)
      return false
    }
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}

export default function Component() {
  const [eventName, setEventName] = useState("")
  const [festTypes, setFestTypes] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [locationOpen, setLocationOpen] = useState(false)
  const [location, setLocation] = useState("")
  const [coordinators, setCoordinators] = useState([{ name: "", phone: "", email: "", isFaculty: false }])
  const [tempImage, setTempImage] = useState<string>("")
  const [croppedImage, setCroppedImage] = useState<string>("")
  const [isCropping, setIsCropping] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { eventId, setEventId } = useEventContext()
  const { userId, setUserId } = useUserContext()
  const router = useRouter()

  const onClose = () => {
    router.push('/dashboard/organizer')
  }

  useEffect(() => {
    setUserId('1')
    setEventId('1')
  }, [])

  useEffect(() => {
    const fetchEventData = async () => {
      if (eventId) {
        try {
          const eventData = await fetchData('Events', eventId, 'EID', ['EName', 'ELocation', 'EType', 'EImage', 'EStartDate', 'EndDate', 'EDecription', 'CID'])
          // console.log(eventData)
          if (eventData) {
            setEventName(eventData.EName)
            setLocation(eventData.ELocation)
            setFestTypes(eventData.EType.split(','))
            setCroppedImage(`${config.api.host}${eventData.EImage}`)
            const startDate = new Date(eventData.EStartDate)
            const endDate = new Date(eventData.EndDate)
            setFromDate(startDate)
            setToDate(endDate)
            setDescription(eventData.EDecription)
            const isMulti = startDate.toDateString() !== endDate.toDateString()
            setIsMultiDay(isMulti)
            if (isMulti) {
              setDateRange({ from: startDate, to: endDate })
            }

            const coordinatorData = await fetchData('Coordinators', eventData.CID, 'CID', ['Name1', 'Email1', 'Phone1', 'Faculty1', 'Name2', 'Email2', 'Phone2', 'Faculty2', 'Name3', 'Email3', 'Phone3', 'Faculty3', 'Name4', 'Email4', 'Phone4', 'Faculty4'])
            if (coordinatorData) {
              const newCoordinators = []
              for (let i = 1; i <= 4; i++) {
                newCoordinators.push({
                  name: coordinatorData[`Name${i}`] || "",
                  email: coordinatorData[`Email${i}`] || "",
                  phone: coordinatorData[`Phone${i}`] || "",
                  isFaculty: coordinatorData[`Faculty${i}`] || false
                })
              }
              setCoordinators(newCoordinators)
            }
          }
        } catch (error) {
          console.error('Error fetching event data:', error)
          toast.error('Failed to load event data')
        }
      }
    }

    fetchEventData()
  }, [eventId])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, boolean> = {}
    if (!eventName.trim()) newErrors.eventName = true
    if (festTypes.length === 0) newErrors.festTypes = true
    if (!description.trim()) newErrors.description = true
    if (!croppedImage) newErrors.eventImage = true
    if (isMultiDay && (!fromDate || !toDate)) newErrors.dateRange = true
    if (!isMultiDay && !fromDate) newErrors.date = true
    if (!location) newErrors.location = true
    if (!coordinators.some(c => c.name.trim() && c.phone.trim() && c.email.trim())) newErrors.coordinators = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [eventName, festTypes, description, croppedImage, isMultiDay, fromDate, toDate, location, coordinators])

  useEffect(() => {
    if (formSubmitted) {
      validateForm()
    }
  }, [eventName, festTypes, description, croppedImage, isMultiDay, fromDate, toDate, location, coordinators, validateForm, formSubmitted])

  const handleCustomAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempImage(reader.result as string)
        setIsCropping(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels)
      setCroppedImage(croppedImage)
      setIsCropping(false)
    } catch (e) {
      console.error(e)
    }
  }, [tempImage, croppedAreaPixels])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      let imageUrl = croppedImage
      if (tempImage) {
        imageUrl = await uploadImage(croppedImage)
      }

      const coordinatorData: Record<string, any> = {}
      for (let i = 0; i < 4; i++) {
        const coordinator = coordinators[i] || { name: "", phone: "", email: "", isFaculty: false }
        const num = i + 1
        coordinatorData[`Name${num}`] = coordinator.name.trim()
        coordinatorData[`Email${num}`] = coordinator.email.trim()
        coordinatorData[`Phone${num}`] = coordinator.phone.trim()
        coordinatorData[`Faculty${num}`] = coordinator.isFaculty
      }

      let coordinatorId
      if (eventId) {
        const eventData = await fetchData('Events', eventId, 'EID', ['CID'])
        coordinatorId = eventData.CID
        for (const [key, value] of Object.entries(coordinatorData)) {
          await saveData('Coordinators', coordinatorId, 'CID', key, value)
        }
      } else {
        coordinatorId = await insertData('Coordinators', coordinatorData)
      }

      if (!coordinatorId) {
        throw new Error('Failed to insert/update coordinator data')
      }

      const eventData = {
        OID: userId,
        EName: eventName,
        ELocation: location,
        EType: festTypes.join(','),
        EImage: imageUrl.replace(config.api.host, ''),
        EStartDate: addDays(fromDate!, 1).toISOString(),
        EndDate: addDays(toDate || fromDate!, 1).toISOString(),
        EDecription: description,
        CID: coordinatorId,
      }

      if (eventId) {
        for (const [key, value] of Object.entries(eventData)) {
          await saveData('Events', eventId, 'EID', key, value)
        }
      } else {
        await insertData('Events', eventData)
      }

      toast.success(eventId ? "Event Updated" : "Event Created", {
        duration: 5000,
        description: `${eventName} has been ${eventId ? 'updated' : 'scheduled'} for ${
          isMultiDay
            ? `${format(fromDate!, "PP")} to ${format(toDate || fromDate!, "PP")}`
            :   format(fromDate!, "PP")
        } at ${location.toUpperCase()}.`,
      })

      setTimeout(() => {
        router.push("/dashboard/organizer")
      }, 5000)
    } catch (error) {
      console.error("Error creating/updating event:", error)
      toast.error(`Failed to ${eventId ? 'update' : 'create'} event. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadImage = async (croppedImage: string) => {
    try {
      const response = await fetch(croppedImage)
      const blob = await response.blob()
      const file = new File([blob], "event_image.jpg", { type: "image/jpeg" })
      const formData = new FormData()
      formData.append('type', 'event')
      formData.append('file', file)

      const uploadResponse = await axios.post(`${config.api.host}${config.api.routes.upload}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (uploadResponse.data.success) {
        return uploadResponse.data.url
      } else {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  const removeCoordinator = (index: number) => {
    setCoordinators(coordinators.filter((_, i) => i !== index))
  }

  const toggleFestType = (value: string) => {
    setFestTypes(prev =>
      prev.includes(value)
        ? prev.filter(t => t !== value)
        : [...prev, value]
    )
  }

  const sanitizeInput = (input: string) => {
    return input.replace(/[^a-zA-Z0-9@.\s]/g, '')
  }


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-8 md:p-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{eventId ? 'Edit Event' : 'Create Event'}</h1>
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventName" className={formSubmitted && errors.eventName ? "text-red-500" : ""}>Event Name</Label>
                <Input 
                  id="eventName" 
                  value={eventName} 
                  onChange={(e) => setEventName(e.target.value)} 
                  placeholder="Enter Event Name"
                  className={formSubmitted && errors.eventName ? "border-red-500" : ""}
                />
              </div>

              <div>
                <Label className={formSubmitted && errors.festTypes ? "text-red-500" : ""}>Fest Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableFestTypes.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={festTypes.includes(type.value) ? "default" : "outline"}
                      onClick={() => toggleFestType(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
                {formSubmitted && errors.festTypes && <p className="text-red-500 text-sm mt-1">Please select at least one event type</p>}
              </div>

              <div>
                <Label htmlFor="description" className={formSubmitted && errors.description ? "text-red-500" : ""}>Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  placeholder="Enter Event Description" 
                  onChange={(e) => setDescription(e.target.value)}
                  className={formSubmitted && errors.description ? "border-red-500" : ""}
                />
              </div>

              <div>
                <Label htmlFor="eventImage" className={formSubmitted && errors.eventImage ? "text-red-500" : ""}>Event Image</Label>
                <Input 
                  id="eventImage" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCustomAvatarUpload} 
                  className={`w-full ${formSubmitted && errors.eventImage ? "border-red-500" : ""}`}
                />
                {croppedImage && (
                  <img src={croppedImage} alt="Cropped event image" className="mt-2 max-w-full h-auto rounded-lg" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              
              <div>
                <Label>Event Duration</Label>
                <RadioGroup value={isMultiDay ? "multi" : "single"} onValueChange={(value) => setIsMultiDay(value === "multi")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Day</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multi" id="multi" />
                    <Label htmlFor="multi">Multiple Days</Label>
                  </div>
                </RadioGroup>
              </div>

              {isMultiDay ? (
                <div>
                  <Label className={formSubmitted && errors.dateRange ? "text-red-500" : ""}>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        type="button"
                        variant="outline" 
                        className={`w-full justify-start text-left font-normal ${formSubmitted && errors.dateRange ? "border-red-500" : ""}`}
                      >
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
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
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(newDateRange) => {
                          setDateRange(newDateRange)
                          setFromDate(newDateRange?.from ?? null)
                          setToDate(newDateRange?.to ?? null)
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <div>
                  <Label className={formSubmitted && errors.date ? "text-red-500" : ""}>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        type="button"
                        variant="outline" 
                        className={`w-full justify-start text-left font-normal ${formSubmitted && errors.date ? "border-red-500" : ""}`}
                      >
                        {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={(newDate) => {
                          setFromDate(newDate)
                          setToDate(newDate)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <Label htmlFor="location" className={formSubmitted && errors.location ? "text-red-500" : ""}>Location</Label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      role="combobox" 
                      aria-expanded={locationOpen} 
                      className={`w-full justify-between ${formSubmitted && errors.location ? "border-red-500" : ""}`}
                    >
                      {location ? districts.find((district) => district.value === location)?.label : "Select district..."}
                      <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search district..." />
                      <CommandList>
                        <CommandEmpty>No district found.</CommandEmpty>
                        <CommandGroup>
                          {districts.map((district) => (
                            <CommandItem
                              key={district.value}
                              value={district.value}
                              onSelect={(currentValue) => {
                                setLocation(currentValue === location ? "" : currentValue)
                                setLocationOpen(false)
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${location === district.value ? "opacity-100" : "opacity-0"}`} />
                              {district.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className={formSubmitted && errors.coordinators ? "text-red-500" : ""}>Coordinators</Label>
                <Card>
                  <CardContent className="p-4">
                    <div className="max-h-64 overflow-y-auto space-y-4">
                      {coordinators.map((coordinator, index) => (
                        <div key={index} className="space-y-2">
                          <Input
                            placeholder="Name"
                            value={coordinator.name}
                            onChange={(e) => {
                              const newCoordinators = [...coordinators]
                              newCoordinators[index].name = sanitizeInput(e.target.value)
                              setCoordinators(newCoordinators)
                            }}
                          />
                          <Input
                            placeholder="Phone"
                            value={coordinator.phone}
                            onChange={(e) => {
                              const newCoordinators = [...coordinators]
                              newCoordinators[index].phone = e.target.value.replace(/\D/g, '')
                              setCoordinators(newCoordinators)
                            }}
                          />
                          <Input
                            placeholder="Email"
                            type="email"
                            value={coordinator.email}
                            onChange={(e) => {
                              const newCoordinators = [...coordinators]
                              newCoordinators[index].email = sanitizeInput(e.target.value)
                              setCoordinators(newCoordinators)
                            }}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`faculty-${index}`}
                                checked={coordinator.isFaculty}
                                onCheckedChange={(checked) => {
                                  const newCoordinators = [...coordinators]
                                  newCoordinators[index].isFaculty = checked as boolean
                                  setCoordinators(newCoordinators)
                                }}
                              />
                              <Label htmlFor={`faculty-${index}`}>This Coordinator is a Faculty</Label>
                            </div>
                            {index > 0 && (
                              <Button type="button" variant="destructive" size="sm" onClick={() => removeCoordinator(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {coordinators.length < 4 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setCoordinators([...coordinators, { name: "", phone: "", email: "", isFaculty: false }])}
                      >
                        Add Coordinator
                      </Button>
                    )}
                  </CardContent>
                </Card>
                {formSubmitted && errors.coordinators && <p className="text-red-500 text-sm mt-1">Please add at least one coordinator with all details</p>}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {eventId ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                {eventId ? 'Update' : 'Save'} & Proceed <ArrowUpRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <Dialog open={isCropping} onOpenChange={setIsCropping}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsCropping(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCropConfirm}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}