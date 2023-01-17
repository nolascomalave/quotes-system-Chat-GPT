import React from 'react';

// Components:
import Notification from './Notification';

// Material UI Components:
import { Tooltip, Button, Badge, Menu, List } from '@mui/material';

// Material Icons:
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function DropMenu({icon:Icon}){
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Notifications">
                <Button
                    onClick={handleClick}
                    className={`notification-button${anchorEl ? ' active' :''}`}
                >
                    <Badge>
                        <NotificationsIcon/>
                    </Badge>
                </Button>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                elevation: 0,
                sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
                },
                '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                },
                },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <List>
                    <Notification/>
                    <Notification/>
                </List>
            </Menu>
        </>
    );
}