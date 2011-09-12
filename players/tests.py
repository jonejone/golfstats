from django.test import TestCase, Client

from players.models import Player


def make_players(count=1):
    players = []

    for i in range(0, count):
        p = Player.objects.create(
            name="Test player %s" % (i),
        )

        players.append(p)

    return players


class PlayerTest(TestCase):
    def test_basic_player(self):
        p = make_players()[0]

        self.assertNotEqual(p.id, None)


class PlayerFrontendTest(TestCase):
    def test_index(self):
        players = make_players(5)

        c = Client()
        r = c.get("/players/")

        self.assertEqual(r.status_code, 200)

        context_players = r.context_data["players"]
        for player in context_players:
            self.assertIn(player, players)

    def test_create(self):
        c = Client()
        r = c.get("/players/create/")

        self.assertContains(r, 'Create or update a player', count=1)

        c = Client()
        r = c.post('/players/create/', {
            "name": "Test player",
        })

        self.assertEqual(r.status_code, 302)

        self.assertEqual(
            Player.objects.filter(name="Test player").count(), 1)

    def test_detail(self):
        player = make_players()[0]

        c = Client()
        r = c.get("/players/%s/" % (player.id))

        self.assertContains(r, "Player %s" % (player.name), count=1)

    def test_update(self):
        player = make_players()[0]

        c = Client()
        r = c.get("/players/%s/edit/" % (player.id))

        self.assertContains(r, player.name, count=1)

        c = Client()
        r = c.post("/players/%s/edit/" % (player.id), {
            "name": "new name",
        })

        self.assertEqual(r.status_code, 302)

        # Ensure that our original and renamed arena
        # have the same IDs
        renamed_player = Player.objects.get(name="new name")
        self.assertEqual(renamed_player.id, player.id)

    def test_delete(self):
        player = make_players()[0]

        c = Client()
        r = c.get("/players/%s/delete/" % (player.id))

        self.assertContains(r, player.name, count=1)

        # Simply posting there should delete the instance
        c = Client()
        r = c.post("/players/%s/delete/" % (player.id))

        self.assertEqual(r.status_code, 302)

        # Check that we can't actually load the deleted instance
        self.assertRaises(player.DoesNotExist,
            Player.objects.get, id=player.id)
