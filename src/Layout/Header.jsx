import React from "react";
import {
  Box,
  CssBaseline,
  IconButton,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import { drawerWidth } from "./index";
import ProfileSection from './ProfileSection'

const Header = ({ open, handleDrawerOpen }) => {

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <MuiAppBar position="fixed"
        open={open}
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#fffffa'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => handleDrawerOpen()}
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon sx={{ color: "#002776" }} />
          </IconButton>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            width={"100%"}
            alignItems={"center"}
          >
            <Box sx={{ flexGrow: 1, border: 1 }} >
              <img style={{ width: "300px", height: "50px" }} src={"/icons/sha_logo.svg"} alt="" />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <ProfileSection />
            </Box>
          </Box>
        </Toolbar>
      </MuiAppBar >
    </Box>
  );
};

export default Header;
