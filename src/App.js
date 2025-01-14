import React, { useState, useEffect, useRef } from 'react';
import ChatMessages from './components/ChatMessages.tsx';
import ChatInput from './components/ChatInput.tsx';
import ConversationList from './components/ConversationaList.tsx';
import './App.css';

const App = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations]);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
      messages: []
    };
    setConversations((prev) => [...prev, newConversation]);
    setActiveConversation(newConversation.id);
  };

  const deleteConversation = (id) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
  };

  const renameConversation = (id, newTitle) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  const handleSendMessage = async (content) => {
    if (!activeConversation || !content.trim()) return;

    setError(null);
    setIsLoading(true);

    const userMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now()
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    try {
      const currentConversation = conversations.find(
        (c) => c.id === activeConversation
      );
      const conversationHistory =
        currentConversation?.messages.map((m) => ({
          role: m.role,
          content: m.content
        })) || [];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_API_KEY`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [...conversationHistory, { role: 'user', content }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const data = await response.json();
      const assistantMessage = {
        id: Date.now().toString(),
        content: data.choices[0].message.content,
        role: 'assistant',
        timestamp: Date.now()
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv
        )
      );
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app ${isDarkTheme ? 'dark-theme' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewConversation}>
            New Chat
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelect={setActiveConversation}
          onDelete={deleteConversation}
          onRename={renameConversation}
        />
      </aside>
      <main className="main-content">
        {activeConversation ? (
          <>
            <ChatMessages
              messages={
                conversations.find((c) => c.id === activeConversation)?.messages ||
                []
              }
              isLoading={isLoading}
              error={error}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </>
        ) : (
          <div className="welcome-screen">
            <h1>Welcome to ChatBot</h1>
            <p>Start a new conversation or select an existing one.</p>
            <button className="new-chat-btn" onClick={createNewConversation}>
              Start New Chat
            </button>
          </div>
        )}
      </main>
      <div className="theme-toggle">
        <button onClick={toggleTheme}>
          {isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        </button>
      </div>
    </div>
  );
};

export default App;
