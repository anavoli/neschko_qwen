import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? 'bg-slate-50' : 'bg-white'} p-4 rounded-lg`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAssistant ? 'bg-blue-600' : 'bg-slate-700'
      }`}>
        {isAssistant ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium text-slate-900 mb-1">
          {isAssistant ? 'Нешко _ Qwen' : 'Ви'}
        </p>
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
