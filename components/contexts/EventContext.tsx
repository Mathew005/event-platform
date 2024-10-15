"use client";
// EventContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your context
interface EventContextType {
  eventId: string;
  programId: string;
  setEventId: (id: string) => void;
  setProgramId: (id: string) => void;
}

// Create the context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Create a provider component
export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [eventId, setEventId] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');

  return (
    <EventContext.Provider value={{ eventId, programId, setEventId, setProgramId }}>
      {children}
    </EventContext.Provider>
  );
};

// Create a custom hook for easier usage
export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
