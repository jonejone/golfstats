(function(window, document, undefined) {

    /* The "Game" model */
    var Game = Backbone.Model.extend({
        initialize: function(attrs) {
            this.gameholes = new GameHoleList();
            this.gameholes.game = this;

            this.players = new GOLFSTATS.PlayerList();

            if(this.id) {
                this.url = '/api/games/' + this.id + '/';
            } else {
                this.set('created', new Date());
                this.set('state', this.STATE_CREATED);
            }

            if(attrs.players) {
                _.each(attrs.players, function(player) {
                    if(typeof player === 'string') {
                        this.players.add(GOLFSTATS.players.getByUrl(player));
                    } else {
                        this.players.add(player);
                    }
                }, this);
            }

            this.bind('change:id', function(e) {
                this.url = '/api/games/' + this.id + '/';
            });

            this.bind('change:players', function(e) {
                /* Empty players collection first */
                this.players.reset();

                /* Add the different players */
                _.each(this.get('players'), function(player) {
                    if(typeof player === 'string') {
                        this.players.add(
                            GOLFSTATS.players.getByUrl(player));
                    } else {
                        this.players.add(player);
                    }
                }, this);
            });

            this.bind('change:gameholes', function(e){
                this.gameholes.reset();

                _.each(this.get('gameholes'), function(gh) {
                    this.gameholes.add(new GameHole(gh));
                }, this);
            });

            if(attrs.gameholes) {
                 _.each(attrs.gameholes, function(gh) {
                    this.gameholes.add(new GameHole(gh));
                }, this);
            }


            this.bind('change:course', function(e) {
                /* If we get course as a string, objectify it */
                if(typeof this.get('course') === 'string') {
                    this.set('course', GOLFSTATS.courses.getByUrl(
                        this.get('course')));
                }
            });

            if(attrs.course) {
                if(typeof attrs.course === 'string') {
                    this.set('course', GOLFSTATS.courses.getByUrl(
                        attrs.course));
                }
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

        parseNotUsed: function(response) {

            /* Set the game course */
            response.course = GOLFSTATS.courses.getByUrl(
                response.course);

            /* Set the players list */
            response.players = _.map(response.players, function(player) {
                return GOLFSTATS.players.getByUrl(player);
            });

            /* Parse gameholes */
            response.gameholes = _.map(response.gameholes, function(gh) {
                /* Since gameholes are unique per game, we can
                    instantiate new instance instead of fetching */
                return new GOLFSTATS.GameHole(gh);
            });

            return response;
        },

        toJSON: function() {
            var players = this.players.map(function(player) {
                return player.getUrl();
            });

            var gameholes = this.gameholes.map(function(gamehole) {
                return {
                    coursehole: gamehole.get('coursehole').getUrl(),
                    player: gamehole.get('player').getUrl(),
                    score: {
                        'throws': gamehole.get('score')['throws'],
                        'ob_throws': gamehole.get('score')['ob_throws'],
                    }
                }
            });

            return {
                players: players,
                course: this.get('course').getUrl(),
                gameholes: gameholes,
                state: this.get('state'),
                creator: this.get('creator')
            }
        },

        /* Will log scores, for convenience */
        printScores: function() {
            console.log('Playing game on ', this.get('course').get('name'));
            this.players.each(function(player) {
                var score = this.getTotalScoreByPlayer(player);
                console.log(player.get('name'), ' score ', score['score'], 'with', score['throws'], 'throws');
            }, this);
        },

        /* Store scores for a player */
        playerScore: function(player, coursehole, score) {

            var gamehole =
                this.gameholes.getByHoleAndPlayer(
                    coursehole, player);

            if(gamehole.length) {
                /* Update existing GameHole */
                gamehole[0].set('score', {
                    'throws': score['throws'],
                    'ob_throws': score['ob_throws'],
                });
            } else {
                /* Create new Gamehole */
                this.gameholes.add(new GameHole({
                    player: player,
                    coursehole: coursehole,
                    score: {
                        'throws': score['throws'],
                        ob_throws: score['ob_throws'],
                    },
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

            _.each(this.gameholes.getByPlayer(player), function(gamehole) {
                var score = gamehole.get('score');

                total_throws += parseInt(score['throws']);
                total_ob += parseInt(score['ob_throws']);
                par_holes_played += gamehole.get('coursehole').get('par');
            });

            var score = total_throws - par_holes_played;

            return {
                'throws': total_throws,
                'ob_throws': total_ob,
                score: score,
            };
        },

    });

    /* The collection holding Games */
    var GameList = Backbone.Collection.extend({
        model: Game, url: '/api/games/',
    });

    /* Model representing "GameHole" */
    var GameHole = Backbone.Model.extend({
        initialize: function(attrs) {


            if(attrs.player) {
                if(typeof attrs.player === 'string') {
                    this.set('player', GOLFSTATS.players.getByUrl(
                        attrs.player));
                }
            }

            if(attrs.coursehole) {
                if(typeof attrs.coursehole === 'string') {
                    this.set('coursehole', GOLFSTATS.courseholes.getByUrl(
                        attrs.coursehole));
                }
            }

            this.bind('change:player', function() {
                var player = this.get('player');
                if(typeof player === 'string') {
                    this.set('player', GOLFSTATS.players.getByUrl(player));
                }
            });

            this.bind('change:coursehole', function() {
                var ch = this.get('coursehole');
                if(typeof ch === 'string') {
                    this.set('coursehole', GOLFSTATS.courseholes.getByUrl(ch));
                }
            });
        },
    });

    /* The collection holding "GameHole" */
    var GameHoleList = Backbone.Collection.extend({
        model: GameHole,

        getByPlayer: function(player) {
            return this.filter(function(gamehole) {
                if(gamehole.get('player') === player) {
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
    window.GOLFSTATS.GameHole =  GameHole;

}(window));
