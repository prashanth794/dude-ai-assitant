import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface CodeCopyButtonProps {
    code: string;
}

const CodeCopyButton: React.FC<CodeCopyButtonProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
        }).catch(err => {
            console.error('Failed to copy code: ', err);
        });
    };

    return (
        <Tooltip title={copied ? "Copied!" : "Copy code"} placement="top">
            <IconButton
                aria-label="copy code to clipboard"
                onClick={handleCopy}
                size="small"
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'grey.300',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                    },
                }}
            >
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
        </Tooltip>
    );
};

export default CodeCopyButton;
