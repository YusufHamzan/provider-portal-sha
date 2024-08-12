import React from "react";
import {
  Box,
  CssBaseline,
  IconButton,
  Typography,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import { drawerWidth } from "./index";
import ProfileSection from './ProfileSection'
import { useKeycloak } from "@react-keycloak/web";


const Header = ({ open, handleDrawerOpen }) => {
  const { keycloak } = useKeycloak()
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
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon sx={{ color: "#002776" }} />
          </IconButton>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            width={"100%"}
            alignItems={"center"}
          >
              <Typography sx={{fontSize:"24px", fontFamily:"monospace", color:"#000", fontWeight:"bold"}}>TORUS</Typography>
            <Box sx={{ flexGrow: 1 }} >
              {/* <img style={{ height: "50px" }} src={"https://aar-insurance.com/media/2023/05/aar-insurance-high-res-logo.png"} alt="" /> */}
              {/* <img style={{ width: "300px", height: "50px" }} src={"/icons/sha_logo.svg"} alt="" /> */}
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <ProfileSection logout={() => keycloak.logout()} />
            </Box>
          </Box>
        </Toolbar>
      </MuiAppBar >
    </Box>
  );
};

export default Header;
