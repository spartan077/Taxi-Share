import React from 'react';
import { Mail, Phone, HelpCircle } from 'lucide-react';

export default function HelpCenter() {
  const faqs = [
    {
      question: "How do I book a ride?",
      answer: `Booking a ride on VIT Taxi Share is simple! Log in to the app and follow these steps:
        • Enter your pickup and destination points
        • Select your date and time slot
        • Choose your preferred ride from the available options
        • Confirm your booking and check for ride details
        Some rides may require admin confirmation, while others are auto-approved.`
    },
    {
      question: "How do I create a ride request?",
      answer: `To create a ride request:
        • Open the app and tap on the "Create Ride" button
        • Enter details like:
          - Pickup and destination points
          - Date and time of departure
          - Number of seats needed
          - Gender preference (if applicable)
        • Confirm your request to publish it
        Once published, your ride will be visible to others for joining.`
    },
    {
      question: "How do I cancel a ride request?",
      answer: `If your plans change, you can cancel your ride request:
        • Contact us @ saatvikdev001@gmail.com
        
        Note: Cancelling early ensures a better experience for all. Refund policies may apply based on the cancellation time.`
    },
    {
      question: "What are the benefits of using VIT Taxi Share?",
      answer: `• Affordable: Share costs with others, making travel budget-friendly
        • Convenient: Easily find rides for your route
        • Eco-Friendly: Reduce traffic and carbon footprint by carpooling
        • Safe: Gender preferences and verified users ensure a secure experience`
    },
    {
      question: "How much does a ride cost?",
      answer: `Ride costs vary based on:
        • Distance between pickup and destination points
        • Selected car type (e.g., hatchback, sedan, SUV)
        • Available discounts
        
        You can view estimated pricing while booking your ride.`
    },
    {
      question: "How does the matching system work?",
      answer: `Our platform connects users traveling on similar routes and time slots. The system prioritizes:
        • Exact matches for pickup and destination
        • Gender preferences, if specified
        • Available seats in a ride group
        
        You can join an existing ride or create a new one if no matches are available.`
    },
    {
      question: "Can I select a specific car type?",
      answer: `Yes! While booking a ride, you can choose from different car types based on your budget and group size:
        • Hatchbacks for small groups
        • Sedans for medium comfort
        • SUVs for larger groups or extra luggage
        
        Prices vary by car type, and availability is displayed during selection.`
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">VIT Taxi Share Help Centre</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-yellow-500" />
              {faq.question}
            </h2>
            <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-yellow-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
        <div className="space-y-3">
          <p className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-yellow-500" />
            <span>Email us at: </span>
            <a href="mailto:saatvikdev001@gmail.com" className="text-yellow-600 hover:text-yellow-700">
              saatvikdev001@gmail.com
            </a>
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-5 w-5 text-yellow-500" />
            <span>For urgent queries (WhatsApp only): </span>
            <a href="https://wa.me/918189864117" className="text-yellow-600 hover:text-yellow-700">
              +91 8189864117
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 