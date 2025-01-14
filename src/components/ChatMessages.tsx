import React from 'react';
import { Message } from '../App.js';
import './ChatMessages.css';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoading, 
  error, 
  messagesEndRef 
}) => {
  return (
    <div className="chat-messages">
      {messages.map(message => (
        <div 
          key={message.id} 
          className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
        >
          <div className="message-content">
            {message.content}
          </div>
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="message assistant-message">
          <div className="loading-indicator">Thinking...</div>
        </div>
      )}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;

