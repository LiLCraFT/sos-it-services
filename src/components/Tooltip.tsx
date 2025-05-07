import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number; placement: 'top' | 'bottom' }>({ x: 0, y: 0, placement: 'top' });
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handleScroll = () => setVisible(false);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll, true);
    };
  }, [visible]);

  useEffect(() => {
    if (visible && tooltipRef.current) {
      setTooltipWidth(tooltipRef.current.offsetWidth);
      setTooltipHeight(tooltipRef.current.offsetHeight);
    }
  }, [visible, text]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let placement: 'top' | 'bottom' = 'top';
    let y = rect.top;
    // On affiche en dessous si pas assez de place au-dessus
    if (rect.top < 40) {
      placement = 'bottom';
      y = rect.bottom;
    }
    let x = rect.left + rect.width / 2;
    setCoords({ x, y, placement });
    setVisible(true);
  };

  const handleMouseLeave = () => setVisible(false);

  // Calcul de la position pour ne jamais sortir de l'écran
  let left = coords.x;
  let top = coords.y - 8;
  const margin = 8;
  if (tooltipWidth > 0) {
    const rightEdge = left + tooltipWidth / 2;
    const leftEdge = left - tooltipWidth / 2;
    const windowWidth = window.innerWidth;
    if (rightEdge + margin > windowWidth) {
      left = windowWidth - tooltipWidth / 2 - margin;
    } else if (leftEdge - margin < 0) {
      left = tooltipWidth / 2 + margin;
    }
  }
  if (coords.placement === 'bottom') {
    top = coords.y + 8;
  }
  // Si le tooltip dépasse en bas de l'écran, on le remonte
  if (coords.placement === 'bottom' && tooltipHeight > 0 && (top + tooltipHeight + margin > window.innerHeight)) {
    top = window.innerHeight - tooltipHeight - margin;
  }
  // Si le tooltip dépasse en haut de l'écran, on le descend
  if (coords.placement === 'top' && tooltipHeight > 0 && (top - tooltipHeight - margin < 0)) {
    top = tooltipHeight + margin;
  }

  return (
    <span
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative cursor-pointer"
      tabIndex={0}
    >
      {children}
      {visible && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: left,
            top: top,
            transform: 'translate(-50%, -100%)',
            zIndex: 99999,
            pointerEvents: 'none',
            maxWidth: '250px',
            whiteSpace: 'pre-line',
          }}
          className="px-2 py-1 rounded bg-black text-xs text-white shadow-lg"
        >
          {text}
        </div>,
        document.body
      )}
    </span>
  );
};

export default Tooltip; 