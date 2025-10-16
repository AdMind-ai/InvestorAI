import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface InfoTooltipIconProps {
    message: string;
    size?: number;
    color?: string;
    bottom?: number;
}

const InfoTooltipIcon: React.FC<InfoTooltipIconProps> = ({
    message,
    size = 24,
    color = '#1976d2',
    bottom = 0,
}) => {
    return (
        <Tooltip
            title={message}
            arrow
            slotProps={{
                tooltip: {
                    sx: {
                        fontSize: '14px', 
                        maxWidth: 260, 
                    },
                },
            }}
        >
            <IconButton
                disableRipple
                sx={{
                    width: size + 8,
                    height: size + 8,
                    backgroundColor: 'none',
                    padding: 0,
                    bottom: bottom,
                    '&:hover': {
                        backgroundColor: 'none',
                    },
                }}
            >
                <InfoOutlinedIcon sx={{ fontSize: size, color }} />
            </IconButton>
        </Tooltip>
    );
};

export default InfoTooltipIcon;
