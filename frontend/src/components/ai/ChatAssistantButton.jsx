import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const ChatAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30 hover:scale-110 hover:shadow-orange-500/50 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Panel */}
      <div 
        className={`fixed bottom-6 right-6 w-80 md:w-96 bg-[#0F172A] rounded-2xl shadow-2xl border border-[#1F2937] z-50 transition-all duration-300 origin-bottom-right flex flex-col ${
          isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
        }`}
        style={{ height: '500px' }}
      >
        <div className="p-4 border-b border-[#1F2937] flex justify-between items-center bg-[#111827] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B00] p-2 rounded-xl text-white">
              <Bot size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-50">AI Assistant</h4>
              <p className="text-xs text-slate-400 font-medium">ShieldGig LLM Support</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-[#0B0F19] space-y-4">
          <div className="bg-[#111827] p-3 rounded-2xl rounded-tl-sm shadow-sm border border-[#1F2937] max-w-[85%] text-sm text-slate-200 leading-relaxed">
            Hello! I'm the ShieldGig AI. I can help you analyze risk patterns, verify parametric triggers, or query specific claims. How can I assist you today?
          </div>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-b-2xl border-t border-[#1F2937]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              className="w-full pl-4 pr-12 py-3 bg-[#111827] border border-[#1F2937] rounded-xl focus:ring-2 focus:ring-[#FF6B00] text-slate-100 text-sm outline-none"
            />
            <button className="absolute right-2 p-1.5 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8C42] transition-colors">
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
