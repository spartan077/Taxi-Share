import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Car, Users, MapPin, Clock, Check, Wind, Shield } from 'lucide-react';

interface CarSelectionProps {
  rideDetails: {
    source: string;
    destination: string;
    timeSlot: string;
    seatsRequired: number;
    genderPreference: string;
    userId: string;
    userDetails: any;
  };
}

export default function CarSelection({ rideDetails }: CarSelectionProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableCars, setAvailableCars] = useState<any[]>([]);

  useEffect(() => {
    if (!rideDetails) {
      navigate('/');
      return;
    }
    
    const fetchAvailableCars = async () => {
      try {
        const routeName = `${rideDetails.source.toLowerCase()}_to_${rideDetails.destination.toLowerCase()}`.replace(/ /g, '_');
        
        const { data, error } = await supabase
          .from('taxi_pricing')
          .select('*')
          .eq('route_name', routeName);

        if (error) throw error;
        
        if (data) {
          // Sort cars by price
          const sortedCars = data.sort((a, b) => a.final_price - b.final_price);
          setAvailableCars(sortedCars);
        }
      } catch (error) {
        console.error('Error fetching car pricing:', error);
        toast.error('Failed to fetch available cars');
      }
    };

    fetchAvailableCars();
  }, [rideDetails, navigate]);

  const handleCarSelect = async (carDetails: any) => {
    setLoading(true);
    try {
      // First create the ride request
      const { data: rideRequest, error: rideError } = await supabase
        .from('ride_requests')
        .insert([
          {
            user_id: rideDetails.userId,
            source: rideDetails.source,
            destination: rideDetails.destination,
            time_slot: rideDetails.timeSlot,
            seats_required: rideDetails.seatsRequired,
            status: 'pending',
            gender_preference: rideDetails.genderPreference,
            selected_car: carDetails.car_name,
            car_details: {
              car: carDetails.car_name,
              car_type: carDetails.car_type,
              base_price: carDetails.base_price,
              discount: carDetails.discount,
              final_price: carDetails.final_price,
              max_passengers: carDetails.max_passengers,
              distance_km: carDetails.distance_km,
              toll_included: carDetails.toll_included,
              route_name: carDetails.route_name
            },
            user_details: rideDetails.userDetails
          }
        ])
        .select()
        .single();

      if (rideError) throw rideError;

      // Calculate capacities based on car type
      const totalCapacity = carDetails.max_passengers;
      const remainingCapacity = totalCapacity - rideDetails.seatsRequired;

      // Then create the ride group
      const { error: groupError } = await supabase
        .from('ride_groups')
        .insert([
          {
            ride_request_id: rideRequest.id,
            total_capacity: totalCapacity,
            remaining_capacity: remainingCapacity,
            members: [rideDetails.userId],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (groupError) throw groupError;

      toast.success('Ride request created successfully!');
      navigate('/matches');
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Failed to create ride request');
    } finally {
      setLoading(false);
    }
  };

  if (!rideDetails) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Review Your Trip</h2>
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <span>{rideDetails.source} → {rideDetails.destination}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span>{new Date(rideDetails.timeSlot).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span>{rideDetails.seatsRequired} seats required</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Select Your Car</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {availableCars.map((car) => (
          <div 
            key={car.car_name}
            className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{car.car_name}</h3>
                  <p className="text-gray-600">Max {car.max_passengers} passengers</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 line-through text-sm">
                    ₹{Math.round(car.base_price / car.max_passengers)} per person
                  </p>
                  <p className="text-2xl font-bold text-yellow-500">
                    ₹{Math.round(car.final_price / car.max_passengers)} per person
                  </p>
                  <p className="text-green-500 text-sm font-medium">
                    Save ₹{Math.round(car.discount / car.max_passengers)} per person
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-yellow-500" />
                  <span>{car.distance_km} km journey</span>
                </p>
                {car.toll_included && (
                  <p className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Toll charges included</span>
                  </p>
                )}
                <p className="flex items-center space-x-2">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <span>AC vehicle</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span>Clean & sanitized</span>
                </p>
              </div>

              <div className="text-gray-600">
                <p>Total seats: {car.max_passengers}</p>
                <p>You requested: {rideDetails.seatsRequired} seats</p>
                <p>Remaining for others: {car.max_passengers - rideDetails.seatsRequired} seats</p>
              </div>

              <button
                onClick={() => handleCarSelect(car)}
                disabled={loading || car.max_passengers < rideDetails.seatsRequired}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-none"
              >
                {car.max_passengers < rideDetails.seatsRequired 
                  ? 'Not enough seats' 
                  : loading ? 'Processing...' : 'Select This Car'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}