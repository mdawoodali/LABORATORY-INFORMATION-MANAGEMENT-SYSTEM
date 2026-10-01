const fs = require('fs');

const run = () => {
  let data = fs.readFileSync('src/components/ribbon/HomeTab.tsx', 'utf8');

  // We need to add useState, useEffect, useRef to the imports
  if (!data.includes('useState')) {
    data = data.replace("import React from 'react';", "import React, { useState, useEffect, useRef } from 'react';");
  }

  // We need to add the ChevronDown icon
  if (!data.includes('ChevronDown')) {
    data = data.replace("RemoveFormatting, Palette, Highlighter, Type, Scissors, Copy, ClipboardPaste", "RemoveFormatting, Palette, Highlighter, Type, Scissors, Copy, ClipboardPaste, ChevronDown");
  }

  // Define CustomFontDropdown before HomeTab
  const customFontDropdownCode = `
const FontDropdown = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="border border-slate-300 rounded px-2 py-1 text-xs w-32 bg-white flex justify-between items-center h-[26px]"
      >
        <span className="truncate" style={{ fontFamily: value }}>{value}</span>
        <ChevronDown size={12} className="text-slate-500 flex-shrink-0 ml-1" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-lg z-50 flex flex-col max-h-64 overflow-y-auto">
          {FONTS.map(f => (
            <button
              key={f}
              onClick={() => { onChange(f); setIsOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 truncate"
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
`;

  if (!data.includes('FontDropdown')) {
    data = data.replace("export default function HomeTab() {", customFontDropdownCode + "\nexport default function HomeTab() {");
  }

  // We need to add font tracking state to HomeTab
  if (!data.includes('const [currentFont, setCurrentFont] = useState("Arial");')) {
    data = data.replace("export default function HomeTab() {", `export default function HomeTab() {
  const [currentFont, setCurrentFont] = useState("Arial");
`);
  }

  // Replace native <select> with CustomFontDropdown
  const oldSelectTarget = `<select \n            onChange={(e) => exec('fontName', e.target.value)}\n            className="border border-slate-300 rounded px-2 py-1 text-xs w-28 bg-white"\n            defaultValue="Arial"\n          >\n            {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}\n          </select>`;
  const oldSelectTargetWindows = oldSelectTarget.replace(/\n/g, '\r\n');
  const oldSelectTargetGeneric = /<select[\s\S]*?onChange=\{\(e\) => exec\('fontName', e\.target\.value\)\}[\s\S]*?<\/select>/;

  const replSelect = `<FontDropdown 
            value={currentFont} 
            onChange={(val) => { setCurrentFont(val); exec('fontName', val); }} 
          />`;

  if (data.includes(oldSelectTarget)) {
    data = data.replace(oldSelectTarget, replSelect);
  } else if (data.includes(oldSelectTargetWindows)) {
    data = data.replace(oldSelectTargetWindows, replSelect);
  } else {
    data = data.replace(oldSelectTargetGeneric, replSelect);
  }

  fs.writeFileSync('src/components/ribbon/HomeTab.tsx', data, 'utf8');
  console.log("patched HomeTab.tsx");
}

run();
