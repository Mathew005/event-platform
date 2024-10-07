"use client"

import { useState } from 'react'
import { X, Info, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface FAQItem {
  question: string
  answer: string
  votes: number
  userVote: 'up' | 'down' | null
}

export default function Component() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    { question: "How do I create an event?", answer: "Click the 'Create Event' button in the top right corner of the homepage.", votes: 0, userVote: null },
    { question: "Can I edit an event after publishing?", answer: "Yes, you can edit your event details at any time from your dashboard.", votes: 0, userVote: null },
    { question: "How do I contact support?", answer: "You can reach our support team via email at support@cfc.com or through the feedback form below.", votes: 0, userVote: null },
  ])

  const handleVote = (index: number, voteType: 'up' | 'down') => {
    setFaqItems(prevItems => prevItems.map((item, i) => {
      if (i === index) {
        if (item.userVote === voteType) {
          return { ...item, votes: item.votes - (voteType === 'up' ? 1 : -1), userVote: null }
        } else {
          return { 
            ...item, 
            votes: item.votes + (voteType === 'up' ? 1 : -1) + (item.userVote ? (item.userVote === 'up' ? -1 : 1) : 0),
            userVote: voteType
          }
        }
      }
      return item
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-medium">Notifications</h2>
              <p className="text-sm text-muted-foreground">Receive event-related updates</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Receive updates about events you're interested in or organizing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">Support & Feedback</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq">
                <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {faqItems.map((item, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h3 className="font-medium">{item.question}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote(index, 'up')}
                            className={item.userVote === 'up' ? 'bg-green-100' : ''}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <span>{item.votes}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote(index, 'down')}
                            className={item.userVote === 'down' ? 'bg-red-100' : ''}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="feedback">
                <AccordionTrigger>Feedback Form</AccordionTrigger>
                <AccordionContent>
                  <form className="space-y-4 px-1">
                    <div className="space-y-2">
                      <Label htmlFor="feedback">Your Feedback</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Share your thoughts or suggestions..."
                        className="min-h-[100px] w-full"
                      />
                    </div>
                    <Button type="submit">Submit Feedback</Button>
                  </form>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground">
              Our privacy policy outlines how we collect, use, and protect your personal information.
              For the full policy, please visit our <a href="#" className="text-blue-600 hover:underline">Privacy Policy page</a>.
            </p>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700">
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}