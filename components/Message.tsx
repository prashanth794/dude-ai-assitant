import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { keyframes } from '@emotion/react';
import { ChatMessage } from '../types';
import CodeCopyButton from './CodeCopyButton';


interface MessageProps {
  message: ChatMessage;
}

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;


const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const markdownComponents = {
    // Use MUI Typography for consistent text styling
    p: ({node, ...props}) => <Typography variant="body1" component="p" {...props} sx={{ whiteSpace: 'pre-wrap' }} />,
    li: ({node, ...props}) => <li style={{ margin: '4px 0' }}><Typography variant="body1" component="span" {...props} /></li>,
    a: ({node, ...props}) => <Link target="_blank" rel="noopener noreferrer" {...props} />,
    // Custom renderer for code blocks
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      return !inline && match ? (
        <Box sx={{ position: 'relative', my: 1, '& pre': { m: 0, borderRadius: '8px', p: '16px !important' } }}>
          <CodeCopyButton code={codeString} />
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <code 
            className={className} 
            {...props}
            style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                padding: '2px 4px',
                borderRadius: '4px',
                fontFamily: 'monospace'
            }}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: '10px 14px',
          maxWidth: '80%',
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: isUser
            ? '20px 20px 4px 20px'
            : '20px 20px 20px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          wordWrap: 'break-word',
          animation: `${isUser ? slideInFromRight : slideInFromLeft} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        }}
      >
        {message.attachments && message.attachments.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {message.attachments.map((att, index) => (
              <img
                key={index}
                src={`data:${att.mimeType};base64,${att.data}`}
                alt={`attachment ${index + 1}`}
                style={{
                  height: 'auto',
                  maxWidth: '150px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
            ))}
          </Box>
        )}
        {message.text && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.text}
          </ReactMarkdown>
        )}
        {message.sources && message.sources.length > 0 && (
          <Box sx={{ mt: 1.5, borderTop: 1, borderColor: isUser ? 'rgba(255,255,255,0.2)' : 'divider', pt: 1 }}>
            <Typography variant="caption" component="div" sx={{ mb: 0.5, color: isUser ? 'inherit' : 'text.secondary' }}>
              Sources:
            </Typography>
            <Box component="ul" sx={{ m: 0, p: 0, pl: 2 }}>
              {message.sources.map((source, index) => (
                <Typography component="li" variant="caption" key={index} sx={{ listStyleType: 'disc' }}>
                  <Link href={source.uri} target="_blank" rel="noopener noreferrer" underline="hover" color="inherit">
                    {source.title}
                  </Link>
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Message;