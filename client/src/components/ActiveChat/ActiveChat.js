import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { useSelector } from "react-redux";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column"
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between"
  }
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const user = useSelector(state => state.user);
  const conversation = useSelector(state => getConversation(state)) || {};

  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              messages={conversation.messages}
              otherUser={conversation.otherUser}
              userId={user.id}
              lastReadMessageId = {conversation.lastReadMessageId}
            />
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              unreadMessagesCount={conversation.unreadMessagesCount}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const getConversation = (state) => {
  return state.conversations && state.conversations.find(
    (conversation) => conversation.otherUser.username === state.activeConversation
  )
}

export default ActiveChat;
