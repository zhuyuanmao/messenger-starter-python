from django.contrib.auth.middleware import get_user
from django.db.models import Max, Q
from django.db.models.query import Prefetch
from django.http import HttpResponse, JsonResponse
from messenger_backend.models import Conversation, Message
from online_users import online_users
from rest_framework.views import APIView
from rest_framework.request import Request


class Conversations(APIView):
    """get all conversations for a user, include latest message text for preview, and all messages
    include other user model so we have info on username/profile pic (don't include current user info)
    TODO: for scalability, implement lazy loading"""

    def get(self, request: Request):
        try:
            user = get_user(request)

            if user.is_anonymous:
                return HttpResponse(status=401)
            user_id = user.id

            conversations = (
                Conversation.objects.filter(
                    Q(user1=user_id) | Q(user2=user_id))
                .prefetch_related(
                    Prefetch(
                        "messages", queryset=Message.objects.order_by("createdAt")
                    )
                )
                .all()
            )

            conversations_response = []

            for convo in conversations:
                convo_dict = {
                    "id": convo.id,
                    "messages": [
                        message.to_dict(
                            ["id", "text", "senderId", "readStatus", "createdAt"])
                        for message in convo.messages.all()
                    ],
                }

                # set properties for notification count and latest message preview
                convo_dict["latestMessageText"] = convo_dict["messages"][-1]["text"]

                # set a property "otherUser" so that frontend will have easier access
                user_fields = ["id", "username", "photoUrl"]
                if convo.user1 and convo.user1.id != user_id:
                    convo_dict["otherUser"] = convo.user1.to_dict(user_fields)
                elif convo.user2 and convo.user2.id != user_id:
                    convo_dict["otherUser"] = convo.user2.to_dict(user_fields)

                # set property for online status of the other user
                if convo_dict["otherUser"]["id"] in online_users:
                    convo_dict["otherUser"]["online"] = True
                else:
                    convo_dict["otherUser"]["online"] = False

                # set property for the number of unread messages
                counts = convo.messages.all().exclude(
                    senderId=user_id).filter(readStatus=False).count()
                convo_dict["unreadMessagesCount"] = counts

                # set property for last read message.
                convo_dict["lastReadMessageId"] = -1
                msgs = convo.messages.all().filter(
                    readStatus=True).filter(senderId=user_id).order_by("-createdAt")
                if msgs:
                    convo_dict["lastReadMessageId"] = msgs.first().id

                conversations_response.append(convo_dict)
            conversations_response.sort(
                key=lambda convo: convo["messages"][-1]["createdAt"],
                reverse=True,
            )
            return JsonResponse(
                conversations_response,
                safe=False,
            )
        except Exception as e:
            return HttpResponse(status=500)

    def patch(self, request: Request, convo_id):
        """update all messages in given conversation to read status.
        """
        try:
            user = get_user(request)

            if user.is_anonymous:
                return HttpResponse(status=401)
            user_id = user.id
            convo = Conversation.objects.filter(id=convo_id).filter(
                Q(user1=user_id) | Q(user2=user_id))
            if not convo:
                return JsonResponse(
                    data={"error": "can not find the conversation"},
                    safe=False,
                )
            convo = convo.first()
            convo.messages.all().exclude(senderId=user_id).update(readStatus=True)
            recipientId = convo.user1.id if convo.user1.id != user_id else convo.user2.id

            last_read_msg = -1
            msgs = convo.messages.all().filter(
                readStatus=True).exclude(senderId=user_id).order_by("-createdAt")
            if msgs:
                last_read_msg = msgs.first().id

            return JsonResponse(
                data={"lastReadMessageId": last_read_msg,
                      "conversationId": convo.id,
                      "recipientId": recipientId
                      },

                status=200,
                safe=False
            )

        except Exception as e:
            return HttpResponse(status=500)
