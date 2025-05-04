import React from 'react';
import { Monitor } from 'lucide-react';
import { Link } from './ui/Link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#202225] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Monitor className="h-8 w-8 text-[#5865F2]" />
              <span className="ml-2 text-white font-bold text-xl">TechFix</span>
            </div>
            <p className="mb-4 text-gray-400">
              Expert computer repair and IT support services for individuals and businesses. 
              Fast, reliable solutions for all your technology needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#services" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#team" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Computer Repair
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Virus Removal
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Data Recovery
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  Network Setup
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  IT Consulting
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail size={18} className="mr-2 mt-1 text-[#5865F2] flex-shrink-0" />
                <span>support@techfix.com</span>
              </li>
              <li>
                <p>(555) 123-4567</p>
              </li>
              <li>
                <p>123 Tech Street, Silicon Valley, CA 94025</p>
              </li>
              <li>
                <p>
                  <span className="block font-medium text-white">Hours:</span>
                  Mon-Fri: 9am - 7pm<br />
                  Sat: 10am - 5pm
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} TechFix. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-[#5865F2]">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#5865F2]">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#5865F2]">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;