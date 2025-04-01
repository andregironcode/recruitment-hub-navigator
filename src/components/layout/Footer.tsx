
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-recruitment-primary text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">Harries Recruitment</h3>
            <p className="mb-4">Connecting talented professionals with top employers since 2005.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-recruitment-secondary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-recruitment-secondary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-recruitment-secondary transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-recruitment-secondary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-recruitment-secondary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-recruitment-secondary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-recruitment-secondary transition-colors">Browse Jobs</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-recruitment-secondary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-recruitment-secondary transition-colors">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="text-xl font-bold mb-4">Industries</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs?industry=technology" className="hover:text-recruitment-secondary transition-colors">Technology</Link>
              </li>
              <li>
                <Link to="/jobs?industry=finance" className="hover:text-recruitment-secondary transition-colors">Finance</Link>
              </li>
              <li>
                <Link to="/jobs?industry=healthcare" className="hover:text-recruitment-secondary transition-colors">Healthcare</Link>
              </li>
              <li>
                <Link to="/jobs?industry=marketing" className="hover:text-recruitment-secondary transition-colors">Marketing</Link>
              </li>
              <li>
                <Link to="/jobs?industry=engineering" className="hover:text-recruitment-secondary transition-colors">Engineering</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone size={18} className="mr-2" />
                <span>+44 (0) 1234 567890</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2" />
                <a href="mailto:info@harriesrecruitment.com" className="hover:text-recruitment-secondary transition-colors">
                  info@harriesrecruitment.com
                </a>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1" />
                <span>123 Recruitment Street<br />London, EC1A 1BB<br />United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} Harries Recruitment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
