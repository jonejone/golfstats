$(function() {

    module('Golfstats.Players');

    function make_players(num) {
        var players = [];

        _.each(_.range(1, num + 1), function(i) {

            var player = new GOLFSTATS.Player({
                name: 'Player ' + i
            });

            GOLFSTATS.players.add(player);
            players.push(player);
        });

        return players;
    }

    test('Make some players', function() {

        /* How many players before creating new ones */
        var count = GOLFSTATS.players.length;

        /* Make new players */
        var players = make_players(10);

        equals(count + 10, GOLFSTATS.players.length, "Created 10 players");
    });

    if(!window.GOLFSTATS_DEBUG) {
        window.GOLFSTATS_DEBUG = {};
    }

    window.GOLFSTATS_DEBUG.make_players = make_players;
});
