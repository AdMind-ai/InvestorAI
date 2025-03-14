import React from 'react';
import { Box, Typography, Link, Paper, Avatar } from '@mui/material';
import SadFace from '../assets/icons/sad-face.svg';
import HappyFace from '../assets/icons/happy-face.svg';
import NeutralFace from '../assets/icons/neutral-face.svg';

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
  sentiment: number;
  title: string;
  content: string;
  originalLink: string;
}

const NewsModal: React.FC<NewsModalProps> = ({
  open,
  onClose,
  sentiment,
  title,
  content,
  originalLink
}) => {

  const sentimentText =
    sentiment >= 60 ? 'Alto' : sentiment >= 40 ? 'Medio' : 'Basso';
  const sentimentColor =
    sentiment >= 60 ? '#4CAF50' : sentiment >= 40 ? '#FF9800' : '#F44336';
  const SentimentIcon = sentiment >= 60 ? HappyFace : sentiment >= 40 ? NeutralFace : SadFace;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0,0,0,0.4)',
        zIndex: 1300,
        display: open ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClose}
    >
      <Paper
        sx={{
          maxWidth: '900px',
          width: '90%',
          height: '500px',
          p: 2,
          overflowY: 'hidden',
          position: 'relative',
          bgcolor: 'white',
          borderRadius: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sentiment */}
        <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5, pl:1}}>
          <Avatar sx={{ bgcolor: 'transparent', mr: 0.5 }}>
            <img src={SentimentIcon} alt="Sentiment Icon" style={{ width: 25, height: 25 }} />
          </Avatar>
          <Typography variant="subtitle2" sx={{  }}>
            Sentiment medio{' '}
            <span style={{ color: sentimentColor, fontWeight: 'bold', fontSize: '1.1rem' }}>
              {sentiment}% • {sentimentText}
            </span>
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            px: 2,
            whiteSpace: 'nowrap',      
            overflow: 'hidden',       
            textOverflow: 'ellipsis', 
          }}
        >
          {title}
        </Typography>   

        {/* Content */}
        <Box 
          sx={{ 
            overflow: 'auto', 
            mt: 1, 
            height: 'calc(72%)', 
            paddingRight: 1,
            borderRadius: '12px',
            border: '1px solid #E4E4E4',
            padding: '12px',
          }}
        >
          <Typography variant="subtitle2" component="div" whiteSpace="pre-wrap">
            {content}
          </Typography>
        </Box>

        {/* Link */}
        <Box sx={{ position: 'absolute', bottom: '15px', left: '24px', fontSize: '1rem' }}>
          <Link href={originalLink} target="_blank">
            Vai all'articolo originale
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewsModal;