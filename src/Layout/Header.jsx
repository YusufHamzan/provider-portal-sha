import React from "react";
import { styled } from "@mui/material/styles";
import { IconButton, Typography } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import { drawerWidth } from "./index";
import { Avatar } from "primereact/avatar";
import { jwtDecode } from "jwt-decode";
import { useKeycloak } from "@react-keycloak/web";
import { Button } from "primereact/button";

const Header = ({ open, handleDrawerOpen }) => {
  const { keycloak } = useKeycloak();
  let token = window["getToken"] && window["getToken"]();
  const { name } = jwtDecode(token);

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  return (
    <AppBar position="fixed" open={open} color="default" elevation={0}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => handleDrawerOpen()}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: "none" }),
          }}
        >
          <MenuIcon sx={{ color: "#002776" }} />
        </IconButton>
        {/* <Typography variant="h6" noWrap component="div" >
          EOxegen
        </Typography>
        <Avatar icon="pi pi-user" size="normal" shape="circle" /> */}
        <Typography
          variant="body1"
          component="a"
          sx={{ flexGrow: 1, marginleft: 4, cursor: "pointer" }}
        >
          {name}
        </Typography>

        <Button
          onClick={() => {
            localStorage.clear();
            keycloak.logout();
          }}
        >
          <i className="pi pi-sign-out" style={{ marginRight: "0.5rem" }}></i>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
