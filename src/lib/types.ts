export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    registration_number: string;
    gender: 'male' | 'female';
  };
}

export interface RideRequest {
  id: number;
  user_id: string;
  source: string;
  destination: string;
  time_slot: string;
  seats_required: number;
  status: string;
  gender_preference: 'any' | 'female_only';
  user_details: {
    full_name: string;
    gender: string;
  };
}