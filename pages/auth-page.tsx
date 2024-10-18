'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from 'axios'
import config from '@/config'
import { useUserContext } from '@/components/contexts/UserContext'
import { useRouter } from 'next/navigation'


const countryCodes = [
  { value: "+1", label: "USA (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+91", label: "India (+91)" },
]
interface ifLogin {
  ifLogin: boolean;
}

const ImageFile = 'files/imgs/events/placeholder.svg'

export default function Component({ifLogin}:ifLogin) {
  const { setUserId, setUsername, setUsertype} = useUserContext();

  const [isLogin, setIsLogin] = useState(ifLogin)
  const [userType, setUserType] = useState('participant')
  const [formKey, setFormKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    
    if (!isLogin && password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
  
    setLoading(true);
    setErrorMessage('');
    setPasswordError('');
  
    try {
      const response = await axios.post(
        `${config.api.host}${config.api.routes.auth}`,
        {
          action: isLogin ? 'login' : 'register',
          ...data,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = response.data;
      
      if (result.success) {
        const user = result.user;
        setUserId(user.id)
        setUsername(user.name)
        setUsertype(user.userType)
        console.log('Logged In')
        router.push('/home')
        // console.log(user)
        // alert(result.message);
        if (formRef.current) {
          formRef.current.reset();
        }
        setPassword('');
        setConfirmPassword('');
      } else {
        console.log(result.message)
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset form when switching between login and register
    setFormKey(prevKey => prevKey + 1)
    setPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }, [isLogin])

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" style={{backgroundImage: `url('${config.api.host}${ImageFile}?height=1080&width=1920')`}}>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="bg-white/80 p-8 rounded-lg shadow-md w-full max-w-md relative z-10 transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{isLogin ? 'Login' : 'Register'}</h1>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500 mb-1">
              {isLogin ? 'Switch to Register' : 'Switch to Login'}
            </span>
            <Switch
              checked={!isLogin}
              onCheckedChange={() => setIsLogin(!isLogin)}
            />
          </div>
        </div>

        {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}

        <form ref={formRef} key={formKey} onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password" 
                  required 
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>User Type</Label>
                <RadioGroup defaultValue={userType} onValueChange={setUserType} name="userType">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="participant" id="participant" />
                    <Label htmlFor="participant">Participant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organizer" id="organizer" />
                    <Label htmlFor="organizer">Organizer</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {userType === 'participant' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required />
                </div>
              )}
              
              {userType === 'organizer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input id="organizationName" name="organizationName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="new-password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  autoComplete="new-password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordError && <div className="text-red-500">{passwordError}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <div className="flex space-x-2">
                  <Select name="countryCode">
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
                  <Input id="contactNumber" name="contactNumber" type="tel" required className="flex-1" />
                </div>
              </div>
              
              {userType === 'organizer' && (
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" />
                </div>
              )}
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </Button>
        </form>
      </div>
    </div>
  )
}