import React from 'react';

interface PQSWordmarkProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function PQSWordmark({ className = "", style }: PQSWordmarkProps) {
  return (
    <img 
      src="/pqs-wordmark.png" 
      alt="PQS Wordmark" 
      className={`object-contain max-w-none shrink-0 ${className}`} 
      style={{ ...style, height: '28px', width: '271px', objectFit: 'contain' }} 
    />
  );
}
