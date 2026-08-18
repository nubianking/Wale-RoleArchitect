import React, { useState } from 'react';
import { TailoredResume, TargetRole } from '../types';
import { Button } from './Button';

interface TailoredViewProps {
  data: TailoredResume;
  role: TargetRole;
  candidateName: string;
  contactInfo: {
    location: string;
    email: string;
    phone: string;
    linkedin: string;
  };
  onBack: () => void;
  onOpenQA?: () => void;
  onOpenOptimize?: () => void;
}

export const TailoredView: React.FC<TailoredViewProps> = ({ 
  data: initialData, 
  role, 
  candidateName, 
  contactInfo,
  onBack, 
  onOpenQA,
  onOpenOptimize
}) => {
  const [data, setData] = useState<TailoredResume>(initialData);
  const [viewMode, setViewMode] = useState<'preview' | 'ats' | 'email'>('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSummary = (newSummary: string) => {
    setData(prev => ({ ...prev, summary: newSummary }));
  };

  const updateBullet = (jobIdx: number, bulletIdx: number, text: string) => {
    setData(prev => {
      const newExp = [...prev.experience];
      const newBullets = [...newExp[jobIdx].bullets];
      newBullets[bulletIdx] = text;
      newExp[jobIdx] = { ...newExp[jobIdx], bullets: newBullets };
      return { ...prev, experience: newExp };
    });
  };

  const addBullet = (jobIdx: number) => {
    setData(prev => {
      const newExp = [...prev.experience];
      newExp[jobIdx] = {
        ...newExp[jobIdx],
        bullets: [...newExp[jobIdx].bullets, 'New tailored technical achievement...']
      };
      return { ...prev, experience: newExp };
    });
  };

  const removeBullet = (jobIdx: number, bulletIdx: number) => {
    setData(prev => {
      const newExp = [...prev.experience];
      const newBullets = newExp[jobIdx].bullets.filter((_, i) => i !== bulletIdx);
      newExp[jobIdx] = { ...newExp[jobIdx], bullets: newBullets };
      return { ...prev, experience: newExp };
    });
  };

  const getPlainText = () => {
    let text = `NAME: ${candidateName}\nROLE: ${role}\n\nSUMMARY\n${data.summary}\n\nSKILLS\n${data.skills.join(', ')}\n\nCERTIFICATIONS\n${(data.certifications || []).join('\n')}\n\nEXPERIENCE\n`;
    data.experience.forEach(exp => {
      text += `\n${exp.role} at ${exp.company} (${exp.duration})\n`;
      exp.bullets.forEach(b => text += `• ${b}\n`);
    });
    return text;
  };

  const getEmailFormat = () => {
    return `Subject: Application for ${role} - ${candidateName}\n\nDear Hiring Manager,\n\nI am writing to express my interest in the ${role} position. Based on the job description, I believe my background aligns perfectly with your needs.\n\n${data.summary}\n\nKey Highlights:\n${data.experience[0]?.bullets.slice(0, 3).map(b => `- ${b}`).join('\n') || ''}\n\nI have attached my full resume for your review.\n\nBest regards,\n${candidateName}\n${contactInfo.phone}\n${contactInfo.linkedin}`;
  };

  const generatePDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      setIsDownloadingPdf(false);
      return;
    }

    // @ts-ignore
    if (!window.html2pdf) {
      alert("PDF library is not loaded. Please refresh the page.");
      setIsDownloadingPdf(false);
      return;
    }

    const safeName = candidateName.replace(/\s+/g, '_');
    const opt = {
      margin: 0,
      filename: `${safeName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloadingPdf(false);
    }).catch((err: any) => {
      console.error(err);
      setIsDownloadingPdf(false);
    });
  };

  const handleDownloadPDF = () => {
    setIsDownloadingPdf(true);
    
    if (viewMode !== 'preview') {
      setViewMode('preview');
      setTimeout(() => generatePDF(), 500);
    } else {
      generatePDF();
    }
  };

  const handleGoogleDocs = async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <h1 style="font-size: 18pt; font-weight: bold; text-transform: uppercase; margin: 0;">${candidateName}</h1>
          <p style="font-size: 10pt; margin: 5px 0 0 0; color: #333;">
            ${contactInfo.location} | ${contactInfo.email} | ${contactInfo.phone} <br>
            ${contactInfo.linkedin}
          </p>
        </div>

        <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 20px; color: #000;">Summary</h2>
        <p style="margin-top: 10px; margin-bottom: 10px;">${data.summary}</p>

        <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 20px; color: #000;">Skills</h2>
        <p style="margin-top: 10px; margin-bottom: 10px;"><strong>Technical Competencies:</strong> ${data.skills.join(', ')}</p>

        ${data.certifications && data.certifications.length > 0 ? `
        <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 20px; color: #000;">Certifications</h2>
        <ul style="margin-top: 10px; margin-bottom: 10px;">
          ${data.certifications.map(cert => `<li>${cert}</li>`).join('')}
        </ul>
        ` : ''}

        <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 20px; color: #000;">Professional Experience</h2>
        ${data.experience.map(exp => `
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
              <tr>
                <td style="font-weight: bold; font-size: 12pt; text-align: left; padding: 0;">${exp.role}</td>
                <td style="font-size: 10pt; text-align: right; white-space: nowrap; padding: 0;">${exp.duration}</td>
              </tr>
            </table>
            <div style="font-weight: bold; font-style: italic; font-size: 11pt; margin-bottom: 5px;">${exp.company}</div>
            <ul style="margin-top: 0; padding-left: 20px;">
              ${exp.bullets.map(b => `<li style="margin-bottom: 3px; padding-left: 5px;">${b}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    try {
      const blob = new Blob([htmlContent], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/html": blob });
      await navigator.clipboard.write([clipboardItem]);
      
      const newWindow = window.open("https://docs.google.com/document/create", "_blank");
      if (newWindow) {
         setTimeout(() => {
             alert("Resume copied to clipboard!\n\nPASTE (Ctrl+V) into the new Google Doc tab.");
         }, 500);
      } else {
         alert("Resume copied! Please manually open Google Docs and paste.");
      }
    } catch (e) {
      console.error("Clipboard API failed", e);
      navigator.clipboard.writeText(getPlainText());
      alert("Rich formatting unavailable. Plain text copied. Opening Google Docs...");
      window.open("https://docs.google.com/document/create", "_blank");
    }
  };

  const handleDownloadTxt = () => {
    const safeName = candidateName.replace(/\s+/g, '_');
    const element = document.createElement("a");
    const file = new Blob([getPlainText()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${safeName}_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800 animate-fade-in print:bg-white print:border-none print:h-auto print:block">
      
      {/* Header - Hidden on Print */}
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900 sticky top-0 z-10 print:hidden flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tailored Output</h2>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-neutral-400">Match Score: <span className="text-green-400 font-bold">{data.analysis?.matchScore || 92}%</span></span>
            <button 
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {showAnalysis ? 'Hide Analysis' : 'View Match Details'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
           <Button variant="outline" onClick={onBack} className="!px-3 !py-1.5 !text-xs">Back</Button>
           
           <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)} 
              className={`!px-3 !py-1.5 !text-xs ${isEditing ? '!border-green-500 !text-green-300 !bg-green-950/40' : '!border-neutral-700'}`}
           >
             {isEditing ? '✓ Editing Active' : '✏️ Quick Edit'}
           </Button>

           {onOpenQA && (
             <Button 
                variant="outline" 
                onClick={onOpenQA} 
                className="!px-3 !py-1.5 !text-xs !border-purple-500/50 !text-purple-300 hover:!bg-purple-900/20"
             >
               Q&A Assistant
             </Button>
           )}

           {onOpenOptimize && (
             <Button 
                variant="outline" 
                onClick={onOpenOptimize} 
                className="!px-3 !py-1.5 !text-xs !border-blue-500/50 !text-blue-300 hover:!bg-blue-900/20"
             >
               AI Optimizer
             </Button>
           )}

           {/* Export Group */}
           <div className="flex bg-neutral-800 rounded p-0.5 gap-0.5">
             <button onClick={handleDownloadTxt} className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white rounded transition-colors" title="Download Text">
               TXT
             </button>
             <button onClick={handleGoogleDocs} className="px-2.5 py-1 text-xs font-medium text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 rounded transition-colors" title="Export to Google Docs">
               G-Docs
             </button>
             <button 
                onClick={handleDownloadPDF} 
                disabled={isDownloadingPdf}
                className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-700 hover:bg-neutral-600 rounded transition-colors disabled:opacity-50" 
                title="Download PDF"
             >
               {isDownloadingPdf ? 'PDF...' : 'Download PDF'}
             </button>
           </div>
        </div>
      </div>

      {/* Analysis Details Drawer */}
      {showAnalysis && data.analysis && (
        <div className="bg-neutral-950 border-b border-neutral-800 p-5 text-xs text-neutral-300 space-y-2 animate-fade-in print:hidden">
          <div className="font-bold text-white uppercase tracking-wider text-[11px]">Semantic Analysis Breakdown</div>
          <div><strong className="text-neutral-400">Matched Keywords:</strong> {data.analysis.keywordsUsed?.join(', ') || 'None specified'}</div>
          <div><strong className="text-neutral-400">Tone Adjustments:</strong> {data.analysis.toneNotes}</div>
        </div>
      )}

      {/* View Tabs - Hidden on Print */}
      <div className="flex border-b border-neutral-800 bg-neutral-950 print:hidden text-xs font-medium">
        <button 
          onClick={() => setViewMode('preview')}
          className={`flex-1 py-3 transition-colors ${viewMode === 'preview' ? 'text-white border-b-2 border-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Visual Resume Preview
        </button>
        <button 
          onClick={() => setViewMode('ats')}
          className={`flex-1 py-3 transition-colors ${viewMode === 'ats' ? 'text-white border-b-2 border-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          ATS Plain Text
        </button>
        <button 
          onClick={() => setViewMode('email')}
          className={`flex-1 py-3 transition-colors ${viewMode === 'email' ? 'text-white border-b-2 border-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Email & WhatsApp Template
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-8 bg-neutral-950 print:p-0 print:bg-white print:overflow-visible">
        
        {viewMode === 'preview' && (
          <div id="resume-preview" className="max-w-3xl mx-auto bg-white text-black p-10 shadow-2xl min-h-[1000px] print:shadow-none print:max-w-none print:w-full print:min-h-0 print:p-0 font-sans">
            
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-5 mb-5">
              <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">{candidateName}</h1>
              <p className="text-xs text-gray-600">{contactInfo.location} | {contactInfo.email} | {contactInfo.phone}</p>
              <p className="text-xs text-gray-600">{contactInfo.linkedin}</p>
            </div>

            {/* Summary */}
            <div className="mb-5">
              <h3 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 pb-0.5 tracking-wider">Summary</h3>
              {isEditing ? (
                <textarea 
                  value={data.summary} 
                  onChange={(e) => updateSummary(e.target.value)}
                  className="w-full h-24 p-2 border border-blue-300 rounded text-xs leading-relaxed focus:outline-none"
                />
              ) : (
                <p className="text-xs leading-relaxed text-gray-800">{data.summary}</p>
              )}
            </div>

            {/* Skills */}
            <div className="mb-5">
              <h3 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 pb-0.5 tracking-wider">Skills & Core Competencies</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, i) => (
                  <span key={i} className="text-xs text-gray-800 bg-gray-100 px-2 py-0.5 rounded-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 pb-0.5 tracking-wider">Certifications</h3>
                <ul className="list-disc ml-5 space-y-0.5">
                  {data.certifications.map((cert, i) => (
                    <li key={i} className="text-xs text-gray-800">{cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience */}
            <div>
              <h3 className="font-bold text-xs uppercase border-b border-gray-300 mb-3 pb-0.5 tracking-wider">Professional Experience</h3>
              {data.experience.map((job, idx) => (
                <div key={idx} className="mb-5 break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-bold text-sm">{job.role}</h4>
                    <span className="text-xs text-gray-600 font-medium">{job.duration}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 italic">{job.company}</p>
                  
                  <ul className="list-disc ml-5 space-y-1.5">
                    {job.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs text-gray-800 leading-relaxed group relative">
                        {isEditing ? (
                          <div className="flex items-start gap-1">
                            <textarea 
                              value={bullet} 
                              onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                              className="w-full p-1 border border-blue-300 rounded text-xs leading-relaxed focus:outline-none"
                            />
                            <button 
                              onClick={() => removeBullet(idx, bIdx)}
                              className="text-red-500 text-xs px-1 hover:font-bold"
                              title="Delete Bullet"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span>{bullet}</span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {isEditing && (
                    <button 
                      onClick={() => addBullet(idx)}
                      className="mt-2 text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      + Add Bullet Point
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {viewMode === 'ats' && (
          <div className="max-w-3xl mx-auto print:hidden">
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {getPlainText()}
            </div>
            <div className="mt-4 flex justify-between items-center">
                <p className="text-neutral-500 text-xs">
                  Optimized for ATS parser compatibility.
                </p>
                <Button variant="secondary" onClick={() => handleCopy(getPlainText())} className="!py-1.5 !px-3 !text-xs">
                 {copied ? "Copied ✓" : "Copy Plain Text"}
               </Button>
            </div>
          </div>
        )}

        {viewMode === 'email' && (
          <div className="max-w-3xl mx-auto print:hidden">
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 font-sans text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {getEmailFormat()}
            </div>
            <div className="mt-4 flex justify-center">
               <Button variant="secondary" onClick={() => handleCopy(getEmailFormat())} className="w-full !py-2 !text-xs">
                  Copy Cover Email / Message
               </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
