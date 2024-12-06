import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Search, Home } from 'lucide-react';

export default function Confirmation() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-green-50 rounded-full"></div>
          </div>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto relative z-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Ride Request Confirmed!
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You'll receive a notification when the group is complete and the cab is ready to be booked.
        </p>

        <div className="grid gap-4 max-w-sm mx-auto">
          <Link
            to="/matches"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm hover:shadow-md group"
          >
            <Search className="h-5 w-5" />
            <span>View Other Rides</span>
            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Need help? Contact support at saatvikdev001@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}