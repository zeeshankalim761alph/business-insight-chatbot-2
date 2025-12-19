import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Menu, Sparkles, PlusCircle } from 'lucide-react';
import DashboardSidebar from './components/DashboardSidebar';
import ChatMessage from './components/ChatMessage';
import { BusinessContext, ChatState, Industry, Message, Sender } from './types';
import { generateResponse } from './services/gemini';

const SAMPLE_QUESTIONS = [
  "Why are my sales decreasing?",
  "How can I reduce my operating costs?",
  "What is a good marketing strategy for my industry?",
  "Perform a SWOT analysis based on my numbers."
];

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [context, setContext] = useState<BusinessContext>({
    industry: Industry.RETAIL,
    monthlyRevenue: 15000,
    monthlyExpenses: 8000,
    customerCount: 450,
    trend: 'stable',
    goals: ''
  });

  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        text: "Hello! I'm your Business Insights Assistant. \n\nI can analyze your data and provide strategic advice. Update your business metrics in the sidebar for personalized insights, or just ask me a question to get started!",
        sender: Sender.BOT,
        timestamp: new Date()
      }
    ],
    isLoading: false
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isLoading]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));
    setInputValue('');

    try {
      const responseText = await generateResponse(chatState.messages, text, context);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: Sender.BOT,
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I encountered an error processing your request. Please ensure your API key is valid and try again.",
        sender: Sender.BOT,
        timestamp: new Date(),
        isError: true
      };
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }));
    }
  }, [chatState.messages, chatState.isLoading, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar - Settings & Context */}
      <DashboardSidebar 
        context={context} 
        onUpdateContext={setContext} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <h1 className="font-bold text-slate-800 text-lg tracking-tight">BizInsight AI</h1>
            </div>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Gemini 3 Flash
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-slate-50 scrollbar-hide">
          <div className="max-w-3xl mx-auto w-full pb-4">
            {chatState.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {chatState.isLoading && (
              <div className="flex w-full mb-6 justify-start">
                 <div className="flex max-w-[85%] md:max-w-[75%] gap-3 flex-row">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                        <Sparkles size={16} className="animate-pulse" />
                    </div>
                    <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-3xl mx-auto w-full space-y-4">
            
            {/* Quick Prompts - Only show if few messages */}
            {chatState.messages.length < 3 && !chatState.isLoading && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="flex-shrink-0 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Field */}
            <div className="relative flex items-end gap-2 bg-slate-100 p-2 rounded-xl border border-transparent focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hidden sm:block">
                <PlusCircle size={20} />
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for business insights..."
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 resize-none max-h-32 min-h-[44px] py-2.5 text-sm"
                rows={1}
                style={{ height: 'auto', minHeight: '44px' }}
                // Auto-resize hack
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
              <button 
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || chatState.isLoading}
                className={`p-2.5 rounded-lg transition-all ${
                  inputValue.trim() && !chatState.isLoading
                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-400">
              AI insights can be inaccurate. Always verify important financial decisions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;