-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone_number TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create ride_requests table
CREATE TABLE public.ride_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE TABLE public.ride_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ride_request_id UUID REFERENCES ride_requests NOT NULL,
    total_capacity INTEGER NOT NULL,
    remaining_capacity INTEGER NOT NULL,
    members UUID[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create taxi_pricing table
CREATE TABLE public.taxi_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    route_name TEXT NOT NULL,
    car_type TEXT NOT NULL,
    car_name TEXT NOT NULL,
    base_price INTEGER NOT NULL,
    discount INTEGER NOT NULL,
    final_price INTEGER NOT NULL,
    toll_included BOOLEAN DEFAULT true,
    distance_km INTEGER NOT NULL,
    max_passengers INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX idx_ride_requests_user_id ON ride_requests(user_id);
CREATE INDEX idx_ride_requests_status ON ride_requests(status);
CREATE INDEX idx_ride_groups_ride_request_id ON ride_groups(ride_request_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_taxi_pricing_route_name ON taxi_pricing(route_name);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxi_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for ride_requests
CREATE POLICY "Users can view all pending ride requests"
    ON ride_requests FOR SELECT
    USING (status = 'pending');

CREATE POLICY "Users can create their own ride requests"
    ON ride_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ride requests"
    ON ride_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for ride_groups
CREATE POLICY "Users can view all ride groups"
    ON ride_groups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create and join ride groups"
    ON ride_groups FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() != (SELECT user_id FROM ride_requests WHERE id = ride_request_id)
        AND remaining_capacity > 0
    );

CREATE POLICY "Users can update groups they're part of"
    ON ride_groups FOR UPDATE
    USING (auth.uid() = ANY(members));

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'saatviktiwari@gmail.com'
        )
    );

-- Create policy for taxi_pricing
CREATE POLICY "Anyone can view taxi pricing"
    ON taxi_pricing FOR SELECT
    TO authenticated
    USING (true);

-- Insert taxi pricing data
INSERT INTO taxi_pricing (
    route_name,
    car_type,
    car_name,
    base_price,
    discount,
    final_price,
    toll_included,
    distance_km,
    max_passengers
) VALUES 

-- VIT Vellore to Bangalore Airport
('vit_vellore_to_bangalore_airport', '4-seater', 'Wagon R or equivalent', 6006, 1266, 4740, true, 213, 4),
('vit_vellore_to_bangalore_airport', '4-seater', 'Toyota Etios or equivalent', 6108, 1287, 4821, true, 213, 4),
('vit_vellore_to_bangalore_airport', '6-seater', 'Ertiga or equivalent', 9395, 2361, 7034, true, 213, 6),
('vit_vellore_to_bangalore_airport', '6-seater', 'Toyota Innova', 14129, 3665, 10464, true, 213, 6),

-- Bangalore Airport to VIT Vellore
('bangalore_airport_to_vit_vellore', '4-seater', 'Wagon R or equivalent', 6006, 1266, 4740, true, 213, 4),
('bangalore_airport_to_vit_vellore', '4-seater', 'Toyota Etios or equivalent', 6108, 1287, 4821, true, 213, 4),
('bangalore_airport_to_vit_vellore', '6-seater', 'Ertiga or equivalent', 9395, 2361, 7034, true, 213, 6),
('bangalore_airport_to_vit_vellore', '6-seater', 'Toyota Innova', 14129, 3665, 10464, true, 213, 6),

-- VIT Vellore to Chennai Airport
('vit_vellore_to_chennai_airport', '4-seater', 'Wagon R or equivalent', 3111, 442, 2669, true, 135, 4),
('vit_vellore_to_chennai_airport', '4-seater', 'Toyota Etios or equivalent', 3154, 446, 2708, true, 135, 4),
('vit_vellore_to_chennai_airport', '6-seater', 'Ertiga or equivalent', 5975, 1116, 4859, true, 135, 6),
('vit_vellore_to_chennai_airport', '6-seater', 'Toyota Innova', 8730, 685, 8045, true, 135, 6),

-- Chennai Airport to VIT Vellore
('chennai_airport_to_vit_vellore', '4-seater', 'Wagon R or equivalent', 3429, 470, 2959, true, 138, 4),
('chennai_airport_to_vit_vellore', '4-seater', 'Toyota Etios or equivalent', 3479, 475, 3004, true, 138, 4),
('chennai_airport_to_vit_vellore', '6-seater', 'Ertiga or equivalent', 6695, 839, 5856, true, 138, 6),
('chennai_airport_to_vit_vellore', '6-seater', 'Toyota Innova', 8368, 742, 7626, true, 138, 6);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ride_groups_updated_at
    BEFORE UPDATE ON ride_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add other functions and triggers as needed... 