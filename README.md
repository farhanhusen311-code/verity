# Digital Investigation System

A professional, enterprise-grade digital investigation platform built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui. This security operations center (SOC) dashboard provides a modern interface for managing investigations, tracking leaks, and analyzing security incidents.

## Features

- **Professional Dark Theme**: Dark mode with blue accent colors designed for extended viewing in SOC environments
- **Responsive Design**: Mobile-first layout that works on all devices
- **Sidebar Navigation**: Quick access to all major system features
- **Dashboard Analytics**: Real-time stats cards with trend indicators
- **Activity Tracking**: Recent activity feed with severity indicators
- **User Authentication**: Login and registration pages (ready for Supabase integration)
- **Scalable Architecture**: Organized folder structure for easy expansion

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS with CSS variables for theming
- **shadcn/ui** - High-quality UI components
- **Lucide Icons** - Beautiful icon library
- **Supabase** - Authentication and PostgreSQL database (setup ready)
- **Prisma ORM** - Type-safe database client (setup ready)

## Project Structure

```
/app
  /auth
    /login           - Login page
    /register        - Registration page
  /dashboard
    /investigation   - Investigation management
    /leaks          - Leak detection
    /osint          - OSINT analysis
    /graph          - Relationship graphs
    /reports        - Report generation
    /settings       - User settings
    layout.tsx      - Dashboard layout with sidebar
    page.tsx        - Dashboard home

/components
  /ui               - shadcn/ui components (Button, Card, Input, Label)
  /dashboard        - Dashboard-specific components
    sidebar.tsx     - Navigation sidebar
    top-nav.tsx     - Top navigation bar
    stat-card.tsx   - Statistics card component
    activity-list.tsx - Recent activity list

/lib
  - Utility functions and helpers

/hooks
  - Custom React hooks (ready for implementation)

/services
  - API and external service integrations

/types
  - TypeScript type definitions

/utils
  - Utility functions (cn, date formatting, color helpers)
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Routes

- `/` - Redirects to login
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Main dashboard
- `/dashboard/investigation` - Investigations page
- `/dashboard/leaks` - Leak detection page
- `/dashboard/osint` - OSINT analysis page
- `/dashboard/graph` - Relationship graphs page
- `/dashboard/reports` - Reports page
- `/dashboard/settings` - Settings page

## Demo Credentials

For testing the login flow:
- **Email**: admin@investigation.com
- **Password**: demo123456

Currently, authentication bypasses to dashboard after 500ms for demo purposes.

## Color Scheme

The application uses a professional dark theme with blue accents optimized for SOC environments:

- **Background**: Very dark gray (`#1F2937` equivalent)
- **Surface**: Dark gray (`#2D3748` equivalent)
- **Primary/Accent**: Vibrant blue (`#3B82F6` equivalent)
- **Text**: Light gray/white for readability
- **Status Colors**:
  - Critical: Red
  - High: Orange
  - Medium: Yellow
  - Low: Green

## Key Components

### Sidebar
- Navigation menu with all major features
- Active state highlighting
- Settings and logout options
- Logo and branding area

### Top Navigation
- User avatar with dropdown menu
- Notification bell with indicator
- Mobile menu toggle
- Responsive design

### Stat Cards
- Key metrics display
- Trend indicators with direction
- Color-coded by metric type
- Responsive grid layout

### Activity List
- Recent activities with timestamps
- Severity indicators
- Type-specific icons
- Scrollable history

## Future Enhancements

1. **Supabase Integration**
   - Complete authentication system
   - Database schema for investigations, leaks, and activities
   - Real-time data synchronization

2. **Investigation Features**
   - Case management
   - Evidence tracking
   - Timeline visualization

3. **Leak Detection**
   - Real-time monitoring
   - Dark web scanning
   - Alert system

4. **OSINT Tools**
   - Domain analysis
   - IP tracking
   - Social media monitoring

5. **Advanced Analytics**
   - Chart.js/Recharts integration
   - Network visualization
   - Relationship mapping

6. **Collaboration**
   - Team features
   - Comments and notes
   - Case assignments

## Development Notes

- **Dark Mode**: Configured globally in `layout.tsx` and `globals.css`
- **Icons**: All icons from Lucide React library
- **Responsive**: Mobile-first approach with Tailwind breakpoints (sm, md, lg, xl)
- **Type Safety**: Full TypeScript coverage for components and utilities
- **Component Pattern**: Functional components with proper export patterns

## Styling Approach

The project uses Tailwind CSS v4 with CSS variables for theming. All colors are defined in `globals.css`:

```css
--background: oklch(0.12 0 0);        /* Very dark background */
--primary: oklch(0.55 0.2 264);       /* Vibrant blue */
--foreground: oklch(0.95 0 0);        /* Light text */
```

Override these variables to change the entire theme globally.

## Performance Considerations

- Server-side rendering for fast initial load
- Optimized images with Next.js Image component
- CSS variables for efficient theming
- Responsive images for mobile devices
- Minimal client-side JavaScript for authentication UI

## Security Notes

- Password fields use proper HTML5 type="password"
- Form validation on client side (can be enhanced with server validation)
- Ready for Supabase authentication with proper secrets
- CORS configured for API calls

## Contributing

The codebase is organized for easy expansion:

1. Add new pages in `/app/dashboard/[feature]`
2. Create components in `/components/dashboard/[feature]`
3. Add types in `/types/index.ts`
4. Implement services in `/services/[feature].ts`
5. Use existing utilities in `/utils/cn.ts`

## License

MIT License - feel free to use this as a template for your projects.

## Support

For questions or issues, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
