from piston.handler import BaseHandler
from piston.utils import rc

from datetime import datetime

from players.models import Player


class PlayerHandler(BaseHandler):
    allowed_methods = ("GET", "POST",)
    model = Player
    fields = ("id", "name", )

    def read(self, request, pk=None):
        base = Player.objects

        if pk is not None:
            return base.get(pk=pk)

        return base.all()

    def create(self, req):
        if req.content_type and req.data:
            data = req.data

            player = self.model.objects.create(name=data["name"],
                created=datetime.now())

            response = rc.CREATED
            response.content = dict(id=player.id)

            return response

        else:
            return rc.BAD_REQUEST
