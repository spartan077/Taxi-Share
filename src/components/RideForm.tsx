import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { LOCATIONS, TAXI_PRICING } from '../lib/constants';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { User } from '../lib/types';

interface Props {
  user: User;
}

interface CarOption {
  car: string;
  base_price: number;
  discount: number;
  final_price: number;
  max_passengers: number;
}

export default function RideForm({ user }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    timeSlot: '',
    seatsRequired: 1,
    genderPreference: user.user_metadata.gender === 'female' ? 'any' : 'any',
    selectedCar: ''
  });

  const [availableCars, setAvailableCars] = useState<CarOption[]>([]);

  useEffect(() => {
    if (formData.source && formData.destination) {
      const routeKey = `${formData.source.toLowerCase().replace(' ', '_')}_to_${formData.destination.toLowerCase().replace(' ', '_')}`;
      const route = TAXI_PRICING.routes[routeKey as keyof typeof TAXI_PRICING.routes];
      
      if (route) {
        const allCars = [...route['4-seater'], ...route['6-seater']];
        setAvailableCars(allCars);
      } else {
        setAvailableCars([]);
      }
    }
  }, [formData.source, formData.destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store form data in localStorage or state management
    const rideDetails = {
      source: formData.source,
      destination: formData.destination,
      timeSlot: formData.timeSlot,
      seatsRequired: formData.seatsRequired,
      genderPreference: formData.genderPreference,
      userId: user.id,
      userDetails: {
        full_name: user.user_metadata.full_name,
        gender: user.user_metadata.gender
      }
    };

    // Navigate to car selection with ride details
    navigate('/select-car', { state: rideDetails });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Source</label>
          <div className="mt-1 relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select source</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <div className="mt-1 relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select destination</option>
              {LOCATIONS.filter(loc => loc !== formData.source).map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
          <div className="mt-1 relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="datetime-local"
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Seats Required</label>
          <input
            type="number"
            min="1"
            max={availableCars.find(car => car.car === formData.selectedCar)?.max_passengers || 6}
            required
            value={formData.seatsRequired}
            onChange={(e) => setFormData({ ...formData, seatsRequired: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {user.user_metadata.gender === 'female' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender Preference</label>
            <select
              value={formData.genderPreference}
              onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="any">Any Gender</option>
              <option value="female_only">Female Only</option>
            </select>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Ride Request'}
      </button>
    </form>
  );
}