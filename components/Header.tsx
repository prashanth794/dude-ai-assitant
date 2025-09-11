import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import DarkModeSwitch from './DarkModeSwitch';

interface HeaderProps {
  onMenuClick: () => void;
  onHomeClick: () => void;
  title: string;
  avatarUrl: string;
  isVoiceModeEnabled: boolean;
  onToggleVoiceMode: () => void;
  themeMode: 'light' | 'dark';
  onThemeChange: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onHomeClick, title, avatarUrl, isVoiceModeEnabled, onToggleVoiceMode, themeMode, onThemeChange }) => {
  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open conversation history"
          onClick={onMenuClick}
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>
        <Box 
          onClick={onHomeClick}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1, overflow: 'hidden', minWidth: 0 }}
        >
            <Avatar 
                alt="Dude AI Assistant" 
                src={avatarUrl} 
                sx={{ mr: 2, bgcolor: 'primary.main' }}
            />
            <Typography variant="h6" component="h1" fontWeight="bold" noWrap>
                {title}
            </Typography>
        </Box>
        <Tooltip title={themeMode === 'light' ? "Switch to dark mode" : "Switch to light mode"}>
            <DarkModeSwitch isDarkMode={themeMode === 'dark'} onToggle={onThemeChange} />
        </Tooltip>
        <Tooltip title={isVoiceModeEnabled ? "Disable voice conversation" : "Enable voice conversation"}>
            <IconButton
                onClick={onToggleVoiceMode}
                color="inherit"
                aria-label={isVoiceModeEnabled ? "disable voice conversation" : "enable voice conversation"}
            >
                {isVoiceModeEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Header;