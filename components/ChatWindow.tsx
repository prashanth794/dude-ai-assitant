import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { ChatMessage } from '../types';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smoothly scroll to the bottom when new messages are added or loading state changes.
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const showLoading = isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user';

  return (
    <Box
      ref={scrollContainerRef}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {showLoading && <LoadingIndicator />}
      {/* This empty div is the target for our smooth scroll */}
      <div ref={bottomRef} />
    </Box>
  );
};

export default ChatWindow;