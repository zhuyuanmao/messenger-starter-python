import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  unreadPreviewText: {
    fontSize: 12,
    color: "#212121",
    letterSpacing: -0.17,
    fontWeight: "bold",
  }
}));

const ChatContent = (props) => {
  const classes = useStyles();
  const { conversation } = props;
  const { latestMessageText, otherUser } = conversation;
  const user = useSelector(state => state.user);
  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography 
          className={unreadByCurrentUser(user,conversation)?classes.unreadPreviewText: classes.previewText }
        >
          {latestMessageText}
        </Typography>
      </Box>
    </Box>
  );
}
const unreadByCurrentUser = (user, conversation) => {
  const lastMsg = conversation.messages[conversation.messages.length-1];
  return lastMsg.senderId !== user.id && !lastMsg?.readStatus
}
export default ChatContent;
