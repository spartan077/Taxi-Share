import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isAdmin } from '../lib/utils';
import { RideGroup, RideRequest } from '../lib/types';
import { Trash2, Edit2, UserX, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PricingManager from './PricingManager';

interface MemberDetail {
  id: string;
  full_name: string;
  phone_number: string;
}

export default function AdminDashboard() {
  const [groups, setGroups] = useState<RideGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    total_capacity: 0,
    remaining_capacity: 0
  });
  const [activeTab, setActiveTab] = useState<'rides' | 'pricing'>('rides');
  const [rideStatuses, setRideStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    checkAdmin();
    fetchGroups();
    fetchRideStatuses();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchGroups = async () => {
    try {
      console.log('Fetching groups...');
      
      const { data: basicGroups, error: groupsError } = await supabase
        .from('ride_groups')
        .select(`
          *,
          ride_request:ride_requests(
            source,
            destination,
            time_slot,
            gender_preference,
            user_id,
            car_details,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('Error fetching basic groups:', groupsError);
        throw groupsError;
      }

      const groupsWithDetails = await Promise.all(
        basicGroups.map(async (group) => {
          const { data: creatorData } = await supabase
            .from('profiles')
            .select('id, full_name, phone_number')
            .eq('id', group.ride_request.user_id)
            .single();

          let memberDetails: MemberDetail[] = [];
          const allMembers = [...(group.members || []), group.ride_request.user_id];
          
          if (allMembers.length > 0) {
            const { data: members, error: membersError } = await supabase
              .from('profiles')
              .select('id, full_name, phone_number')
              .in('id', allMembers);

            if (membersError) {
              console.error('Error fetching member details:', membersError);
            }
            memberDetails = members || [];
          }

          return {
            ...group,
            creator_details: creatorData || { full_name: 'Unknown', phone_number: 'No phone' },
            member_details: memberDetails
          };
        })
      );

      setGroups(groupsWithDetails);
    } catch (error) {
      console.error('Error in fetchGroups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRideStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('ride_status')
        .select('*');

      if (error) throw error;

      const statusMap = (data || []).reduce((acc: Record<string, any>, status: any) => {
        acc[status.ride_group_id] = status;
        return acc;
      }, {});

      setRideStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching ride statuses:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this ride group? This action cannot be undone.')) return;

    try {
      // First get the current group data
      const { data: currentGroup, error: fetchError } = await supabase
        .from('ride_groups')
        .select(`
          *,
          ride_request:ride_requests(*)
        `)
        .eq('id', groupId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (!currentGroup || !currentGroup.ride_request) {
        toast.error('Could not fetch group data');
        return;
      }

      // First delete the ride_group
      const { error: groupError } = await supabase
        .from('ride_groups')
        .delete()
        .eq('id', groupId);

      if (groupError) {
        console.error('Group delete error:', groupError);
        throw groupError;
      }

      // Then delete the ride_request
      const { error: requestError } = await supabase
        .from('ride_requests')
        .delete()
        .eq('id', currentGroup.ride_request.id);

      if (requestError) {
        console.error('Request delete error:', requestError);
        throw requestError;
      }

      toast.success('Ride group deleted successfully');
      fetchGroups();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete ride group: ' + (error.message || 'Unknown error'));
    }
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      // First get the current group data with ride request
      const { data: currentGroup, error: fetchError } = await supabase
        .from('ride_groups')
        .select(`
          *,
          ride_request:ride_requests(*)
        `)
        .eq('id', groupId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (!currentGroup) {
        toast.error('Could not fetch group data');
        return;
      }

      // Calculate the current number of members (including the one being removed)
      const currentMembers = currentGroup.members || [];
      const memberCount = currentMembers.length;
      
      // Remove member from array
      const updatedMembers = currentMembers.filter(id => id !== memberId);
      
      // Calculate new remaining capacity
      // If someone is being removed, add 1 to remaining capacity
      const newRemainingCapacity = currentGroup.total_capacity - updatedMembers.length;

      console.log('Updating group with:', {
        groupId,
        memberId,
        currentMembers,
        updatedMembers,
        total_capacity: currentGroup.total_capacity,
        new_remaining_capacity: newRemainingCapacity
      });

      // Update the group
      const { error: updateError } = await supabase
        .from('ride_groups')
        .update({
          members: updatedMembers,
          remaining_capacity: newRemainingCapacity
        })
        .eq('id', groupId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Create notification
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: memberId,
            message: `You have been removed from the ride ${currentGroup.ride_request.source} to ${currentGroup.ride_request.destination}`,
            type: 'removed_from_ride',
            created_at: new Date().toISOString()
          });
      } catch (notifError) {
        console.error('Notification error:', notifError);
        // Continue execution even if notification fails
      }

      toast.success('Member removed successfully');
      fetchGroups();
    } catch (error: any) {
      console.error('Remove member error:', error);
      toast.error('Failed to remove member: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditGroup = async (groupId: string) => {
    if (editingGroup === groupId) {
      try {
        if (!editForm.total_capacity || !editForm.remaining_capacity) {
          toast.error('Capacity values cannot be empty or zero');
          return;
        }

        if (editForm.remaining_capacity > editForm.total_capacity) {
          toast.error('Remaining capacity cannot be greater than total capacity');
          return;
        }

        const { error } = await supabase
          .from('ride_groups')
          .update({
            total_capacity: editForm.total_capacity,
            remaining_capacity: editForm.remaining_capacity
          })
          .eq('id', groupId);

        if (error) throw error;
        toast.success('Group updated successfully');
        setEditingGroup(null);
        fetchGroups();
      } catch (error: any) {
        toast.error('Failed to update group: ' + error.message);
      }
    } else {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setEditForm({
          total_capacity: group.total_capacity || 4, // Default to 4 if null
          remaining_capacity: group.remaining_capacity || 0 // Default to 0 if null
        });
        setEditingGroup(groupId);
      }
    }
  };

  const handleCancelRide = async (groupId: string) => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;

    try {
      // First get the current group data
      const { data: currentGroup, error: fetchError } = await supabase
        .from('ride_groups')
        .select(`
          *,
          ride_request:ride_requests(*)
        `)
        .eq('id', groupId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (!currentGroup || !currentGroup.ride_request) {
        toast.error('Could not fetch ride data');
        return;
      }

      // Update ride request status
      const { error: rideError } = await supabase
        .from('ride_requests')
        .update({ status: 'cancelled' })
        .eq('id', currentGroup.ride_request.id);

      if (rideError) {
        console.error('Ride update error:', rideError);
        throw rideError;
      }

      // Notify all members
      const allMembers = [...(currentGroup.members || []), currentGroup.ride_request.user_id]
        .filter(Boolean); // Remove any null/undefined values
      
      if (allMembers.length > 0) {
        try {
          await supabase
            .from('notifications')
            .insert(allMembers.map(memberId => ({
              user_id: memberId,
              message: `The ride from ${currentGroup.ride_request.source} to ${currentGroup.ride_request.destination} has been cancelled by admin`,
              type: 'ride_cancelled',
              created_at: new Date().toISOString()
            })));
        } catch (notifError) {
          console.error('Notification error:', notifError);
          // Continue execution even if notifications fail
        }
      }

      toast.success('Ride cancelled successfully');
      fetchGroups();
    } catch (error: any) {
      console.error('Cancel ride error:', error);
      toast.error('Failed to cancel ride: ' + (error.message || 'Unknown error'));
    }
  };

  const handleStatusChange = async (groupId: string, field: string, value: boolean) => {
    try {
      const existingStatus = rideStatuses[groupId];
      
      if (existingStatus) {
        // Update existing status
        const { error } = await supabase
          .from('ride_status')
          .update({
            [field]: value,
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          })
          .eq('ride_group_id', groupId);

        if (error) throw error;
      } else {
        // Create new status
        const { error } = await supabase
          .from('ride_status')
          .insert([{
            ride_group_id: groupId,
            [field]: value,
            updated_by: user?.id
          }]);

        if (error) throw error;
      }

      // Update local state
      setRideStatuses(prev => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [field]: value,
          ride_group_id: groupId
        }
      }));

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (!isAdmin(user)) {
    return <div className="text-center p-8 text-red-600">Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('rides')}
              className={`${
                activeTab === 'rides'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium`}
            >
              Manage Rides
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`${
                activeTab === 'pricing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium`}
            >
              Manage Pricing
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'rides' ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route & Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {group.ride_request.source} → {group.ride_request.destination}
                      </div>
                      <div className="text-xs text-gray-500">
                        Gender: {group.ride_request.gender_preference || 'Any'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {group.ride_request.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {new Date(group.ride_request.time_slot).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {group.ride_request.car_details?.car || 'Not selected'}
                      </div>
                      {group.ride_request.car_details && (
                        <div className="text-xs text-gray-500">
                          Price: ₹{group.ride_request.car_details.final_price}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {group.creator_details.full_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {group.creator_details.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {group.member_details.map((member) => (
                          <div key={member.id} className="flex items-center justify-between text-sm">
                            <span>{member.full_name}</span>
                            {member.id !== group.ride_request.user_id && (
                              <button
                                onClick={() => handleRemoveMember(group.id, member.id)}
                                className="text-red-600 hover:text-red-800 ml-2"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingGroup === group.id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={editForm.total_capacity}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              total_capacity: parseInt(e.target.value)
                            })}
                            className="w-20 px-2 py-1 border rounded"
                          />
                          <input
                            type="number"
                            value={editForm.remaining_capacity}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              remaining_capacity: parseInt(e.target.value)
                            })}
                            className="w-20 px-2 py-1 border rounded"
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {group.remaining_capacity}/{group.total_capacity} available
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rideStatuses[group.id]?.first_call || false}
                            onChange={(e) => handleStatusChange(group.id, 'first_call', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">First Call</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rideStatuses[group.id]?.follow_up || false}
                            onChange={(e) => handleStatusChange(group.id, 'follow_up', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Follow Up</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rideStatuses[group.id]?.payment || false}
                            onChange={(e) => handleStatusChange(group.id, 'payment', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Payment</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rideStatuses[group.id]?.advance_payment || false}
                            onChange={(e) => handleStatusChange(group.id, 'advance_payment', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Advance Payment</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditGroup(group.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingGroup === group.id ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Edit2 className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleCancelRide(group.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <PricingManager />
      )}
    </div>
  );
}
