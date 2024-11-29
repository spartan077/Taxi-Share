import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, Filter } from 'lucide-react';
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

    return {
      car: pricing.car_name,
      base_price: pricing.base_price,
      discount: pricing.discount,
      final_price: pricing.final_price,
      max_passengers: pricing.max_passengers
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <Announcement />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center mb-8">Available Rides</h1>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Sources</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Destinations</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {user?.user_metadata.gender === 'female' && (
              <div className="flex items-end">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={showFemaleOnly}
                    onChange={(e) => setShowFemaleOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Female only rides</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {requests.map((request) => {
            const group = groups[request.id];
            const remainingSeats = group ? group.remaining_capacity : request.seats_required;
            const isCreator = request.user_id === user?.id;
            const isMember = group?.members?.includes(user?.id);
            const isFull = remainingSeats <= 0;

            const carDetails = getCarDetails(request.source, request.destination, request.selected_car);

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 relative"
              >
                {/* Add a "FULL" badge if the ride is full */}
                {isFull && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                    FULL
                  </div>
                )}
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {new Date(request.time_slot).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {request.source} → {request.destination}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {remainingSeats} seat{remainingSeats !== 1 ? 's' : ''} available
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-gray-600">
                    {request.selected_car || 'Car not specified'}
                  </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                    ₹{getPricePerPerson(request)}/person
                  </div>
                </div>
                <RideMembers request={request} group={group} />
                {!isCreator && !isMember && (
                  <button
                    onClick={() => handleJoinRide(request)}
                    className={`w-full mt-4 py-2 px-4 rounded-md ${
                      isFull
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isFull}
                  >
                    {isFull ? 'Ride Full' : 'Join Ride'}
                  </button>
                )}
                {(isCreator || isMember) && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm mt-4 text-center">
                    {isCreator ? 'Your Ride' : 'Already Joined'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}