import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, Filter, Car, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LOCATIONS } from '../lib/constants';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/useAuth';
import { isAdmin } from '../lib/utils';
import type { RideRequest, RideGroup } from '../lib/types';
import AuthForm from '../components/AuthForm';
import { RideMembers } from '../components/RideMembers';
import Announcement from '../components/Announcement';

export default function Matches() {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [groups, setGroups] = useState<Record<number, RideGroup>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showFemaleOnly, setShowFemaleOnly] = useState(false);
  
  // New filter states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const [pricingData, setPricingData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchGroups();
      fetchPricingData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [selectedDate, selectedSource, selectedDestination, showFemaleOnly]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter requests based on gender preference, availability, and new filters
      const filteredRequests = data.filter(request => {
        const group = groups[request.id];
        const remainingSeats = group ? group.remaining_capacity : request.seats_required;
        const isCreator = request.user_id === user?.id;
        const isMember = group?.members?.includes(user?.id);

        // Don't show rides that are full unless user is creator/member/admin
        if (remainingSeats <= 0 && !isAdmin(user) && !isCreator && !isMember) {
          return false;
        }

        // Gender preference filter
        if (user?.user_metadata.gender === 'male' && request.gender_preference === 'female_only') {
          return false;
        }
        if (showFemaleOnly && request.gender_preference !== 'female_only') {
          return false;
        }

        // Date filter
        if (selectedDate) {
          const requestDate = new Date(request.time_slot).toLocaleDateString();
          if (requestDate !== new Date(selectedDate).toLocaleDateString()) {
            return false;
          }
        }

        // Route filter
        if (selectedSource && request.source !== selectedSource) {
          return false;
        }
        if (selectedDestination && request.destination !== selectedDestination) {
          return false;
        }

        return true;
      });

      setRequests(filteredRequests || []);
    } catch (error) {
      toast.error('Failed to fetch ride requests');
      console.error('Error:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('ride_groups')
        .select('*');

      if (error) throw error;

      const groupsMap = data.reduce((acc, group) => {
        acc[group.ride_request_id] = group;
        return acc;
      }, {} as Record<number, RideGroup>);

      setGroups(groupsMap);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('taxi_pricing')
        .select('*');
      if (error) throw error;
      setPricingData(data || []);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    }
  };

  const handleJoinRide = async (request: RideRequest) => {
    if (!user) {
      toast.error('Please login to join a ride');
      return;
    }

    try {
      console.log('Starting join process for request:', request);
      console.log('Current user:', user);

      // First check if user is the creator
      if (request.user_id === user.id) {
        toast.error("You can't join your own ride request");
        return;
      }

      const { data: existingGroups, error: fetchError } = await supabase
        .from('ride_groups')
        .select('*')
        .eq('ride_request_id', request.id)
        .single();

      console.log('Existing groups query result:', { existingGroups, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching groups:', fetchError);
        throw fetchError;
      }

      if (existingGroups?.members?.includes(user.id)) {
        toast.error('You have already joined this ride');
        return;
      }

      if (existingGroups) {
        console.log('Updating existing group:', existingGroups);
        // Update existing group
        const newMembers = [...(existingGroups.members || []), user.id];
        const newRemainingCapacity = existingGroups.total_capacity - newMembers.length;

        if (newRemainingCapacity < 0) {
          toast.error('This ride is already full');
          return;
        }

        const { error: updateError } = await supabase
          .from('ride_groups')
          .update({
            members: newMembers,
            remaining_capacity: newRemainingCapacity
          })
          .eq('id', existingGroups.id);

        console.log('Update result:', { updateError });

        if (updateError) throw updateError;
      } else {
        console.log('Creating new group for request:', request);
        // Create new group
        const newGroup = {
          ride_request_id: request.id,
          total_capacity: request.seats_required,
          remaining_capacity: request.seats_required - 1,
          members: [user.id]
        };

        const { error: insertError } = await supabase
          .from('ride_groups')
          .insert([newGroup]);

        console.log('Insert result:', { insertError });

        if (insertError) throw insertError;
      }

      toast.success('Successfully joined the ride!');
      navigate('/confirmation');
    } catch (error: any) {
      console.error('Full error details:', error);
      toast.error(error.message || 'Failed to join ride');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      // Check if user is admin or creator
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      if (!isAdmin(user) && request.user_id !== user?.id) {
        toast.error('You can only cancel your own requests');
        return;
      }

      const { error } = await supabase
        .from('ride_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Ride request cancelled successfully');
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error('Failed to cancel ride request');
      console.error('Error:', error);
    }
  };

  const getPricePerPerson = (request: RideRequest) => {
    if (!request.car_details?.final_price || !request.selected_car) return 0;
    
    const pricing = pricingData.find(p => 
      p.car_name.toLowerCase().includes(request.selected_car.toLowerCase())
    );
    
    if (!pricing) {
      // Fallback to previous logic if pricing not found
      const isSixSeater = request.selected_car.toLowerCase().includes('innova') || 
                         request.selected_car.toLowerCase().includes('ertiga');
      return Math.round(request.car_details.final_price / (isSixSeater ? 6 : 4));
    }

    return Math.round(request.car_details.final_price / pricing.max_passengers);
  };

  const getCarDetails = (source: string, destination: string, carType: string) => {
    if (!source || !destination || !carType) return null;
    
    const routeName = `${source.toLowerCase()}_to_${destination.toLowerCase()}`.replace(/ /g, '_');
    const pricing = pricingData.find(p => 
      p.route_name === routeName && 
      p.car_name.toLowerCase().includes(carType.toLowerCase())
    );
    
    if (!pricing) return null;

    const maxPassengers = pricing.car_name.toLowerCase().includes('innova') || 
                         pricing.car_name.toLowerCase().includes('ertiga') ? 6 : 4;

    return {
      car: pricing.car_name,
      base_price: Math.round(pricing.base_price / maxPassengers),
      discount: Math.round(pricing.discount / maxPassengers),
      final_price: Math.round(pricing.final_price / maxPassengers),
      max_passengers: maxPassengers
    };
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Please Login</h1>
        <AuthForm />
      </div>
    );
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Payment Information</h3>
        <p className="text-yellow-700">
          Please note: We require an advance payment of ₹250 per person. Once your ride group is full, 
          our team will contact you to coordinate the payment and travel arrangements.
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="rounded-lg border-gray-200 focus:border-yellow-500 focus:ring focus:ring-yellow-200"
          >
            <option value="">Any Source</option>
            {LOCATIONS.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="rounded-lg border-gray-200 focus:border-yellow-500 focus:ring focus:ring-yellow-200"
          >
            <option value="">Any Destination</option>
            {LOCATIONS.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border-gray-200 focus:border-yellow-500 focus:ring focus:ring-yellow-200"
          />

          {user?.user_metadata?.gender === 'female' && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFemaleOnly}
                onChange={(e) => setShowFemaleOnly(e.target.checked)}
                className="rounded text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-gray-700">Female only rides</span>
            </label>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-500 mb-4" />
            <p className="text-gray-600">Loading available rides...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rides available</h3>
            <p className="text-gray-600">Create a new ride request to start sharing!</p>
          </div>
        ) : (
          requests.map((request) => {
            const group = groups[request.id];
            const totalSeats = request.selected_car.toLowerCase().includes('innova') || 
                              request.selected_car.toLowerCase().includes('ertiga') ? 6 : 4;
            const remainingSeats = group ? 
              group.remaining_capacity : 
              (totalSeats - request.seats_required);
            
            const isCreator = request.user_id === user?.id;
            const isMember = group?.members?.includes(user?.id);
            const isFull = remainingSeats <= 0;
            const carDetails = getCarDetails(request.source, request.destination, request.selected_car);

            return (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative hover:shadow-md transition-shadow"
              >
                {isFull && (
                  <div className="absolute top-4 right-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    FULL
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-700">
                        {new Date(request.time_slot).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-700">
                        {request.source} → {request.destination}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-700">
                        {remainingSeats} seats available 
                        <span className="text-sm text-gray-500">
                          (Creator requested {request.seats_required} seats)
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {carDetails?.car || 'Car not selected'}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {carDetails ? (
                            <>
                              ₹{carDetails.final_price} per person
                              <span className="text-xs text-gray-500 block">
                                ({carDetails.max_passengers} seater)
                              </span>
                            </>
                          ) : 'Price not available'}
                        </p>
                      </div>
                      {!isCreator && !isMember && !isFull && (
                        <button
                          onClick={() => handleJoinRide(request)}
                          disabled={loading}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                        >
                          Join Ride
                        </button>
                      )}
                    </div>
                    
                    {(isCreator || isMember) && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          {isCreator ? 'You created this ride' : 'You joined this ride'}
                        </h4>
                        <p className="text-yellow-700 text-sm">
                          Contact details will be shared once the group is full
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}