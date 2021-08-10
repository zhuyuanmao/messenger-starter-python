import React, { useState } from "react";
import { FormControl, FilledInput } from "@material-ui/core";
import {  useDispatch, useSelector } from "react-redux";
import { postMessage,readMessages } from "../../store/utils/thunkCreators";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    justifySelf: "flex-end",
    marginTop: theme.spacing(1),
  },
  input: {
    height: 70,
    backgroundColor: "#F4F6FA",
    borderRadius: 8,
    marginBottom: theme.spacing(1),
  },
}));


const Input = (props) => {
  const classes = useStyles();
  const [text, setText] = useState("");
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const handleChange = (event) => {
    setText(event.target.value);
  }
  const handleFocus = async (event) => {
    event.preventDefault();
    if (props.unreadMessagesCount > 0){
      await dispatch(readMessages(props.conversationId));
    }
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    // add sender user info if posting to a brand new convo, so that the other user will have access to username, profile pic, etc.
    const reqBody = {
      text: event.target.text.value,
      recipientId: props.otherUser.id,
      conversationId: props.conversationId,
      sender: props.conversationId ? null : user,
    };
    await dispatch(postMessage(reqBody));
    setText("");
  }
  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <FormControl fullWidth hiddenLabel>
        <FilledInput
          classes={{ root: classes.input }}
          disableUnderline
          placeholder="Type something..."
          value={text}
          name="text"
          onChange={handleChange}
          onFocus={handleFocus}
        />
      </FormControl>
    </form>
  );

}

export default Input;
