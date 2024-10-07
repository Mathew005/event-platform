'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

// Mock data for the program
const programData = {
  isGroupEvent: true, // Toggle this to switch between group and solo event
  programImage: "/placeholder.svg?height=300&width=400",
  programTitle: "AI & Machine Learning Hackathon",
  eventTitle: "TechFest 2023",
  description: "Develop an AI solution for a real-world problem within 36 hours. All code must be original and created during the event.",
  date: "September 15-16, 2023",
  fees: 100,
  minMembers: 2,
  maxMembers: 4
}

const countryCodes = [
  { value: "+91", label: "India (+91)" },
  { value: "+1", label: "USA (+1)" },
  { value: "+44", label: "UK (+44)" },
  // Add more country codes as needed
]

interface Member {
  name: string
  email: string
  countryCode: string
  contact: string
}

export default function ProgramRegistration() {
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([{ name: '', email: '', countryCode: '+91', contact: '' }])

  const handleAddMember = () => {
    if (members.length < programData.maxMembers) {
      setMembers([...members, { name: '', email: '', countryCode: '+91', contact: '' }])
    }
  }

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = [...members]
      newMembers.splice(index, 1)
      setMembers(newMembers)
    }
  }

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members]
    newMembers[index][field] = value
    setMembers(newMembers)
  }

  const isFormValid = () => {
    const requiredMembers = programData.isGroupEvent ? programData.minMembers : 1
    return members.length >= requiredMembers && members.slice(0, requiredMembers).every(member => 
      member.name && member.email && member.contact
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      console.log('Form submitted:', members)
      toast({
        title: "Registration Successful",
        description: "Proceeding to payment...",
      })
    } else {
      toast({
        title: "Invalid Form",
        description: `Please fill in details for at least ${programData.isGroupEvent ? programData.minMembers : 1} member(s).`,
        variant: "destructive",
      })
    }
  }

  const fillFromProfile = () => {
    // Mock function to fill data from profile
    const profileData = { name: 'John Doe', email: 'john@example.com', countryCode: '+91', contact: '1234567890' }
    setMembers([profileData, ...members.slice(1)])
  }

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto">
      <div className="relative max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Program Registration</CardTitle>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="text-muted-foreground"
                onClick={()=>{}}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <img src={programData.programImage} alt={programData.programTitle} className="w-full h-48 object-cover rounded-lg" />
              <h2 className="text-xl font-semibold mt-4">{programData.programTitle}</h2>
              <p className="text-gray-600">{programData.eventTitle}</p>
              <p className="mt-2">{programData.description}</p>
              <p className="mt-2">Date: {programData.date}</p>
              <p>Registration Fee: ${programData.fees}</p>
              {programData.isGroupEvent && (
                <p>Team Size: {programData.minMembers} - {programData.maxMembers} members</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <h3 className="text-lg font-semibold">{programData.isGroupEvent ? 'Team Leader Information' : 'Participant Information'}</h3>
                <Button type="button" variant="outline" onClick={fillFromProfile}>
                  Fill from Profile
                </Button>
              </div>

              {members.map((member, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    {index > 0 && <h4 className="text-lg font-semibold mb-4">Additional Member {index}</h4>}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`name-${index}`}>Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor={`contact-${index}`}>Contact Number</Label>
                        <div className="flex space-x-2">
                          <Select
                            value={member.countryCode}
                            onValueChange={(value) => handleMemberChange(index, 'countryCode', value)}
                          >
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
                            id={`contact-${index}`}
                            value={member.contact}
                            onChange={(e) => handleMemberChange(index, 'contact', e.target.value)}
                            className="flex-1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-4"
                        onClick={() => handleRemoveMember(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {programData.isGroupEvent && members.length < programData.maxMembers && (
                <Button type="button" variant="outline" onClick={handleAddMember}>
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              )}

              <p className="text-sm text-gray-600">Note: Please add your WhatsApp number as the contact number.</p>

              <Button type="submit" className="w-full">
                Proceed to Payment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}