import { useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatBlock() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Нешко _ Qwen</h1>
              <p className="text-sm text-slate-500">Питајте ме шта год желите</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Нови разговор
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Добродошли у Нешко _ Qwen
              </h2>
              <p className="text-slate-600 max-w-md">
                Започните разговор пишући поруку испод. Ту сам да вам помогнем са питањима и пружим подршку.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
                <button
                  onClick={() => sendMessage("Здраво! Како можете да ми помогнете?")}
                  className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <p className="text-sm font-medium text-slate-900">Почетак</p>
                  <p className="text-xs text-slate-500 mt-1">Здраво! Како можете да ми помогнете?</p>
                </button>
                <button
                  onClick={() => sendMessage("Шта можете да урадите?")}
                  className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <p className="text-sm font-medium text-slate-900">Сазнајте више</p>
                  <p className="text-xs text-slate-500 mt-1">Шта можете да урадите?</p>
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-t border-red-200 px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
