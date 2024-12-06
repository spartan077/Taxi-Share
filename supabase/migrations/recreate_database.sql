-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone_number TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create taxi_pricing table
CREATE TABLE IF NOT EXISTS public.taxi_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_name TEXT NOT NULL,
    car_type TEXT NOT NULL,
    car_name TEXT NOT NULL,
    base_price INTEGER NOT NULL,
    discount INTEGER NOT NULL,
    final_price INTEGER NOT NULL,
    toll_included BOOLEAN NOT NULL,
    distance_km INTEGER NOT NULL,
    max_passengers INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create ride_requests table
CREATE TABLE IF NOT EXISTS public.ride_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    time_slot TIMESTAMP NOT NULL,
    seats_required INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    gender_preference TEXT DEFAULT 'any' NOT NULL,
    user_details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    selected_car TEXT,
    car_details JSONB
);

-- Create ride_groups table
CREATE TABLE IF NOT EXISTS public.ride_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ride_request_id UUID REFERENCES ride_requests NOT NULL,
    total_capacity INTEGER NOT NULL,
    remaining_capacity INTEGER NOT NULL,
    members UUID[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ride_requests_user_id ON ride_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests(status);
CREATE INDEX IF NOT EXISTS idx_ride_groups_ride_request_id ON ride_groups(ride_request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxi_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Insert taxi pricing data
INSERT INTO taxi_pricing (
    route_name, car_type, car_name, base_price, discount, final_price, 
    toll_included, distance_km, max_passengers
) VALUES 
-- VIT Vellore to Bangalore Airport
('vit_vellore_to_bangalore_airport', '4-seater', 'Wagon R or equivalent', 6006, 1266, 4740, true, 213, 4),
('vit_vellore_to_bangalore_airport', '4-seater', 'Toyota Etios or equivalent', 6108, 1287, 4821, true, 213, 4),
('vit_vellore_to_bangalore_airport', '6-seater', 'Ertiga or equivalent', 9395, 2361, 7034, true, 213, 6),
('vit_vellore_to_bangalore_airport', '6-seater', 'Toyota Innova', 14129, 3665, 10464, true, 213, 6),
-- ... (rest of the taxi pricing data)
('chennai_airport_to_vit_vellore', '6-seater', 'Toyota Innova', 8368, 742, 7626, true, 138, 6);

-- Create RLS policies
-- ... (copying all the policies from your original schema) 