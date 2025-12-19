import React from 'react';
import { Message, Sender } from '../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.BOT;

  // Simple formatter to handle bold text and newlines from Markdown-like responses
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
        // Simple bold parsing: **text** -> <b>text</b>
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <div key={i} className={`${line.trim().startsWith('-') ? 'pl-4' : 'min-h-[1.2rem]'}`}>
                {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{part}</span>;
                })}
            </div>
        );
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
        }`}>
          {isBot ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isBot 
              ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'
          }`}>
             {message.isError ? (
                <span className="text-red-500">{message.text}</span>
             ) : (
                <div className="space-y-1">
                    {formatText(message.text)}
                </div>
             )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </div>
  );
};

export default ChatMessage;