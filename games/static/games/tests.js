$(function() {

    module('Golfstats.Games');

    test('Create a game', function() {

        /* First we need a course and players */
        var course = GOLFSTATS_DEBUG.make_course(18, 3);
        var players = new GOLFSTATS.PlayerList();

        _.each(GOLFSTATS_DEBUG.make_players(1), function(player) {
            players.add(player);
        });

        /* Create the game */
        var game = new GOLFSTATS.Game({
            course: course,
            players: players,
        });

        /* Our test player */
        var player = players.models[0];

        /* Make sure initial score is correct */
        var score = game.getTotalScoreByPlayer(player);
        equals(score.score, 0, 'Initial score of zero');

        /* Now lets make some scores */
        _.each(course.courseholes.models, function(ch) {
            _.each(players.models, function(player) {
                game.playerScore(player, ch, {
                    'throws': ch.get('par'),
                    'ob_throws': 0 });
            });
        });

        /* Iterate over players and check scores */
        var score = game.getTotalScoreByPlayer(player);

        /* Player par on all holes, so score should be 0 */
        equals(score.score, 0, 'Score after full game');

        /* Now update one players score */
        var ch = course.courseholes.models[0];

        game.playerScore(player, ch, {
            'throws': ch.get('par') + 1,
            'ob_throws': 0, });

        var score = game.getTotalScoreByPlayer(player);

        /* Now the score should be 1 */
        equals(score.score, 1, 'Score correct after increase');

        /* Lets decrease the score as well */
        game.playerScore(player, ch, {
            'throws': ch.get('par') - 1,
            'ob_throws': 0, });

        var score = game.getTotalScoreByPlayer(player);

        /* Now the score should be -1 */
        equals(score.score, -1, 'Score correct after decrease');

        window.game = game;
        window.players = players;
        window.course = course;
        window.player = player;
        window.ch = ch;
    });
});
