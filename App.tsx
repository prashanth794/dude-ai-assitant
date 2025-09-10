
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { ChatMessage, Conversation, Attachment, Source } from './types';
import { initializeApi, sendMessageToDudeStream, generateTitleForChat, generateAvatar } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import ConversationDrawer from './components/ConversationDrawer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7e57c2',
      dark: '#673ab7',
      light: '#d1c4e9',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const CONVERSATIONS_KEY = 'dude-conversations';
const CHAT_HISTORY_KEY = 'dude-chat-history'; // Old key for migration
const AVATAR_KEY = 'dude-avatar-url';


const createNewConversation = (): Conversation => {
  const initialMessage: ChatMessage = {
    id: 'initial-message',
    text: "Hey Asha, It's me, Dude!",
    sender: 'ai',
  };
  return {
    id: `convo-${Date.now()}`,
    title: 'New Chat',
    messages: [initialMessage],
    createdAt: Date.now(),
  };
};


const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiInitialized, setIsApiInitialized] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('/icon-192.png');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState<boolean>(false);


  useEffect(() => {
    const initialized = initializeApi();
    setIsApiInitialized(initialized);

    // Load avatar from local storage
    const savedAvatar = localStorage.getItem(AVATAR_KEY);
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }


    if (initialized) {
      try {
        const savedConversations = localStorage.getItem(CONVERSATIONS_KEY);
        if (savedConversations) {
          const parsed = JSON.parse(savedConversations) as Conversation[];
          setConversations(parsed);
           if (parsed.length > 0) {
            setActiveConversationId(parsed.sort((a, b) => b.createdAt - a.createdAt)[0].id);
           } else {
             const newConvo = createNewConversation();
             setConversations([newConvo]);
             setActiveConversationId(newConvo.id);
           }
        } else {
          // Migration from old format or start fresh
          const oldHistory = localStorage.getItem(CHAT_HISTORY_KEY);
          if (oldHistory) {
            const oldMessages = JSON.parse(oldHistory);
            if (oldMessages.length > 1) { // Only migrate if there's more than the initial message
              const migratedConvo: Conversation = {
                id: `migrated-${Date.now()}`,
                title: 'Previous Chat',
                messages: oldMessages,
                createdAt: Date.now()
              };
              setConversations([migratedConvo]);
              setActiveConversationId(migratedConvo.id);
              localStorage.removeItem(CHAT_HISTORY_KEY);
            } else {
                const newConvo = createNewConversation();
                setConversations([newConvo]);
                setActiveConversationId(newConvo.id);
            }
          } else {
            const newConvo = createNewConversation();
            setConversations([newConvo]);
            setActiveConversationId(newConvo.id);
          }
        }
      } catch (e) {
        console.error("Failed to load or parse messages from localStorage", e);
        const newConvo = createNewConversation();
        setConversations([newConvo]);
        setActiveConversationId(newConvo.id);
      }
    } else {
       const errorConvo = createNewConversation();
       errorConvo.messages.push({
          id: 'error-message',
          text: "G'day! I seem to be having trouble connecting. Please ensure the API Key is configured correctly. I can't start my engine without it!",
          sender: 'ai',
       });
       setConversations([errorConvo]);
       setActiveConversationId(errorConvo.id);
       setError("Chat service not initialized. API Key might be missing.");
    }
  }, []);

  useEffect(() => {
    if (isApiInitialized && conversations.length > 0) {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }
  }, [conversations, isApiInitialized]);

  const handleNewChat = useCallback(() => {
    if (isLoading) return;
    const newConvo = createNewConversation();
    setConversations(prev => [newConvo, ...prev]);
    setActiveConversationId(newConvo.id);
    setDrawerOpen(false);
  }, [isLoading]);
  
  const handleSelectConversation = useCallback((id: string) => {
    if (isLoading) return;
    setActiveConversationId(id);
    setDrawerOpen(false);
  }, [isLoading]);

  const handleDeleteConversation = useCallback((id: string) => {
    if (isLoading) return;
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    
    // Also remove any lingering draft for the deleted conversation
    localStorage.removeItem(`dude-draft-${id}`);

    if (activeConversationId === id) {
        if (remaining.length > 0) {
            setActiveConversationId(remaining.sort((a,b) => b.createdAt - a.createdAt)[0].id);
        } else {
            const newConvo = createNewConversation();
            setConversations([newConvo]);
            setActiveConversationId(newConvo.id);
        }
    }
  }, [isLoading, activeConversationId, conversations]);

  const handleRenameConversation = useCallback((id: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, title: newTitle } : c)
    );
  }, []);

  const handleClearOldConversations = useCallback(() => {
    if (conversations.length <= 1) return; // Don't clear if there's only one or zero conversations

    const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
    const cutoffDate = Date.now() - thirtyDaysInMillis;

    const oldConversations = conversations.filter(c => c.createdAt < cutoffDate);
    if (oldConversations.length === 0) return; // No old conversations to clear

    let conversationsToKeep = conversations.filter(c => c.createdAt >= cutoffDate);

    // If clearing old conversations would leave the list empty,
    // keep the single most recent one regardless of its age.
    if (conversationsToKeep.length === 0) {
        const sorted = [...conversations].sort((a, b) => b.createdAt - a.createdAt);
        conversationsToKeep = [sorted[0]];
    }

    setConversations(conversationsToKeep);

    // If the active conversation was deleted, switch to the newest remaining one
    const activeConvoStillExists = conversationsToKeep.some(c => c.id === activeConversationId);
    if (!activeConvoStillExists && conversationsToKeep.length > 0) {
        const newest = conversationsToKeep.sort((a, b) => b.createdAt - a.createdAt)[0];
        setActiveConversationId(newest.id);
    }
  }, [conversations, activeConversationId]);

  const handleGenerateAvatar = async () => {
    if (isGeneratingAvatar || !isApiInitialized) return;
    setIsGeneratingAvatar(true);
    setError(null);
    try {
        const newAvatarDataUrl = await generateAvatar();
        setAvatarUrl(newAvatarDataUrl);
        localStorage.setItem(AVATAR_KEY, newAvatarDataUrl);
        setDrawerOpen(false); // Close drawer on success
    } catch (e: any) {
        console.error("Failed to generate avatar", e);
        setError(e.message || "Could not generate a new avatar right now.");
    } finally {
        setIsGeneratingAvatar(false);
    }
  };


  const handleSendMessage = useCallback(async (inputText: string, attachments?: Attachment[]) => {
    if (isLoading || (!inputText.trim() && !attachments?.length) || !isApiInitialized || !activeConversationId) return;

    const activeConvo = conversations.find(c => c.id === activeConversationId);
    if (!activeConvo) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      attachments,
    };

    setIsLoading(true);
    setError(null);
    
    // Immediately add user message and a placeholder for the AI response
    const aiMessageId = (Date.now() + 1).toString();
    const placeholderAiMessage: ChatMessage = { id: aiMessageId, text: '', sender: 'ai' };
    const updatedMessages = [...activeConvo.messages, userMessage, placeholderAiMessage];
    setConversations(conversations.map(c => 
      c.id === activeConversationId ? { ...c, messages: updatedMessages } : c
    ));
    
    // Generate title in the background without blocking the chat response
    if (activeConvo.messages.length === 1) {
      const titlePrompt = inputText || "Image Analysis";
      generateTitleForChat(titlePrompt).then(title => {
        setConversations(prev => prev.map(c => 
          c.id === activeConversationId ? { ...c, title } : c
        ));
      });
    }

    // FIX: The file was truncated here. The line is completed and the rest of the function is added.
    const historyForApi = activeConvo.messages;
    
    try {
      const stream = sendMessageToDudeStream(inputText, historyForApi, attachments);
      
      let fullResponseText = '';
      
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponseText += chunk.text;
          setConversations(prev => {
            return prev.map(c => {
              if (c.id === activeConversationId) {
                const newMessages = c.messages.map(m => 
                  m.id === aiMessageId ? { ...m, text: fullResponseText } : m
                );
                return { ...c, messages: newMessages };
              }
              return c;
            });
          });
        }
        
        if (chunk.sources && chunk.sources.length > 0) {
           setConversations(prev => {
            return prev.map(c => {
              if (c.id === activeConversationId) {
                const newMessages = c.messages.map(m => 
                  m.id === aiMessageId ? { ...m, sources: chunk.sources } : m
                );
                return { ...c, messages: newMessages };
              }
              return c;
            });
          });
        }
      }
    } catch (e: any) {
        console.error("Failed to send message", e);
        const errorMessage = e.message || "Apologies, I've hit a snag. Could you try that again?";
        setError(errorMessage);
        setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return {
                    ...c,
                    messages: c.messages.map(m => m.id === aiMessageId ? { ...m, text: errorMessage } : m)
                };
            }
            return c;
        }));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isApiInitialized, activeConversationId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'row' }}>
        <ConversationDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onClearOldConversations={handleClearOldConversations}
          onGenerateAvatar={handleGenerateAvatar}
          isGeneratingAvatar={isGeneratingAvatar}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
          <Header
            onMenuClick={() => setDrawerOpen(true)}
            title={activeConversation?.title || 'New Chat'}
            avatarUrl={avatarUrl}
          />
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <ChatWindow
              messages={activeConversation?.messages ?? []}
              isLoading={isLoading}
            />
          </Box>
          {error && <Box sx={{ p: 2, bgcolor: 'error.main', color: 'white' }}>{error}</Box>}
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isChatInitialized={isApiInitialized}
            activeConversationId={activeConversationId}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;