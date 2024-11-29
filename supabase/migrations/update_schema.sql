-- First, create the ride_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS ride_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    time_slot TIMESTAMP NOT NULL,
    seats_required INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    gender_preference TEXT DEFAULT 'any' NOT NULL,
    user_details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create ride_groups table
CREATE TABLE IF NOT EXISTS ride_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ride_request_id UUID REFERENCES ride_requests NOT NULL,
    total_capacity INTEGER NOT NULL,
    remaining_capacity INTEGER NOT NULL,
    members UUID[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ride_requests_user_id ON ride_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests(status);
CREATE INDEX IF NOT EXISTS idx_ride_groups_ride_request_id ON ride_groups(ride_request_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger for ride_groups
DROP TRIGGER IF EXISTS update_ride_groups_updated_at ON ride_groups;
CREATE TRIGGER update_ride_groups_updated_at
    BEFORE UPDATE ON ride_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_groups ENABLE ROW LEVEL SECURITY;

-- Policies for ride_requests
DROP POLICY IF EXISTS "Users can view all pending ride requests" ON ride_requests;
CREATE POLICY "Users can view all pending ride requests"
    ON ride_requests FOR SELECT
    USING (status = 'pending');

DROP POLICY IF EXISTS "Users can create their own ride requests" ON ride_requests;
CREATE POLICY "Users can create their own ride requests"
    ON ride_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ride requests" ON ride_requests;
CREATE POLICY "Users can update their own ride requests"
    ON ride_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for ride_groups
DROP POLICY IF EXISTS "Users can view all ride groups" ON ride_groups;
CREATE POLICY "Users can view all ride groups"
    ON ride_groups FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can create and join ride groups" ON ride_groups;
CREATE POLICY "Users can create and join ride groups"
    ON ride_groups FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Check that the user is not the creator of the ride request
        auth.uid() != (
            SELECT user_id 
            FROM ride_requests 
            WHERE id = ride_request_id
        )
        -- And check that the group has capacity
        AND remaining_capacity > 0
    );

DROP POLICY IF EXISTS "Users can update groups they're part of" ON ride_groups;
CREATE POLICY "Users can update groups they're part of"
    ON ride_groups FOR UPDATE
    USING (auth.uid() = ANY(members));

-- Add a trigger to update remaining_capacity
CREATE OR REPLACE FUNCTION update_remaining_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update remaining_capacity when members array changes
    NEW.remaining_capacity = NEW.total_capacity - array_length(NEW.members, 1);
    
    -- If remaining capacity would go negative, raise an error
    IF NEW.remaining_capacity < 0 THEN
        RAISE EXCEPTION 'Ride group is full';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for the remaining capacity update
DROP TRIGGER IF EXISTS update_ride_groups_capacity ON ride_groups;
CREATE TRIGGER update_ride_groups_capacity
    BEFORE UPDATE OF members ON ride_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_remaining_capacity();

-- Create notifications table with proper foreign key reference
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.uid() IN (
            SELECT user_id 
            FROM ride_requests 
            WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 
            FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.email = 'saatviktiwari@gmail.com'
        )
    );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_ride_notification()
RETURNS TRIGGER AS $$
DECLARE
    creator_id UUID;
BEGIN
    -- Get the ride creator's ID
    SELECT user_id INTO creator_id
    FROM ride_requests
    WHERE id = NEW.ride_request_id;

    -- Notify ride creator when group is full
    IF NEW.remaining_capacity = 0 AND OLD.remaining_capacity > 0 THEN
        INSERT INTO notifications (user_id, message, type)
        VALUES (
            creator_id,
            'Your ride group is now full! Time to book the cab.',
            'ride_full'
        );
    END IF;
    
    -- Notify new member when they join
    IF array_length(NEW.members, 1) > array_length(OLD.members, 1) THEN
        -- Get the new member's ID (last element in the array)
        INSERT INTO notifications (user_id, message, type)
        VALUES (
            NEW.members[array_length(NEW.members, 1)],
            'You have successfully joined the ride group!',
            'ride_joined'
        );
        
        -- Notify the ride creator about new member
        IF creator_id != NEW.members[array_length(NEW.members, 1)] THEN
            INSERT INTO notifications (user_id, message, type)
            VALUES (
                creator_id,
                'A new member has joined your ride group!',
                'member_joined'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS create_ride_notifications ON ride_groups;
CREATE TRIGGER create_ride_notifications
    AFTER UPDATE OF members, remaining_capacity ON ride_groups
    FOR EACH ROW
    EXECUTE FUNCTION create_ride_notification();

-- Add to your schema.sql
CREATE OR REPLACE FUNCTION hide_full_rides()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.remaining_capacity = 0 THEN
        UPDATE ride_requests
        SET status = 'completed'
        WHERE id = NEW.ride_request_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS hide_full_ride_groups ON ride_groups;
CREATE TRIGGER hide_full_ride_groups
    AFTER UPDATE OF remaining_capacity ON ride_groups
    FOR EACH ROW
    WHEN (NEW.remaining_capacity = 0)
    EXECUTE FUNCTION hide_full_rides();

-- Add this to your schema
ALTER TABLE notifications ADD CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;