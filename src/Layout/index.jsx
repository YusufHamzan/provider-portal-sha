import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from './Sidebar';
import Header from './Header';

export const drawerWidth = 240;


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));


export default function Layout({ children }) {
  const [open, setOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);


  const handleDrawerClose = () => {
    setIsClosing(true);
    setOpen(false);
  };

  const handleDrawerToggle = () => {
    // if (!isClosing) {
    setOpen(!open);
    // }
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header open={open} handleDrawerOpen={handleDrawerToggle} />
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} handleDrawerTransitionEnd={handleDrawerTransitionEnd} />
      <Box component="main" sx={{ flexGrow: 1, p: 2, width: `calc(100% - ${drawerWidth}px)` }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
