import React from "react";

interface PQSLogoImageProps {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

export default function PQSLogoImage({ className, style, width = 64, height = 64 }: PQSLogoImageProps) {
  return (
    <img 
      src="/pqs-logo.png" 
      alt="PQS Logo" 
      width={width}
      height={height}
      className={className} 
      style={style} 
    />
  );
}
