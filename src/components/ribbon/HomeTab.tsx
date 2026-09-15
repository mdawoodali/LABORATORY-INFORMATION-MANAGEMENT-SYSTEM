import React from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, IndentDecrease, IndentIncrease,
  RemoveFormatting, Palette, Highlighter, Type, Scissors, Copy, ClipboardPaste
} from 'lucide-react';

const FONTS = [
  "Arial", "Calibri", "Cambria", "Courier New", 
  "Georgia", "Helvetica", "Impact", "Times New Roman", "Trebuchet MS", "Verdana",
  "Inter", "Lora", "Merriweather", "Montserrat", "Open Sans", "Playfair Display", "Roboto"
];

const GroupBorder = () => <div className="w-px h-10 bg-slate-300 mx-2"></div>;

const Button = ({ icon: Icon, onClick, title, active = false }: { icon: any, onClick: any, title?: string, active?: boolean }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors ${active ? 'bg-slate-300 text-black' : 'text-slate-700 hover:bg-slate-200'} flex items-center justify-center`}
  >
    <Icon size={16} />
  </button>
);

export default function HomeTab() {
  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    // Keep focus on the editor if it was focused
    const editor = document.querySelector('[contentEditable="true"]:focus') as HTMLElement;
    if (editor) editor.focus();
  };

  return (
    <div className="flex flex-col gap-4 w-full text-sm">
      
      {/* Styles Group */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Styles (Headings)</div>
        <select 
          onChange={(e) => exec('formatBlock', e.target.value)}
          className="border border-slate-300 rounded px-2 py-1 text-xs w-full bg-white"
          defaultValue="P"
        >
          <option value="P">Normal Text</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="H4">Heading 4</option>
          <option value="H5">Heading 5</option>
          <option value="H6">Heading 6</option>
        </select>
      </div>

      {/* Font Group */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Font</div>
        
        <div className="flex gap-2 items-center">
          <select 
            onChange={(e) => exec('fontName', e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-xs w-28 bg-white"
            defaultValue="Arial"
          >
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          
          <select 
            onChange={(e) => exec('fontSize', e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-xs w-16 bg-white"
            defaultValue="3"
          >
            <option value="1">10</option>
            <option value="2">13</option>
            <option value="3">16</option>
            <option value="4">18</option>
            <option value="5">24</option>
            <option value="6">32</option>
            <option value="7">48</option>
          </select>
          <Button icon={RemoveFormatting} title="Clear Formatting" onClick={() => exec('removeFormat')} />
        </div>

        <div className="flex gap-1 items-center flex-wrap">
          <Button icon={Bold} title="Bold" onClick={() => exec('bold')} />
          <Button icon={Italic} title="Italic" onClick={() => exec('italic')} />
          <Button icon={Underline} title="Underline" onClick={() => exec('underline')} />
          <Button icon={Strikethrough} title="Strikethrough" onClick={() => exec('strikeThrough')} />
          <GroupBorder />
          <Button icon={Subscript} title="Subscript" onClick={() => exec('subscript')} />
          <Button icon={Superscript} title="Superscript" onClick={() => exec('superscript')} />
          <GroupBorder />
          <div className="flex items-center gap-1">
            <Highlighter size={14} className="text-slate-500"/>
            <input type="color" onChange={(e) => exec('hiliteColor', e.target.value)} className="w-5 h-5 p-0 border-0 cursor-pointer" title="Highlight Color" />
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Type size={14} className="text-slate-500"/>
            <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="w-5 h-5 p-0 border-0 cursor-pointer" title="Text Color" />
          </div>
        </div>
      </div>

      {/* Paragraph Group */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Paragraph</div>
        
        <div className="flex gap-1 items-center flex-wrap">
          <Button icon={List} title="Bullet List" onClick={() => exec('insertUnorderedList')} />
          <Button icon={ListOrdered} title="Numbered List" onClick={() => exec('insertOrderedList')} />
          <GroupBorder />
          <Button icon={IndentDecrease} title="Decrease Indent" onClick={() => exec('outdent')} />
          <Button icon={IndentIncrease} title="Increase Indent" onClick={() => exec('indent')} />
        </div>
        
        <div className="flex gap-1 items-center mt-1">
          <Button icon={AlignLeft} title="Align Left" onClick={() => exec('justifyLeft')} />
          <Button icon={AlignCenter} title="Align Center" onClick={() => exec('justifyCenter')} />
          <Button icon={AlignRight} title="Align Right" onClick={() => exec('justifyRight')} />
          <Button icon={AlignJustify} title="Justify" onClick={() => exec('justifyFull')} />
        </div>
      </div>

      {/* Clipboard Group */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clipboard</div>
        <div className="flex gap-1 items-center">
          <Button icon={Scissors} title="Cut" onClick={() => exec('cut')} />
          <Button icon={Copy} title="Copy" onClick={() => exec('copy')} />
          <Button icon={ClipboardPaste} title="Paste" onClick={() => {
            navigator.clipboard.readText().then(text => {
              exec('insertText', text);
            }).catch(() => {
              alert("Please use Ctrl+V to paste.");
            });
          }} />
        </div>
      </div>

    </div>
  );
}
