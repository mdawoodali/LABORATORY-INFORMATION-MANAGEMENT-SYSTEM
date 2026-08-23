const fs = require('fs');

const sig = fs.readFileSync('public/docx_images/image2.png', 'base64');
fs.writeFileSync('src/components/report/SignatureImage.tsx', 'export const DefaultSignatureBase64 = `data:image/png;base64,' + sig + '`;\n');

const pqs = fs.readFileSync('public/pqs-logo.svg', 'base64');
fs.writeFileSync('src/components/report/PQSLogoImage.tsx', 'import React from "react";\nexport const PQSLogoBase64 = `data:image/svg+xml;base64,' + pqs + '`;\nexport default function PQSLogoImage({className}: {className?: string}) { return <img src={PQSLogoBase64} alt="PQS Logo" className={className} />; }\n');

const wm = fs.readFileSync('public/pqs-wordmark.png', 'base64');
fs.writeFileSync('src/components/report/PQSWordmark.tsx', 'import React from "react";\nexport const PQSWordmarkBase64 = `data:image/png;base64,' + wm + '`;\ninterface PQSWordmarkProps { className?: string; style?: React.CSSProperties; }\nexport default function PQSWordmark({ className = "", style }: PQSWordmarkProps) { return <img src={PQSWordmarkBase64} alt="PQS Wordmark" className={`object-contain max-w-none shrink-0 ${className}`} style={{ height: "28px", width: "271px", objectFit: "contain", ...style }} />; }\n');
