import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isAdmin } from '../lib/utils';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">VIT Taxi Share</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              New Request
            </Link>
            <Link to="/matches" className="text-gray-700 hover:text-blue-600">
              Find Matches
            </Link>
            {isAdmin(user) && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                Admin Dashboard
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}