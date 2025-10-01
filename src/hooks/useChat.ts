import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  visitor_id: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedVisitorId = localStorage.getItem('visitor_id');
    if (storedVisitorId) {
      setVisitorId(storedVisitorId);
      loadConversation(storedVisitorId);
    } else {
      const newVisitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('visitor_id', newVisitorId);
      setVisitorId(newVisitorId);
    }
  }, []);

  const loadConversation = async (vid: string) => {
    try {
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('visitor_id', vid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convError) throw convError;

      if (conversations) {
        setConversationId(conversations.id);
        await loadMessages(conversations.id);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const createConversation = async (): Promise<string> => {
    const { data, error: convError } = await supabase
      .from('conversations')
      .insert({ visitor_id: visitorId })
      .select()
      .single();

    if (convError) throw convError;

    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        role,
        content,
      })
      .select()
      .single();

    if (msgError) throw msgError;

    return data;
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      let currentConvId = conversationId;

      if (!currentConvId) {
        currentConvId = await createConversation();
      }

      const userMessage = await saveMessage(currentConvId, 'user', content);
      setMessages(prev => [...prev, userMessage]);

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConvId);

      const allMessages = [...messages, { role: 'user', content }].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qwen-chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          conversationId: currentConvId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const assistantMessage = await saveMessage(
        currentConvId,
        'assistant',
        data.message
      );

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Није успело слање поруке. Молимо покушајте поново.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, messages, visitorId, isLoading]);

  const clearChat = useCallback(async () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}
