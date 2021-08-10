import React, { useEffect,useState } from "react";
import { Redirect } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { SidebarContainer } from "./Sidebar";
import { ActiveChat } from "./ActiveChat";
import { logout, fetchConversations } from "../store/utils/thunkCreators";
import { clearOnLogout } from "../store/index";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() =>({
  root: {
    height: "97vh",
  },
}));

const Home = () => {
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() =>{
    if (user.id){
      setIsLoggedIn(true);
    }
  },[user])

  useEffect(() => {
    dispatch(fetchConversations());
  },[dispatch]);

  const handleLogout = async () => {
    dispatch(logout(user.id));
    dispatch(clearOnLogout());
  }
  if (!user.id){
    if (isLoggedIn) return <Redirect to="/login" />;
    return <Redirect to="/register" />;
  }
  return (
    <>
      {/* logout button will eventually be in a dropdown next to username */}
      <Button className={classes.logout} onClick={handleLogout}>
        Logout
      </Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer />
        <ActiveChat />
      </Grid>
    </>
  );
}

export default Home;
