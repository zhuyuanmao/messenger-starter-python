import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  realAllMessages
} from "./store/conversations";

const socket = io(window.location.origin, { autoConnect: false });

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    store.dispatch(setNewMessage(data.message, data.sender));
  });
  socket.on("read-conversation", (data) => {
    const {conversationId, lastReadMessageId, recipientId} = data
    store.dispatch(realAllMessages(conversationId,lastReadMessageId,recipientId));
  });
  socket.on('connect_error', (e) => {
    console.error(e.message);
  });
});

export default socket;
