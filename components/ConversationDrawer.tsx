import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCommentIcon from '@mui/icons-material/AddComment';
import SearchIcon from '@mui/icons-material/Search';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Conversation } from '../types';

interface ConversationDrawerProps {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onExportConversation: (id: string) => void;
  onClearOldConversations: () => void;
  onGenerateAvatar: () => void;
  isGeneratingAvatar: boolean;
}

const CONVERSATIONS_PAGE_SIZE = 25;

const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  open,
  onClose,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onExportConversation,
  onClearOldConversations,
  onGenerateAvatar,
  isGeneratingAvatar,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(CONVERSATIONS_PAGE_SIZE);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convoToDelete, setConvoToDelete] = useState<Conversation | null>(null);

  // State for clear old confirmation
  const [clearOldDialogOpen, setClearOldDialogOpen] = useState(false);

  // State for renaming
  const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    // If drawer closes, cancel any editing and clear search
    // If it opens, reset the visible count for lazy loading
    if (open) {
      setVisibleCount(CONVERSATIONS_PAGE_SIZE);
    } else {
      setEditingConvoId(null);
      setSearchTerm('');
    }
  }, [open]);

  // --- Delete Handlers ---
  const handleOpenDeleteDialog = (e: React.MouseEvent, convo: Conversation) => {
    e.stopPropagation();
    setConvoToDelete(convo);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConvoToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (convoToDelete) {
      onDeleteConversation(convoToDelete.id);
    }
    handleCloseDeleteDialog();
  };

  // --- Clear Old Handlers ---
  const handleOpenClearOldDialog = () => {
    setClearOldDialogOpen(true);
  };
  const handleCloseClearOldDialog = () => {
    setClearOldDialogOpen(false);
  };
  const handleConfirmClearOld = () => {
    onClearOldConversations();
    handleCloseClearOldDialog();
  };
  
  // --- Rename Handlers ---
  const handleStartEditing = (e: React.MouseEvent, convo: Conversation) => {
      e.stopPropagation();
      setEditingConvoId(convo.id);
      setEditingTitle(convo.title);
  };
  
  const handleCancelEditing = () => {
      setEditingConvoId(null);
      setEditingTitle('');
  };

  const handleSaveTitle = () => {
    if (editingConvoId && editingTitle.trim()) {
      onRenameConversation(editingConvoId, editingTitle.trim());
    }
    handleCancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // prevent form submission if any
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditing();
    }
  };

  const handleExport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onExportConversation(id);
  };

  const filteredConversations = conversations
    .filter(convo => convo.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);
  
  const isSearching = searchTerm.trim().length > 0;
  const conversationsToShow = isSearching
    ? filteredConversations
    : filteredConversations.slice(0, visibleCount);

  const canLoadMore = !isSearching && visibleCount < filteredConversations.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + CONVERSATIONS_PAGE_SIZE);
  };


  const drawerContent = (
    <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" component="h2">
          History
        </Typography>
        <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: '25px' }
            }}
          />
        <Button
            variant="outlined"
            startIcon={<AddCommentIcon />}
            onClick={onNewChat}
            fullWidth
          >
            New Chat
          </Button>
      </Box>
      <Divider />
       <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            startIcon={isGeneratingAvatar ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={onGenerateAvatar}
            disabled={isGeneratingAvatar}
            fullWidth
          >
            {isGeneratingAvatar ? 'Generating...' : 'Generate New Avatar'}
          </Button>
      </Box>
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {conversationsToShow.map((convo) => (
          <ListItem key={convo.id} disablePadding secondaryAction={
            editingConvoId !== convo.id ? (
              <Box>
                <Tooltip title="Export chat">
                  <IconButton edge="end" aria-label="export conversation" onClick={(e) => handleExport(e, convo.id)}>
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rename chat">
                  <IconButton edge="end" aria-label="rename conversation" onClick={(e) => handleStartEditing(e, convo)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete chat">
                  <IconButton edge="end" aria-label="delete conversation" onClick={(e) => handleOpenDeleteDialog(e, convo)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : null
          }>
            {editingConvoId === convo.id ? (
              <TextField
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                variant="standard"
                autoFocus
                fullWidth
                sx={{ px: 2, py: '7px' }}
                onClick={(e) => e.stopPropagation()} // Prevent list item click
              />
            ) : (
              <ListItemButton
                selected={convo.id === activeConversationId}
                onClick={() => onSelectConversation(convo.id)}
              >
                <ListItemText 
                  primary={convo.title}
                  primaryTypographyProps={{
                      noWrap: true,
                      sx: { fontWeight: convo.id === activeConversationId ? 'bold' : 'normal' }
                  }}
                />
              </ListItemButton>
            )}
          </ListItem>
        ))}
        {canLoadMore && (
            <ListItem disablePadding>
                <ListItemButton onClick={handleLoadMore} sx={{ justifyContent: 'center' }}>
                    <ListItemText primary="Load More" primaryTypographyProps={{ textAlign: 'center' }}/>
                </ListItemButton>
            </ListItem>
        )}
      </List>
       <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="text"
            startIcon={<DeleteSweepIcon />}
            onClick={handleOpenClearOldDialog}
            fullWidth
            sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none' }}
          >
            Clear chats older than 30 days
          </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
      >
        {drawerContent}
      </Drawer>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Conversation?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the conversation "{convoToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
       <Dialog
        open={clearOldDialogOpen}
        onClose={handleCloseClearOldDialog}
        aria-labelledby="alert-dialog-clear-old-title"
        aria-describedby="alert-dialog-clear-old-description"
      >
        <DialogTitle id="alert-dialog-clear-old-title">
          {"Clear Old Conversations?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-clear-old-description">
            This will permanently delete all conversations older than 30 days. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClearOldDialog}>Cancel</Button>
          <Button onClick={handleConfirmClearOld} color="error" autoFocus>
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConversationDrawer;