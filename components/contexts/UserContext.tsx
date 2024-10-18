"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import config from '@/config';

// Define the shape of your context
interface UserContextType {
  userId: string;
  username: string;
  usertype: string;
  setUserId: (id: string) => void;
  setUsername: (name: string) => void;
  setUsertype: (type: string) => void;
  fetchUserData: (id: string, userType: 'participant' | 'organizer') => Promise<void>;
  dumpUserData: (userType: 'participant' | 'organizer') => Promise<boolean>;
  saveData: (table: string, id: string, columnIdentifier: string, columnTarget: string, data: any) => Promise<boolean>;
  fetchData: (table: string, id: string, columnIdentifier: string, columnTargets?: string[]) => Promise<any>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [usertype, setUsertype] = useState<string>('');

  const fetchUserData = async (id: string, userType: 'participant' | 'organizer') => {
    try {
      const response = await axios.get(`${config.api.host}${config.api.routes[userType]}?id=${id}`);
      const data = response.data;
  
      if (userType === 'organizer') {
        setUsername(data.OrganizerName);
      } else {
        setUsername(data.ParticipantName);
      }
    } catch (error) {
      console.error(`Error fetching ${userType} data:`, error);
      throw new Error('Failed to fetch user data');
    }
  };

  const dumpUserData = async (userType: 'participant' | 'organizer'): Promise<boolean> => {
    try {
      const payload = userType === 'organizer' ? {
        OrganizerID: userId,
        OrganizerName: username,
      } : {
        ParticipantID: userId,
        ParticipantName: username,
      };

      const response = await axios.post(`${config.api.host}${config.api.routes[userType]}`, payload);
      return response.data.success;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  };

  // Function to save data to a specific table and column
  const saveData = async (table: string, id: string, columnIdentifier: string, columnTarget: string, data: any): Promise<boolean> => {
    try {
      const payload = {
        table,
        id,
        columnIdentifier,
        columnTarget,
        data,
      };
      const response = await axios.post(`${config.api.host}${config.api.routes.save_fetch}`, payload);
      return response.data.success;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  };

  // Modified function to fetch data from specific table and multiple columns
  const fetchData = async (table: string, id: string, columnIdentifier: string, columnTargets?: string[]): Promise<any> => {
    try {
      const params: any = {
        table,
        id,
        columnIdentifier,
      };

      // Only add columnTargets if it is provided
      if (columnTargets && columnTargets.length > 0) {
        params.columnTargets = columnTargets.join(','); // Send columns as a comma-separated string
      }

      const response = await axios.get(`${config.api.host}${config.api.routes.save_fetch}`, { params });
      return response.data || null; // Expect the result as an object containing the requested columns
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        username,
        usertype,
        setUserId,
        setUsername,
        setUsertype,
        fetchUserData,
        dumpUserData,
        saveData,
        fetchData,
      }}
    >
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
