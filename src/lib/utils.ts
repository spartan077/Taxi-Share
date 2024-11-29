import { User } from '@supabase/supabase-js';



// Add admin emails here

const ADMIN_EMAILS = [

    'saatviktiwari@gmail.com',  // Your email

    // Add more admin emails if needed

];



export const isAdmin = (user: User | null): boolean => {

    if (!user || !user.email) return false;

    return ADMIN_EMAILS.includes(user.email);

};



// Helper function to check if user can view ride details

export const canViewRideDetails = (user: User | null, rideCreatorId: string): boolean => {

    return isAdmin(user) || (user?.id === rideCreatorId);

}; 
