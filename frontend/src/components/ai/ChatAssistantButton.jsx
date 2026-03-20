import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

import { BASE_URL } from "../../api/config";

const BACKEND_URL = BASE_URL;

const ChatAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm the ShieldGig AI. I can help you analyze risk patterns, verify parametric triggers, or query specific claims. How can I assist you today?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) throw new Error('Failed to get response from AI');

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="flex-1 p-4 overflow-y-auto bg-[#0B0F19] space-y-4 scrollbar-hide">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-[#FF6B00] text-white border-[#FF8C42] rounded-tr-sm' 
                  : 'bg-[#111827] text-slate-200 border-[#1F2937] rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#111827] p-3 rounded-2xl rounded-tl-sm border border-[#1F2937] flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 size={14} className="animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-[#0F172A] rounded-b-2xl border-t border-[#1F2937]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className="w-full pl-4 pr-12 py-3 bg-[#111827] border border-[#1F2937] rounded-xl focus:ring-2 focus:ring-[#FF6B00] text-slate-100 text-sm outline-none transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-1.5 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8C42] disabled:opacity-50 disabled:hover:bg-[#FF6B00] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatAssistantButton;
