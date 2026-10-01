const fs = require('fs');

let data = fs.readFileSync('src/app/pqs-letterhead/page.tsx', 'utf8');

const targetCustomFonts = `                                {customFonts.map(f => (
                                  <button 
                                    key={f.name}
                                    onClick={() => { setFontDropdownOpen(false); handleFontChange(f.class); }}
                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 truncate"
                                    style={{ fontFamily: f.class }}
                                  >
                                    {f.name}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            <div className="py-1">
                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">System Fonts</div>
                              {FONTS.map(f => (
                                <button 
                                  key={f.name}
                                  onClick={() => { setFontDropdownOpen(false); handleFontChange(f.class); }}
                                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 truncate"
                                  style={{ fontFamily: f.class }}
                                >
                                  {f.name}
                                </button>
                              ))}`;

const replCustomFonts = `                                {customFonts.map(f => (
                                  <button 
                                    key={f.name}
                                    onClick={() => { setFontDropdownOpen(false); handleFontChange(f.class); }}
                                    className={\`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 truncate \${f.class}\`}
                                  >
                                    {f.name}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            <div className="py-1">
                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">System Fonts</div>
                              {FONTS.map(f => (
                                <button 
                                  key={f.name}
                                  onClick={() => { setFontDropdownOpen(false); handleFontChange(f.class); }}
                                  className={\`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 truncate \${f.class}\`}
                                >
                                  {f.name}
                                </button>
                              ))}`;

// Also handle the case of CRLF
const targetCRLF = targetCustomFonts.replace(/\n/g, '\r\n');

if (data.includes(targetCustomFonts)) {
    data = data.replace(targetCustomFonts, replCustomFonts);
} else if (data.includes(targetCRLF)) {
    data = data.replace(targetCRLF, replCustomFonts);
} else {
    // If exact block fails, just use generic replace
    data = data.replace(/className="w-full text-left px-3 py-1\.5 text-sm hover:bg-slate-100 truncate"\s*style=\{\{ fontFamily: f\.class \}\}/g, 
      "className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 truncate ${f.class}`}");
}

fs.writeFileSync('src/app/pqs-letterhead/page.tsx', data, 'utf8');
console.log("patched pqs-letterhead");
