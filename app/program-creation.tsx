"use client";

import React, { useState, useCallback } from "react";
import {
    X,
    Check,
    ArrowUpRight,
    MapPin,
    Trash2,
    Upload,
    ChevronDown,
    List,
    Minus,
} from "lucide-react";
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

const programTypes = [
    { value: "academic", label: "Academic" },
    { value: "cultural", label: "Cultural" },
    { value: "sports", label: "Sports" },
    { value: "technical", label: "Technical" },
];

export default function ProgramCreation() {
    const { toast } = useToast();
    const [programName, setProgramName] = useState("");
    const [programType, setProgramType] = useState("");
    const [programTypeOpen, setProgramTypeOpen] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [date, setDate] = useState<Date>();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [venue, setVenue] = useState("");
    const [time, setTime] = useState("");
    const [rulesRegulations, setRulesRegulations] = useState("");
    const [rulesFile, setRulesFile] = useState<File | null>(null);
    const [registrationFees, setRegistrationFees] = useState("");
    const [isTeamEvent, setIsTeamEvent] = useState(false);
    const [minParticipants, setMinParticipants] = useState("1");
    const [maxParticipants, setMaxParticipants] = useState("1");
    const [coordinators, setCoordinators] = useState([
        { name: "", phone: "", email: "", isFaculty: false },
    ]);
    const [tempImage, setTempImage] = useState<string>("");
    const [croppedImage, setCroppedImage] = useState<string>("");
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleProgramPhotoUpload = (
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

    const handleRulesFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            setRulesFile(file);
        }
    };

    const insertHelpfulElement = (element: string) => {
        setRulesRegulations((prev) => prev + `\n${element}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation and submission logic here
        toast({
            title: "Program Created",
            description: `${programName} has been scheduled.`,
        });
    };

    const removeCoordinator = (index: number) => {
        setCoordinators(coordinators.filter((_, i) => i !== index));
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8 max-w-2xl mx-auto p-4 sm:p-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Create Program</h1>
                <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="programName">Program Name</Label>
                    <Input
                        id="programName"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="programType">Program Type</Label>
                    <Popover
                        open={programTypeOpen}
                        onOpenChange={setProgramTypeOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={programTypeOpen}
                                className="w-full justify-between"
                            >
                                {programType
                                    ? programTypes.find(
                                          (type) => type.value === programType
                                      )?.label
                                    : "Select program type..."}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search program type..." />
                                <CommandList>
                                    <CommandEmpty>
                                        No program type found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {programTypes.map((type) => (
                                            <CommandItem
                                                key={type.value}
                                                value={type.value}
                                                onSelect={(currentValue) => {
                                                    setProgramType(
                                                        currentValue ===
                                                            programType
                                                            ? ""
                                                            : currentValue
                                                    );
                                                    setProgramTypeOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={`mr-2 h-4 w-4 ${
                                                        programType ===
                                                        type.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
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
                </div>

                <div>
                    <Label htmlFor="programPhoto">Program Photo</Label>
                    <Input
                        id="programPhoto"
                        type="file"
                        accept="image/*"
                        onChange={handleProgramPhotoUpload}
                        className="w-full"
                        required
                    />
                    {croppedImage && (
                        <img
                            src={croppedImage}
                            alt="Cropped program image"
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
                    <Label>Program Duration</Label>
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
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                        id="venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Enter venue"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        {time &&
                            format(new Date(`2000-01-01T${time}`), "h:mm a")}
                    </p>
                </div>

                <div>
                    <Label htmlFor="rulesRegulations">
                        Rules and Regulations
                    </Label>
                    <Textarea
                        id="rulesRegulations"
                        value={rulesRegulations}
                        onChange={(e) => setRulesRegulations(e.target.value)}
                        rows={4}
                    />
                </div>

                <div>
                    <Label htmlFor="rulesFile">
                        Rules and Regulations File
                    </Label>
                    <Input
                        id="rulesFile"
                        type="file"
                        onChange={handleRulesFileUpload}
                        className="w-full"
                    />
                    {rulesFile && (
                        <p className="mt-2">File uploaded: {rulesFile.name}</p>
                    )}
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
                            onChange={(e) =>
                                setRegistrationFees(e.target.value)
                            }
                            className="pl-7"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isTeamEvent"
                        checked={isTeamEvent}
                        onCheckedChange={(checked) =>
                            setIsTeamEvent(checked as boolean)
                        }
                    />
                    <Label htmlFor="isTeamEvent">Team Event</Label>
                </div>

                {isTeamEvent && (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="maxParticipants">
                                Maximum Participants
                            </Label>
                            <Input
                                id="maxParticipants"
                                type="number"
                                value={maxParticipants}
                                onChange={(e) =>
                                    setMaxParticipants(e.target.value)
                                } // Allow typing without validation
                                onBlur={(e) => {
                                    let value = parseInt(e.target.value);

                                    // Ensure the value is at least 1
                                    if (isNaN(value) || value < 1) {
                                        value = 1;
                                    }

                                    // Ensure minParticipants is less than or equal to maxParticipants
                                    if (
                                        minParticipants &&
                                        parseInt(minParticipants) > value
                                    ) {
                                        setMinParticipants(value.toString());
                                    }

                                    setMaxParticipants(value.toString());
                                }}
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="minParticipants">
                                Minimum Participants
                            </Label>
                            <Input
                                id="minParticipants"
                                type="number"
                                value={minParticipants}
                                onChange={(e) =>
                                    setMinParticipants(e.target.value)
                                } // Allow typing without validation
                                onBlur={(e) => {
                                    let value = parseInt(e.target.value);

                                    // Ensure the value is at least 1
                                    if (isNaN(value) || value < 1) {
                                        value = 1;
                                    }

                                    // Ensure minParticipants is less than or equal to maxParticipants
                                    if (
                                        maxParticipants &&
                                        parseInt(maxParticipants) < value
                                    ) {
                                        setMaxParticipants(value.toString());
                                    }

                                    setMinParticipants(value.toString());
                                }}
                                min="1"
                                required
                            />
                        </div>
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
                                            const newCoordinators = [
                                                ...coordinators,
                                            ];
                                            newCoordinators[index].name =
                                                e.target.value;
                                            setCoordinators(newCoordinators);
                                        }}
                                        required={index === 0}
                                    />
                                    <Input
                                        placeholder="Phone"
                                        value={coordinator.phone}
                                        onChange={(e) => {
                                            const newCoordinators = [
                                                ...coordinators,
                                            ];
                                            newCoordinators[index].phone =
                                                e.target.value;
                                            setCoordinators(newCoordinators);
                                        }}
                                        required={index === 0}
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        value={coordinator.email}
                                        onChange={(e) => {
                                            const newCoordinators = [
                                                ...coordinators,
                                            ];
                                            newCoordinators[index].email =
                                                e.target.value;
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
                                                    const newCoordinators = [
                                                        ...coordinators,
                                                    ];
                                                    newCoordinators[
                                                        index
                                                    ].isFaculty =
                                                        checked as boolean;
                                                    setCoordinators(
                                                        newCoordinators
                                                    );
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
                                                onClick={() =>
                                                    removeCoordinator(index)
                                                }
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
                Save & Proceed <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
        </form>
    );
}
