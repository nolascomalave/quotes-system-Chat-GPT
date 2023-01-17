import React from 'react';
import Link from 'next/link';

// Material UI Components:
import {ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Typography} from '@mui/material';

const Notification=()=>{
    return (
        <Link href="/">
            <a className="link">
                <ListItemButton className="notification">
                    <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                        </ListItemAvatar>
                        <ListItemText
                            primary="Brunch this weekend?"
                            secondary={
                                <React.Fragment>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Ali Connors
                                    </Typography>
                                    {" — I'll be in your neighborhood doing errands this…"}
                                </React.Fragment>
                            }
                        />
                    </ListItem>
                </ListItemButton>
            </a>
        </Link>
    );
};

export default Notification;