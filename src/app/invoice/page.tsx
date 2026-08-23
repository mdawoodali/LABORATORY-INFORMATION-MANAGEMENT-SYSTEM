"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Plus, Trash2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PQSWordmark from '@/components/report/PQSWordmark';
import DropdownInput from '@/components/form/DropdownInput';

const convertDate = (d: string) => {
  if (!d) return '';
  const p = d.split('-');
  if (p.length !== 3) return d;
  return `${p[2]}-${p[1]}-${p[0]}`;
};

// Helper to convert numbers to words (International format)
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Only';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const getWords = (n: number): string => {
    if (n < 20) return a[n] || '';
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? getWords(n % 100) : '');
    if (n < 1000000) return getWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? getWords(n % 1000) : '');
    if (n < 1000000000) return getWords(Math.floor(n / 1000000)) + 'Million ' + (n % 1000000 !== 0 ? getWords(n % 1000000) : '');
    return '';
  };
  
  const words = getWords(Math.floor(absNum)).trim();
  return 'Pakistani Rupees ' + (isNegative ? 'Minus ' : '') + words + ' Only.';
}

export default function InvoicePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateInvoiceNo = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const random = Math.floor(100000 + Math.random() * 900000);
    return `pqs-${mm}${yy}-${random}`;
  };
  
  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  };

  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: '',
    customerName: '',
    companyAddress: '',
    responsiblePerson: '',
    contactDetail: '',
    email: '',
    ntn: '',
    otherInformation: '',
    discountPercent: '',
  });

  // Hydrate on mount to avoid hydration mismatch with random/date values
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      invoiceNo: generateInvoiceNo(),
      invoiceDate: getTodayDate()
    }));
  }, []);

  const [items, setItems] = useState<any[]>([
    { id: '1', test: 'Water Analysis', method: 'ISO 1234', price: '', samples: '' },
  ]);

  const lastBackedUpDataRef = React.useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !formData.invoiceNo) return;
    
    const currentData = JSON.stringify({ formData, items });
    
    // Set initial baseline
    if (lastBackedUpDataRef.current === '') {
      lastBackedUpDataRef.current = currentData;
      return;
    }

    if (currentData === lastBackedUpDataRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const password = localStorage.getItem('sr_settings') 
          ? JSON.parse(localStorage.getItem('sr_settings')!).defaultPassword 
          : '1234';
          
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('receipts')
          .upsert({
            id: formData.invoiceNo,
            password: password || '1234',
            data: { formData, items, type: 'invoice' }
          });
          
        if (!error) {
          lastBackedUpDataRef.current = currentData;
        }
      } catch (e) {}
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, items]);

  const totalAmount = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.samples === '' ? 1 : (Number(item.samples) || 0))), 0);
  const discountAmount = totalAmount * ((Number(formData.discountPercent) || 0) / 100);
  const invoiceAmount = totalAmount - discountAmount;
  const amountInWords = numberToWords(invoiceAmount);

  const getWeight = (item: any) => {
    const testLines = (item.test || '').toString().split('\n').map((line: string) => Math.max(1, Math.ceil(line.length / 45))).reduce((a: number, b: number) => a + b, 0);
    const methodLines = (item.method || '').toString().split('\n').map((line: string) => Math.max(1, Math.ceil(line.length / 22))).reduce((a: number, b: number) => a + b, 0);
    return Math.max(1, testLines, methodLines);
  };

  const chunks = [];
  let i = 0;
  while (i < items.length) {
    let remainingWeight = 0;
    for (let j = i; j < items.length; j++) {
      remainingWeight += getWeight(items[j]);
    }

    if (remainingWeight <= 12) {
      chunks.push(items.slice(i, items.length));
      break;
    } else {
      let currentWeight = 0;
      let take = 0;
      for (let j = i; j < items.length; j++) {
        const w = getWeight(items[j]);
        if (currentWeight + w > 16 && take > 0) {
          break;
        }
        currentWeight += w;
        take++;
      }
      chunks.push(items.slice(i, i + take));
      i += take;
    }
  }
  
  if (chunks.length > 0) {
    const lastChunk = chunks[chunks.length - 1];
    const lastWeight = lastChunk.reduce((sum, item) => sum + getWeight(item), 0);
    if (lastWeight > 12) {
      chunks.push([]);
    }
  }
  if (chunks.length === 0) chunks.push([]);

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      // 1. Try to save to DB (Handle RLS gracefully based on settings)
      const autoBackup = true;
      if (autoBackup) {
        // We will need to import supabase, so I'll add it to the top of the file
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('receipts')
          .upsert({
            id: formData.invoiceNo,
            password: '1234', // default password for now
            data: { formData, items, type: 'invoice' }
          });
          
        if (error) {
          console.error("Supabase Error:", error);
          if (error.message.includes('row-level security')) {
            toast.error("Cloud Backup Failed: Row Level Security is enabled.", { duration: 6000 });
          } else {
            toast.error("Database save failed: " + error.message);
          }
        } else {
          toast.success("Saved securely to cloud.");
        }
      }

      await new Promise(r => setTimeout(r, 300));
      const html2canvas = (await import('html2canvas-pro')).default;
      
      const content = [];
      for (let i = 0; i < chunks.length; i++) {
        const element = document.getElementById(`invoice-page-${i}`);
        if (element) {
          const canvas = await html2canvas(element, { scale: 3, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          content.push({ 
            image: imgData, 
            width: 595.28, 
            height: 841.89, 
            margin: [0, 0, 0, 0],
            pageBreak: i < chunks.length - 1 ? 'after' : undefined
          });
        }
      }
      
      if (content.length === 0) throw new Error("No pages generated");

      // @ts-ignore
      const pdfMakeModule = await import('pdfmake/build/pdfmake.js');
      // @ts-ignore
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts.js');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

      const docDefinition = {
        pageSize: 'A4' as const,
        pageMargins: [0, 0, 0, 0] as [number, number, number, number],
        content: content as any
      };

      const pdfGenerator = pdfMake.createPdf(docDefinition);
      
      // Save using Tauri natively, or fallback to browser download
      const { saveSilentBackup } = await import('@/utils/exportManager');
      pdfGenerator.getBlob(async (blob: Blob) => {
        await saveSilentBackup(formData.invoiceNo, blob, false);
        toast.success("Invoice PDF generated successfully!");
      });
      
    } catch (e: any) {
      console.error(e);
      toast.error(`PDF generation failed: ${e.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Form */}
      <div className="w-full md:w-[450px] bg-white border-r shadow-lg flex flex-col z-10 no-print h-full md:h-screen">
        <div className="p-4 border-b bg-slate-900 text-white flex gap-3 shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all">
              <ArrowLeft size={16} />
            </button>
            <h2 className="font-bold text-lg tracking-wider">Invoice Editor</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded shadow transition-all flex items-center gap-2 text-sm">
              <Printer size={16} /> Generate PDF
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <section>
            <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">Header Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Invoice #</label>
                <input type="text" value={formData.invoiceNo} readOnly className="w-full border rounded p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Invoice Date</label>
                <input type="date" value={convertDate(formData.invoiceDate)} onChange={(e) => updateField('invoiceDate', convertDate(e.target.value))} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">Client Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Company Name</label>
                <DropdownInput value={formData.customerName} onChange={v => updateField('customerName', v)} fieldKey="inv_customerName" className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Company Address</label>
                <DropdownInput value={formData.companyAddress} onChange={v => updateField('companyAddress', v)} fieldKey="inv_companyAddress" className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Contact Person</label>
                <DropdownInput value={formData.responsiblePerson} onChange={v => updateField('responsiblePerson', v)} fieldKey="inv_responsiblePerson" className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Contact detail</label>
                <DropdownInput value={formData.contactDetail} onChange={v => updateField('contactDetail', v)} fieldKey="inv_contactDetail" className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <DropdownInput value={formData.email} onChange={v => updateField('email', v)} fieldKey="inv_email" className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">NTN #</label>
                <DropdownInput value={formData.ntn} onChange={v => updateField('ntn', v)} fieldKey="inv_ntn" className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Other Information</label>
                <DropdownInput value={formData.otherInformation} onChange={v => updateField('otherInformation', v)} fieldKey="inv_otherInformation" className="w-full border rounded p-2 text-sm" />
              </div>
            </div>
          </section>

            <section>
              <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">Table Items</h3>
              {items.map((item, index) => (
                <div key={item.id} className="border p-3 rounded mb-2 bg-slate-50 relative mt-4 shadow-sm hover:shadow transition-all">
                  <div className="absolute -top-2 -right-2">
                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="bg-slate-800 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow"><Trash2 size={12} /></button>
                  </div>
                  <div className="space-y-2">
                  <textarea value={item.test} onChange={e => updateItem(item.id, 'test', e.target.value)} className="w-full border rounded p-1 text-sm font-semibold" placeholder="TEST" rows={2}/>
                  <textarea value={item.method} onChange={e => updateItem(item.id, 'method', e.target.value)} className="w-full border rounded p-1 text-sm" placeholder="METHOD" rows={1}/>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">PRICE (PKR)</label>
                      <input type="number" placeholder="0" value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)} className="w-full border rounded p-1 text-sm text-right" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">No of sample</label>
                      <input type="number" placeholder="1" value={item.samples} onChange={e => updateItem(item.id, 'samples', e.target.value)} className="w-full border rounded p-1 text-sm text-right" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 border-t pt-4">
              <button onClick={() => setItems([...items, { id: Date.now().toString(), test: '', method: '', price: '', samples: '' }])} className="w-full py-2 border-2 border-dashed rounded text-blue-600 font-bold text-sm flex items-center justify-center gap-2"><Plus size={16}/> Add Test</button>
            </div>
          </section>

          <section>
             <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">Discount</h3>
             <div>
                <label className="text-xs font-semibold text-slate-600">Discount %</label>
                <input type="number" placeholder="0" value={formData.discountPercent} onChange={e => updateField('discountPercent', e.target.value)} className="w-full border rounded p-2 text-sm" />
             </div>
          </section>

        </div>
      </div>

      {/* Preview Area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-gray-400 print:bg-white print:p-0 ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
        {chunks.map((chunk, pageIndex) => {
          const isLastPage = pageIndex === chunks.length - 1;
          
          return (
            <div id={`invoice-page-${pageIndex}`} key={pageIndex} className="a4-page bg-white shadow-2xl border border-gray-300 shrink-0 py-8 px-10 flex flex-col font-sans relative mb-16" style={{ width: '794px', height: '1123px', fontSize: '13px' }}>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <img src="/pqs-logo.svg" alt="PQS Logo" className="w-[90px] h-[90px] object-contain" />
                    <div className="flex flex-col">
                      <PQSWordmark className="mb-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        R-332/9, Dastagir, F.B Area, Karachi, 75950.
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Contact: 03322673373
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Email: precisionqualityserviceslabs@gmail.com
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="mb-4">
                      <div className="text-2xl font-bold tracking-wider text-gray-800 border border-gray-800 px-4 py-1">INVOICE</div>
                    </div>
                    <div className="flex gap-2 text-sm"><span className="font-bold w-20 text-right whitespace-nowrap">Inv #:</span><span className="w-28 text-left border-b border-gray-400">{formData.invoiceNo}</span></div>
                    <div className="flex gap-2 text-sm mt-1">
                      <span className="font-bold w-20 text-right whitespace-nowrap">Invoice Date:</span>
                      <label className="w-28 text-left border-b border-gray-400 relative cursor-pointer block">
                        {formData.invoiceDate}
                        <input 
                          type="date"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          value={convertDate(formData.invoiceDate)}
                          onChange={(e) => updateField('invoiceDate', convertDate(e.target.value))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

              {/* Client Details */}
              <div className="mb-4">
                 <div className="font-bold text-lg mb-2 text-gray-700 underline">Client details:</div>
                 <div className="flex flex-col gap-1 ml-4">
                    <div className="flex"><span className="w-40 font-semibold text-gray-700">Company Name:</span><span className="font-bold underline">{formData.customerName}</span></div>
                    <div className="flex"><span className="w-40 font-semibold text-gray-700">Company Address:</span><span>{formData.companyAddress}</span></div>
                    <div className="flex"><span className="w-40 font-semibold text-gray-700">Contact Person:</span><span>{formData.responsiblePerson}</span></div>
                    <div className="flex"><span className="w-40 font-semibold text-gray-700">Contact detail:</span><span>{formData.contactDetail}</span></div>
                    <div className="flex"><span className="w-40 font-semibold text-gray-700">Email:</span><span>{formData.email}</span></div>
                    <div className="flex"><span className="w-40 font-semibold text-gray-700">NTN #:</span><span>{formData.ntn}</span></div>
                    <div className="flex"><span className="w-40 font-semibold text-gray-700">Other Information:</span><span>{formData.otherInformation}</span></div>
                 </div>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-gray-800 text-[12px] table-fixed">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-800">
                    <th className="border-r border-gray-800 py-2 px-2 w-[40%] text-left font-bold uppercase">TEST</th>
                    <th className="border-r border-gray-800 py-2 px-2 w-[20%] text-center font-bold uppercase">METHOD</th>
                    <th className="border-r border-gray-800 py-2 px-2 w-[15%] text-center font-bold uppercase">PRICE (PKR)</th>
                    <th className="border-r border-gray-800 py-2 px-2 w-[10%] text-center font-bold uppercase">No of sample</th>
                    <th className="py-2 px-2 w-[15%] text-center font-bold uppercase">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((item) => (
                    <tr key={item.id} className="align-top border-b border-gray-300">
                      <td className="border-r border-gray-800 p-2 break-words whitespace-pre-wrap">{item.test}</td>
                      <td className="border-r border-gray-800 p-2 text-center break-words whitespace-pre-wrap">{item.method}</td>
                      <td className="border-r border-gray-800 p-2 text-center">{(Number(item.price) || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="border-r border-gray-800 p-2 text-center">{item.samples === '' ? 1 : item.samples}</td>
                      <td className="p-2 text-right font-semibold">{((Number(item.price) || 0) * (item.samples === '' ? 1 : (Number(item.samples) || 0))).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    </tr>
                  ))}
                  
                  {isLastPage && (
                    <>
                      {/* Totals Section enclosed in table */}
                      <tr className="border-t border-gray-800 bg-gray-50">
                        <td colSpan={4} className="border-r border-gray-800 p-2 text-right font-bold text-gray-700">Total Amount (PKR)</td>
                        <td className="p-2 text-right font-bold">{totalAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      </tr>
                      <tr className="border-t border-gray-300 text-red-600 bg-gray-50">
                        <td colSpan={4} className="border-r border-gray-800 p-2 text-right font-bold">Discount ({formData.discountPercent || 0}%)</td>
                        <td className="p-2 text-right font-bold">- {discountAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-800 bg-gray-100 text-[14px]">
                        <td colSpan={4} className="border-r border-gray-800 py-2 px-2 text-right font-black text-gray-800">Invoice Amount (PKR)</td>
                        <td className="py-2 px-2 text-right font-black text-blue-800">{invoiceAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-800">
                        <td colSpan={5} className="p-3 font-semibold text-[13px] bg-white">
                           Amount in words: <span className="font-bold underline decoration-dotted">{amountInWords}</span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* Footer Area */}
              <div className="absolute bottom-10 left-0 w-full flex flex-col items-center">
                <div className="w-[80%] flex justify-between border-t border-gray-400 pt-3 text-xs text-gray-500">
                  <span className="italic tracking-wide">This is a computer generated document and doesn't need a signature.</span>
                  <span className="font-bold text-gray-700">Page {pageIndex + 1}/{chunks.length}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
