(function(window, document, undefined) {

    /* The "Game" model */
    var Game = Backbone.Model.extend({
        initialize: function() {
            this.gameholes = new GameHoleList();
            this.gameholes.game = this;

            if(this.id) {
                this.gameholes.url = '/api/games/' + this.id
                    + '/gameholes/';
            } else {
                this.set('created', new Date());
                this.set('state', this.STATE_CREATED);
            }
        },
        url: '/api/games/',

        STATE_CREATED: 1,
        STATE_STARTED: 2,
        STATE_FINISHED: 3,
        STATE_ABORTED: 4,

        start: function() {
            this.set('state', this.STATE_STARTED);
            this.set('started', new Date());
        },

        finish: function() {
            this.set('state', this.STATE_FINISHED);
            this.set('finished', new Date());
        },

        abort: function() {
            this.set('state', this.STATE_ABORTED);
        },

        toJSON: function() {
            var players = this.get('players').map(function(player) {
                return player.getUrl();
            });

            var gameholes = this.gameholes.map(function(gamehole) {
                return {
                    coursehole: gamehole.get('coursehole').getUrl(),
                    player: gamehole.get('player').getUrl(),
                    score: {
                        'throws': gamehole.get('throws'),
                        'ob_throws': gamehole.get('ob_throws'),
                    }
                }
            });

            return {
                players: players,
                course: this.get('course').getUrl(),
                gameholes: gameholes,
            }
        },

        /* Store scores for a player */
        playerScore: function(player, coursehole, score) {

            var gamehole =
                this.gameholes.getByHoleAndPlayer(
                    coursehole, player);


            if(gamehole.length) {
                /* Update existing GameHole */
                gamehole[0].set({
                    'throws': score['throws'],
                    'ob_throws': score['ob_throws'],
                });
            } else {
                /* Create new Gamehole */
                this.gameholes.add(new GameHole({
                    player: player,
                    coursehole: coursehole,
                    'throws': score['throws'],
                    ob_throws: score['ob_throws'],
                    game: this,
                }));
            }
        },

        /* Get total scores by player */
        getTotalScoreByPlayer: function(player) {
            var total_throws = 0;
            var total_ob = 0;

            /* Contains the par on holes played, in case only
                a few holes are played */
            var par_holes_played = 0;

            _.each(this.gameholes.getByPlayer(player), function(score) {
                total_throws += score.get('throws');
                total_ob += score.get('ob_throws');
                par_holes_played += score.get('coursehole').get('par');
            });

            var score = total_throws - par_holes_played;

            return {
                total_throws: total_throws,
                total_ob: total_ob,
                score: score,
            };
        },

    });

    /* The collection holding Games */
    var GameList = Backbone.Collection.extend({
        model: Game, url: '/api/games/',
    });

    /* Model representing "GameHole" */
    var GameHole = Backbone.Model.extend({});

    /* The collection holding "GameHole" */
    var GameHoleList = Backbone.Collection.extend({
        model: GameHole,

        getByPlayer: function(player) {
            return this.filter(function(score) {
                if(score.get('player') === player) {
                    return true;
                }
            });
        },

        getByHoleAndPlayer: function(coursehole, player) {
            return this.filter(function(gamehole) {
                if(gamehole.get('player') === player &&
                    gamehole.get('coursehole') === coursehole) {
                    return true;
                }
            });
        },
    });

    /* Make necessary models available in global scope */
    window.GOLFSTATS.games = new GameList();
    window.GOLFSTATS.Game = Game;



}(window));
