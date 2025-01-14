import React, { useState } from 'react';
import { Conversation } from '../App.js';
import './ConversationList.css';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelect,
  onDelete,
  onRename
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleRenameStart = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleRenameSubmit = (id: string) => {
    if (editingTitle.trim()) {
      onRename(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="conversation-list">
      {conversations.map(conversation => (
        <div
          key={conversation.id}
          className={`conversation-item ${activeConversation === conversation.id ? 'active' : ''}`}
        >
          {editingId === conversation.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleRenameSubmit(conversation.id)}
              onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit(conversation.id)}
              autoFocus
            />
          ) : (
            <div className="conversation-title" onClick={() => onSelect(conversation.id)}>
              {conversation.title}
            </div>
          )}
          <div className="conversation-actions">
            <button onClick={() => handleRenameStart(conversation)}>
              Rename
            </button>
            <button onClick={() => onDelete(conversation.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;

