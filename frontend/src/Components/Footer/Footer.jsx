import React from 'react';
import {Link} from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">No Dues MS</h3>
            <p className="text-gray-300">
              Streamlining the college dues clearance process for students, faculty, and administration.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link></li>
              <li><Link href="/check-status" className="text-gray-300 hover:text-white">Check Status</Link></li>
              <li><Link href="/departments" className="text-gray-300 hover:text-white">Departments</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/faqs" className="text-gray-300 hover:text-white">FAQs</Link></li>
              <li><Link href="/help" className="text-gray-300 hover:text-white">Help Guide</Link></li>
              <li><Link href="/payment-methods" className="text-gray-300 hover:text-white">Payment Methods</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Support</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300">
              <p>Student Affairs Office</p>
              <p>Main Campus Building</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: nodues@college.edu</p>
            </address>
          </div>
        </div>
        
        <hr className="border-gray-600 my-6" />
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p>&copy; {currentYear} No Dues Management System by <b>Vipin Singh</b></p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-gray-300 hover:text-white">Terms of Service</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
