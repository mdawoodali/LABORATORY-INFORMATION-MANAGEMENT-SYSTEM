import React from "react";
import { PQSWordmarkBase64 } from "./PQSWordmarkBase64";

interface PQSWordmarkProps { 
  className?: string; 
  style?: React.CSSProperties; 
}

export default function PQSWordmark({ className = "", style }: PQSWordmarkProps) { 
  return (
    <img 
      src={PQSWordmarkBase64} 
      alt="PQS Wordmark" 
      className={`object-contain max-w-none shrink-0 ${className}`} 
      style={{ height: "28px", width: "271px", objectFit: "contain", ...style }} 
    />
  ); 
}
