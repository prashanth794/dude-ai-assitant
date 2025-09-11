import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import WorkIcon from '@mui/icons-material/Work';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import SpaIcon from '@mui/icons-material/Spa';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const priorities = [
  {
    icon: <WorkIcon color="primary" />,
    title: "Tailor resume for a Senior PM role",
    prompt: "I need to tailor my resume for a Senior Project Manager job description I have."
  },
  {
    icon: <StorefrontIcon color="primary" />,
    title: "Brainstorm marketing for 'olir' serum",
    prompt: "Let's brainstorm some marketing angles for the new 'olir' vitamin C serum."
  },
  {
    icon: <SelfImprovementIcon color="primary" />,
    title: "Take a 5-minute mindfulness break",
    prompt: "Guide me through a quick 5-minute mindfulness exercise to reset my focus."
  }
];

const toolkit = [
  {
    icon: <QuestionAnswerIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Interview Practice",
    description: "Let's run through some questions for an upcoming interview. Just give me the job description.",
    prompt: "Help me prepare for an interview.",
    buttonText: "Start Practice"
  },
  {
    icon: <StorefrontIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Visualize Product Idea",
    description: "Have a new idea for 'olir'? Describe it and I'll create a photorealistic mockup for you.",
    prompt: "Generate a product mockup for 'olir'.",
    buttonText: "Create Mockup"
  },
  {
    icon: <SelfImprovementIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Create a Mind Map",
    description: "Feeling overwhelmed or want to learn something new? I can structure any topic into a mind map.",
    prompt: "Create a mind map for me.",
    buttonText: "Map It Out"
  },
  {
    icon: <SpaIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Wellness Check-in",
    description: "Feeling overwhelmed or just need a moment? Let's check in on how you're doing.",
    prompt: "Let's do a wellness check-in.",
    buttonText: "Check In"
  }
];

interface HomeScreenProps {
    onStartChat: (prompt: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartChat }) => {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        animation: `${fadeIn} 0.8s ease-out`,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Good Morning, Asha
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here's your daily hub. What's our focus?
        </Typography>
      </Box>

      {/* Today's Focus Section */}
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
        Today's Focus
      </Typography>
      <Card sx={{ mb: 4, borderRadius: '16px' }}>
        <List sx={{ p: 0 }}>
          {priorities.map((item, index) => (
            <ListItem key={item.title} divider={index < priorities.length - 1}>
              <ListItemButton onClick={() => onStartChat(item.prompt)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Card>
      
      {/* Toolkit Section */}
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
        Your Toolkit
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {toolkit.map((tool) => (
          <Grid key={tool.title} xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: '16px',
              boxShadow: '0 4px_20px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>{tool.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {tool.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tool.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                <Button variant="contained" onClick={() => onStartChat(tool.prompt)}>
                  {tool.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomeScreen;