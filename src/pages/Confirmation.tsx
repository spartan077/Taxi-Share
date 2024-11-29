import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Confirmation() {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-lg shadow-md p-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Ride Request Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          You'll receive a notification when the group is complete and the cab is ready to be booked.
        </p>
        <div className="space-y-4">
          <Link
            to="/matches"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Other Rides
          </Link>
          <Link
            to="/"
            className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Create New Request
          </Link>
        </div>
      </div>
    </div>
  );
}