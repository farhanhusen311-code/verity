# Digital Investigation Page Documentation

## Overview

The Investigation page is a comprehensive digital forensics and OSINT search interface designed to look and function like a professional SOC (Security Operation Center) investigation platform. It provides users with a professional interface to search for digital identities across multiple sources and investigation types.

## Page Structure

### Layout Architecture

The page uses a 3-column layout on desktop (responsive):

```
┌─────────────────────────────────────────────────────────────┐
│                         Top Navigation                       │
├──────────────┬────────────────────────────┬─────────────────┤
│              │                            │                 │
│   Sidebar    │      Main Content          │  Right Sidebar  │
│   (Left)     │   - Search Form            │  - Tips Card    │
│              │   - Results Table          │  - Statistics   │
│              │   - Action Buttons         │  - Pro Tips     │
│              │                            │                 │
└──────────────┴────────────────────────────┴─────────────────┘
```

### Page Header

```
Title: Digital Investigation
Subtitle: Search digital identities and investigate publicly available information.
Action Button: + New Investigation
```

## Components

### 1. SearchForm Component (`/components/investigation/search-form.tsx`)

A comprehensive search interface with multiple input fields and options.

#### Features:
- **7 Input Fields** (all optional):
  - Email Address (with Mail icon)
  - Username (with User icon)
  - Phone Number (with Phone icon)
  - Full Name (with Users icon)
  - Website URL (with Globe icon)
  - Domain (with Network icon)
  - IP Address (with Server icon)

- **4 Search Options** (checkboxes, all enabled by default):
  - Include OSINT Search
  - Include Leak Detection
  - Include Domain Intelligence
  - Include Social Media Search

- **Action Buttons**:
  - Search Investigation (Primary, full width, shows loading state)
  - Reset (Outline style, clears all fields)

#### State Management:
```typescript
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
```

#### Styling:
- Input fields have `bg-input/50` background
- All fields are labeled with icons
- 2-column layout on desktop, single column on mobile
- Proper spacing and visual hierarchy
- Professional card design with borders and shadows

### 2. InvestigationTable Component (`/components/investigation/investigation-table.tsx`)

A modern, professional table displaying investigation results with mock data.

#### Columns:
| Column | Type | Features |
|--------|------|----------|
| Target | Text | Investigation target identifier |
| Type | Text | Email, Username, Domain, IP Address |
| Status | Badge | Pending / Running / Completed |
| Risk Level | Badge | Low / Medium / High / Critical |
| Created | Date | YYYY-MM-DD format |
| Action | Button | View button with eye icon |

#### Mock Data:
- 5 pre-populated investigation records
- Varied status values (pending, running, completed)
- Risk levels color-coded with badges
- Realistic investigation targets

#### Badge Styling:
- **Status Badges**:
  - Pending: Yellow background/border
  - Running: Blue background/border
  - Completed: Green background/border

- **Risk Badges**:
  - Low: Green
  - Medium: Yellow
  - High: Orange
  - Critical: Red

#### Table Features:
- Hover effects on rows
- Responsive overflow on mobile
- Professional spacing and typography
- View button with hover animation

### 3. InvestigationSidebar Component (`/components/investigation/investigation-sidebar.tsx`)

Right sidebar with tips, statistics, and helpful information.

#### Card 1: Investigation Tips
Displays three actionable tips with checkmark icons:
1. Use valid email addresses
2. Use complete domain names
3. Multiple identifiers improve results

Each tip includes:
- Green checkmark icon
- Title text
- Description text

#### Card 2: Search Statistics
Real-time statistics with progress bars:
- **Today's Searches**: 24 (60% of daily limit)
- **Successful Matches**: 18 (75% success rate)
- **Avg Investigation Time**: 2.4s (performance metric)

Each statistic includes:
- Label
- Large metric number
- Colored progress bar
- Description text

#### Card 3: Pro Tip Card
- Styled card with primary accent background
- Tip about saving search profiles
- Quick reference for advanced usage

## UI Components Used

### New Components Created:
1. **Checkbox** (`/components/ui/checkbox.tsx`)
   - Radix UI based checkbox with Lucide icon
   - Styled for dark theme with blue accent

2. **Badge** (`/components/ui/badge.tsx`)
   - Variant-based badge system
   - Status variants: pending, completed, running
   - Risk variants: low, medium, high, critical

3. **Textarea** (`/components/ui/textarea.tsx`)
   - Form textarea component
   - Consistent with Input styling

### Existing Components Used:
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button (with variant and size options)
- Input
- Label

### Icons (Lucide):
- Mail, User, Phone, Users, Globe, Network, Server (search fields)
- Search (form title)
- Eye (view action)
- Lightbulb (tips card)
- BarChart3 (statistics card)
- CheckCircle2 (tip checkmarks)
- Plus (new investigation button)

## Styling and Theme

### Color System
- **Background**: Dark (#1A1F2E equivalent in oklch)
- **Cards**: Slightly lighter dark (#242B3D equivalent)
- **Primary**: Blue accent (#3B82F6 equivalent in oklch)
- **Text**: Light gray/white for contrast
- **Borders**: Subtle borders with opacity

### Typography
- **Headings**: Bold, larger sizes (h1, h2)
- **Labels**: Medium weight, medium size
- **Body**: Regular weight, smaller size
- **Descriptions**: Muted foreground color

### Spacing
- Cards: 6-unit padding (24px)
- Input grid: 4-unit gap (16px)
- Form sections: 6-unit spacing (24px)

### Responsive Design
- **Desktop (lg)**: 3-column layout (2:1:1 ratio)
- **Tablet (md)**: 2-column layout for form fields
- **Mobile**: Single column, full width

## Features and Interactions

### Search Form
- ✅ All fields optional
- ✅ Checkboxes enabled by default
- ✅ Loading state on search button
- ✅ Reset button clears all fields
- ✅ Form validation ready (no backend call)

### Table
- ✅ Hover effects on rows
- ✅ Color-coded status badges
- ✅ Color-coded risk level badges
- ✅ View button for each record
- ✅ Responsive table layout

### Sidebar
- ✅ Investigation tips with icons
- ✅ Search statistics with progress bars
- ✅ Real-time metric display
- ✅ Pro tip card with advice

## Accessibility Features

- Semantic HTML with proper heading hierarchy
- ARIA labels on form inputs
- Checkbox accessibility via Radix UI
- Color coding supplemented with text labels
- Proper contrast ratios for dark theme
- Icon + text combinations for clarity
- Keyboard navigation support

## Type Definitions

New types added to `/types/index.ts`:

```typescript
export interface InvestigationTarget {
  email?: string
  username?: string
  phone?: string
  fullName?: string
  website?: string
  domain?: string
  ipAddress?: string
}

export interface SearchOptions {
  includeOsint: boolean
  includeLeakDetection: boolean
  includeDomainIntelligence: boolean
  includeSocialMedia: boolean
}

export interface InvestigationResult {
  id: string
  target: string
  type: 'email' | 'username' | 'phone' | 'domain' | 'ip' | 'website'
  status: 'pending' | 'running' | 'completed'
  risk: 'low' | 'medium' | 'high' | 'critical'
  created: string
  findings?: string[]
}
```

## Future Enhancements

1. **Backend Integration**
   - Connect search form to actual investigation API
   - Real-time results fetching
   - Actual search processing and findings

2. **Advanced Features**
   - Save and filter investigations
   - Export investigation reports
   - Share investigations with team members
   - Investigation history and analytics

3. **Data Visualization**
   - Graph visualization for relationships
   - Timeline view for investigations
   - Risk assessment charts

4. **Real-time Updates**
   - Live investigation progress
   - Real-time findings updates
   - Websocket for live notifications

5. **Advanced Search**
   - Saved search profiles
   - Search filters and conditions
   - Advanced query builder

## Testing Checklist

- ✅ Form field inputs work
- ✅ Checkboxes toggle correctly
- ✅ Search button shows loading state
- ✅ Reset button clears fields
- ✅ Table displays all 5 mock records
- ✅ Badges display with correct colors
- ✅ Hover effects work on table rows
- ✅ Mobile responsive layout works
- ✅ Sidebar displays all cards
- ✅ Progress bars display correctly
- ✅ Navigation links work
- ✅ Page is responsive at all viewport sizes

## File Structure

```
/app/dashboard/investigation/
└── page.tsx (Main page component)

/components/investigation/
├── search-form.tsx (Search form component)
├── investigation-table.tsx (Results table)
└── investigation-sidebar.tsx (Right sidebar)

/components/ui/
├── checkbox.tsx (New - Checkbox input)
├── badge.tsx (New - Badge component)
└── textarea.tsx (New - Textarea component)

/types/
└── index.ts (Updated with investigation types)
```

## Performance Considerations

- Component lazy loading ready
- Minimal re-renders with proper React optimization
- Static mock data for immediate rendering
- CSS class optimization with Tailwind
- Responsive images and icons
- No external API calls in current version

---

**Last Updated**: 2024-01-16
**Version**: 1.0
**Status**: Ready for Backend Integration
