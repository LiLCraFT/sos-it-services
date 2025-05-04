import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Github, Linkedin, Twitter } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const TeamCard: React.FC<TeamMember> = ({ name, role, image, bio, social }) => {
  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="relative overflow-hidden aspect-square bg-gray-800">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#36393F] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              <div className="flex justify-center space-x-3">
                {social.twitter && (
                  <a href={social.twitter} className="text-white hover:text-[#5865F2] transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
                {social.linkedin && (
                  <a href={social.linkedin} className="text-white hover:text-[#5865F2] transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {social.github && (
                  <a href={social.github} className="text-white hover:text-[#5865F2] transition-colors">
                    <Github size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-[#5865F2] mb-2">{role}</p>
          <p className="text-gray-300 text-sm">{bio}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const Team: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'Alex Mitchell',
      role: 'Lead Technician',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bio: 'Over 10 years of experience in hardware diagnostics and repair. CompTIA A+ and Microsoft certified.',
      social: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com'
      }
    },
    {
      name: 'Sarah Johnson',
      role: 'Network Specialist',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bio: 'Cisco certified network professional with expertise in setting up secure networks for businesses.',
      social: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      name: 'Michael Torres',
      role: 'Software Engineer',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bio: 'Specialized in data recovery and software troubleshooting. Expert in Windows, macOS, and Linux environments.',
      social: {
        linkedin: 'https://linkedin.com',
        github: 'https://github.com'
      }
    },
    {
      name: 'Emily Chen',
      role: 'Mobile Device Expert',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bio: 'Apple and Samsung certified repair technician with 5+ years of experience in smartphone and tablet repairs.',
      social: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    }
  ];

  return (
    <section id="team" className="py-20 bg-[#2F3136]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet Our Expert Team</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Our certified technicians have years of experience solving the most complex technical issues.
            Trust your devices with the best in the business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <TeamCard key={index} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;