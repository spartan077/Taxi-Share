# VIT Taxi Share

A web application for VIT Vellore students to share taxi rides to/from airports. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- User authentication with email verification
- Create and join ride requests
- Gender-specific ride sharing options
- Real-time notifications for group completion
- Predefined taxi options with pricing
- Automatic group matching based on source, destination, and time

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - React Router
  - React Hot Toast
  - Lucide Icons

- Backend:
  - Supabase (Database & Authentication)
  - PostgreSQL with RLS policies

## Setup Instructions

1. **Supabase Setup**

   a. Create a Supabase Account:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Note down the `URL` and `anon` key

   b. Enable Email Authentication:
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure SMTP settings (optional for production)
   - Add authorized email domains (e.g., `vitstudent.ac.in` for production)

   c. Run Database Migrations:
   - Go to SQL Editor
   - Copy and paste the contents of `supabase/migrations/update_schema.sql`
   - Run the script

2. **Environment Variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Local Development**

   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

4. **Deployment**

   The project is deployed to Netlify. To deploy your changes:

   ```bash
   # Build the project
   npm run build

   # Deploy to Netlify
   netlify deploy
   ```

   Or simply push to your GitHub repository if you've set up continuous deployment.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthForm.tsx    # User registration/login
│   ├── Navbar.tsx      # Navigation header
│   └── RideForm.tsx    # Ride request form
├── lib/                # Utilities and hooks
│   ├── constants.ts    # App constants
│   ├── supabase.ts     # Supabase client
│   ├── types.ts        # TypeScript interfaces
│   ├── useAuth.ts      # Authentication hook
│   └── useNotifications.ts # Notifications hook
├── pages/              # Route components
│   ├── Home.tsx        # Landing/Create request
│   ├── Matches.tsx     # Available rides
│   └── Confirmation.tsx # Booking confirmation
└── App.tsx             # Root component
```

## Database Schema

### ride_requests
- id (Primary Key)
- user_id (References auth.users)
- source (Text)
- destination (Text)
- time_slot (Timestamp)
- seats_required (Integer)
- status (Text)
- gender_preference (Text)
- user_details (JSONB)

### ride_groups
- id (Primary Key)
- ride_request_id (References ride_requests)
- total_capacity (Integer)
- remaining_capacity (Integer)
- members (UUID Array)
- created_at (Timestamp)
- updated_at (Timestamp)

## Security

- Row Level Security (RLS) policies ensure users can only:
  - View pending ride requests
  - Create requests with their own user_id
  - Update their own requests
  - Join groups they're eligible for

## Known Issues & TODOs

1. Email Authorization:
   - Currently allows any email domain
   - TODO: Restrict to VIT student emails

2. Ride Management:
   - TODO: Add ability to cancel/leave rides
   - TODO: Add admin dashboard for monitoring

3. Notifications:
   - TODO: Implement email notifications
   - TODO: Add in-app notifications

## Deployment

The application is deployed to Netlify. You can:
1. Access the live site at: [VIT Taxi Share](https://vit-taxi-share.netlify.app)
2. Claim the site using the provided claim URL (check deployment logs)

To deploy your local changes:
1. Build the project: `npm run build`
2. Deploy to Netlify: `npm run deploy` (requires Netlify CLI)