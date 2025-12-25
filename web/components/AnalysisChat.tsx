'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AnalysisChatProps {
  analysisId: number;
  initialContext?: string;
}

export function AnalysisChat({ analysisId, initialContext }: AnalysisChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I've analyzed your profile against this job. What would you like to know more about? I can help you understand:\n\n• Why certain skills are gaps\n• How to prioritize your learning\n• Specific next steps for improvement\n• Timeline to become job-ready\n• Alternative career paths\n\nWhat's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // For now, simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        role: 'assistant',
        content: `I understand you're asking about: "${input}"\n\nBased on your analysis results, here's my insight:\n\n[This would be the AI's response based on the analysis data and your question]`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What should I focus on first?",
    "How long will it take to be job-ready?",
    "What are the most important skills to learn?",
    "Can you explain my skill gaps in detail?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card className="border-purple-100 dark:border-purple-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Ask Questions About Your Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Quick questions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-purple-600 dark:hover:border-purple-600 transition-all text-sm text-slate-700 dark:text-slate-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 h-96 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      message.role === 'user'
                        ? 'bg-purple-100 dark:bg-purple-900/50'
                        : 'bg-blue-100 dark:bg-blue-900/50'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-blue-100 dark:bg-blue-900/50">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your analysis..."
              className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="self-end bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
