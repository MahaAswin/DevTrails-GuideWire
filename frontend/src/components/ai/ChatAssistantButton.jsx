import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const ChatAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-110 hover:shadow-indigo-600/50 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Panel */}
      <div 
        className={`fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 origin-bottom-right flex flex-col ${
          isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
        }`}
        style={{ height: '500px' }}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Bot size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">AI Assistant</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">ShieldGig LLM Support</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700 max-w-[85%] text-sm dark:text-slate-200 leading-relaxed">
            Hello! I'm the ShieldGig AI. I can help you analyze risk patterns, verify parametric triggers, or query specific claims. How can I assist you today?
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-b-2xl border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm outline-none"
            />
            <button className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">LLM logic placeholder. Not connected to backend yet.</p>
        </div>
      </div>
    </>
  );
};

export default ChatAssistantButton;
