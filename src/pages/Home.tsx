import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RideForm from '../components/RideForm';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../lib/useAuth';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to VIT Taxi Share</h1>
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Create a Ride Request</h1>
      <RideForm user={user} />
    </div>
  );
}