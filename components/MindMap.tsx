import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { MindMapNode } from '../types';

interface MindMapNodeProps {
  node: MindMapNode;
  isRoot?: boolean;
}

const StyledList = styled('ul')({
  listStyle: 'none',
  paddingLeft: '24px',
  margin: 0,
  position: 'relative',
});

const StyledListItem = styled('li')({
  position: 'relative',
  padding: '4px 0 4px 20px',
  // Creates the vertical line connecting siblings
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    borderLeft: '1px solid #ccc',
    height: '100%',
  },
  // Creates the horizontal line connecting to the parent
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '16px',
    left: 0,
    borderTop: '1px solid #ccc',
    width: '16px',
  },
  // Remove vertical line from the last item
  '&:last-child::before': {
    height: '16px',
  },
});

const MindMapNodeComponent: React.FC<MindMapNodeProps> = ({ node, isRoot = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const NodeContent = (
    <Box sx={{ display: 'flex', alignItems: 'center', cursor: hasChildren ? 'pointer' : 'default' }} onClick={hasChildren ? handleToggle : undefined}>
      {hasChildren && (
        <IconButton size="small" sx={{ p: 0.5, mr: 0.5 }}>
          {isOpen ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
        </IconButton>
      )}
      <Typography 
        variant="body1" 
        component="span" 
        sx={{ 
            fontWeight: isRoot ? 'bold' : 'normal',
            pl: hasChildren ? 0 : '28px' // Align text if no icon
        }}
    >
        {node.title}
      </Typography>
    </Box>
  );

  return (
    <>
      {isRoot ? NodeContent : <StyledListItem>{NodeContent}</StyledListItem>}
      {hasChildren && isOpen && (
        <StyledList>
          {node.children?.map((child, index) => (
            <MindMapNodeComponent key={index} node={child} />
          ))}
        </StyledList>
      )}
    </>
  );
};

const MindMap: React.FC<{ data: MindMapNode }> = ({ data }) => {
  return (
    <Box sx={{ my: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'action.hover' }}>
      <MindMapNodeComponent node={data} isRoot />
    </Box>
  );
};

export default MindMap;
