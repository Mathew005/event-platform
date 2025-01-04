"use client"

import React, { useState, useCallback, useEffect } from "react"
import { X, Check, ArrowUpRight, MapPin, Trash2, Upload, ChevronDown, Loader2, ExternalLink } from "lucide-react"
import Cropper from "react-easy-crop"
import { addDays, format, parse, isWithinInterval, set } from "date-fns"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getCroppedImg } from "@/lib/cropImage"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"
import config from "@/config"
import axios from "axios"
import { useEventContext } from "@/components/contexts/EventContext"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers'
import dayjs from 'dayjs'
import { Toaster, toast} from "sonner"


const eventCategories = {
  "Technology": ["Coding", "Web Design", "AI", "Cybersec", "Blockchain", "Data", "Cloud", "IoT", "AR/VR"],
  "Culture": ["Art", "Music", "Dance", "Books", "Langs", "Film", "Theater", "Food Traditions", "Heritage"],
  "Commerce": ["Marketing", "Finance", "Startups", "E-commerce", "Supply Chain", "Social Biz"],
  "Science": ["Physics", "Chem", "Bio", "Space", "Enviro Science", "Psych", "Genetics", "Geology"],
  "Sports": ["Soccer", "Basketball", "Tennis", "Swim", "Yoga", "Running", "Martial Arts", "Extreme Sports"],
  "Lifestyle": ["Fashion", "Cooking", "Travel", "Photo", "Fitness", "Home Decor", "Gardening", "Mindfulness"],
  "Health": ["Mental Health", "Nutrition", "Holistic", "Meditation", "Wellness", "Fitness Trends"],
  "Environment": ["Renewables", "Conservation", "Urban Garden", "Eco Living", "Waste Reduction", "Sustainable Fashion"],
  "Education": ["Workshops", "Lifelong Learning", "STEM", "Languages", "Online Courses", "Skills"],
  "Social": ["Service", "Activism", "Nonprofit", "Social Justice", "Volunteering", "Civic Duty"],
  "Gaming": ["Video Games", "Board Games", "Game Dev", "VR", "Streaming", "Game Design"],
  "Food": ["Culinary", "Wine", "Food Trucks", "Global Cuisine", "Food Fests", "Sustainable Eating"],
  "Travel": ["Adventure", "Cultural Exchange", "Travel Photo", "Eco Tourism", "Road Trips", "Backpacking"],
  "Crafts": ["Handmade", "DIY", "Upcycling", "Markets", "Craft Fairs", "Sewing"],
  "Film": ["Documentaries", "Filmmaking", "Animation", "Storytelling", "Film Fests", "Podcasting"],
  "History": ["Heritage", "Reenactments", "Genealogy", "Local History", "Preservation", "Archaeology"],
  "Themes": ["Innovation", "Cultures", "Future Work", "Digital Nomads", "Diversity", "Nature", "Art-Tech Fusion", "Tradition", "Mindfulness", "Local Talent"]
};

// Generate programTypes dynamically
const programTypes = Object.entries(eventCategories).flatMap(([category, programs]) => {
  return programs.map(program => ({
    value: program.toLowerCase().replace(/\s+/g, '-'),
    label: program,
    category: category.toLowerCase()
  }));
});

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

const saveData = async (table: string, identifier: string, identifierColumn: string, target: string, data: any) => {
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

const timePickerStyles = {
  // width: '100%',
  '& .MuiOutlinedInput-root': {
    padding: '10px 14px',
    backgroundColor: 'white',
  },
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, -9px) scale(0.75)',
    backgroundColor: 'white',
    padding: '0 4px',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    transform: 'translate(14px, -9px) scale(0.75)',
  }
}

export default function ProgramCreation() {
  const [programName, setProgramName] = useState("")
  const [programType, setProgramType] = useState("")
  const [programTypeOpen, setProgramTypeOpen] = useState(false)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [date, setDate] = useState<Date>()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [venue, setVenue] = useState("")
  const [hour, setHour] = useState("")
  const [minute, setMinute] = useState("")
  const [ampm, setAmpm] = useState("AM")
  const [rulesRegulations, setRulesRegulations] = useState("")
  const [rulesFile, setRulesFile] = useState<File | null>(null)
  const [registrationFees, setRegistrationFees] = useState("")
  const [isTeamEvent, setIsTeamEvent] = useState(false)
  const [minParticipants, setMinParticipants] = useState("1")
  const [maxParticipants, setMaxParticipants] = useState("1")
  const [coordinators, setCoordinators] = useState([
    { name: "", phone: "", email: "", isFaculty: false },
  ])
  const [tempImage, setTempImage] = useState<string>("")
  const [croppedImage, setCroppedImage] = useState<string>("")
  const [isCropping, setIsCropping] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [eventStartDate, setEventStartDate] = useState<Date | null>(null)
  const [eventEndDate, setEventEndDate] = useState<Date | null>(null)
  const [eventName, setEventName] = useState("")
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFileUrl, setUploadedFileUrl] = useState("")
  const router = useRouter()
  const { eventId, programId, setEventId, setProgramId } = useEventContext()
  const [selectedTime, setSelectedTime] = useState(null)


  useEffect(() => {
    setEventId('7')
    // setProgramId('4')
  }, [])

  useEffect(() => {
    const fetchEventData = async () => {
      if (eventId) {
        const eventData = await fetchData("Events", eventId, "EID", ["EName", "EStartDate", "EndDate", "EType"])
        console.log(eventData)
        if (eventData) {
          setEventStartDate(new Date(eventData.EStartDate))
          setEventEndDate(new Date(eventData.EndDate))
          setEventName(eventData.EName)
          setEventTypes(eventData.EType.split(','))
        }
      }
    }
    fetchEventData()
  }, [eventId])

  useEffect(() => {
    if (programId) {
      const fetchProgramData = async () => {
        const programData = await fetchData("Programs", programId, "PID", [
          "PName", "PTime", "PLocation", "PType", "PImage", "PStartDate", "PEndDate",
          "PDecription", "PDF", "Fee", "Min", "Max", "Contact", "CID", "Open"
        ])
        if (programData) {
          setProgramName(programData.PName)
          setVenue(programData.PLocation)
          setProgramType(programData.PType)
          setCroppedImage(`${config.api.host}/${programData.PImage}`)
          setDate(new Date(programData.PStartDate))
          setIsMultiDay(programData.PStartDate !== programData.PEndDate)
          if (programData.PStartDate !== programData.PEndDate) {
            setDateRange({ from: new Date(programData.PStartDate), to: new Date(programData.PEndDate) })
          }
          setSelectedTime(dayjs(programData.PTime, "HH:mm"))
          setHour(selectedTime?.hour.toString())
          setMinute(selectedTime?.minute.toString())
          setRulesRegulations(programData.PDecription)
          setRegistrationFees(programData.Fee.toString())
          setMinParticipants(programData.Min.toString())
          setMaxParticipants(programData.Max.toString())
          setIsTeamEvent(programData.Max > 1)
          setUploadedFileUrl(`${config.api.host}/${programData.PDF}`)

          // Fetch coordinator data
          const coordinatorData = await fetchData("Coordinators", programData.CID, "CID", [
            "Name1", "Phone1", "Email1", "Faculty1",
            "Name2", "Phone2", "Email2", "Faculty2",
            "Name3", "Phone3", "Email3", "Faculty3",
            "Name4", "Phone4", "Email4", "Faculty4"
          ])
          if (coordinatorData) {
            const newCoordinators = []
            for (let i = 1; i <= 4; i++) {
              if (coordinatorData[`Name${i}`]) {
                newCoordinators.push({
                  name: coordinatorData[`Name${i}`],
                  phone: coordinatorData[`Phone${i}`],
                  email: coordinatorData[`Email${i}`],
                  isFaculty: coordinatorData[`Faculty${i}`] === 1
                })
              }
            }
            setCoordinators(newCoordinators)
          }
        }
      }
      fetchProgramData()
    }
  }, [programId])

  const filteredProgramTypes = programTypes.filter(type => 
    eventTypes.some(eventType => type.category.toLowerCase() === eventType.toLowerCase())
  )

  const handleProgramPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRulesFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setRulesFile(file)
    }
  }

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'programName':
        return value.trim() ? '' : 'Program name is required'
      case 'programType':
        return value ? '' : 'Program type is required'
      case 'programImage':
        return value ? '' : 'Program image is required'
      case 'date':
        return value ? '' : 'Date is required'
      case 'dateRange':
        return value?.from && value?.to ? '' : 'Date range is required'
      case 'venue':
        return value.trim() ? '' : 'Venue is required'
      case 'time':
        console.log(selectedTime)
        return hour && minute && ampm ? '' : 'Time is required'
      case 'rulesFile':
        return uploadedFileUrl ? '' : 'Rules and regulations file is required'
      case 'rulesFile':
        return value ? '' : 'Rules and regulations file is required'
      case 'rulesRegulations':
        return value.trim() ? '' : 'Rules and regulations are required'
      case 'registrationFees':
        return value.trim() ? '' : 'Registration fees are required'
      case 'participants':
        return isTeamEvent && (!minParticipants || !maxParticipants) ? 'Participant numbers are required for team events' : ''
      case 'coordinators':
        return coordinators.some(c => c.name && c.phone && c.email) ? '' : 'At least one coordinator with complete details is required'
      default:
        return ''
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {
      programName: validateField('programName', programName),
      programType: validateField('programType', programType),
      programImage: validateField('programImage', croppedImage),
      venue: validateField('venue', venue),
      time: validateField('time', { hour, minute, ampm }),
      rulesFile: validateField('rulesFile', rulesFile),
      rulesRegulations: validateField('rulesRegulations', rulesRegulations),
      registrationFees: validateField('registrationFees', registrationFees),
      participants: validateField('participants', { minParticipants, maxParticipants }),
      coordinators: validateField('coordinators', coordinators),
    }

    if (isMultiDay) {
      newErrors.dateRange = validateField('dateRange', dateRange)
    } else {
      newErrors.date = validateField('date', date)
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => !error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    console.log(validateForm())
    if (!validateForm()) {
      setIsSubmitting(false)
      toast.error("Please fill in all required fields correctly.")
      return
    }

    try {
      let imageUrl = croppedImage
      if (tempImage) {
        imageUrl = await uploadImage(croppedImage)
      }

      const timeString = selectedTime ? selectedTime.format("HH:mm:ss") : "00:00:00"

      // First, insert or update coordinator data
      const coordinatorData = {}
      for (let i = 0; i < 4; i++) {
        const coordinator = coordinators[i] || { name: "", phone: "", email: "", isFaculty: false }
        coordinatorData[`Name${i + 1}`] = coordinator.name
        coordinatorData[`Phone${i + 1}`] = coordinator.phone
        coordinatorData[`Email${i + 1}`] = coordinator.email
        coordinatorData[`Faculty${i + 1}`] = coordinator.isFaculty ? 1 : 0
      }

      let coordinatorId
      if (programId) {
        const existingProgram = await fetchData('Programs', programId, 'PID', ['CID'])
        coordinatorId = existingProgram.CID
        for (const [key, value] of Object.entries(coordinatorData)) {
          await saveData('Coordinators', coordinatorId, 'CID', key, value)
        }
      } else {
        coordinatorId = await insertData('Coordinators', coordinatorData)
      }

      if (!coordinatorId) {
        throw new Error("Failed to create/update coordinator data")
      }

      // Then, insert or update program data
      const programData = {
        EID: eventId,
        PName: programName,
        PTime: timeString,
        PLocation: venue,
        PType: programType,
        PImage: imageUrl.replace(config.api.host, ''),
        PStartDate: isMultiDay ? addDays(dateRange?.from!, 1).toISOString() : addDays(date!, 1).toISOString(),
        PEndDate: isMultiDay ? addDays(dateRange?.to!, 1).toISOString() : addDays(date!, 1).toISOString(),
        PDecription: rulesRegulations,
        PDF: uploadedFileUrl.replace(config.api.host, ''),
        Fee: parseFloat(registrationFees),
        Min: parseInt(minParticipants),
        Max: parseInt(maxParticipants),
        Contact: coordinators[0].phone,
        CID: coordinatorId,
        Open: true
      }

      let insertedId
      if (programId) {
        for (const [key, value] of Object.entries(programData)) {
          await saveData('Programs', programId, 'PID', key, value)
        }
        insertedId = programId
      } else {
        insertedId = await insertData('Programs', programData)
      }

      if (insertedId) {
        toast.success(programId ? "Program Updated" : "Program Created", {
          duration: 5000,
          description: `${programName} has been ${programId ? 'updated' : 'scheduled'}.`,
        })
        setTimeout(() => {
          router.push("/dashboard/organizer/overview")
        }, 5000)
      } else {
        throw new Error("Failed to create/update program")
      }
    } catch (error) {
      console.error("Error creating/updating program:", error)
      toast.error("Failed to create/update program. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }


  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('type', 'docs')
      formData.append('file', file)

      const uploadResponse = await axios.post(`${config.api.host}${config.api.routes.upload}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (uploadResponse.data.success) {
        setUploadedFileUrl(uploadResponse.data.url)
        handleFieldChange('rulesFile', uploadResponse.data.url)
        return uploadResponse.data.url
      } else {
        throw new Error("Failed to upload file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  const removeCoordinator = (index: number) => {
    setCoordinators(coordinators.filter((_, i) => i !== index))
  }

  const uploadImage = async (croppedImage: string) => {
    try {
      const response = await fetch(croppedImage)
      const blob = await response.blob()
      const file = new File([blob], "program_image.jpg", { type: "image/jpeg" })
      const formData = new FormData()
      formData.append('type', 'program')
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
  
  const sanitizeInput = (input: string) => {
    return input.replace(/[^a-zA-Z0-9@.\s]/g, '')
  }

  
  const onClose = () => {
    router.push('/dashboard/organizer/overview')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <Toaster richColors/>
      <Card className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mr-4">
             <CardHeader>
                <CardTitle className="text-2xl font-bold">{programId ? 'Edit' : 'Create'} Program</CardTitle>
                <CardDescription>Fill in the details to {programId ? 'edit' : 'create'} a program for <b>{eventName}</b>.</CardDescription>
            </CardHeader>
                <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
          </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="programName">Program Name</Label>
                <Input
                  id="programName"
                  value={programName}
                  onChange={(e) => {
                    setProgramName(e.target.value)
                    handleFieldChange('programName', e.target.value)
                  }}
                  className={errors.programName ? "border-red-500" : ""}
                />
                {errors.programName && <p className="text-red-500 text-sm mt-1">{errors.programName}</p>}
              </div>

              <div>
                <Label htmlFor="programType">Program Type</Label>
                <Popover open={programTypeOpen} onOpenChange={setProgramTypeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={programTypeOpen}
                      className={`w-full justify-between ${errors.programType ? "border-red-500" : ""}`}
                    >
                      {programType
                        ? filteredProgramTypes.find((type) => type.value === programType)?.label
                        : "Select program type..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search program type..." />
                      <CommandList>
                        <CommandEmpty>No program type found.</CommandEmpty>
                        <CommandGroup>
                          {filteredProgramTypes.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={type.value}
                              onSelect={(currentValue) => {
                                setProgramType(currentValue === programType ? "" : currentValue)
                                setProgramTypeOpen(false)
                                handleFieldChange('programType', currentValue)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  programType === type.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {type.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.programType && <p className="text-red-500 text-sm mt-1">{errors.programType}</p>}
              </div>

              <div>
                <Label htmlFor="programPhoto">Program Photo</Label>
                <Input
                  id="programPhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleProgramPhotoUpload}
                  className={`w-full ${errors.programImage ? "border-red-500" : ""}`}
                />
                {croppedImage && (
                  <img
                    src={croppedImage}
                    alt="Cropped program image"
                    className="mt-2 max-w-full h-auto"
                  />
                )}
                {errors.programImage && <p className="text-red-500 text-sm mt-1">{errors.programImage}</p>}
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
                    <Button variant="outline" onClick={() => setIsCropping(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCropConfirm}>Confirm</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div>
                <Label>Program Duration</Label>
                <RadioGroup
                  value={isMultiDay ? "multi" : "single"}
                  onValueChange={(value) => setIsMultiDay(value === "multi")}
                >
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
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${errors.dateRange ? "border-red-500" : ""}`}
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
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(newDateRange) => {
                          setDateRange(newDateRange)
                          handleFieldChange('dateRange', newDateRange)
                        }}
                        numberOfMonths={2}
                        fromDate={eventStartDate}
                        toDate={eventEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.dateRange && <p className="text-red-500 text-sm mt-1">{errors.dateRange}</p>}
                </div>
              ) : (
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${errors.date ? "border-red-500" : ""}`}
                      >
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate)
                          handleFieldChange('date', newDate)
                        }}
                        initialFocus
                        fromDate={eventStartDate}
                        toDate={eventEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => {
                    setVenue(e.target.value)
                    handleFieldChange('venue', e.target.value)
                  }}
                  placeholder="Enter venue"
                  className={errors.venue ? "border-red-500" : ""}
                />
                {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
              </div>

              <div>
              <Label>Time</Label><br></br>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={selectedTime}
                  onChange={(newValue) => {
                    setSelectedTime(newValue)
                    setHour(newValue?.hour.toString())
                    setMinute(newValue?.minute.toString())
                    // setAmpm(newValue.)
                  }}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  sx={timePickerStyles}
                  slotProps={{
                    textField: {
                      placeholder: "Select time",
                      error: !!errors.time,
                    },
                  }}
                />
              </LocalizationProvider>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>

              <div>
                <Label htmlFor="rulesRegulations">Rules and Regulations</Label>
                <Textarea
                  id="rulesRegulations"
                  value={rulesRegulations}
                  onChange={(e) => {
                    setRulesRegulations(e.target.value)
                    handleFieldChange('rulesRegulations', e.target.value)
                  }}
                  rows={4}
                  className={errors.rulesRegulations ? "border-red-500" : ""}
                />
                {errors.rulesRegulations && <p className="text-red-500 text-sm mt-1">{errors.rulesRegulations}</p>}
              </div>

              <div>
              <Label htmlFor="rulesFile">Rules and Regulations File</Label>
              <Input
                id="rulesFile"
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    try {
                      const uploadedUrl = await uploadFile(file)
                      setUploadedFileUrl(uploadedUrl)
                      setRulesFile(file)
                      toast.success("File uploaded successfully")
                    } catch (error) {
                      console.error("Error uploading file:", error)
                      toast.error("Failed to upload file. Please try again.")
                    }
                  }
                }}
                className={`w-full ${errors.rulesFile ? "border-red-500" : ""}`}
              />
              {programId && uploadedFileUrl && (
                <div className="mt-2 flex items-center">
                  <p className="mr-2">File uploaded successfully</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(uploadedFileUrl, '_blank')}
                  >
                    View File <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
              {errors.rulesFile && <p className="text-red-500 text-sm mt-1">{errors.rulesFile}</p>}
            </div>

              <div>
                <Label htmlFor="registrationFees">Registration Fees</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    ₹
                  </span>
                  <Input
                    id="registrationFees"
                    type="number"
                    value={registrationFees}
                    onChange={(e) => {
                      setRegistrationFees(e.target.value)
                      handleFieldChange('registrationFees', e.target.value)
                    }}
                    className={`pl-7 ${errors.registrationFees ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.registrationFees && <p className="text-red-500 text-sm mt-1">{errors.registrationFees}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTeamEvent"
                  checked={isTeamEvent}
                  onCheckedChange={(checked) => setIsTeamEvent(checked as boolean)}
                />
                <Label htmlFor="isTeamEvent">Team Event</Label>
              </div>

              {isTeamEvent && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maxParticipants">Maximum Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => {
                        setMaxParticipants(e.target.value)
                        handleFieldChange('participants', { minParticipants, maxParticipants: e.target.value })
                      }}
                      onBlur={(e) => {
                        let value = parseInt(e.target.value)
                        if (isNaN(value) || value < 1) value = 1
                        if (minParticipants && parseInt(minParticipants) > value) {
                          setMinParticipants(value.toString())
                        }
                        setMaxParticipants(value.toString())
                      }}
                      min="1"
                      className={errors.participants ? "border-red-500" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minParticipants">Minimum Participants</Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      value={minParticipants}
                      onChange={(e) => {
                        setMinParticipants(e.target.value)
                        handleFieldChange('participants', { minParticipants: e.target.value, maxParticipants })
                      }}
                      onBlur={(e) => {
                        let value = parseInt(e.target.value)
                        if (isNaN(value) || value < 1) value = 1
                        if (maxParticipants && parseInt(maxParticipants) < value) {
                          setMaxParticipants(value.toString())
                        }
                        setMinParticipants(value.toString())
                      }}
                      min="1"
                      className={errors.participants ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.participants && <p className="text-red-500 text-sm mt-1">{errors.participants}</p>}
                </div>
              )}

            <div>
              <Label>Coordinators</Label>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {coordinators.map((coordinator, index) => (
                    <div key={index} className="space-y-2">
                      <Input
                        placeholder="Name"
                        value={coordinator.name}
                        onChange={(e) => {
                          const newCoordinators = [...coordinators]
                          newCoordinators[index].name = sanitizeInput(e.target.value)
                          setCoordinators(newCoordinators)
                          handleFieldChange('coordinators', newCoordinators)
                        }}
                        className={errors.coordinators ? "border-red-500" : ""}
                      />
                      <Input
                        placeholder="Phone"
                        value={coordinator.phone}
                        onChange={(e) => {
                          const newCoordinators = [...coordinators]
                          newCoordinators[index].phone = e.target.value.replace(/\D/g, '')
                          setCoordinators(newCoordinators)
                          handleFieldChange('coordinators', newCoordinators)
                        }}
                        className={errors.coordinators ? "border-red-500" : ""}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={coordinator.email}
                        onChange={(e) => {
                          const newCoordinators = [...coordinators]
                          newCoordinators[index].email = sanitizeInput(e.target.value)
                          setCoordinators(newCoordinators)
                          handleFieldChange('coordinators', newCoordinators)
                        }}
                        className={errors.coordinators ? "border-red-500" : ""}
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
                              handleFieldChange('coordinators', newCoordinators)
                            }}
                          />
                          <Label htmlFor={`faculty-${index}`}>
                            This Coordinator is a Faculty
                          </Label>
                        </div>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCoordinator(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {coordinators.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setCoordinators([
                          ...coordinators,
                          { name: "", phone: "", email: "", isFaculty: false },
                        ])
                      }
                    >
                      Add Coordinator
                    </Button>
                  )}
                </CardContent>
              </Card>
              {errors.coordinators && <p className="text-red-500 text-sm mt-1">{errors.coordinators}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save & Proceed <ArrowUpRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}