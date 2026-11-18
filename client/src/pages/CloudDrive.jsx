import React, { useState } from 'react';
import { 
  HardDrive, 
  Folder, 
  FileText, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Database,
  Cloud,
  Pencil,
  Trash2,
  X
} from 'lucide-react';

export default function CloudDrive({ driveFiles = [], onDeleteFile, onUpdateFile }) {
  const [activeFolder, setActiveFolder] = useState('ALL');
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const folders = [
    { id: 'ALL', name: 'All Cloud Files', count: driveFiles.length },
    { id: 'Invoices', name: 'Invoices & Billing', count: driveFiles.filter(f => f.folder_category === 'Invoices').length },
    { id: 'Stock-In-Vouchers', name: 'Stock-In Purchase Slips', count: driveFiles.filter(f => f.folder_category === 'Stock-In-Vouchers').length },
    { id: 'Stock-Out-Dispatches', name: 'Stock-Out Delivery Slips', count: driveFiles.filter(f => f.folder_category === 'Stock-Out-Dispatches').length },
  ];

  const filteredFiles = driveFiles.filter(f => {
    if (activeFolder === 'ALL') return true;
    return f.folder_category === activeFolder;
  });

  const totalKB = driveFiles.reduce((acc, f) => acc + (Number(f.file_size_kb) || 5.0), 0);

  const openEditModal = (f) => {
    setEditingFile(f);
    setEditName(f.file_name || '');
    setEditCategory(f.folder_category || 'Invoices');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('File name cannot be empty');
      return;
    }
    if (onUpdateFile) {
      onUpdateFile(editingFile.id, {
        file_name: editName.trim(),
        folder_category: editCategory
      });
    }
    setEditingFile(null);
  };

  const handleDeleteClick = (f) => {
    if (confirm(`Are you sure you want to remove "${f.file_name}" from Cloud Drive records?`)) {
      if (onDeleteFile) {
        onDeleteFile(f.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">DATA (Document Storage &amp; Records)</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          All customer invoices, stock receipts, and data files securely cataloged with edit &amp; delete controls.
        </p>
      </div>

      {/* Storage Gauge Card */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Cloud Storage Active
            </span>
            <h3 className="text-lg font-black tracking-tight">
              {totalKB.toFixed(1)} KB Used
            </h3>
            <p className="text-xs text-slate-300">
              High-efficiency document compression securely archives customer bills and operational records.
            </p>
          </div>

          <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 text-right">
            <span className="text-[11px] text-slate-400 block">System Status</span>
            <span className="text-sm font-bold text-emerald-400">Online &amp; Active</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: '0.05%' }}
          ></div>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFolder(f.id)}
            className={`p-3.5 rounded-xl border text-left transition flex items-center space-x-3 ${
              activeFolder === f.id
                ? 'bg-blue-50 border-blue-300 shadow-sm'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeFolder === f.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">{f.name}</p>
              <p className="text-[11px] text-slate-500">{f.count} documents</p>
            </div>
          </button>
        ))}
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand-600" /> Stored Vector PDFs &amp; Documents
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            All files strictly in KB
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filteredFiles.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              No files in this folder category yet.
            </div>
          ) : (
            filteredFiles.map((f) => (
              <div key={f.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{f.file_name}</p>
                    <p className="text-[11px] text-slate-400">
                      Category: {f.folder_category} • Created: {f.created_at || 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {f.file_size_kb || 5.4} KB
                  </span>

                  <a
                    href={f.web_view_link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition"
                  >
                    <span>View Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Edit File Name */}
                  <button
                    onClick={() => openEditModal(f)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                    title="Rename / Edit File"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Rename</span>
                  </button>

                  {/* Delete File */}
                  <button
                    onClick={() => handleDeleteClick(f)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit File Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-600" /> Rename Document
              </h3>
              <button onClick={() => setEditingFile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Invoices">Invoices &amp; Billing</option>
                  <option value="Stock-In-Vouchers">Stock-In Purchase Slips</option>
                  <option value="Stock-Out-Dispatches">Stock-Out Delivery Slips</option>
                  <option value="General">General Documents</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
