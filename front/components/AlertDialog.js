import * as React from 'react';

// Material UI Components:
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function AlertDialog({open, title, description, handleClose, handleAccept, denyText, acceptText}) {
  return (
    <Dialog
        className="dialog"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
    <DialogTitle id="alert-dialog-title">
        {title}
    </DialogTitle>
    {description && (
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {description}
            </DialogContentText>
        </DialogContent>
    )}
    <DialogActions>
        {denyText && (
            <button onClick={handleClose} autoFocus>
                {denyText}
            </button>
        )}
        {acceptText && (
            <button onClick={handleAccept} autoFocus>
                {acceptText}
            </button>
        )}
    </DialogActions>
    </Dialog>
  );
}