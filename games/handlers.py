from piston.handler import BaseHandler
from piston.utils import rc

from datetime import datetime

from games.models import Game, GameHole
from courses.models import Course, CourseHole
from players.models import Player


class GameHandler(BaseHandler):
    allowed_methods = ("GET", "POST", "PUT")
    model = Game
    fields = ("id", "state", "verified", "course", "players")
    # TODO: Game JSON is now extremely minimal

    def read(self, req, pk=None):
        base = Game.objects

        if pk is not None:
            return self._get_game(base.get(pk=pk))

        return base.all()

    def update(self, req, pk):
        game = Game.objects.get(pk=pk)
        data = req.data

        players = []
        for player in data['players']:
            players.append(
                self._get_player_by_url(player))

        course = self._get_course_by_url(data['course'])

        if game.state == Game.STATE_CREATED and \
            data['state'] == Game.STATE_STARTED:

            game.start()

        game.state = data['state']
        game.players = players
        game.course = course
        game.save()

        # Now go through the scores
        for gamehole in data['gameholes']:
            player = self._get_player_by_url(gamehole['player'])
            coursehole = self._get_coursehole_by_url(gamehole['coursehole'])

            # Get object to store scores
            gamehole_obj, created = GameHole.objects.get_or_create(
                player=player, coursehole=coursehole, game=game)

            gamehole_obj.throws = gamehole['score']['throws']
            gamehole_obj.ob_throws = gamehole['score']['ob_throws']
            gamehole_obj.save()

        return self._get_game(game)

    def create(self, req):
        if req.content_type and req.data:
            data = req.data
            course = self._get_course_by_url(data['course'])

            players = []
            for player in data['players']:
                players.append(self._get_player_by_url(player))

            game = self.model.objects.create(
                course_id=course.id,
                created=datetime.now(),
                creator_id=req.user.id,
                state=data['state'],
            )

            game.players = players

            return self._get_game(game)
        else:
            return rc.BAD_REQUEST

    def _get_game(self, game):
        return {
            'id': game.id,
            'state': game.state,
            'course': '/api/courses/%i/' % game.course.id,
            'created': game.created,
            'started': game.started,
            'finished': game.finished,
            'players': self._get_players(game),
            'gameholes': self._get_gameholes(game),
        }

    def _get_players(self, game):
        players = []

        for player in game.players.all():
            players.append('/api/players/%i/' % player.id)

        return players

    def _get_gameholes(self, game):
        return [{
            'player': '/api/players/%i/' % gh.player.id,
            'score': {
                'ob_throws': gh.ob_throws,
                'throws': gh.throws,
            },
            'coursehole': '/api/courseholes/%i/' % gh.coursehole.id
        } for gh in game.gamehole_set.all()]

    def _get_player_by_url(self, player_url):
        return Player.objects.get(
            pk=player_url.split('/')[3])

    def _get_course_by_url(self, course_url):
        return Course.objects.get(
            pk=course_url.split('/')[3])

    def _get_coursehole_by_url(self, coursehole_url):
        return CourseHole.objects.get(
            pk=coursehole_url.split('/')[3])

    def _get_gamehole_by_url(self, gamehole_url):
        return GameHole.objects.get(
            pk=gamehole_url.split('/')[3])


class GameHoleHandler(BaseHandler):
    allowed_methods = ("GET", "PUT",)

    # Custom filtering of gameholes
    # TODO: Is this necessary, can we just use piston ?
    gamehole_fields = (
        'player_id',
        'coursehole_id',
        'throws',
        'ob_throws',
    )

    # Filters according to self.gamehole_fields
    def _filter_gamehole(self, gh):
        # Grab only defined fields
        d = {}
        for name in self.gamehole_fields:
            d[name] = getattr(gh, name)

        return d

    # Return all gameholes for game
    def read(self, req, pk):
        game = Game.objects.get(pk=pk)

        return [self._filter_gamehole(x) for
            x in  game.gamehole_set.all()]

    # Receive gameholes for this game
    # TODO: This doesn't handle removing gamehole
    def update(self, req, pk):
        game = Game.objects.get(pk=pk)

        if req.content_type and req.data:
            for req_gh in req.data:
                # Create or find gamehole object
                try:
                    gh = GameHole.objects.get(
                        player__id=req_gh["player_id"],
                        game__id=game.id,
                        coursehole__id=req_gh["coursehole_id"])
                except GameHole.DoesNotExist:
                    gh = GameHole()
                    gh.player_id = req_gh["player_id"]
                    gh.game_id = game.id
                    gh.coursehole_id = req_gh["coursehole_id"]

                # Set properties and save gamehole
                gh.throws = req_gh["throws"]
                gh.ob_throws = req_gh["ob_throws"]
                gh.save()

            return rc.ALL_OK

        else:
            return rc.BAD_REQUEST
