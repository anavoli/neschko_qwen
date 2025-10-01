import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 bg-slate-50 p-4 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium text-slate-900 mb-1">Нешко _ Qwen</p>
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
