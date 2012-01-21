(function(window, document, undefined) {

    // The PlayController will manage routes for the "Play game" view
    var PlayController = Backbone.Router.extend({
        routes: {
            "": "index",
            "hole/:id": "hole",
        },

        index: function() {
            // Just render out an index view
            new GOLFSTATS.views.PlayIndexView({game: this.game});
        },

        hole: function(hole_order) {
            // Define course and current coursehole
            var course = this.game.get('course');
            var coursehole = course.courseholes.getByOrder(hole_order);

            if(!coursehole) {
                throw "Unable to find coursehole with order " + hole_order;
                return;
            }

            // Create view for this hole on this game
            new GOLFSTATS.views.PlayHoleView({
                game: this.game,
                coursehole: coursehole,
            });
        },

        // The constructor will try to load the game from collection
        // or fetch it from the API
        initialize: function(game_id) {
            var game;
            var that = this;

            // See if we can find game in our games collection
            if(GOLFSTATS.games.get(game_id)) {
                game = GOLFSTATS.games.get(game_id);
                this.game = game;
            } else {
                // Load it from the API instead
                game = new GOLFSTATS.Game({id: game_id});
                game.fetch({options: function() {
                    that.game = game;
                }});
            }
        },
    });

    // Make it available in the global scope
    window.GOLFSTATS.controllers.PlayController = PlayController;

}(window, document));
