import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import HomeTab from './HomeTab';
import InsertTab from './InsertTab';
import LayoutTab from './LayoutTab';

interface RibbonSidebarProps {
  handlePrint: () => void;
  // Stamp props
  showStamp: boolean;
  setShowStamp: (val: boolean) => void;
  blendMode: string;
  setBlendMode: (val: string) => void;
  // Margin props
  margins: { top: number, right: number, bottom: number, left: number };
  setMargins: React.Dispatch<React.SetStateAction<{ top: number, right: number, bottom: number, left: number }>>;
}

export default function RibbonSidebar({ 
  handlePrint, 
  showStamp, setShowStamp, blendMode, setBlendMode,
  margins, setMargins
}: RibbonSidebarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Layout'>('Home');

  const TabButton = ({ name }: { name: 'Home' | 'Insert' | 'Layout' }) => (
    <button 
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
        activeTab === name 
          ? 'bg-white text-[#002f6c] border-[#002f6c]' 
          : 'text-slate-600 hover:bg-slate-200 border-transparent'
      }`}
    >
      {name}
    </button>
  );

  return (
    <div className="w-full md:w-[450px] h-auto md:h-full bg-slate-100 border-r border-slate-300 flex flex-col z-20 shadow-xl md:shadow-none no-print overflow-hidden shrink-0">
      
      {/* Top Bar with Actions */}
      <div className="flex-none p-3 border-b border-slate-300 bg-[#002f6c] flex justify-between items-center text-white">
        <button 
          onClick={() => router.push('/')} 
          className="p-1.5 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Back to Home"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-sm font-semibold tracking-wide">PQS Letterhead</div>
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 bg-white text-[#002f6c] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all shadow-md active:scale-95"
        >
          <Printer size={16} />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-2 pt-2 gap-1 bg-slate-200 border-b border-slate-300">
        <TabButton name="Home" />
        <TabButton name="Insert" />
        <TabButton name="Layout" />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {activeTab === 'Home' && <HomeTab />}
        {activeTab === 'Insert' && (
          <InsertTab 
            showStamp={showStamp} setShowStamp={setShowStamp} 
            blendMode={blendMode} setBlendMode={setBlendMode} 
          />
        )}
        {activeTab === 'Layout' && (
          <LayoutTab margins={margins} setMargins={setMargins} />
        )}
      </div>

    </div>
  );
}
