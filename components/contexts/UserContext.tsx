"use client";
// UserContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your context
interface UserContextType {
  userId: string;
  username: string;
  usertype: string
  setUserId: (id: string) => void;
  setUsername: (name: string) => void;
  setUsertype: (type: string) => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [usertype, setUsertype] = useState<string>('');

  return (
    <UserContext.Provider value={{ userId, username, usertype, setUserId, setUsername, setUsertype }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook for easier usage
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
