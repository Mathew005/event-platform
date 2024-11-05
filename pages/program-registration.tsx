'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, X } from 'lucide-react'
import config from '@/config'
import axios from 'axios'
import { useEventContext } from '@/components/contexts/EventContext'
import { useUserContext } from '@/components/contexts/UserContext'
import { Toaster, toast } from 'sonner'

interface Member {
  name: string
  email: string
  countryCode: string
  contact: string
}

const countryCodes = [
  { value: "+91", label: "India (+91)" },
  { value: "+1", label: "USA (+1)" },
  { value: "+44", label: "UK (+44)" },
]

const sanitizeInput = (input: string) => {
  return input.replace(/[^a-zA-Z0-9@.\s]/g, '')
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

export default function ProgramRegistration() {
  const [members, setMembers] = useState<Member[]>([{ name: '', email: '', countryCode: '+91', contact: '' }])
  const { eventId, programId, setEventId, setProgramId } = useEventContext()
  const { userId, setUserId } = useUserContext()
  const [programData, setProgramData] = useState({
    isGroupEvent: false,
    image: '',
    programTitle: '',
    eventTitle: '',
    description: '',
    date: '',
    fees: 0,
    minMembers: 1,
    maxMembers: 1
  })
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    setUserId('2')
    setProgramId('3')
    setEventId('1')
  }, [])

  useEffect(() => {
    fetchEventData()
    fetchProgramData()
  }, [programId, eventId])

  const fetchProgramData = async () => {
    if(programId){
      const data = await fetchData('Programs', programId, 'PID', ['PName', 'PTime', 'PLocation', 'PType', 'PImage', 'PStartDate', 'PEndDate', 'PDecription', 'Fee', 'Min', 'Max'])
      if (data) {
        console.log(data)
        const startDate = new Date(data.PStartDate)
        const endDate = new Date(data.PEndDate)
        const formattedDate = startDate.toDateString() === endDate.toDateString() 
          ? startDate.toLocaleDateString() 
          : `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        
        setProgramData({
          isGroupEvent: data.Min > 1,
          image: `${config.api.host}${data.PImage}?height=300&width=400`,
          programTitle: data.PName,
          eventTitle: programData.eventTitle, // We'll update this separately
          description: data.PDecription,
          date: formattedDate,
          fees: data.Fee,
          minMembers: data.Min,
          maxMembers: data.Max
        })
      }
    }
  }

  const fetchEventData = async () => {
    if(eventId){
      const data = await fetchData('Events', eventId, 'EID', ['EName'])
      if (data) {
        setProgramData(prevData => ({
          ...prevData,
          eventTitle: data.EName
        }))
      }
    }
  }

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
    if (field === 'name' || field === 'email') {
      newMembers[index][field] = sanitizeInput(value)
    } else if (field === 'contact') {
      newMembers[index][field] = value.replace(/[^0-9]/g, '')
    } else {
      newMembers[index][field] = value
    }
    setMembers(newMembers)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {}
    members.forEach((member, index) => {
      if (!member.name) newErrors[`name-${index}`] = true
      if (!member.email) newErrors[`email-${index}`] = true
      if (!member.contact) newErrors[`contact-${index}`] = true
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const options = {
        key: 'rzp_test_74JvhBshSMhVVm',
        amount: programData.fees * 100,
        currency: 'INR',
        name: programData.eventTitle,
        description: programData.programTitle,
        handler: async function (response: any) {
          console.log('Payment successful:', response)
          await saveRegistration()
          toast.success("Registration Successful", {
            duration: 5000,
            description: "Payment successful, thank you!",
          })
        },
        prefill: {
          name: members[0].name,
          email: members[0].email,
          contact: members[0].contact,
        },
        theme: {
          color: "#ffffff",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      toast.error(`Please fill in all required fields for ${programData.isGroupEvent ? programData.minMembers : 1} member(s).`)
    }
  }

  const saveRegistration = async () => {
    const registrationData = {
      EID: eventId,
      PID: programId,
      ParticipantName: members[0].name,
      ParticipantEmail: members[0].email,
      ParticipantPhone: `${members[0].countryCode}${members[0].contact}`,
      AdditionParticipantNames: members.slice(1).map(m => m.name).join(', '),
      AdditionParticipantEmail: members.slice(1).map(m => m.email).join(', '),
      AdditionParticipantPhone: members.slice(1).map(m => `${m.countryCode}${m.contact}`).join(', ')
    }

    const result = await insertData('Registrations', registrationData)
    if (result) {
      console.log('Registration saved successfully')
    } else {
      console.error('Failed to save registration')
    }
  }

  const fillFromProfile = async () => {
    const userData = await fetchData('Participants', userId, 'PID', ['PName', 'PEmail', 'PPhone', 'PCode'])
    if (userData) {
      const profileData = { 
        name: userData.PName, 
        email: userData.PEmail, 
        countryCode: userData.PCode,
        contact: userData.PPhone
      }
      setMembers([profileData, ...members.slice(1)])
    }
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto">
      <Toaster richColors/>
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
                onClick={() => {}}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <img src={programData.image} alt={programData.programTitle} className="w-full h-48 object-cover rounded-lg" />
              <h2 className="text-xl font-semibold mt-4">{programData.programTitle}</h2>
              <p className="text-gray-600">{programData.eventTitle}</p>
              <p className="mt-2">{programData.description}</p>
              <p className="mt-2">Date: {programData.date}</p>
              <p>Registration Fee: ₹{programData.fees}</p>
              {programData.isGroupEvent && (
                <p>Team Size: {programData.minMembers === programData.maxMembers 
                  ? `${programData.minMembers} members` 
                  : `${programData.minMembers} - ${programData.maxMembers} members`}
                </p>
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
                          className={errors[`name-${index}`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          className={errors[`email-${index}`] ? 'border-red-500' : ''}
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
                            className={`flex-1 ${errors[`contact-${index}`] ? 'border-red-500' : ''}`}
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
                  <Plus className="mr-2 h-4  w-4" /> Add Member
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