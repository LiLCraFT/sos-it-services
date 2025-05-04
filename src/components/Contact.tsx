import React, { useState } from 'react';
import { Button } from './ui/Button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string | React.ReactNode;
}

const ContactInfoItem: React.FC<ContactInfo> = ({ icon, title, details }) => {
  return (
    <div className="flex items-start mb-6">
      <div className="w-10 h-10 bg-[#5865F2] bg-opacity-20 rounded-lg flex items-center justify-center text-[#5865F2] mr-4 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium mb-1">{title}</h3>
        <div className="text-gray-300">{details}</div>
      </div>
    </div>
  );
};

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form logic would go here
    console.log('Form submitted:', formData);
    alert('Thanks for contacting us! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    });
  };

  const contactInfo: ContactInfo[] = [
    {
      icon: <MapPin size={20} />,
      title: 'Our Location',
      details: '123 Tech Street, Silicon Valley, CA 94025'
    },
    {
      icon: <Phone size={20} />,
      title: 'Phone Number',
      details: '(555) 123-4567'
    },
    {
      icon: <Mail size={20} />,
      title: 'Email Address',
      details: 'support@techfix.com'
    },
    {
      icon: <Clock size={20} />,
      title: 'Working Hours',
      details: (
        <>
          Monday - Friday: 9am - 7pm<br />
          Saturday: 10am - 5pm<br />
          Sunday: Closed
        </>
      )
    }
  ];

  return (
    <section id="contact" className="py-20 bg-[#36393F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get In Touch</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Have a question or need technical support? Fill out the form below and our team will be in touch shortly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-[#2F3136] rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-md bg-[#36393F] border border-gray-700 text-white focus:outline-none focus:border-[#5865F2]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-md bg-[#36393F] border border-gray-700 text-white focus:outline-none focus:border-[#5865F2]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="phone" className="block text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-[#36393F] border border-gray-700 text-white focus:outline-none focus:border-[#5865F2]"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block text-gray-300 mb-2">
                    Service Needed *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-md bg-[#36393F] border border-gray-700 text-white focus:outline-none focus:border-[#5865F2]"
                  >
                    <option value="">Select a service</option>
                    <option value="computer-repair">Computer Repair</option>
                    <option value="virus-removal">Virus Removal</option>
                    <option value="data-recovery">Data Recovery</option>
                    <option value="hardware-upgrade">Hardware Upgrade</option>
                    <option value="network-setup">Network Setup</option>
                    <option value="mobile-repair">Mobile Repair</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-300 mb-2">
                  Describe Your Issue *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md bg-[#36393F] border border-gray-700 text-white focus:outline-none focus:border-[#5865F2]"
                ></textarea>
              </div>
              
              <Button size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div>
            <div className="bg-[#2F3136] rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
              {contactInfo.map((info, index) => (
                <ContactInfoItem
                  key={index}
                  icon={info.icon}
                  title={info.title}
                  details={info.details}
                />
              ))}
            </div>
            
            <div className="bg-[#2F3136] rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.639290621064!2d-122.08296158468864!3d37.42199997982367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba02425dad8f%3A0x29cdf01a44fc687f!2sGoogle%20Building%2040!5e0!3m2!1sen!2sus!4v1632512407925!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;