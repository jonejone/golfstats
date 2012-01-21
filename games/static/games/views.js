$(function() {

    (function(window, document, undefined) {

        // The Index view which shows game details
        var PlayIndexView = Backbone.View.extend({

            el: $('#main-content-view'),

            initialize: function() {
                this.game = this.options.game;
                this.render();
            },

            render: function() {
                var template = _.template($('#index-template').html());
                $(this.el).html(template({game:this.game}));
            },
        });

        // The Hole view which shows a specific hole for a game
        var PlayHoleView = Backbone.View.extend({

            el: $('#main-content-view'),

            initialize: function() {
                this.coursehole = this.options.coursehole;
                this.game = this.options.game;
                this.render();

                // We need to initialize views for the players
                var scores = $('.scores').get(0); 

                this.game.players.each(function(player) {
                    // Generate views for each player on this hole
                    var view = new PlayHolePlayerView({
                        coursehole: this.coursehole,
                        player: player,
                        game: this.game,
                    });

                    $(scores).append(view.el);
                }, this);

            },

            render: function() {
                // Render our hole template with right context
                var template = _.template($('#hole-template').html());
                $(this.el).html(
                    template({
                        coursehole:this.coursehole,
                        game: this.game, }));
            },

        });

        // The HolePlayer view which renders just one player on a hole
        var PlayHolePlayerView = Backbone.View.extend({

            tagName: 'li',

            events: {
                'change input': 'updateScoresFromInput',
            },

            updateTotalScores: function() {
                var score = this.game.getTotalScoreByPlayer(
                    this.player);

                $(this.el).find('span.score').html(
                    score.score + ' (' + score['throws'] + ' throws)'
                );
            },

            // Lets us re-draw scores based on gamehole
            updateScoresFromGamehole: function() {
                $(this.el).find('input.throws').val(
                    this.gamehole.get('score')['throws']);
            },

            // Lets us set a new score for a gamehole
            updateScoresFromInput: function() {
                var score = {
                    'throws': $(this.el).find('input.throws').val(),
                    'ob_throws': $(this.el).find('input.ob_throws').val(),
                }

                this.gamehole.set('score', score);
            },

            initialize: function() {
                this.player = this.options.player;
                this.coursehole = this.options.coursehole;
                this.game = this.options.game;
                this.gamehole = null;

                try {
                    this.gamehole = this.game.gameholes.getByHoleAndPlayer(
                        this.coursehole, this.player)[0];
                } catch(e) {

                }

                // TODO: Instead if depending on gamehole, we should make sure it exists
                // by automatically creating it, so we can avoid the condition below. We should
                // rather always have a gamehole, because now we get into trouble with
                // binding events later if/when gameholes are created
                if(this.gamehole) {
                    this.gamehole.bind('change', this.updateScoresFromGamehole, this);
                    this.gamehole.bind('change', this.updateTotalScores, this);
                }

                this.render();
            },

            render: function() {
                var template = _.template($('#hole-player-template').html());
                var gamehole;

                $(this.el).html(template({
                    player: this.player,
                    game: this.game,
                    coursehole: this.coursehole,
                }));

                this.updateScoresFromGamehole();
                this.updateTotalScores();
            },
        });

        // Make our new views available in global scope
        window.GOLFSTATS.views.PlayIndexView = PlayIndexView;
        window.GOLFSTATS.views.PlayHoleView = PlayHoleView;

    }(window, document));

});
