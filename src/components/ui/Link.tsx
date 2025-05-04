import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, className, children }) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (href.startsWith('#')) {
      const targetId = href.replace(/.*\#/, '');
      const element = document.getElementById(targetId);
      
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 80,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    } else if (href.startsWith('/')) {
      // Pour les liens internes, utiliser React Router
      navigate(href);
    } else {
      // Pour les liens externes
      window.location.href = href;
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};