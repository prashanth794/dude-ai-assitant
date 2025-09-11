import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import EventIcon from '@mui/icons-material/Event';

import { CalendarEventData } from '../types';

interface CalendarEventCardProps {
  data: CalendarEventData;
}

// Helper to format date for display
const formatDisplayDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Helper to format date for calendar URLs (YYYYMMDDTHHMMSSZ)
const formatIsoForCalendar = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d{3}/g, '');
};


const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ data }) => {
  const { title, startTime, duration } = data;
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const handleGoogleCalendar = () => {
    const gCalUrl = new URL('https://www.google.com/calendar/render');
    gCalUrl.searchParams.append('action', 'TEMPLATE');
    gCalUrl.searchParams.append('text', title);
    gCalUrl.searchParams.append('dates', `${formatIsoForCalendar(startDate)}/${formatIsoForCalendar(endDate)}`);
    gCalUrl.searchParams.append('details', 'Event created by Dude AI Assistant');
    window.open(gCalUrl.toString(), '_blank');
  };
  
  const generateIcsContent = (): string => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@dude-ai`,
      `DTSTAMP:${formatIsoForCalendar(new Date())}`,
      `DTSTART:${formatIsoForCalendar(startDate)}`,
      `DTEND:${formatIsoForCalendar(endDate)}`,
      `SUMMARY:${title}`,
      'DESCRIPTION:Event created by Dude AI Assistant',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsData)}`;
  }
  
  return (
    <Paper
      elevation={2}
      sx={{
        my: 1,
        p: 2,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <EventIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {formatDisplayDate(startDate)}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
        <Button variant="contained" size="small" onClick={handleGoogleCalendar}>
          Add to Google
        </Button>
        <Button 
            variant="outlined" 
            size="small"
            href={generateIcsContent()}
            download={`${title.replace(/[^a-z0-9]/gi, '_')}.ics`}
        >
          Add to Apple/Other
        </Button>
      </Box>
    </Paper>
  );
};

export default CalendarEventCard;