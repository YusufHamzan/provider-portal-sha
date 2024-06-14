import React from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import { drawerWidth } from "./index";
import { Avatar } from "primereact/avatar";
import { jwtDecode } from "jwt-decode";
import { useKeycloak } from "@react-keycloak/web";
import { Button } from "primereact/button";
import { Logout } from "@mui/icons-material";

const Header = ({ open, handleDrawerOpen }) => {
  const { keycloak } = useKeycloak();
  // let token = window["getToken"] && window["getToken"]();
  // const { name } = jwtDecode(token);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const openSelect = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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

  const clientLogo = "/icons/sha_logo.svg";

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
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
          alignItems={"center"}
        >
          <Box style={{ width: "300px", height: "55px" }}>
            <img src={"/icons/sha_logo.svg"} alt="" />
          </Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            width={"10%"}
            alignItems={"center"}
          >
            <Typography
              variant="body1"
              component="a"
              sx={{ flexGrow: 1, marginleft: 4 }}
            >
              {/* {name} */}
            </Typography>
            <Box sx={{ marginLeft: "2%" }}>
              <Logout
              cursor={"pointer"}
                fontSize="small"
                onClick={() => {
                  localStorage.clear();
                  keycloak.logout();
                }}
              />
            </Box>
          </Box>
          {/* <Button
            onClick={() => {
              localStorage.clear();
              keycloak.logout();
            }}
          >
            <i className="pi pi-sign-out" style={{ marginRight: "0.5rem" }}></i>
            Logout
          </Button> */}
          {/* <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={openSelect}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
