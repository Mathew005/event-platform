"use client"

import { useState, useMemo, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Users, Calendar, ArrowUp, ArrowDown, Download, } from "lucide-react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import config from '@/config'
import axios from 'axios'
import { useEventContext } from '@/components/contexts/EventContext'
import { useUserContext } from '@/components/contexts/UserContext'
import { useRouter } from 'next/navigation'

// Mock data for demonstration purposes

const analysisDataBase ={
  events:[
    // { id: 1, name: "AI Workshop", type: "group" },
    // { id: 2, name: "Tech Conference 2023", type: "solo" },
    // { id: 3, name: "Annual Charity Gala", type: "group" },
    // { id: 4, name: "Hackathon 2023", type: "group" },
    // { id: 5, name: "Data Science Symposium", type: "solo" },
  ],
  registrationData: [
    // { id: 1, name: "John Doe", contact: "123-456-7890", email: "john@example.com", eventId: 1, collegeName: "MIT", eventType: "group", participants: 3, department: "Computer Science", course: "AI and Machine Learning", registrationTime: "2023-09-15T10:30:00" },
    // { id: 2, name: "Jane Smith", contact: "098-765-4321", email: "jane@example.com", eventId: 2, collegeName: "Stanford", eventType: "solo", participants: 1, department: "Electrical Engineering", course: "Robotics", registrationTime: "2023-09-16T14:45:00" },
    // { id: 3, name: "Alice Johnson", contact: "111-222-3333", email: "alice@example.com", eventId: 3, collegeName: "Harvard", eventType: "group", participants: 4, department: "Business", course: "Entrepreneurship", registrationTime: "2023-09-17T09:15:00" },
    // { id: 4, name: "Bob Williams", contact: "444-555-6666", email: "bob@example.com", eventId: 4, collegeName: "CalTech", eventType: "group", participants: 3, department: "Physics", course: "Quantum Computing", registrationTime: "2023-09-18T11:00:00" },
    // { id: 5, name: "Charlie Brown", contact: "777-888-9999", email: "charlie@example.com", eventId: 5, collegeName: "UCLA", eventType: "solo", participants: 1, department: "Statistics", course: "Machine Learning", registrationTime: "2023-09-19T13:30:00" },
    // { id: 6, name: "Diana Prince", contact: "000-111-2222", email: "diana@example.com", eventId: 1, collegeName: "NYU", eventType: "group", participants: 2, department: "Computer Science", course: "Natural Language Processing", registrationTime: "2023-09-20T15:45:00" },
    // { id: 7, name: "Ethan Hunt", contact: "333-444-5555", email: "ethan@example.com", eventId: 2, collegeName: "UC Berkeley", eventType: "solo", participants: 1, department: "Computer Engineering", course: "Cybersecurity", registrationTime: "2023-09-21T10:00:00" },
    // { id: 8, name: "Fiona Gallagher", contact: "666-777-8888", email: "fiona@example.com", eventId: 3, collegeName: "Columbia", eventType: "group", participants: 3, department: "Economics", course: "Fintech", registrationTime: "2023-09-22T14:15:00" },
    // { id: 9, name: "George Costanza", contact: "999-000-1111", email: "george@example.com", eventId: 4, collegeName: "Princeton", eventType: "group", participants: 4, department: "Mathematics", course: "Cryptography", registrationTime: "2023-09-23T09:30:00" },
    // { id: 10, name: "Hermione Granger", contact: "222-333-4444", email: "hermione@example.com", eventId: 5, collegeName: "Oxford", eventType: "solo", participants: 1, department: "Data Science", course: "Big Data Analytics", registrationTime: "2023-09-24T11:45:00" },
  ],

  groupMembers: {
    // 1: [
    //   { name: "Team Member 1", contact: "111-111-1111", email: "member1@example.com" },
    //   { name: "Team Member 2", contact: "222-222-2222", email: "member2@example.com" },
    // ],
    // 3: [
    //   { name: "Team Member A", contact: "333-333-3333", email: "memberA@example.com" },
    //   { name: "Team Member B", contact: "444-444-4444", email: "memberB@example.com" },
    //   { name: "Team Member C", contact: "555-555-5555", email: "memberC@example.com" },
    // ],
    // 4: [
    //   { name: "Team Member X", contact: "666-666-6666", email: "memberX@example.com" },
    //   { name: "Team Member Y", contact: "777-777-7777", email: "memberY@example.com" },
    // ],
    // 6: [
    //   { name: "Team Member Z", contact: "888-888-8888", email: "memberZ@example.com" },
    // ],
    // 8: [
    //   { name: "Team Member D", contact: "999-999-9999", email: "memberD@example.com" },
    //   { name: "Team Member E", contact: "000-000-0000", email: "memberE@example.com" },
    // ],
    // 9: [
    //   { name: "Team Member F", contact: "111-111-0000", email: "memberF@example.com" },
    //   { name: "Team Member G", contact: "222-222-0000", email: "memberG@example.com" },
    //   { name: "Team Member H", contact: "333-333-0000", email: "memberH@example.com" },
    // ],
  }
}

const allEventsHeaders = [
  { key: 'registrationTime', label: 'Time of Registration' },
  { key: 'id', label: 'Reg ID' },
  { key: 'name', label: 'Participant Name' },
  { key: 'contact', label: 'Contact' },
  { key: 'email', label: 'Email' },
  { key: 'eventId', label: 'Event Name' },
  { key: 'collegeName', label: 'College Name' },
  { key: 'eventType', label: 'Event Type' },
  { key: 'participants', label: 'No. of Participants' },
]

const specificEventHeaders = [
  { key: 'registrationTime', label: 'Time of Registration' },
  { key: 'name', label: 'Participant Name' },
  { key: 'contact', label: 'Contact' },
  { key: 'email', label: 'Email' },
  { key: 'collegeName', label: 'College Name' },
  { key: 'participants', label: 'No. of Participants' },
]


const getAnalysisData = async (id: string) => {
  try{
    const response = await axios.get(`${config.api.host}${config.api.routes.analysis}`,{
      params:{id}
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
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

export default function RegistrationAnalytics() {
    const [selectedEvent, setSelectedEvent] = useState<number | 'all'>('all')
    // const [visibleColumns, setVisibleColumns] = useState<string[]>(allEventsHeaders.map(h => h.key))
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null })
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [eventName, setEventName ] = useState("")
    const { eventId, setEventId } = useEventContext()
    const { userId, setUserId } = useUserContext()
    const [analysisData, setAnalysisData] = useState(analysisDataBase)
    const router = useRouter()
  
      useEffect(() => {
      // setEventId("7")
      // setUserId('1')
    }, [])
    
    useEffect(() => {
      const getdata = async () =>{
        if(eventId){
          const data = await getAnalysisData(eventId);
          
          const name = await fetchData("events", eventId, "EID", ["EName"]);
          setEventName(name.EName);
          // console.log(data)
          setAnalysisData(data)
        }
      }
      getdata()
    }, [eventId])


  const getHeaders = useMemo(() => {
    return selectedEvent === 'all' ? allEventsHeaders : specificEventHeaders
  }, [selectedEvent])

  // useEffect(() => {
  //   setVisibleColumns(getHeaders.map(h => h.key))
  // }, [getHeaders])
 
  const filteredData = useMemo(() => {
    let filtered = selectedEvent === 'all' 
      ? analysisData.registrationData 
      : analysisData.registrationData.filter(reg => reg.eventId === selectedEvent)

    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [selectedEvent, searchTerm, sortConfig, analysisData.registrationData])

  const totalParticipants = useMemo(() => {
    if (selectedEvent === 'all') {
      return analysisData.registrationData.reduce((sum, reg) => sum + reg.participants, 0)
    } else {
      const event = analysisData.events.find(e => e.id === selectedEvent)
      if (event?.type === 'group') {
        return analysisData.registrationData.find(reg => reg.eventId === selectedEvent)?.participants || 0
      } else {
        return filteredData[0]?.participants || 0
      }
    }
  }, [selectedEvent, filteredData])

  const selectedEventInfo = analysisData.events.find(e => e.id === selectedEvent)
  const selectedEventName = selectedEvent === 'all' ? 'All Programs' : selectedEventInfo?.name || ''
  const selectedEventType = selectedEventInfo?.type || ''

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        if (prevConfig.direction === 'asc') return { key, direction: 'desc' }
        if (prevConfig.direction === 'desc') return { key: '', direction: null }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleRowSelection = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const getExportData = () => {
    if (selectedRows.length > 0) {
      return filteredData.filter(row => selectedRows.includes(row.id))
    }
    return filteredData
  }

  const exportToExcel = () => {
    const dataToExport = getExportData().map(registration => {
      const row: any = { ...registration }
      row.eventName = analysisData.events.find(e => e.id === registration.eventId)?.name || ''
      if (registration.eventType === 'group') {
        const members = analysisData.groupMembers[registration.id] || []
        members.forEach((member, index) => {
          row[`member${index + 1}Name`] = member.name
          row[`member${index + 1}Email`] = member.email
          row[`member${index + 1}Contact`] = member.contact
        })
      }
      return row
    })

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Registrations")
    XLSX.writeFile(wb, "registrations.xlsx")
  }

  const exportToPDF = () => {
    const dataToExport = getExportData()
    const doc = new jsPDF()
    doc.autoTable({
      head: [getHeaders.map(h => h.label)],
      body: dataToExport.map(row => 
        getHeaders.map(h => row[h.key])
      ),
    })
    doc.save("registrations.pdf")
  }

  const handleClose = () =>{
    router.push('/dashboard/organizer')
  }
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background to-secondary/20 z-50 overflow-y-auto">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">
        <Card className="mb-6">
          <CardHeader className="flex flex-col space-y-1.5 pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Registration Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Event: {eventName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() =>{
                  handleClose()
                }}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisData.registrationData.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Event Participants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalParticipants}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisData.events.length}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing data for: {selectedEventName}{selectedEvent !== 'all' ? ` - ${selectedEventType}` : ''}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-4">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2 md:items-center">
                <Select 
                  defaultValue="all"
                  onValueChange={(value) => setSelectedEvent(value === 'all' ? 'all' : Number(value))}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {analysisData.events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        <span className="truncate">{event.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/80">
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedRows.length === filteredData.length}
                        onCheckedChange={(checked) => {
                          setSelectedRows(checked ? filteredData.map(row => row.id) : [])
                        }}
                      />
                    </TableHead>
                    {getHeaders.map((header) => (
                      <TableHead
                        key={header.key}
                        className="cursor-pointer"
                        onClick={() => handleSort(header.key)}
                      >
                        <div className="flex items-center">
                          {header.label}
                          {sortConfig.key === header.key && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="ml-2 h-4 w-4" />
                            ) : sortConfig.direction === 'desc' ? (
                              <ArrowDown className="ml-2 h-4 w-4" />
                            ) : null
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((registration, index) => (
                    <TableRow key={registration.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(registration.id)}
                          onCheckedChange={() => handleRowSelection(registration.id)}
                        />
                      </TableCell>
                      {getHeaders.map((header) => (
                        <TableCell key={header.key}>
                          {header.key === 'eventId'
                            ? analysisData.events.find(e => e.id === registration[header.key])?.name
                            : header.key === 'registrationTime'
                              ? new Date(registration[header.key]).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false,
                            })
                              : registration[header.key]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Registration Details</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh] overflow-y-auto">
                              <div className="space-y-4">
                                {Object.entries(registration).map(([key, value]) => (
                                  <div key={key} className="flex flex-col">
                                    <span className="text-sm font-medium text-muted-foreground">{allEventsHeaders.find(h => h.key === key)?.label || key}</span>
                                    <span className="text-sm">{key === 'eventId' ? analysisData.events.find(e => e.id === value)?.name : value}</span>
                                  </div>
                                ))}
                                {registration.eventType === 'group' && (
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Group Members</h4>
                                    {analysisData.groupMembers[registration.id]?.map((member, index) => (
                                      <div key={index} className="mb-2 p-2 bg-muted rounded-md">
                                        <p className="text-sm"><strong>Name:</strong> {member.name}</p>
                                        <p className="text-sm"><strong>Contact:</strong> {member.contact}</p>
                                        <p className="text-sm"><strong>Email:</strong> {member.email}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={exportToExcel}>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
              <Button onClick={exportToPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export to PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}