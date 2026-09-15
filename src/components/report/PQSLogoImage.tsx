import React from "react";

interface PQSLogoImageProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function PQSLogoImage({ className, style }: PQSLogoImageProps) {
  return (
    <img 
      src="/pqs-logo.png" 
      alt="PQS Logo" 
      className={className} 
      style={style} 
    />
  );
}
