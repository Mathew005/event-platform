"use client"

import { useState, useMemo, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { X, BarChart, Users, Calendar, ArrowUpDown, Download, Search } from "lucide-react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Mock data for demonstration purposes
const events = [
  { id: 1, name: "AI Workshop", type: "group" },
  { id: 2, name: "Tech Conference 2023", type: "solo" },
  { id: 3, name: "Annual Charity Gala", type: "group" },
  { id: 4, name: "Hackathon 2023", type: "group" },
  { id: 5, name: "Data Science Symposium", type: "solo" },
]

const registrationData = [
  { id: 1, name: "John Doe", contact: "123-456-7890", email: "john@example.com", eventId: 1, collegeName: "MIT", eventType: "group", participants: 3, department: "Computer Science", course: "AI and Machine Learning", registrationTime: "2023-09-15T10:30:00" },
  { id: 2, name: "Jane Smith", contact: "098-765-4321", email: "jane@example.com", eventId: 2, collegeName: "Stanford", eventType: "solo", participants: 1, department: "Electrical Engineering", course: "Robotics", registrationTime: "2023-09-16T14:45:00" },
  { id: 3, name: "Alice Johnson", contact: "111-222-3333", email: "alice@example.com", eventId: 3, collegeName: "Harvard", eventType: "group", participants: 4, department: "Business", course: "Entrepreneurship", registrationTime: "2023-09-17T09:15:00" },
  { id: 4, name: "Bob Williams", contact: "444-555-6666", email: "bob@example.com", eventId: 4, collegeName: "CalTech", eventType: "group", participants: 3, department: "Physics", course: "Quantum Computing", registrationTime: "2023-09-18T11:00:00" },
  { id: 5, name: "Charlie Brown", contact: "777-888-9999", email: "charlie@example.com", eventId: 5, collegeName: "UCLA", eventType: "solo", participants: 1, department: "Statistics", course: "Machine Learning", registrationTime: "2023-09-19T13:30:00" },
  { id: 6, name: "Diana Prince", contact: "000-111-2222", email: "diana@example.com", eventId: 1, collegeName: "NYU", eventType: "group", participants: 2, department: "Computer Science", course: "Natural Language Processing", registrationTime: "2023-09-20T15:45:00" },
  { id: 7, name: "Ethan Hunt", contact: "333-444-5555", email: "ethan@example.com", eventId: 2, collegeName: "UC Berkeley", eventType: "solo", participants: 1, department: "Computer Engineering", course: "Cybersecurity", registrationTime: "2023-09-21T10:00:00" },
  { id: 8, name: "Fiona Gallagher", contact: "666-777-8888", email: "fiona@example.com", eventId: 3, collegeName: "Columbia", eventType: "group", participants: 3, department: "Economics", course: "Fintech", registrationTime: "2023-09-22T14:15:00" },
  { id: 9, name: "George Costanza", contact: "999-000-1111", email: "george@example.com", eventId: 4, collegeName: "Princeton", eventType: "group", participants: 4, department: "Mathematics", course: "Cryptography", registrationTime: "2023-09-23T09:30:00" },
  { id: 10, name: "Hermione Granger", contact: "222-333-4444", email: "hermione@example.com", eventId: 5, collegeName: "Oxford", eventType: "solo", participants: 1, department: "Data Science", course: "Big Data Analytics", registrationTime: "2023-09-24T11:45:00" },
]

const groupMembers = {
  1: [
    { id: 1, name: "John Doe", contact: "123-456-7890", email: "john@example.com" },
    { name: "Team Member 1", contact: "111-111-1111", email: "member1@example.com" },
    { name: "Team Member 2", contact: "222-222-2222", email: "member2@example.com" },
  ],
  3: [
    { id: 3, name: "Alice Johnson", contact: "111-222-3333", email: "alice@example.com" },
    { name: "Team Member A", contact: "333-333-3333", email: "memberA@example.com" },
    { name: "Team Member B", contact: "444-444-4444", email: "memberB@example.com" },
    { name: "Team Member C", contact: "555-555-5555", email: "memberC@example.com" },
  ],
  4: [
    { id: 4, name: "Bob Williams", contact: "444-555-6666", email: "bob@example.com" },
    { name: "Team Member X", contact: "666-666-6666", email: "memberX@example.com" },
    { name: "Team Member Y", contact: "777-777-7777", email: "memberY@example.com" },
  ],
  6: [
    { id: 6, name: "Diana Prince", contact: "000-111-2222", email: "diana@example.com" },
    { name: "Team Member Z", contact: "888-888-8888", email: "memberZ@example.com" },
  ],
  8: [
    { id: 8, name: "Fiona Gallagher", contact: "666-777-8888", email: "fiona@example.com" },
    { name: "Team Member D", contact: "999-999-9999", email: "memberD@example.com" },
    { name: "Team Member E", contact: "000-000-0000", email: "memberE@example.com" },
  ],
  9: [
    { id: 9, name: "George Costanza", contact: "999-000-1111", email: "george@example.com" },
    { name: "Team Member F", contact: "111-111-0000", email: "memberF@example.com" },
    { name: "Team Member G", contact: "222-222-0000", email: "memberG@example.com" },
    { name: "Team Member H", contact: "333-333-0000", email: "memberH@example.com" },
  ],
}

const allEventsHeaders = [
  { key: 'id', label: 'Reg ID' },
  { key: 'name', label: 'Participant Name' },
  { key: 'contact', label: 'Contact' },
  { key: 'email', label: 'Email' },
  { key: 'eventId', label: 'Event Name' },
  { key: 'collegeName', label: 'College Name' },
  { key: 'eventType', label: 'Event Type' },
  { key: 'participants', label: 'No. of Participants' },
  { key: 'department', label: 'Department' },
  { key: 'course', label: 'Course' },
  { key: 'registrationTime', label: 'Registration Time' },
]

const groupEventHeaders = [
  { key: 'id', label: 'Reg ID' },
  { key: 'name1', label: 'Participant Name 1' },
  { key: 'contact1', label: 'Participant 1 Contact' },
  { key: 'email1', label: 'Participant 1 Email' },
  { key: 'name2', label: 'Participant Name 2' },
  { key: 'contact2', label: 'Participant 2 Contact' },
  { key: 'email2', label: 'Participant 2 Email' },
  { key: 'name3', label: 'Participant Name 3' },
  { key: 'contact3', label: 'Participant 3 Contact' },
  { key: 'email3', label: 'Participant 3 Email' },
  { key: 'name4', label: 'Participant Name 4' },
  { key: 'contact4', label: 'Participant 4 Contact' },
  { key: 'email4', label: 'Participant 4 Email' },
  { key: 'eventId', label: 'Event Name' },
  { key: 'collegeName', label: 'College Name' },
  { key: 'eventType', label: 'Event Type' },
  { key: 'participants', label: 'No. of Participants' },
  { key: 'department', label: 'Department' },
  { key: 'course', label: 'Course' },
  { key: 'registrationTime', label: 'Registration Time' },
]

export default function RegistrationAnalytics({ onClose }: { onClose: () => void }) {
  const [selectedEvent, setSelectedEvent] = useState<number | 'all'>('all')
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allEventsHeaders.map(h => h.key))
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const filteredData = useMemo(() => {
    let filtered = selectedEvent === 'all' 
      ? registrationData 
      : registrationData.filter(reg => reg.eventId === selectedEvent)

    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [selectedEvent, searchTerm, sortConfig])

  const totalParticipants = useMemo(() => {
    if (selectedEvent === 'all') {
      return registrationData.reduce((sum, reg) => sum + reg.participants, 0)
    } else {
      const event = events.find(e => e.id === selectedEvent)
      if (event?.type === 'group') {
        return groupMembers[selectedEvent as keyof typeof groupMembers]?.length || 0
      } else {
        return filteredData[0]?.participants || 0
      }
    }
  }, [selectedEvent, filteredData])

  const headers = selectedEvent === 'all' ? allEventsHeaders : 
    (events.find(e => e.id === selectedEvent)?.type === 'group' ? groupEventHeaders : allEventsHeaders)

  const selectedEventName = selectedEvent === 'all' ? 'All Programs' : events.find(e => e.id === selectedEvent)?.name || ''

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleRowSelection = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Registrations")
    XLSX.writeFile(wb, "registrations.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.autoTable({
      head: [headers.filter(h => visibleColumns.includes(h.key)).map(h => h.label)],
      body: filteredData.map(row => 
        headers.filter(h => visibleColumns.includes(h.key)).map(h => row[h.key])
      ),
    })
    doc.save("registrations.pdf")
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background to-secondary/20 z-50 overflow-y-auto">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl md:text-3xl font-bold">Registration Analytics</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{registrationData.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
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
                  <div className="text-2xl font-bold">{events.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Select Event</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Select onValueChange={(value) => setSelectedEvent(value === 'all' ? 'all' : Number(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <p className="text-sm text-muted-foreground">Showing data for: {selectedEventName}</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Columns</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {headers.map((header) => (
                      <DropdownMenuCheckboxItem
                        key={header.key}
                        checked={visibleColumns.includes(header.key)}
                        onCheckedChange={() => toggleColumnVisibility(header.key)}
                      >
                        {header.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={exportToExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={exportToPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedRows.length === filteredData.length}
                        onCheckedChange={(checked) => {
                          setSelectedRows(checked ? filteredData.map(row => row.id) : [])
                        }}
                      />
                    </TableHead>
                    {headers.filter(h => visibleColumns.includes(h.key)).map((header) => (
                      <TableHead key={header.key} className="cursor-pointer" onClick={() => handleSort(header.key)}>
                        <div className="flex items-center">
                          {header.label}
                          {sortConfig?.key === header.key && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((registration) => {
                    const isGroupEvent = events.find(e => e.id === registration.eventId)?.type === 'group'
                    const groupData = isGroupEvent ? groupMembers[registration.id as keyof typeof groupMembers] : []
                    return (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(registration.id)}
                            onCheckedChange={() => handleRowSelection(registration.id)}
                          />
                        </TableCell>
                        {headers.filter(h => visibleColumns.includes(h.key)).map((header) => {
                          if (selectedEvent === 'all' || !isGroupEvent) {
                            // For "All Events" view or solo events, show the primary registrant's details
                            if (header.key === 'name' || header.key === 'contact' || header.key === 'email') {
                              return <TableCell key={header.key}>{registration[header.key as keyof typeof registration]}</TableCell>
                            }
                          } else if (header.key.startsWith('name') || header.key.startsWith('contact') || header.key.startsWith('email')) {
                            const index = parseInt(header.key.slice(-1)) - 1
                            const participant = groupData[index] || {}
                            const keyWithoutNumber = header.key.replace(/\d+$/, '') as keyof typeof participant;
                            return (
                              <TableCell key={header.key}>
                                {participant[keyWithoutNumber] || ''}
                              </TableCell>
                            )
                          }
                          return (
                            <TableCell key={header.key}>
                              {header.key === 'eventId'
                                ? events.find(e => e.id === registration.eventId)?.name
                                : header.key === 'registrationTime'
                                  ? new Date(registration[header.key as keyof typeof registration]).toLocaleString()
                                  : registration[header.key as keyof typeof registration]}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}