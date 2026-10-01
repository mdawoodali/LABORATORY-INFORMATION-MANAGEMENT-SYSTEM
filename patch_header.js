const fs = require('fs');
let data = fs.readFileSync('src/app/pqs-letterhead/page.tsx', 'utf8');

const regex = /<div className="relative flex justify-center items-end mb-6 border-b-2 border-gray-800 pb-2 px-10 pt-4 z-10">[\s\S]*?Date:<\/span>\s*<span\s*className="w-28 text-left border-b border-gray-400"\s*contentEditable\s*suppressContentEditableWarning\s*>\s*&nbsp;\s*<\/span>\s*<\/div>\s*<\/div>/;

const replacement = `<div className="relative w-full grid grid-cols-[1fr_auto_1fr] items-end mb-6 border-b-2 border-gray-800 pb-2 px-10 pt-4 z-10">
            {/* Empty left column */}
            <div></div>

            {/* Centered logo stack */}
            <div className="flex flex-col items-center gap-1">
              <img src={LOGO_SRC} alt="PQS Logo" style={logoStyle} />
              <img src={BANNER_SRC} alt="Precision Quality Services" style={bannerStyle} />
              <div className="text-xs text-gray-500 whitespace-nowrap" contentEditable suppressContentEditableWarning>
                Providing Consultancy Services to Textile Industries
              </div>
            </div>
  
            {/* Date field, right column */}
            <div className="flex justify-end items-center gap-1.5 text-xs pb-1 pr-6">
              <span className="font-bold whitespace-nowrap">Date:</span>
              <span
                className="w-28 text-left border-b border-gray-400 outline-none block"
                contentEditable
                suppressContentEditableWarning
              >
                &nbsp;
              </span>
            </div>
          </div>`;

if (regex.test(data)) {
    data = data.replace(regex, replacement);
    fs.writeFileSync('src/app/pqs-letterhead/page.tsx', data, 'utf8');
    console.log("Success");
} else {
    console.log("Target not found!");
}
