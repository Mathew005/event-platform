"use client";

import React, { useState, useCallback } from "react";
import { X, Check, ArrowUpRight, MapPin, Trash2 } from "lucide-react";
import Cropper from "react-easy-crop";
import { useToast } from "@/components/ui/use-toast";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getCroppedImg } from "@/lib/cropImage";
import { DateRange } from "react-day-picker";

const availableFestTypes = [
    { value: "music", label: "Music" },
    { value: "food", label: "Food" },
    { value: "art", label: "Art" },
    { value: "tech", label: "Technology" },
    { value: "sports", label: "Sports" },
];

const districts = [
    {
      value: "thiruvananthapuram",
      label: "Thiruvananthapuram",
    },
    {
      value: "kollam",
      label: "Kollam",
    },
    {
      value: "pathanamthitta",
      label: "Pathanamthitta",
    },
    {
      value: "alappuzha",
      label: "Alappuzha",
    },
    {
      value: "kottayam",
      label: "Kottayam",
    },
    {
      value: "idukki",
      label: "Idukki",
    },
    {
      value: "ernakulam",
      label: "Ernakulam",
    },
    {
      value: "thrissur",
      label: "Thrissur",
    },
    {
      value: "palakkad",
      label: "Palakkad",
    },
    {
      value: "malappuram",
      label: "Malappuram",
    },
    {
      value: "kozhikode",
      label: "Kozhikode",
    },
    {
      value: "wayanad",
      label: "Wayanad",
    },
    {
      value: "kannur",
      label: "Kannur",
    },
    {
      value: "kasaragod",
      label: "Kasaragod",
    },
  ];
  
export default function Component() {
    const { toast } = useToast();
    const [eventName, setEventName] = useState("");
    const [festTypes, setFestTypes] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [date, setDate] = useState<Date>();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(2022, 0, 20),
        to: addDays(new Date(2022, 0, 20), 20),
    });
    const [locationOpen, setLocationOpen] = useState(false);
    const [location, setLocation] = useState("");
    const [coordinators, setCoordinators] = useState([
        { name: "", phone: "", email: "", isFaculty: false },
    ]);
    const [tempImage, setTempImage] = useState<string>("");
    const [croppedImage, setCroppedImage] = useState<string>("");
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleCustomAvatarUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = useCallback(
        (croppedArea: any, croppedAreaPixels: any) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleCropConfirm = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(
                tempImage,
                croppedAreaPixels
            );
            setCroppedImage(croppedImage);
            setIsCropping(false);
        } catch (e) {
            console.error(e);
        }
    }, [tempImage, croppedAreaPixels]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !eventName ||
            !festTypes.length ||
            !description ||
            !croppedImage ||
            (!date && !dateRange) ||
            !location ||
            !coordinators[0]?.name
        ) {
            toast({
                title: "Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }
        toast({
            title: "Event Created",
            description: `${eventName} has been scheduled for ${
                isMultiDay && dateRange
                    ? `${format(
                          dateRange?.from ?? new Date(),
                          "PP"
                      )} to ${format(dateRange?.to ?? new Date(), "PP")}`
                    : format(date ?? new Date(), "PP")
            } at ${location}.`,
        });
    };

    const removeCoordinator = (index: number) => {
        setCoordinators(coordinators.filter((_, i) => i !== index));
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8 max-w-2xl mx-auto p-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Create Event</h1>
                <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input
                        id="eventName"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>Fest Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {availableFestTypes.map((type) => (
                            <Button
                                key={type.value}
                                variant={festTypes.includes(type.value) ? "default" : "outline"}
                                onClick={() => {
                                    setFestTypes(prev =>
                                        prev.includes(type.value)
                                            ? prev.filter(t => t !== type.value)
                                            : [...prev, type.value]
                                    );
                                }}
                            >
                                {type.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="eventImage">Event Image</Label>
                    <Input
                        id="eventImage"
                        type="file"
                        accept="image/*"
                        onChange={handleCustomAvatarUpload}
                        className="w-full"
                        required
                    />
                    {croppedImage && (
                        <img
                            src={croppedImage}
                            alt="Cropped event image"
                            className="mt-2 max-w-full h-auto"
                        />
                    )}
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
                            <Button
                                variant="outline"
                                onClick={() => setIsCropping(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCropConfirm}>Confirm</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div>
                    <Label>Event Duration</Label>
                    <RadioGroup
                        value={isMultiDay ? "multi" : "single"}
                        onValueChange={(value) =>
                            setIsMultiDay(value === "multi")
                        }
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
                                    className="w-full justify-start text-left font-normal"
                                >
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(
                                                    dateRange.from,
                                                    "LLL dd, y"
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                    dateRange.to,
                                                    "LLL dd, y"
                                                )}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                ) : (
                    <div>
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    {date ? (
                                        format(date, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <div>
                    <Label htmlFor="location">Location</Label>
                    <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={locationOpen}
                                className="w-full justify-between"
                            >
                                {location
                                    ? districts.find(
                                          (district) =>
                                              district.value === location
                                      )?.label
                                    : "Select district..."}
                                <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search district..." />
                                <CommandList>
                                    <CommandEmpty>
                                        No district found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {districts.map((district) => (
                                            <CommandItem
                                                key={district.value}
                                                value={district.value}
                                                onSelect={(currentValue) => {
                                                    setLocation(
                                                        currentValue ===
                                                            location
                                                            ? ""
                                                            : currentValue
                                                    );
                                                    setLocationOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={`mr-2 h-4 w-4 ${
                                                        location ===
                                                        district.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    }`}
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
                                            const newCoordinators = [...coordinators];
                                            newCoordinators[index].name = e.target.value;
                                            setCoordinators(newCoordinators);
                                        }}
                                        required={index === 0}
                                    />
                                    <Input
                                        placeholder="Phone"
                                        value={coordinator.phone}
                                        onChange={(e) => {
                                            const newCoordinators = [...coordinators];
                                            newCoordinators[index].phone = e.target.value;
                                            setCoordinators(newCoordinators);
                                        }}
                                        required={index === 0}
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        value={coordinator.email}
                                        onChange={(e) => {
                                            const newCoordinators = [...coordinators];
                                            newCoordinators[index].email = e.target.value;
                                            setCoordinators(newCoordinators);
                                        }}
                                        required={index === 0}
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`faculty-${index}`}
                                                checked={coordinator.isFaculty}
                                                onCheckedChange={(checked) => {
                                                    const newCoordinators = [...coordinators];
                                                    newCoordinators[index].isFaculty = checked as boolean;
                                                    setCoordinators(newCoordinators);
                                                }}
                                            />
                                            <Label htmlFor={`faculty-${index}`}>Faculty</Label>
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
                                            {
                                                name: "",
                                                phone: "",
                                                email: "",
                                                isFaculty: false,
                                            },
                                        ])
                                    }
                                >
                                    Add Coordinator
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Button type="submit" className="w-full">
                Save & Procced <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
        </form>
    );
}