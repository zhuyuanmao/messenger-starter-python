import os
import jwt
from messenger_backend.settings import SECRET_KEY
from messenger_backend.models import User
from online_users import online_users
import socketio

async_mode = None


basedir = os.path.dirname(os.path.realpath(__file__))
sio = socketio.Server(async_mode=async_mode, logger=False)
thread = None


@sio.event
def connect(sid, environ, auth):
    token = auth.get("token", None)
    user = None
    print(auth)
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = User.get_by_id(decoded["id"])
    except (jwt.ExpiredSignatureError, jwt.InvalidSignatureError, jwt.DecodeError):
        raise Exception("Authentication failed.")
    if not user:
        raise Exception("Can not find the user.")

    sio.emit("my_response", {"data": "Connected", "count": 0}, room=sid)


@sio.on("go-online")
def go_online(sid, user_id):
    if user_id not in online_users:
        online_users.add(user_id)
    sio.emit("add-online-user", user_id, skip_sid=sid)


@sio.on("new-message")
def new_message(sid, message):
    sio.emit(
        "new-message",
        {"message": message["message"], "sender": message["sender"]},
        skip_sid=sid,
    )


@sio.on("read-conversation")
def read_conversation(sid, data):
    sio.emit(
        "read-conversation",
        {"conversationId": data["conversationId"],
         "lastReadMessageId": data["lastReadMessageId"]},
        skip_sid=sid,
    )


@sio.on("logout")
def logout(sid, user_id):
    if user_id in online_users:
        online_users.remove(user_id)
    sio.emit("remove-offline-user", user_id, skip_sid=sid)
