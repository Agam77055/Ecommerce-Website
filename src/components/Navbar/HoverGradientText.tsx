'use client'

import React, { useState } from 'react';

interface HoverGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

const HoverGradientText: React.FC<HoverGradientTextProps> = ({
  children,
  className = '',
}) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPos({ x, y });
  };

  const onMouseLeave = () => {
    setPos(null);
  };

  // Use gradient when hovering, solid black when not
  const gradient = pos
    ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(220,38,38,0.8), black 60%)`
    : `linear-gradient(to right, black, black)`;

  const style: React.CSSProperties = {
    backgroundImage: gradient,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    transition: 'all 0.3s ease-out',
  };

  return (
    <span
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className={`${className} inline-block text-2xl font-bold`}
    >
      {children}
    </span>
  );
};

export default HoverGradientText;