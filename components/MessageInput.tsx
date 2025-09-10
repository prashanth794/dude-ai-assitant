import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { Attachment } from '../types';

const DRAFT_KEY_PREFIX = 'dude-draft-';

interface AttachmentPreview extends Attachment {
  name: string;
  previewUrl: string;
}

interface MessageInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
  isChatInitialized: boolean;
  activeConversationId: string | null;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is "data:mime/type;base64,..."
      // we only want the part after the comma
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, isChatInitialized, activeConversationId }) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to LOAD draft when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      const draftKey = `${DRAFT_KEY_PREFIX}${activeConversationId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setInputText(savedDraft);
      } else {
        setInputText(''); // Clear input for convos with no draft
      }
      setAttachments([]); // Clear attachments when switching conversations
    } else {
      setInputText(''); // Clear input if no conversation is active
    }
  }, [activeConversationId]);

  // Effect to SAVE draft when text changes
  useEffect(() => {
    if (activeConversationId) {
      const draftKey = `${DRAFT_KEY_PREFIX}${activeConversationId}`;
      if (inputText) {
        localStorage.setItem(draftKey, inputText);
      } else {
        // Clean up storage by removing the key if the draft is empty
        localStorage.removeItem(draftKey);
      }
    }
  }, [inputText, activeConversationId]);
  
  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
        attachments.forEach(att => URL.revokeObjectURL(att.previewUrl));
    }
  }, [attachments]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const files = Array.from(event.target.files);
        const newAttachments: AttachmentPreview[] = await Promise.all(
            files.map(async file => ({
                name: file.name,
                mimeType: file.type,
                data: await fileToBase64(file),
                previewUrl: URL.createObjectURL(file),
            }))
        );
        setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (name: string) => {
    const attachmentToRemove = attachments.find(att => att.name === name);
    if(attachmentToRemove) {
        URL.revokeObjectURL(attachmentToRemove.previewUrl);
    }
    setAttachments(prev => prev.filter(att => att.name !== name));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasText = inputText.trim().length > 0;
    const hasAttachments = attachments.length > 0;
    if (hasText || hasAttachments) {
      const attachmentsToSend = attachments.map(({ mimeType, data }) => ({ mimeType, data }));
      onSendMessage(inputText, attachmentsToSend);
      setInputText('');
      setAttachments([]);
    }
  };

  const isDisabled = isLoading || !isChatInitialized;
  const placeholderText = !isChatInitialized 
    ? "Chat is unavailable." 
    : "What's on your mind, Asha?";

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', boxShadow: '0 -2px 5px -2px rgba(0,0,0,0.1)' }}>
      {attachments.length > 0 && (
        <Paper elevation={0} sx={{ p: 1, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: 'auto' }}>
            {attachments.map(att => (
                <Box key={att.name} sx={{ position: 'relative', width: '60px', height: '60px' }}>
                    <img 
                        src={att.previewUrl} 
                        alt={att.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <IconButton
                        size="small"
                        onClick={() => removeAttachment(att.name)}
                        sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            ))}
        </Paper>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <input 
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
        />
        <FormControl fullWidth variant="outlined">
          <OutlinedInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholderText}
            disabled={isDisabled}
            endAdornment={
                 <IconButton
                    aria-label="attach file"
                    edge="end"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDisabled}
                 >
                    <AttachFileIcon />
                 </IconButton>
            }
            sx={{
              borderRadius: '25px',
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          />
        </FormControl>
        <IconButton
          type="submit"
          color="primary"
          disabled={isDisabled || (!inputText.trim() && attachments.length === 0)}
          aria-label="Send message"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MessageInput;