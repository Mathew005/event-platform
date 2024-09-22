'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const countryCodes = [
  { value: "+1", label: "USA (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+91", label: "India (+91)" },
  // Add more country codes as needed
]

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState('participant')
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)
    
    // Here you would typically send this data to your backend
    console.log(data)
    
    // Placeholder for success message
    alert(isLogin ? "Logged in successfully!" : "Registered successfully!")
  }

  useEffect(() => {
    // Reset form when switching between login and register
    setFormKey(prevKey => prevKey + 1)
  }, [isLogin])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{isLogin ? 'Login' : 'Register'}</h1>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500 mb-1">
              {isLogin ? 'Switch to Register' : 'Switch to Login'}
            </span>
            <Switch
              checked={!isLogin}
              onCheckedChange={() => setIsLogin(!isLogin)}
            />
          </div>
        </div>

        <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>User Type</Label>
                <RadioGroup defaultValue={userType} onValueChange={setUserType} name="userType">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="participant" id="participant" />
                    <Label htmlFor="participant">Participant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organizer" id="organizer" />
                    <Label htmlFor="organizer">Organizer</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {userType === 'participant' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required />
                </div>
              )}
              
              {userType === 'organizer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input id="organizationName" name="organizationName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <div className="flex space-x-2">
                  <Select name="countryCode">
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
                  <Input id="contactNumber" name="contactNumber" type="tel" required className="flex-1" />
                </div>
              </div>
              
              {userType === 'participant' && (
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input id="interests" name="interests" placeholder="e.g., Music, Sports, Technology" />
                </div>
              )}
              
              {userType === 'organizer' && (
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" />
                </div>
              )}
            </>
          )}
          <Button type="submit" className="w-full">
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>
      </div>
    </div>
  )
}