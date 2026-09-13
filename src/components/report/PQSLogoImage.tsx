import React from "react";
import { PQSLogoBase64 } from "./PQSLogoBase64";

interface PQSLogoImageProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function PQSLogoImage({ className, style }: PQSLogoImageProps) {
  return (
    <img 
      src={PQSLogoBase64} 
      alt="PQS Logo" 
      className={className} 
      style={style} 
    />
  );
}
