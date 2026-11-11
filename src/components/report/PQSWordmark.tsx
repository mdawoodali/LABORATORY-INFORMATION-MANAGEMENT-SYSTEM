import React from "react";

interface PQSWordmarkProps { 
  className?: string; 
  style?: React.CSSProperties; 
  width?: number;
  height?: number;
}

export default function PQSWordmark({ className = "", style, width = 240, height = 28 }: PQSWordmarkProps) { 
  return (
    <img 
      src="/pqs-wordmark.png" 
      alt="PQS Wordmark" 
      width={width}
      height={height}
      className={`object-contain max-w-none shrink-0 ${className}`} 
      style={{ height: `${height}px`, objectFit: "contain", ...style }} 
    />
  ); 
}
