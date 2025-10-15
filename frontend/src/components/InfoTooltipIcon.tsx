import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface InfoTooltipIconProps {
    message: string;
    size?: number;
    color?: string;
}

const InfoTooltipIcon: React.FC<InfoTooltipIconProps> = ({
    message,
    size = 24,
    color = '#1976d2',
}) => {
    return (
        <Tooltip title={message} arrow>
            <IconButton
                disableRipple
                sx={{
                    width: size + 8,
                    height: size + 8,
                    backgroundColor: 'none',
                    padding: 0,
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
