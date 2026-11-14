import React from 'react';
import { X, FileText } from 'lucide-react';

interface ExtractedTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
}

export const ExtractedTextModal: React.FC<ExtractedTextModalProps> = ({ isOpen, onClose, rawText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-zinc-900 text-base">Extracted PDF Plain Text</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto font-mono text-xs text-zinc-700 whitespace-pre-wrap bg-zinc-50/50 leading-relaxed">
          {rawText || 'No text extracted from PDF.'}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end bg-zinc-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};
