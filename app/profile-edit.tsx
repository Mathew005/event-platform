"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, ChevronLeft, Plus } from "lucide-react"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "@/lib/cropImage"
import { Calendar } from "@/components/ui/calendar"

const defaultAvatars = [
  "/avatar1.png", "/avatar2.png", "/avatar3.png", "/avatar4.png",
  "/avatar5.png", "/avatar6.png", "/avatar7.png", "/avatar8.png",
]

const interestCategories = {
  "Technology": ["Coding", "Web Design", "AI", "Cybersecurity", "Blockchain"],
  "Cultural": ["Art", "Music", "Dance", "Literature", "Languages"],
  "Commerce": ["Marketing", "Finance", "Entrepreneurship", "E-commerce"],
  "Science": ["Physics", "Chemistry", "Biology", "Astronomy"],
  "Sports": ["Football", "Basketball", "Tennis", "Swimming", "Yoga"],
  "Lifestyle": ["Fashion", "Cooking", "Travel", "Photography", "Fitness"]
}

export default function ProfileEdit() {
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [avatar, setAvatar] = useState("/avatar1.png")
  const [course, setCourse] = useState("Computer Science")
  const [department, setDepartment] = useState("Engineering")
  const [interests, setInterests] = useState<string[]>([])
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [dob, setDob] = useState<Date | undefined>(new Date())
  const [location, setLocation] = useState("")
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [tempImage, setTempImage] = useState("")

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
    if (newPassword === confirmPassword) {
      console.log("Password changed")
    } else {
      console.log("Passwords do not match")
    }
  }

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Profile</h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
          <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
          <span className="sr-only">Back</span>
        </Button>
      </div>

      <div className="space-y-4">
        <Label>Profile Picture</Label>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="w-20 h-20 md:w-24 md:h-24">
            <AvatarImage src={avatar} alt="Profile picture" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {defaultAvatars.map((av, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 md:h-12 md:w-12"
                  onClick={() => handleAvatarChange(av)}
                >
                  <Avatar>
                    <AvatarImage src={av} alt={`Avatar ${index + 1}`} />
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

      <div className="grid gap-4 md:grid-cols-2">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="course">Current Course</Label>
          <Input
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                {dob ? dob.toDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
            <Calendar
                mode="single"
                selected={dob}
                onSelect={setDob}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="location">Location Preference</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your preferred location"
          />
        </div>
      </div>

      <div>
        <Label>Interests</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map(interest => (
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
              <TabsList className="h-20 grid grid-cols-3 grid-rows-2 gap-y-1 gap-4">
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
                          variant={interests.includes(interest) ? "secondary" : "outline"}
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

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button>Change Password</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <Label htmlFor="old-password">Old Password</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button className="w-full">Save Changes</Button>
    </div>
  )
}