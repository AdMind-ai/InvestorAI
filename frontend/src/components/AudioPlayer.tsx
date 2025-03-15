import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, Paper, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';;
import PauseIcon from '@mui/icons-material/PauseRounded';
import downloadIcon from '../assets/icons/download-icon.svg';

interface AudioPlayerProps {
  src: string;
  audioTitle?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, audioTitle }) => {
  const theme = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = src;

    const onLoadedMetadata = () => setDuration(formatTime(audio.duration));
    const onTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(formatTime(audio.currentTime));
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
    setIsPlaying(prev => !prev);
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = src;
    link.target = '_blank';
    link.download = audioTitle || 'audio';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#F4F2F2',
        padding: '0px 8px',
        borderRadius: '12px',
        border: `1px solid #CBCBCB`,
        boxShadow: 'None',
        width: '100%',
        height: '56px',
      }}
    >
      <IconButton 
        onClick={togglePlayPause} 
        sx={{ '&:hover': { backgroundColor: 'transparent' }, p:0 }}
      >
        {isPlaying ? (
          <PauseIcon sx={{ color: theme.palette.secondary.main, fontSize: 35, p: 0 }} />
        ) : (
          <PlayArrowIcon sx={{ color: theme.palette.secondary.main, fontSize: 35, p: 0 }} />
        )}
      </IconButton>


      <Box sx={{ flexGrow: 1, mx: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: 'grey.300',
            '& .MuiLinearProgress-bar': { bgcolor: 'grey.800' },
          }}
        />
      </Box>

      <Typography variant="caption" sx={{ mx: 1 }}>
        {currentTime} / {duration}
      </Typography>

      <IconButton onClick={downloadAudio}>
        <img src={downloadIcon} alt="Download" width={18} height={18} />
      </IconButton>
    </Paper>
  );
};

function formatTime(seconds: number) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

export default AudioPlayer;