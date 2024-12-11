import React from 'react';
import { Mail, MapPin, Building2, Phone, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-yellow-500" />
                Company Name
              </h3>
              <p className="text-gray-600">UrbanFleet Mobility Solutions Pvt. Ltd.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-yellow-500" />
                HQ Address
              </h3>
              <address className="text-gray-600 not-italic">
                1st Floor, GRS Memorial School,<br />
                Near Omaxe Residency, Saraswati Puram,<br />
                Sarsawan Road, Arjunganj,<br />
                Lucknow, Uttar Pradesh, 226002, India.
              </address>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Mail className="h-5 w-5 text-yellow-500" />
                Contact Us
              </h3>
              <p className="text-gray-600">
                Email: <a href="mailto:saatvikdev001@gmail.com" className="text-yellow-600 hover:text-yellow-700">
                  saatvikdev001@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Us</h3>
              <a 
                href="https://www.instagram.com/rideurbanfleet/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                @rideurbanfleet
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-gray-600 hover:text-yellow-600">Help Center</a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-gray-600 hover:text-yellow-600">Privacy Policy</a>
                </li>
                <li>
                  <a href="/cancellation-policy" className="text-gray-600 hover:text-yellow-600">Cancellation Policy</a>
                </li>
                <li>
                  <a href="/shipping-policy" className="text-gray-600 hover:text-yellow-600">Shipping Policy</a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-600 hover:text-yellow-600">Terms & Conditions</a>
                </li>
                <li>
                  <p className="text-sm text-gray-500">
                    For urgent queries (WhatsApp only):{' '}
                    <a href="https://wa.me/918189864117" className="text-yellow-600 hover:text-yellow-700">
                      +91 8189864117
                    </a>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}