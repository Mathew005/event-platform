"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, ChevronLeft, Plus } from "lucide-react"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "@/lib/cropImage"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { cn } from "@/lib/utils"
import { useUserContext } from "@/components/contexts/UserContext"
import config from "@/config"
import { useRouter } from "next/navigation"

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

const countryCodes = [
  { value: "+1", label: "+1 (US)" },
  { value: "+44", label: "+44 (UK)" },
  { value: "+91", label: "+91 (IN)" },
  // Add more country codes as needed
]

const defaultAvatars = [
  "files/imgs/defaults/avatar1.jpg", "files/imgs/defaults/avatar2.jpg", "files/imgs/defaults/avatar3.jpg", "files/imgs/defaults/avatar4.jpg",
  "files/imgs/defaults/avatar5.jpg", "files/imgs/defaults/avatar6.jpg", "files/imgs/defaults/avatar7.jpg",
]

const interestCategories = {
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
}

export default function Component() {
  const {
    userId,
    username,
    usertype,
    image,
    email,
    phone,
    password,
    website,
    address,
    course,
    department,
    institute,
    location,
    interests: userInterests,
    gps,
    setUserId,
    setUsername,
    setUsertype,
    setImage,
    setEmail,
    setPhone,
    setPassword,
    setWebsite,
    setAddress,
    setCourse,
    setDepartment,
    setInstitute,
    setLocation,
    setInterests,
    setGps,
    fetchUserData,
    dumpUserData
  } = useUserContext()

  const [name, setName] = useState(username)
  const [emailState, setEmailState] = useState(email)
  const [avatar, setAvatar] = useState(image)
  const [courseState, setCourseState] = useState(course || "")
  const [departmentState, setDepartmentState] = useState(department || "")
  const [instituteState, setInstituteState] = useState(institute)
  const [interestsState, setInterestsState] = useState<string[]>(userInterests?.split(',') || [])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationState, setLocationState] = useState(location || "")
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [tempImage, setTempImage] = useState("")
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [websiteState, setWebsiteState] = useState(website || "")
  const [addressState, setAddressState] = useState(address || "")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [gpsState, setGpsState] = useState(gps || "")
  const router = useRouter()

  useEffect(() => {
    setUserId('4')
    setUsertype('participant')
  },[])

  useEffect(() => {
    if (userId) {
      fetchUserData(userId, usertype as 'participant' | 'organizer')
      setEmailState(email)
      setAvatar(image)
      setName(username)
      if(usertype == 'participant'){
      setCourseState(course|| "")
      setDepartmentState(department || "")
      setInstituteState(institute || "")
      setLocationState(location || "")
      setInterestsState(userInterests?.split(',') || [])
      console.log(email)
    }else if(usertype == 'organizer'){
      
    }
    }
  }, [userId, usertype, fetchUserData])

  useEffect(() => {
    if (phone) {
      const code = phone.substring(0, phone.indexOf(' '))
      const number = phone.substring(phone.indexOf(' ') + 1)
      setCountryCode(code)
      setPhoneNumber(number)
    }
  }, [phone])

  const handleAvatarChange = (newAvatar: string) => {
    setAvatar(newAvatar)
  }

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
      setAvatar(croppedImage)
      setIsCropping(false)
    } catch (e) {
      console.error(e)
    }
  }, [tempImage, croppedAreaPixels])

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage("New password and confirm password do not match.")
      return
    }
    
    setPassword(newPassword)
    console.log("Password changed successfully")
    setPasswordChangeMessage("Password changed successfully!")
    setIsPasswordDialogOpen(false)
    setNewPassword("")
    setConfirmPassword("")
  }

  const toggleInterest = (interest: string) => {
    setInterestsState(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const onClose = () => {
    router.push('/home')
  }

  const handleSaveChanges = async () => {
    setUsername(name)
    setEmail(emailState)
    setImage(avatar)
    setCourse(courseState)
    setDepartment(departmentState)
    setInstitute(instituteState)
    setInterests(interestsState.join(','))
    setLocation(locationState)
    setWebsite(websiteState)
    setAddress(addressState)
    setPhone(`${countryCode} ${phoneNumber}`)
    setGps(gpsState)
    
    const success = await dumpUserData(usertype as 'participant' | 'organizer')
    if (success) {
      console.log("Changes saved successfully")
    } else {
      console.error("Failed to save changes")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Edit Profile</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" onClick={onClose}/>
              <span className="sr-only">Back</span>
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <Label>Profile Picture</Label>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Avatar className="w-20 h-20 md:w-24 md:h-24">
                  <AvatarImage src={`${config.api.host}${avatar}`} alt="Profile picture" />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {defaultAvatars.map((av, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 md:h-12 md:w-12"
                        onClick={() => handleAvatarChange(`${av}`)}
                      >
                        <Avatar>
                          <AvatarImage src={`${config.api.host}${av}`} alt={`Avatar ${index + 1}`} />
                        </Avatar>
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatarUpload}
                    className="w-full md:w-auto"
                  />
                </div>
              </div>
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
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCropping(false)}>Cancel</Button>
                  <Button onClick={handleCropConfirm}>Confirm</Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailState}
                  onChange={(e) => setEmailState(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <div className="flex space-x-2">
                  <Select  value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((code) => (
                        <SelectItem key={code.value} value={code.value}>
                          {code.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    id="contactNumber" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    type="tel" 
                    required 
                    className="flex-1" 
                  />
                </div>
              </div>
              {usertype === 'participant' && (
                <>
                  <div>
                    <Label htmlFor="course">Current Course</Label>
                    <Input
                      id="course"
                      value={courseState}
                      onChange={(e) => setCourseState(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={departmentState}
                      onChange={(e) => setDepartmentState(e.target.value)}
                    />
                  </div>
                </>
              )}
              {usertype === 'organizer' && (
                <>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={websiteState}
                      onChange={(e) => setWebsiteState(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gps">GPS Link</Label>
                    <Input
                      id="gps"
                      value={gpsState}
                      onChange={(e) => setGpsState(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="institute">Institute</Label>
                <Input
                  id="institute"
                  value={instituteState}
                  onChange={(e) => setInstituteState(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">{usertype === 'participant' ? 'Location Preference' : 'Location'}</Label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={locationOpen}
                      className="w-full justify-between"
                    >
                      {locationState
                        ? districts.find((district) => district.value === locationState)?.label
                        : "Select district..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                setLocationState(currentValue === locationState ? "" : currentValue)
                                setLocationOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  locationState === district.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {district.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {interestsState.map(interest => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1"
                      onClick={() => toggleInterest(interest)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Interests
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Interests</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue={Object.keys(interestCategories)[0]} className="w-full">
                    <TabsList className="h-50 grid grid-cols-3 grid-rows-2 gap-y-1 gap-4">
                      {Object.keys(interestCategories).map(category => (
                        <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {Object.entries(interestCategories).map(([category, categoryInterests]) => (
                      <TabsContent key={category} value={category}>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          <div className="grid grid-cols-2 gap-2">
                            {categoryInterests.map(interest => (
                              <Button
                                key={interest}
                                variant={interestsState.includes(interest) ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => toggleInterest(interest)}
                                className="justify-start"
                              >
                                {interest}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    ))}
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-4">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-password" className="text-right">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirm-password" className="text-right">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  {newPassword !== confirmPassword && (
                    <p className="text-sm text-red-500">New password and confirm password do not match.</p>
                  )}
                  <DialogFooter>
                    <Button onClick={handlePasswordChange}>Update Password</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="w-full md:w-auto" onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}