import React from "react";
import { Box, Badge } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { readMessages } from "../../store/utils/thunkCreators";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
  badge: {
    marginRight: 20,
  }

})); 

const Chat = (props) =>{
  const classes = useStyles();
  const dispatch = useDispatch()
  const otherUser = props.conversation.otherUser;
  const {unreadMessagesCount} = props.conversation;
  

  const handleClick = async (conversation) => {
    if (conversation.unreadMessagesCount > 0){
      await dispatch(readMessages(conversation.id));
    }
    await dispatch(setActiveChat(conversation.otherUser.username));
  }
    return (
      <Box
        onClick={() => handleClick(props.conversation)}
        className={classes.root}
      >
        <BadgeAvatar
          photoUrl={otherUser.photoUrl}
          username={otherUser.username}
          online={otherUser.online}
          sidebar={true}
        />
        <ChatContent conversation={props.conversation} />
        <Badge
          className={classes.badge}
          badgeContent={unreadMessagesCount} 
          color="primary"
        >
        </Badge>
      </Box>
    );
}

export default Chat;