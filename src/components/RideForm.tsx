import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Loader2, Search } from 'lucide-react';
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
    genderPreference: 'any' as 'any' | 'female_only',
    selectedCar: '',
    bookWholeCab: false
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
    
    if (!user) {
      toast.error('Please login to create a ride request');
      return;
    }

    try {
      // Validate the form data
      if (!formData.source || !formData.destination || !formData.timeSlot || !formData.seatsRequired) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Navigate to car selection with ride details
      navigate('/car-selection', {
        state: {
          ...formData,
          userId: user.id,
          userDetails: {
            full_name: user.user_metadata?.full_name || 'Unknown',
            phone_number: user.user_metadata?.phone_number || 'No phone'
          }
        }
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create ride request');
    }
  };

  // Add this function to calculate remaining seats
  const getMaxSeats = (carType: string) => {
    const isLargeCar = carType.toLowerCase().includes('innova') || 
                     carType.toLowerCase().includes('ertiga');
    const totalSeats = isLargeCar ? 6 : 4;
    return totalSeats;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Source Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pickup Location
          </label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            required
            className="w-full rounded-lg border-gray-200 focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition-shadow"
          >
            <option value="">Select pickup point</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Drop Location
          </label>
          <select
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
            className="w-full rounded-lg border-gray-200 focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition-shadow"
          >
            <option value="">Select destination</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Time Slot */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Departure Time
          </label>
          <input
            type="datetime-local"
            value={formData.timeSlot}
            onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
            required
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-lg border-gray-200 focus:border-yellow-500 focus:ring focus:ring-yellow-200 transition-shadow"
          />
        </div>

        {/* Seats Required */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Number of Seats Required
          </label>
          <select
            value={formData.seatsRequired}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              seatsRequired: parseInt(e.target.value)
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
          >
            {[...Array(getMaxSeats(formData.selectedCar))].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'seat' : 'seats'}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500">
            {getMaxSeats(formData.selectedCar) - formData.seatsRequired} seats will remain available for others
          </p>
        </div>

        {/* Gender Preference */}
        {user.user_metadata.gender === 'female' && (
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Gender Preference
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="any"
                  checked={formData.genderPreference === 'any'}
                  onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value as 'any' | 'female_only' })}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span>Any</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="female_only"
                  checked={formData.genderPreference === 'female_only'}
                  onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value as 'any' | 'female_only' })}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span>Female Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Book Whole Cab */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.bookWholeCab}
              onChange={(e) => {
                const isBookingWholeCab = e.target.checked;
                setFormData(prev => ({
                  ...prev,
                  bookWholeCab: isBookingWholeCab,
                  // If booking whole cab, set seats to max available
                  seatsRequired: isBookingWholeCab ? getMaxSeats(formData.selectedCar) : 1
                }));
              }}
              className="rounded text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">Book Whole Cab</span>
          </label>
          {formData.bookWholeCab && (
            <p className="text-sm text-yellow-600">
              You will be booking all {getMaxSeats(formData.selectedCar)} seats in the cab
            </p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Create Ride Request</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}