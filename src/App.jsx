import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, RefreshCw, Layers, History, LayoutDashboard } from 'lucide-react';

export default function App() {
  // Navigation State: 'converter' or 'history'
  const [activeTab, setActiveTab] = useState('converter');

  // File States: 'idle' | 'uploading' | 'processing' | 'ready'
  const [status, setStatus] = useState('idle'); 
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  
  // Target format state
  const [targetFormat, setTargetFormat] = useState('PDF');

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFileName(acceptedFiles[0].name);
      simulateFileUpload();
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  });

  // Simulator to mimic interaction with Kalyani's backend & system utilities
  const simulateFileUpload = () => {
    setStatus('uploading');
    setProgress(0);

    // Simulate uploading bar
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          // Transition immediately to backend processing state
          setStatus('processing');
          simulateProcessing();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const simulateProcessing = () => {
    // Hold processing message for 2.5 seconds (representing Pandoc/ImageMagick running)
    setTimeout(() => {
      setStatus('ready');
    }, 2500);
  };

  const resetConverter = () => {
    setStatus('idle');
    setProgress(0);
    setFileName('');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 px-2 py-4 border-b border-slate-700 mb-6">
            <Layers className="text-blue-400 w-6 h-6" />
            <span className="font-bold text-lg tracking-wide">FileMorph</span>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('converter')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'converter' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Converter App
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <History className="w-5 h-5" />
              Conversion History
            </button>
          </nav>
        </div>
        <div className="text-xs text-slate-500 border-t border-slate-800 pt-4 text-center">
          IIT Indore SoC 2026 • PS3
        </div>
      </aside>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold capitalize">{activeTab} Workspace</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500"></span>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
              
            </div>
          </div>
        </header>

        {/* WORKSPACE PAGES */}
        <div className="p-8 flex-1 flex items-center justify-center">
          
          {activeTab === 'converter' ? (
            /* CONVERTER VIEW */
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Convert Your Files</h2>
              <p className="text-center text-sm text-gray-500 mb-6">Securely convert your documents or images in real-time</p>

              {/* CONVERT TO PANEL (TARGET FORMAT SELECTOR) */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  Target Format:
                </label>
                <select 
                  value={targetFormat} 
                  onChange={(e) => setTargetFormat(e.target.value)}
                  disabled={status !== 'idle'}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 disabled:opacity-60"
                >
                  <optgroup label="Documents">
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="DOCX">DOCX (.docx)</option>
                    <option value="TXT">TXT (.txt)</option>
                  </optgroup>
                  <optgroup label="Images">
                    <option value="PNG">PNG (.png)</option>
                    <option value="JPG">JPG (.jpg)</option>
                    <option value="WEBP">WEBP (.webp)</option>
                  </optgroup>
                </select>
              </div>

              {/* IDLE DROPZONE STATE */}
              {status === 'idle' && (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-5/' : 'border-gray-300 hover:border-blue-500 bg-gray-50'}`}
                >
                  <input {...getInputProps()} />
                  <div className="p-4 bg-white rounded-full shadow-md mb-4 text-blue-500">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-base font-semibold mb-1">
                    {isDragActive ? "Drop your file right here!" : "Drag & drop your file here"}
                  </p>
                  <p className="text-xs text-gray-400">or click to browse local files</p>
                </div>
              )}

              {/* UPLOADING STATE */}
              {status === 'uploading' && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 truncate max-w-[70%]">{fileName}</span>
                    <span className="text-blue-600 font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-center text-gray-400">Uploading your file to secure servers...</p>
                </div>
              )}

              {/* PROCESSING STATE */}
              {status === 'processing' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-800">Converting your file to {targetFormat}...</h4>
                    <p className="text-xs text-gray-400 mt-1">ImageMagick & Pandoc operations are execution isolated</p>
                  </div>
                </div>
              )}

              {/* READY / DOWNLOAD STATE */}
              {status === 'ready' && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="p-3 bg-green-100 rounded-full text-green-600 mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-1">Conversion Successful!</h4>
                  <p className="text-sm text-gray-500 mb-6 truncate max-w-sm">{fileName} &rarr; <b>.{targetFormat.toLowerCase()}</b></p>
                  
                  <div className="flex gap-4 w-full">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-lg shadow-green-100">
                      Download Result
                    </button>
                    <button onClick={resetConverter} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors">
                      Convert Another
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* CONVERSION HISTORY TABLE VIEW */
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Your Conversion History Log</h3>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded font-medium border border-amber-200">
                  Files clear securely every 30 mins
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                      <th className="px-6 py-3">Original File</th>
                      <th className="px-6 py-3">Target Format</th>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-200 text-gray-600">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">quarterly_report.pdf</td>
                      <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">DOCX</span></td>
                      <td className="px-6 py-4 text-xs text-gray-400">Just now</td>
                      <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-semibold">Completed</span></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">profile_picture.jpg</td>
                      <td className="px-6 py-4"><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">PNG</span></td>
                      <td className="px-6 py-4 text-xs text-gray-400">14 mins ago</td>
                      <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-semibold">Completed</span></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">lecture_notes.docx</td>
                      <td className="px-6 py-4"><span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">TXT</span></td>
                      <td className="px-6 py-4 text-xs text-gray-400">28 mins ago</td>
                      <td className="px-6 py-4"><span className="text-red-500 bg-red-50 px-2 py-1 rounded-full text-xs font-semibold">Expired</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}