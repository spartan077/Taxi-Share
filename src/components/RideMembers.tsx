import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Member {
  id: string;
  full_name: string;
  phone_number: string;
}

export function RideMembers({ groupId, isCreator }: { groupId: string; isCreator: boolean }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      if (!isCreator) {
        setLoading(false);
        return;
      }

      const { data: group } = await supabase
        .from('ride_groups')
        .select('members')
        .eq('id', groupId)
        .single();

      if (group?.members) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number')
          .in('id', group.members);

        if (profiles) {
          setMembers(profiles);
        }
      }
      setLoading(false);
    }

    fetchMembers();
  }, [groupId, isCreator]);

  if (!isCreator) return null;
  if (loading) return <div>Loading members...</div>;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Ride Members</h3>
      <div className="space-y-2">
        {members.map(member => (
          <div key={member.id} className="p-3 bg-gray-50 rounded border border-gray-200">
            <p className="font-medium">{member.full_name}</p>
            <p className="text-sm text-gray-600">📱 {member.phone_number}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 