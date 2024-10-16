"use client";
// UserContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import config from '@/config';

// Define the shape of your context
interface UserContextType {
  userId: string;
  username: string;
  usertype: string;
  image: string;
  email: string;
  phone: string;
  password: string;
  website?: string;
  address?: string;
  course?: string;
  department?: string;
  institute: string;
  location?: string;
  interests?: string;
  gps?: string;
  setUserId: (id: string) => void;
  setUsername: (name: string) => void;
  setUsertype: (type: string) => void;
  setImage: (image: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setPassword: (password: string) => void;
  setWebsite: (website?: string) => void;
  setAddress: (address?: string) => void;
  setCourse: (course?: string) => void;
  setDepartment: (department?: string) => void;
  setInstitute: (institute: string) => void;
  setLocation: (location?: string) => void;
  setInterests: (interests?: string) => void;
  setGps: (gps?: string) => void;
  fetchUserData: (id: string, userType: 'participant' | 'organizer') => Promise<void>;
  dumpUserData: (userType: 'participant' | 'organizer') => Promise<boolean>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [usertype, setUsertype] = useState<string>('');

  // User data state
  const [image, setImage] = useState<string>('files/imgs/defaults/avatar1.jpg');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [website, setWebsite] = useState<string>();
  const [address, setAddress] = useState<string>();
  const [course, setCourse] = useState<string>();
  const [department, setDepartment] = useState<string>();
  const [institute, setInstitute] = useState<string>('');
  const [location, setLocation] = useState<string>();
  const [interests, setInterests] = useState<string>();
  const [gps, setGps] = useState<string>();

  const fetchUserData = async (id: string, userType: 'participant' | 'organizer') => {
    try {
      const response = await axios.get(`${config.api.host}${config.api.routes[userType]}?id=${id}`);
      const data = response.data;

      if (userType === 'organizer') {
        setUsername(data.OrganizerName);
        setImage(data.OrganizerImage || image);
        setEmail(data.OrganizerEmail);
        setPhone(data.OrganizerPhone);
        setPassword(data.OrganizerPassword || '');
        setWebsite(data.OrganizerWebsite);
        setAddress(data.OrganizerAddress);
        setInstitute(data.OrganizerInstitute);
        setLocation(data.OrganizerGPS);
      } else {
        setUsername(data.ParticipantName);
        setImage(data.ParticipantImage || image);
        setEmail(data.ParticipantEmail);
        setPhone(data.ParticipantPhone);
        setPassword(data.ParticipantPassword || '');
        setCourse(data.ParticipantCourse);
        setDepartment(data.ParticipantDepartment);
        setInstitute(data.ParticipantInstitute);
        setLocation(data.ParticipantLocation);
        setInterests(data.ParticipantInterests);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const dumpUserData = async (userType: 'participant' | 'organizer'): Promise<boolean> => {
    try {
      const payload = userType === 'organizer' ? {
        OrganizerID: userId,
        OrganizerName: username,
        OrganizerEmail: email,
        OrganizerPhone: phone,
        OrganizerPassword: password,
        OrganizerWebsite: website,
        OrganizerAddress: address,
        OrganizerInstitute: institute,
        OrganizerGPS: gps,
      } : {
        ParticipantID: userId,
        ParticipantName: username,
        ParticipantEmail: email,
        ParticipantPhone: phone,
        ParticipantPassword: password,
        ParticipantCourse: course,
        ParticipantDepartment: department,
        ParticipantInstitute: institute,
        ParticipantLocation: location,
        ParticipantInterests: interests,
      };

      const response = await axios.post(`${config.api.host}${config.api.routes[userType]}`, payload);
      return response.data.success;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        username,
        usertype,
        image,
        email,
        phone,
        password,
        website,
        address,
        course,
        department,
        institute,
        location,
        interests,
        gps,
        setUserId,
        setUsername,
        setUsertype,
        setImage,
        setEmail,
        setPhone,
        setPassword,
        setWebsite,
        setAddress,
        setCourse,
        setDepartment,
        setInstitute,
        setLocation,
        setInterests,
        setGps,
        fetchUserData,
        dumpUserData,
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
