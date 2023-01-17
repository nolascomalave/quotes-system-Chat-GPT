import React, {useContext, useState} from 'react';
import Link from 'next/link';

// SASS Colors:
// import { primary } from '../styles/vars.scss';

// Contexts:
import alertsContext from '../contexts/alertsContext';

// Material UI Components:
import { Avatar, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip } from '@mui/material';

// Material Icons:
import LogoutIcon from '@mui/icons-material/Logout';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export default function AccountMenu({removeSession}) {
  const {addAlert} = useContext(alertsContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Account settings" className="profile-button">
          <IconButton onClick={handleClick} >
              <Avatar style={{backgroundColor:'rgb(253,102,0)'}}>M</Avatar>
          </IconButton>
      </Tooltip>
      <Menu
        className="profile-menu"
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
        <Link href="/me">
          <a className="profile-list-button">
            <Avatar /> <p>Profile</p>
          </a>
        </Link>
        <Divider />
        <Link href="/security/change-password">
          <a className="profile-list-button icon">
            <LockOpenIcon /> <p>Change Password</p>
          </a>
        </Link>
        <button className="profile-list-button icon" onClick={()=> addAlert({
            type:'question',
            title: 'Are you sure to close session?',
            acceptButton:true,
            cancelButton:true,
            onAccept:()=> removeSession()
        })}>
          <LogoutIcon /> <p>Logout</p>
        </button>
      </Menu>

      {/*<style jsx global>{`@import '../styles/ProfileMenu';`}</style>*/}
    </>
  );
}