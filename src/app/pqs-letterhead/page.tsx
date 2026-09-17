"use client";
import type { CSSProperties } from "react";

/**
 * PQS Letterhead
 * -----------------------------------------------------------------------
 * A print-ready A4 letterhead for Precision Quality Services.
 * - Built with Tailwind utility classes -> make sure Tailwind CSS is set
 *   up in the app that renders this component.
 * - The header text, date, and body are contentEditable so the document
 *   can be filled in directly in the browser, then printed / saved as a
 *   PDF with Ctrl+P (or Cmd+P). The @media print rules below strip the
 *   page chrome down to just the A4 sheet.
 * - Logo, wordmark, and watermark are embedded as base64 data URIs so
 *   this file has zero external asset dependencies. If you'd rather keep
 *   the bundle lean, move them to /public and swap the `src` values for
 *   plain paths (e.g. "/pqs-logo.png").
 */

const WATERMARK_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAApoAAADyCAYAAADtNGXhAAAStElEQVR4nO3dW3LjOBIFULrCy5r9b8vz4VCXrJIlPvDITJwT0X9dFgkQwGVCpD7+97//bQAL+urwNz86/E2AtD5nHwBARz3C5NnPE0KB5QiaQCWjg+UR98cmdAJLEDSBrCKHyndUPoElCJpABplD5VEqn0AZf2YfAMAbK4XMR1/b2ucPJKeiCUQjWP3rWZuodnLPuGGUQ3PPLWi6QBnF4shvzEPH3NrLmFqPscJMX9uBeUdFk9F+myAtluuyaF5zaNInJWOESE5VNGE2W4NrsXC25QGiWowPyhA0iexxsrWA5mcB7U/ozMnYIIPDc4qnzsnERJyb/htPm+egn4juYzt546qiSTYegMjHIjqXMROTccESBE2ysj0Yn4U0FoEzBuOCpdg6pwITdzz6JC59M4+2J6NLN6cqmlShWjOfRTQPOwLjGBdkdnl+UNGkGj/ZN4c2z0vf9aNtyazJTaigSVUm+HG0dX76sD1tSmbNdjpsnVOZ7fS+LKS1+IWhNowLsms6DwiarMAC2p7FtCbf3TzPmKCC5uPe1jmrsAi0oy0B2EVFk5XYSr9GwFyL8bKPcUEVXca6iibwjif516bvf6dtqKLbDaWgyYoEJzjGeIG6uu5a2DpnZR4Sek244J6t9L+MDaroPp4FTVYnbD63wkLao99XaLfVx8wKfcwahoxjQRMsnI+qL6Q9+/rxb1dvS4CXBE34JmzWC0UR+vO3Y8je1ituo2fvM7g3bOwKmsC21VhEM4We+2PN3Par3KBl7iN4NHTMeuoc/rKY5PSx5Q472Y/fuIE8hs81Kprw02pbgllDQsX+yVzlrFzZzNYX8JspY1TQhHVlW0CrBplnMj5UVDFsZmh3CM3WOTxngYmlWoA5Ksv5Vxo3lc4Fps0hKprwu4oVmm3LsYBWbPersmytVx03kNXU8ShowmvVFs3IAWXbxrd16/YYdfy3z4nan9nHTdR2haOmj0Nb50AUMybElk98zzr+qIQ1mCvE/KCiCe9lr85sW+xFf0Tbjjj/PZ/R41wjVzezjZ2IbQipCZrALD0DSNTAcH9crc8/cuAExgl1c/dnMynBHpnHScRj7zURfm0xz/eZr63P8YZaZLY8/QF0oKIJ+2XbBoyqZRtWCTGtfyggWnXT2IExwo2zz+37oKJMRkA70cZ1qwkw2nm19HhuV9ss0vwePWxGaSc4K+T48tQ5MELICXARkdpemIM+Io3zHz43Ax+OiF6VuYk0rlu0V6TzGanVw0PRttKj0S5kFnpN8h1NOC5L2IzgSjtZ/H9q8T3OCFvprb+PetXs9mgpSpvCf/5sLkyoJNJT1+aWPq72r36pSb8S0q2i6QI9L8qizliqmr9TxezvalUwQmWTa8w/pGDr/DqD/RyLXHsR2rRayIz+3cYrgXN22Ixwsxa1X1+Z3WZwiKDJLPeTZcbJnn9VCZnPzuO3c4ty3GdD2+ywyTFCJukImkRgsTsvSrtlCZm9fvbxmdF9kzFsRnswKCrtQ1qCJlFkrHBG2PqLENLPtEHmcHn2c0ec89ngFuE6GinTuc6eY+ASQRO4IuoiGPG4ot9MrRY2M4h4HcMhfhmIiEyu+80MBmf7qdcxf9z9F13v4zz7mqtZbSfg/ivDdQxvqWgSVfSnfSPIFjJ7Bsyselc5z3y9Y1Zl0/c1/9IGlKGiCdcIwnNVWpB7VTkzVTbR9hQjaBKdSfe5WQH3TBjq8WtFWbbIzxA216XNKUfQJIPok++M19hkIWCe0+P7plmumyzHCewgaJLFCuEiutl9MPvzZ5kZNiu2uSALA3kYCNhj5sM/I8POs2OOELZaPhx39AEhrz0aI8J1Bs0JmmSy+oI383uZR2QImEeO8f7/nR0GWo2B6GFztSfQVzlPFmTrHFjJlQeTooSBVsex8k0bMIigCbwyo5rZ4yGYHk++zzQjbEYJ2tVoV0oTNMlm1Ul5Rkg60tatglyL/v3a+oTLaGG1VSCPHDYjtTdwgqAJPDMj0I8OTUdFvcmJelwAgiYpRVxYV668RKhkjqo2Rrz2RlPVBHbz1DnEFn3LfPbnCSHfrr7+aJWnvKNdL9XbG1Q0gUuuLtxCZlujgouABOwiaAJnzQqZMx7KWSVYRX0wyE0FJGXrHLi3NzzMDJm9VAmTV1+ufvRl7pynrSlPRRO4ib7t2iNkfmztXhMUSfS+PENVExISNCGuigtrhJBZNVw+8v3X+KpfgyBoAofM+AnHlr82tNrCPuJ8M7VppmOFEgRNYNviLsAqa/Noe+AyQRNiqrbInwmyLR44WrGK+UhVE5jGU+ewtqO/Z977M65+1tnPq+7qk+hRrPJieShDRRPiqRAIrhAy45jxzlKgEEET2GNUNfPK5wiZr/VuH+1/nBBPeYIm0EvFdzkCcICgCW1kDDujfgVorzOfk7HdZ4rwHtMWoh3PFZXOBf4haJJR5Ym5yrl50jmunu2mT4AfBE1gtjMPnAg041W5CQIGEjTJxmLXRs9tcyEwvp5b6Pof+I+gCWQjyFCNG2jKEjTJxGTcRqSgZsscvpnfKEnQhDiiLTTRts2FzLay99XIX6oaJdocAJcJmsAzvRc8vzgTQ+TQtYdrCIITNMkgeijJvlhnoI3jiDwWK9C+lCJoQgyjFpdega3nT0AKmaxG2KQMQZPoTLiQkxuEa8x9lCBoElmGidZietyRftW+/WnjuDLMgfCSoElUJlgEIHrJdG2ZC0lN0AQe9VzYLJpwnHFDWp+zDwDumExzylQdoo2vLX+/f2y55pzHY83e/ixCRRPOM9Efk2lR5z2/ez6X8UQKgiZRmDT7y7ToZzpW5lp57lj53EnC1jkzmSTj0SdryraN3EqF885+/Hwre3MtaDJL9smx5aQwoi28TB0grvt1oNS8KmgyQvZQyVilJtlEKlT3oILfxmHKufFzM7HAUSkHexLaFuC5lFVPFU1gBDe0RHVbsF2jZJImdP7Zgh8gBFN5vFhoAfL52gLP315vBPtVDpkA5BYycAqaAOBGkjpCBU5BE/bxRO41FnGAsUKsWYIm7CcsXfOxvW5D7ctsrkGq+domVzgFTXjP4tPWY+B8F0BhJNciVU0JnIImMIuACTDe0LApaMJrghCsx7inumFb6oImAABdCJrwO1UNWJevdrCKrlVNQROes8AAsIpu2+iCJgD8zk0nK2keNgVN+JeFBYBVNQ2bgib8JGQCj3xfk9U0C5uCJvxVfSF5N3FUP3+4yhhhJU3CpqAJ31ZYQFY4R84L8bvIQCiX5wVBEwQwYD/b6KzmUtgUNFmdBQNUM88wd8AOgiYri7JQRDmObTt+LAIKK4s0dqGn03O9oMmqVlsgBEJmGHHdzR7LttJZxamXuguarMiiALRmXoEnBE1WYzGA61TxntMm8EDQZBUWxn7bmLbl4a/V5xnqO7SF/tnxQCACkz685kahvdu8o21ZnoomlQmZ52g3WhCyjCVq2zXGVTSpygQPRHA/FwnfLEdFk2p8FxPWkW2sZzteeOftzZOgSSUm8fd6PhCkWpPPmT4zzq7RfizF1jnZmbThnJ43Biu8qP0K2+lUcruGn45JQZOMMi8wWXxsFkAYQeikgl/XZVvnEEPE8BzxmJjLNdGX75iT1a83SSqaZLDKxDuqivi19WvTnn+bdlTOYlPlpAxBk8gEFmB1z+ZB4ZOInn5XU9AkGuFyDJVHjtpzvYwKQKtfuyqepCFoMsvqC0UWZ7bzhdi4hJJ6jLUayo7NDEHTIGIlVZ72FjYB9qtUpf4x/0d/6txCBf1kn8wYx1wM45R6+0D0oAnMV2bCW9zZG4u9/e/GBdoqETgjB830jQsnRbz2zxyT4JFftGuxxMILB2W85v+b/yMHTSA/YTMG/QC5ZQyb27bFDpomRujva+s/1ozleUb07+1zgL5SVvQjB810jQkNRbz+Ix4T/ehviCnV2IwcNN0hQx3Gc136FsbLEDa/ti120MzQiFCF7dVarm6ZR5x/Ix4T8EbkoAnEc/U7QsJmLfoT5klx8yVoQlwpJhHCuRr+Il53EY8JIgg/NgRN4OZIQFHVjGlkyNSPEEPksPklaAL3RoWHUa/dWcnI9tR3wC6CJsQW+b1pUY9rRS2CX9T+jHpcwA6CJvBo1Bb60c/iudEhU59BPGFvyCIHTZMZ5NAibBrvx63QbmEXT2CfyEETgP6EOaAbQRNyGB0GjlbLWhzfChW6Vlq109Et85H9IwDDMSHHjKAJtNJqkhM4f9eybSJ/LzPkggkcJ2hCHjMW36MBQ0CoSb8CpwiakMtKYVNl86/WbSE4AkMImsAeMyubK4fNFcO2EAyFCJpAL63D5mqBK9r5CoDAYYIm5DNrwT8TfFofa7Tw1UPkUN372hNmoZjP2QcAlPextQ1O93+rSjAZHSyvtGHr/jx7HEACKprAEWerbUJELfoT2EVFE3K6LfRRt1if6VEJe/x7mQJQlL777TjetWXL/szUb8ABKprAGWcDxsfWN1R8bbG/4xj9+O7tOUYBEXhJRRM462uLHTRuQWn2MWYIlQBdCJqQW68HM/Y6GzZHbv0/+4xe4bNaqNwT1q/05eybAKAzQRPyyxo2t23esR/5zNntm4V2grlCjj/f0YQaZleGrkxws4+d97zOCDhF0ARauRo2owaPkFWCCfY+HBS1H4EJBE2oI8ICfzWUCSqx7X1ifs+rkYAFCJpAay0qgIJIXfoW2gu78yJoQi1RKoIt3hX5scU5H4571m/6EhYjaAI9tXo5uYASy5EtdDcLsK4PQRNqqriwVzynVyoFtLDbelBA6PHlPZrACK1+pef+34eeXC94bKPI57z3HapVAjNEEm0+eErQhLpG/vrOXi1/FjJyADviSFtEfCl6lJ/6BAISNIEZWv9OerbQeeXcI95AADz62DZBE1YQsQq2be3D5s3j34xw7itU+3r1J/CvCPPaLoImrCFy2LzpFVKe/d1ebTEyaEXsU9vo0Fe0Mf+WoAnriBhM7o2siLXcaheqAH76b14UNGEtGcLmto2vDNKWbXRoK/K8/ZKgCeuJHja3bcyWOn3ZRofros/Vb3lhO6wp0+KffqIFOKHE3Cdowrqyhc1WP2eZxd6feIxupT6DVjKPmx/zkq1zWFuGbfRHj8ebIWzt8awf9nzXMUMfrraNXvUapY/o4/cSQRPIEFReqfDgyav2r3B+q9FfvJJ5vn3l6VoiaALbViNs3mRY5Fu3dZb+WyE0Z+gH6OWf8S1oAjdVftrw2fHPDjfZ27SlqmFTH8MTgiawglHfmesVNqp8V/OmatgEHgiawKNMgeWsjOdXLWxWos1Z3a9zk9cbAc98bCpOEVV55dG21Qhnq71yC555OecImsArWUILP2XpN0ENihM0AXLZG86yhE0gr7fzjO9oAu/cTySqT7lk+c5mthe6Z2hTCEFFEyCnvWEnS3jbthwBLsMxQhiCJnCEh4RiqRg2gRx2zSuCJnCGwBlHtbAZuWIY+dhgpN3ziaAJXJElvFRXLWwCcR2aRwRN4CrhJYZKYTNa5dBrmODb4flD0ARa+Nhsp0dQKQwJd1CAoAm0JmzO5R2bbQm78O3UvCFoAj2obsaXpY9mVjaFTPh2eq4QNIGesoSZlWXpn9GhT8iEBgRNYASBEyCnS3O3oAmMJHD2dbZ9s/TJqCqjaiZ8uzw3+K1zYAa/n95Oq5Dod9FznD+M0mSMqWgCs6lyntOj3fQDsG0N5wIVTSAKVc73RgRBlU1YV/PxJGgCEQmdf80IUlnCZgurnCe802WusXUORLfqrw7NPucs7S0ownXdxruKJpBJ9UpntHCXpbL5tZ1vu9u/y3Ce0EPXeUfQBLL6bXLMEBiiBcpXVgib25bnPKGVIfOQoAlU8zh5zg4PmUJldlfDJqxi2DgRNIHq9kyoV8No9XCTqdonbMLvho8NQRNAMNkj03cZz4bNTOcIR02Z5zx1DkBFV8KiGw8qmfoGiz+bOzcA9ssUwqxvrG76eP0T4SAASCXTunE2bM5+jymcFerdw7bOATgjxCK2k210qgsVLu8JmgCcFW5Re8E2OtWEDZf3fEcTgCvCL3R3bKPDYCqaAKzENjqZpahi3ov8Hs00jQiAl7pDB+mv08+twEkAEMIKYdOaSUvlb3psnQPQUqZFM0sopq5M4+UUQROA1jItnsImdCRoAtCDsAkImgB0kylsAh0ImgCgqgldCJoA9JSpqilsQmOCJgC9ZXrBtLAJDQmaAAB0IWgCMEqWqibQiKAJwEgZttFtn0MjgiYAAF0ImgDMEL2qCTQgaAIA0IWgCcAsUauaUY8L0hE0AZgpw8NBwEmfsw8AAIIQeKExFU0AIhDyoCAVTQCiuIXN0e+xFHKhExVNAKIZFfx8PxQ6U9EEIKL7ANiywilYwkD/B2GD8sR14cAbAAAAAElFTkSuQmCC";
const LOGO_SRC = "/pqs-logo.png";
const BANNER_SRC = "/pqs-banner.png";

const pageStyle: CSSProperties = { width: "210mm", height: "297mm" };
const watermarkStyle: CSSProperties = { width: "55%", opacity: 0.06, objectFit: "contain" };
const logoStyle: CSSProperties = { width: "78px", height: "78px", objectFit: "contain" };
const bannerStyle: CSSProperties = { height: "30px", width: "auto", objectFit: "contain" };



import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZoomIn, ZoomOut, ArrowLeft, Printer, Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Palette } from 'lucide-react';
import { Rnd } from 'react-rnd';

import { Roboto, Open_Sans, Lato, Montserrat, Merriweather, Playfair_Display, Source_Serif_4 } from 'next/font/google';

const fontRoboto = Roboto({ weight: ['400', '700'], subsets: ['latin'] });
const fontOpenSans = Open_Sans({ subsets: ['latin'] });
const fontLato = Lato({ weight: ['400', '700'], subsets: ['latin'] });
const fontMontserrat = Montserrat({ subsets: ['latin'] });
const fontMerriweather = Merriweather({ weight: ['400', '700'], subsets: ['latin'] });
const fontPlayfair = Playfair_Display({ subsets: ['latin'] });
const fontSourceSerif = Source_Serif_4({ subsets: ['latin'] });

const FONTS = [
  { name: 'Default (System)', class: 'font-sans' },
  { name: 'Roboto', class: fontRoboto.className },
  { name: 'Open Sans', class: fontOpenSans.className },
  { name: 'Lato', class: fontLato.className },
  { name: 'Montserrat', class: fontMontserrat.className },
  { name: 'Merriweather (Serif)', class: fontMerriweather.className },
  { name: 'Playfair Display (Serif)', class: fontPlayfair.className },
  { name: 'Source Serif (Serif)', class: fontSourceSerif.className },
];

export default function PQSLetterheadPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [showStamp, setShowStamp] = useState(false);
  const [stampPos, setStampPos] = useState({ x: 500, y: 700 });
  const [stampSize, setStampSize] = useState({ width: 200, height: 200 });
  const [blendMode, setBlendMode] = useState<string>('normal');

  const [activeFont, setActiveFont] = useState(FONTS[0].class);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 300);
  };

  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  if (!isClient) return null;

  return (
    <div className={`flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden ${activeFont}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A4; margin: 0; }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body, html { margin: 0 !important; padding: 0 !important; background: white !important; height: 100%; }
          .no-print { display: none !important; }
          .zoom-wrapper { transform: none !important; margin-bottom: 0 !important; }
          .pqs-a4-page { box-shadow: none !important; border: none !important; margin: 0 !important; width: 210mm !important; height: 297mm !important; min-height: 297mm !important; page-break-after: avoid; }
        }
      `}} />

      {/* Sidebar */}
      <div className="w-full md:w-[400px] h-auto md:h-full bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl md:shadow-none no-print overflow-hidden shrink-0">
        <div className="flex-none p-4 md:p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all" title="Back to Home">
            <ArrowLeft size={20} />
          </button>
          <div className="text-sm font-semibold text-slate-700">PQS Letterhead</div>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-[#002f6c] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#001f4d] transition-all shadow-md hover:shadow-lg active:scale-95">
            <Printer size={16} />
            <span>Print / PDF</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Add Stamp</label>
              <button onClick={() => setShowStamp(!showStamp)} className={`w-12 h-6 rounded-full p-1 transition-colors ${showStamp ? 'bg-[#002f6c]' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${showStamp ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            {showStamp && (
              <div className="space-y-3 p-3 bg-slate-100 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stamp Blend Mode</label>
                <select value={blendMode} onChange={(e) => setBlendMode(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002f6c]/20">
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="darken">Darken</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Type size={16} /> Text Formatting (MS Word Style)
            </label>
            <div className="space-y-3 p-3 bg-slate-100 rounded-xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Document Font</label>
                <select onChange={(e) => setActiveFont(e.target.value)} value={activeFont} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002f6c]/20">
                  {FONTS.map(f => <option key={f.name} value={f.class}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Style & Align</label>
                <div className="flex flex-wrap gap-1">
                  <button onClick={() => formatText('bold')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50"><Bold size={14}/></button>
                  <button onClick={() => formatText('italic')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50"><Italic size={14}/></button>
                  <button onClick={() => formatText('underline')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50"><Underline size={14}/></button>
                  <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
                  <button onClick={() => formatText('justifyLeft')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50"><AlignLeft size={14}/></button>
                  <button onClick={() => formatText('justifyCenter')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50"><AlignCenter size={14}/></button>
                  <button onClick={() => formatText('justifyRight')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50"><AlignRight size={14}/></button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Headings</label>
                <div className="flex flex-wrap gap-1">
                  <button onClick={() => formatText('formatBlock', 'H1')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 font-bold text-xs">H1</button>
                  <button onClick={() => formatText('formatBlock', 'H2')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 font-bold text-xs">H2</button>
                  <button onClick={() => formatText('formatBlock', 'H3')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 font-bold text-xs">H3</button>
                  <button onClick={() => formatText('formatBlock', 'P')} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 font-bold text-xs">P</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center bg-gray-100 relative ${isGenerating ? 'is-generating-pdf' : ''}`}>
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 no-print items-center">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 rounded-lg hover:bg-slate-100"><ZoomIn size={18} /></button>
          <span className="text-[10px] font-bold font-mono text-slate-500 leading-none">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 rounded-lg hover:bg-slate-100"><ZoomOut size={18} /></button>
        </div>
        <div className="zoom-wrapper w-full origin-top md:transform-none flex flex-col items-center transition-transform" style={{ transform: `scale(${zoom})`, marginBottom: zoom < 1 ? `-${300 * (1 - zoom)}px` : '0' }}>
          <div className="relative">
            {showStamp && (
              <Rnd
                size={{ width: stampSize.width, height: stampSize.height }}
                position={{ x: stampPos.x, y: stampPos.y }}
                onDragStop={(e, d) => setStampPos({ x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setStampSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
                  setStampPos(position);
                }}
                bounds="parent"
                className={`z-50 ${isGenerating ? '' : 'hover:outline hover:outline-2 hover:outline-blue-500/50'}`}
                style={{ mixBlendMode: blendMode as any }}
                enableResizing={!isGenerating}
                disableDragging={isGenerating}
              >
                <img src={'/stamp.png'} alt="Stamp" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
              </Rnd>
            )}
            
            <div
        className="pqs-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300 mx-auto"
        style={pageStyle}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img src={WATERMARK_SRC} alt="Watermark" style={watermarkStyle} />
        </div>

        {/* Header */}
        <div className="relative flex justify-center items-end mb-6 border-b-2 border-gray-800 pb-2 px-10 pt-4 z-10">
          {/* Centered logo stack */}
          <div className="flex flex-col items-center gap-1">
            <img src={LOGO_SRC} alt="PQS Logo" style={logoStyle} />
            <img src={BANNER_SRC} alt="Precision Quality Services" style={bannerStyle} />
            <div className="text-xs text-gray-500" contentEditable suppressContentEditableWarning>
              Providing Consultancy Services to Textile Industries
            </div>
          </div>

          {/* Date field, sitting right above the header divider line */}
          <div className="absolute right-6 bottom-1 flex items-center gap-1.5 text-xs">
            <span className="font-bold whitespace-nowrap">Date:</span>
            <span
              className="w-28 text-left border-b border-gray-400"
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Type your letter or report content here..."
            >
              &nbsp;
            </span>
          </div>
        </div>

        {/* Body text */}
        <div
          className="flex-1 px-10 outline-none relative z-10 mt-4 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:cursor-text"
          contentEditable
          suppressContentEditableWarning
        >
          
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col items-center mt-auto pb-8 relative z-10">
          {/* Uses w-full + px-10 rather than an arbitrary width like w-[95%]: arbitrary
              values only exist if this file is covered by the Tailwind `content` config,
              and when that class goes missing the row collapses to fit its text and
              justify-between has no space left to distribute. */}
          <div className="w-full px-10 flex justify-between items-center gap-8 border-t border-gray-400 pt-4 text-xs text-gray-500">
            <span className="whitespace-nowrap" contentEditable suppressContentEditableWarning>
              R-332/9, Dastagir, F.B Area, Karachi, 75950.
            </span>
            <span className="whitespace-nowrap" contentEditable suppressContentEditableWarning>
              03322673373 | 03333769174
            </span>
            <span className="whitespace-nowrap" contentEditable suppressContentEditableWarning>
              precisionqualityserviceslabs@gmail.com
            </span>
          </div>
        </div>
      </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
