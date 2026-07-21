'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Mail,
  User,
  Phone,
  Users,
  Globe,
  Network,
  Server,
} from 'lucide-react'

interface SearchFormState {
  email: string
  username: string
  phone: string
  fullName: string
  website: string
  domain: string
  ipAddress: string
  includeOsint: boolean
  includeLeakDetection: boolean
  includeDomainIntelligence: boolean
  includeSocialMedia: boolean
}

export function SearchForm() {
  const [formState, setFormState] = useState<SearchFormState>({
    email: '',
    username: '',
    phone: '',
    fullName: '',
    website: '',
    domain: '',
    ipAddress: '',
    includeOsint: true,
    includeLeakDetection: true,
    includeDomainIntelligence: true,
    includeSocialMedia: true,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string) => {
    setFormState((prev) => ({
      ...prev,
      [name]: !prev[name as keyof SearchFormState],
    }))
  }

  const handleSearch = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const handleReset = () => {
    setFormState({
      email: '',
      username: '',
      phone: '',
      fullName: '',
      website: '',
      domain: '',
      ipAddress: '',
      includeOsint: true,
      includeLeakDetection: true,
      includeDomainIntelligence: true,
      includeSocialMedia: true,
    })
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Investigation Target
        </CardTitle>
        <CardDescription>
          Enter identifiers to search for digital footprints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email Address
            </Label>
            <Input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={formState.email}
              onChange={handleInputChange}
              className="bg-input/50"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Username
            </Label>
            <Input
              name="username"
              type="text"
              placeholder="username123"
              value={formState.username}
              onChange={handleInputChange}
              className="bg-input/50"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Phone Number
            </Label>
            <Input
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formState.phone}
              onChange={handleInputChange}
              className="bg-input/50"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Full Name
            </Label>
            <Input
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formState.fullName}
              onChange={handleInputChange}
              className="bg-input/50"
            />
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Website URL
            </Label>
            <Input
              name="website"
              type="url"
              placeholder="https://example.com"
              value={formState.website}
              onChange={handleInputChange}
              className="bg-input/50"
            />
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              Domain
            </Label>
            <Input
              name="domain"
              type="text"
              placeholder="example.com"
              value={formState.domain}
              onChange={handleInputChange}
              className="bg-input/50"
            />
          </div>

          {/* IP Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              IP Address
            </Label>
            <Input
              name="ipAddress"
              type="text"
              placeholder="192.168.1.1"
              value={formState.ipAddress}
              onChange={handleInputChange}
              className="bg-input/50"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 border-t border-border/50 pt-6">
          <p className="text-sm font-medium text-foreground">Search Options</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="osint"
                checked={formState.includeOsint}
                onCheckedChange={() =>
                  handleCheckboxChange('includeOsint')
                }
              />
              <Label
                htmlFor="osint"
                className="text-sm font-normal cursor-pointer"
              >
                Include OSINT Search
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="leak"
                checked={formState.includeLeakDetection}
                onCheckedChange={() =>
                  handleCheckboxChange('includeLeakDetection')
                }
              />
              <Label
                htmlFor="leak"
                className="text-sm font-normal cursor-pointer"
              >
                Include Leak Detection
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="domain"
                checked={formState.includeDomainIntelligence}
                onCheckedChange={() =>
                  handleCheckboxChange('includeDomainIntelligence')
                }
              />
              <Label
                htmlFor="domain"
                className="text-sm font-normal cursor-pointer"
              >
                Include Domain Intelligence
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="social"
                checked={formState.includeSocialMedia}
                onCheckedChange={() =>
                  handleCheckboxChange('includeSocialMedia')
                }
              />
              <Label
                htmlFor="social"
                className="text-sm font-normal cursor-pointer"
              >
                Include Social Media Search
              </Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                Searching...
              </>
            ) : (
              'Search Investigation'
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Search icon since we're using lucide
function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  )
}
