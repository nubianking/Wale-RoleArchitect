import React, { useState, useRef } from 'react';
import { ResumeData, WorkExperience } from '../types';
import { Button } from './Button';
import { BASE_RESUME } from '../constants';
import { parseResumeFromText } from '../services/geminiService';

interface ProfileEditorProps {
  currentData: ResumeData;
  onSave: (data: ResumeData) => void;
  onClose: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ currentData, onSave, onClose }) => {
  const [editorMode, setEditorMode] = useState<'form' | 'json'>('form');
  const [formData, setFormData] = useState<ResumeData>(currentData);
  const [jsonContent, setJsonContent] = useState(JSON.stringify(currentData, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    setError(null);
    if (saveStatus === 'saved') setSaveStatus('idle');
    try {
      const parsed = JSON.parse(e.target.value);
      if (parsed.experience && Array.isArray(parsed.experience)) {
        setFormData(parsed);
      }
    } catch {
      // Ignore JSON parse errors while typing
    }
  };

  const handleFormChange = (newForm: ResumeData) => {
    setFormData(newForm);
    setJsonContent(JSON.stringify(newForm, null, 2));
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  // Saves and closes
  const handleSave = () => {
    try {
      let dataToSave: ResumeData;
      if (editorMode === 'json') {
        dataToSave = JSON.parse(jsonContent);
        if (!dataToSave.experience || !Array.isArray(dataToSave.experience)) {
          throw new Error("Invalid format: Missing 'experience' array.");
        }
      } else {
        dataToSave = formData;
      }
      onSave(dataToSave);
      onClose();
    } catch (err: any) {
      setError("Invalid JSON format: " + err.message);
    }
  };

  // Saves without closing
  const handleQuickSave = () => {
    try {
      let dataToSave: ResumeData;
      if (editorMode === 'json') {
        dataToSave = JSON.parse(jsonContent);
        if (!dataToSave.experience || !Array.isArray(dataToSave.experience)) {
          throw new Error("Invalid format: Missing 'experience' array.");
        }
      } else {
        dataToSave = formData;
      }
      onSave(dataToSave);
      setSaveStatus('saved');
      setError(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setError("Cannot save invalid format: " + err.message);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset to the default base profile?")) {
      setFormData(BASE_RESUME);
      setJsonContent(JSON.stringify(BASE_RESUME, null, 2));
      setError(null);
      setSaveStatus('idle');
    }
  };

  const handleDownloadJson = () => {
    try {
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `role_architect_profile_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Cannot download invalid JSON. Please fix syntax errors first.");
    }
  };

  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
  };

  const extractDocxText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        extractedText = await extractPdfText(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await extractDocxText(file);
      } else if (file.type === 'application/json') {
         const text = await file.text();
         const parsed = JSON.parse(text);
         setFormData(parsed);
         setJsonContent(JSON.stringify(parsed, null, 2));
         setIsProcessing(false);
         if (fileInputRef.current) fileInputRef.current.value = '';
         return;
      } else {
         extractedText = await file.text();
      }

      if (extractedText) {
        const structuredData = await parseResumeFromText(extractedText);
        setFormData(structuredData);
        setJsonContent(JSON.stringify(structuredData, null, 2));
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to process file. Ensure it is a valid PDF, DOCX, or JSON file. " + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Form Field Helpers
  const updateContact = (key: keyof ResumeData['contact'], val: string) => {
    const updated = { ...formData, contact: { ...formData.contact, [key]: val } };
    handleFormChange(updated);
  };

  const updateWorkExp = (index: number, updatedExp: WorkExperience) => {
    const newExp = [...formData.experience];
    newExp[index] = updatedExp;
    handleFormChange({ ...formData, experience: newExp });
  };

  const addWorkExp = () => {
    const newExpItem: WorkExperience = {
      company: 'New Company',
      role: 'Cloud Role',
      duration: 'Present',
      bullets: ['Describe key technical achievement or architectural impact...']
    };
    handleFormChange({ ...formData, experience: [newExpItem, ...formData.experience] });
  };

  const removeWorkExp = (index: number) => {
    const newExp = formData.experience.filter((_, i) => i !== index);
    handleFormChange({ ...formData, experience: newExp });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl w-full max-w-5xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Source Base Profile Editor
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Modify the underlying career profile used for AI tailoring. Upload existing CV (PDF, DOCX) or edit directly.
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Mode Switcher & Toolbar */}
        <div className="px-6 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between flex-wrap gap-3">
          
          {/* Editor Tabs */}
          <div className="flex bg-neutral-900 p-1 rounded border border-neutral-800 text-xs">
            <button
              onClick={() => setEditorMode('form')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${editorMode === 'form' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              Visual Form Editor
            </button>
            <button
              onClick={() => setEditorMode('json')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${editorMode === 'json' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              Raw JSON Editor
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept=".json,.pdf,.docx,.txt" 
              onChange={handleFileUpload}
            />
            
            <Button 
              variant="secondary" 
              className={`!py-1.5 !px-3 !text-xs ${saveStatus === 'saved' ? '!text-green-400 !border-green-900/50 !bg-green-900/10' : ''}`}
              onClick={handleQuickSave}
              disabled={isProcessing}
            >
              {saveStatus === 'saved' ? '✓ Saved' : 'Save'}
            </Button>

            <Button 
              variant="secondary" 
              className="!py-1.5 !px-3 !text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? 'Parsing File...' : 'Upload CV / Resume'}
            </Button>

            <Button
              variant="secondary"
              className="!py-1.5 !px-3 !text-xs"
              onClick={handleDownloadJson}
              disabled={isProcessing}
            >
              Export JSON
            </Button>

            <Button 
              variant="outline" 
              className="!py-1.5 !px-3 !text-xs !border-neutral-700 hover:!bg-red-900/20 hover:!border-red-800 hover:!text-red-400"
              onClick={handleReset}
              disabled={isProcessing}
            >
              Reset Default
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-900 space-y-6">
          
          {editorMode === 'form' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Contact Information */}
              <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
                  Personal & Contact Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => handleFormChange({ ...formData, name: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.contact.email} 
                      onChange={(e) => updateContact('email', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={formData.contact.phone} 
                      onChange={(e) => updateContact('phone', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Location</label>
                    <input 
                      type="text" 
                      value={formData.contact.location} 
                      onChange={(e) => updateContact('location', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-neutral-400 block mb-1">LinkedIn Profile</label>
                    <input 
                      type="text" 
                      value={formData.contact.linkedin} 
                      onChange={(e) => updateContact('linkedin', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
                  Executive Summary
                </h3>
                <textarea 
                  value={formData.summary} 
                  onChange={(e) => handleFormChange({ ...formData, summary: e.target.value })}
                  className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded p-3 text-sm text-neutral-200 focus:outline-none focus:border-neutral-600 resize-none leading-relaxed"
                />
              </div>

              {/* Skills & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
                    Skills (Comma Separated)
                  </h3>
                  <textarea 
                    value={formData.skills.join(', ')} 
                    onChange={(e) => handleFormChange({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 resize-none"
                  />
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
                    Certifications (One per line)
                  </h3>
                  <textarea 
                    value={formData.certifications.join('\n')} 
                    onChange={(e) => handleFormChange({ ...formData, certifications: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 resize-none"
                  />
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Work Experience ({formData.experience.length} Roles)
                  </h3>
                  <Button variant="secondary" className="!py-1 !px-2.5 !text-xs" onClick={addWorkExp}>
                    + Add Role
                  </Button>
                </div>

                <div className="space-y-6">
                  {formData.experience.map((exp, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 p-4 rounded space-y-3 relative group">
                      <div className="flex justify-between items-start gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                          <input 
                            type="text" 
                            placeholder="Company Name"
                            value={exp.company} 
                            onChange={(e) => updateWorkExp(idx, { ...exp, company: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white font-bold"
                          />
                          <input 
                            type="text" 
                            placeholder="Role Title"
                            value={exp.role} 
                            onChange={(e) => updateWorkExp(idx, { ...exp, role: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white font-bold"
                          />
                          <input 
                            type="text" 
                            placeholder="Duration (e.g. 2021 - Present)"
                            value={exp.duration} 
                            onChange={(e) => updateWorkExp(idx, { ...exp, duration: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-neutral-400"
                          />
                        </div>
                        <button 
                          onClick={() => removeWorkExp(idx)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                          title="Delete Role"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Bullets */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Experience Bullets (One per line)</label>
                        <textarea 
                          value={exp.bullets.join('\n')}
                          onChange={(e) => updateWorkExp(idx, { ...exp, bullets: e.target.value.split('\n').filter(Boolean) })}
                          className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded p-2.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-600 resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {editorMode === 'json' && (
            <div className="h-full min-h-[450px] relative">
              <textarea
                value={jsonContent}
                onChange={handleJsonChange}
                spellCheck={false}
                readOnly={isProcessing}
                className={`w-full h-full min-h-[450px] bg-[#1e1e1e] text-neutral-300 font-mono text-xs p-6 resize-none focus:outline-none leading-relaxed custom-scrollbar ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center rounded-b-lg">
          <div className="text-red-400 text-xs font-medium">
            {error && <span className="flex items-center gap-2">⚠️ {error}</span>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>Close</Button>
            <Button onClick={handleSave} disabled={isProcessing}>Save & Close Profile</Button>
          </div>
        </div>

      </div>
    </div>
  );
};
