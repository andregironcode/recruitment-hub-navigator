
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-recruitment-primary">
                Harries Recruitment
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="text-recruitment-dark hover:text-recruitment-primary transition-colors px-3 py-2">
              Home
            </Link>
            <Link to="/about" className="text-recruitment-dark hover:text-recruitment-primary transition-colors px-3 py-2">
              About Us
            </Link>
            <Link to="/jobs" className="text-recruitment-dark hover:text-recruitment-primary transition-colors px-3 py-2">
              Jobs
            </Link>
            <Link to="/contact" className="text-recruitment-dark hover:text-recruitment-primary transition-colors px-3 py-2">
              Contact
            </Link>
            <Link to="/admin">
              <Button variant="outline" className="ml-4 border-recruitment-primary text-recruitment-primary hover:bg-recruitment-primary hover:text-white">
                Admin Login
              </Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-recruitment-dark hover:text-recruitment-primary focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pb-3 px-4">
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className="text-recruitment-dark hover:text-recruitment-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-recruitment-dark hover:text-recruitment-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/jobs" 
              className="text-recruitment-dark hover:text-recruitment-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            <Link 
              to="/contact" 
              className="text-recruitment-dark hover:text-recruitment-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/admin" 
              className="text-recruitment-dark hover:text-recruitment-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
