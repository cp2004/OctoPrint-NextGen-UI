import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import create from 'zustand';

type ConfirmDialogStore = {
    title: string;
    message: string;
    onSubmit?: () => void;
    close: () => void;
};

const useConfirmDialogStore = create<ConfirmDialogStore>((set) => ({
    title: '',
    message: '',
    onSubmit: undefined,
    close: () => set({ onSubmit: undefined }),
}));

export const confirmDialog = (title: string, message: string, onSubmit: () => void) => {
    useConfirmDialogStore.setState({
        title,
        message,
        onSubmit,
    });
};


const ConfirmDialog = () => {
    const { title, message, onSubmit, close } = useConfirmDialogStore();
    return (
        <Dialog open={Boolean(onSubmit)} onClose={close} maxWidth="sm" fullWidth>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <DialogTitle>{title}</DialogTitle>
                <IconButton onClick={close}>
                    <Close />
                </IconButton>
            </Box>
            <DialogContent>
                {message}
            </DialogContent>
            <DialogActions>
                <Button color="primary" variant="contained" onClick={close}>
                    Cancel
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                        if (onSubmit) {
                            onSubmit();
                        }
                        close();
                    }}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
