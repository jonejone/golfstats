(function(window) {

    var GameView = function() {
        this.current_game = null;
        this.current_hole = null;
        this.players = null;
        this.courses = null;
        this.bindEventHandlers();
    } 

    GameView.prototype = {

        setPlayers: function(players) {
            this.players = players;

            /* Now update all view with list of players */
            var create = $('#create-game');
            var select = $('#select-players');

            $.each(players, function(index, player) {
                var option = $('<option></option>')
                    .text(player.name)
                    .attr('value', player.id);

                select.append(option);
            });
        },

        setCourses: function(courses) {
            this.courses = courses;
            var select = $('#select-course');

            $.each(courses, function(index, course) {
                var option = $('<option></option>')
                    .text(course.name)
                    .attr('value', course.id);

                select.append(option);
            });
        },

        getPlayerById: function(id) {
            var return_player = false;
            $.each(this.players, function(index, player) {
                if(player.id == id) {
                    return_player = player;
                }
            });

            return return_player;
        },

        getCourseById: function(id) {
            var return_course = false;
            $.each(this.courses, function(index, course) {
                if(course.id == id) {
                    return_course = course;
                }
            });

            return return_course;
        },

        bindEventHandlers: function() {
            // TODO: Avoid "that = this" sillyness
            var that = this;

            // Previous and next hole buttons
            $('.next-hole').click(function(e) {
                e.preventDefault();
                that.changeNextHole();
            });

            $('.previous-hole').click(function(e) {
                e.preventDefault();
                that.changePrevHole();
            });

            $('.starframe-button').click(function(e) {
                var birdie = that.current_hole.par - 1;

                $.each(that.current_game.players, function(i, player) {
                    that.updatePlayerScore(player, birdie);
                });
            });

            $('.betong-button').click(function(e) {
                var par = that.current_hole.par;

                $.each(that.current_game.players, function(i, player) {
                    that.updatePlayerScore(player, par);
                });
            });

            $(document).bind('pagebeforecreate', function(e, data) {
                if(e.target.id == 'game-hole') {
                    /* Lets fake a game */
                    /*
                    var game = new Game();
                    var players = [
                        that.players[0],
                        that.players[1],
                        that.players[2],
                    ];

                    var course = that.courses[0];

                    game.setCourse(course);
                    game.setPlayers(players);

                    that.setCurrentGame(game);
                    that.setCurrentHole(
                        that.getHoleByOrder(1));
                    */
                }
            });

            // Setting of scores
            $('#game-hole input[type=radio]').live('change', function(e) {
                var parent = $(this).parents('li').get(0);
                var throw_count = $(parent).find('input[type=radio]:checked').val();

                $(parent).find('.throw-count').val(throw_count);
                that.updateBetongStarframeButtons();
            });

            $('#create-game-button').click(function() {
                var player_ids = $('#select-players').val();
                var players = [];
                var course_id = $('#select-course').val();

                $.each(player_ids, function(index, player_id) {
                    players.push(that.getPlayerById(player_id));
                });

                var course = that.getCourseById(course_id);

                /* Okay, lets create our new game */
                var game = new Game();
                game.setPlayers(players);
                game.setCourse(course);
                game.start();

                that.setCurrentGame(game);
                that.setCurrentHole(
                    that.getHoleByOrder(1));

                $.mobile.changePage('#game-hole');
            });

        },

        setCurrentHole: function(hole) {
            var that = this;

            $('#game-hole div[data-role=header] h1') 
                .html('Hole ' + hole.order + ' (par: ' + hole.par + ')');

            var s = $('#game-hole ul#game-hole-players');

            /* We need to save scores */
            $('ul#game-hole-players .throw-count').each(function(index, value) {
                if($(value).val() != '') {
                    that.current_game.setPlayerHoleScore(
                        $(value).data('player-id'),
                        that.current_hole,
                        { throws: $(value).val(),
                            ob_throws: 0 }
                    );
                }
            });

            /* Reset inputs */
            s.find('input[type=radio]:checked').attr('checked', false);
            s.find('label.ui-btn-active').removeClass('ui-btn-active');
            s.find('.throw-count').val('');

            /* Now we must populate scores for this hole if it exists */
            var scores = that.current_game.getScoresByHole(hole);

            $.each(scores, function(index, value) {
                that.updatePlayerScore(
                    that.getPlayerById(index), value.throws);
            });

            /* Finally set the new hole as current */
            this.current_hole = hole;

        },

        updateBetongStarframeButtons: function() {
            var par = this.current_hole.par;
            var birdie = this.current_hole.par - 1;

            $('#game-hole div[data-role="navbar"] .ui-btn-active')
                .removeClass('ui-btn-active');

            if(this.allPlayersHaveScore(par)) {
                /* This is a betong hole */
                $('.betong-button').addClass('ui-btn-active');
            } else if(this.allPlayersHaveScore(birdie)) {
                /* This is a starframe hole */
                $('.starframe-button').addClass('ui-btn-active');
            }
        },

        allPlayersHaveScore: function(score) {
            var search = $('#game-hole .throw-count');
            var result = true;

            if(search.length == this.current_game.players.length) {
                for(var x=0; x < search.length; x++) {
                    if($(search[x]).val() != score) {
                        result = false;
                    }
                }
            }

            return result;
        },

        updatePlayerScore: function(player, score) {
            $('#player-id-' + player.id).
                find('.throw-count').val(score);

            /* Look for corresponding radio input */
            $('#player-id-' + player.id)
                .find('.ui-btn-active')
                .removeClass('ui-btn-active');

            var radio = $('#radio-choice-player-' + player.id + '-' + score);

            if(radio) {
                radio.attr('checked', 'checked');
                $('label[for=radio-choice-player-'
                    + player.id + '-' + score + ']')
                    .addClass('ui-btn-active');
            }

            this.updateBetongStarframeButtons();
        },

        setCurrentGame: function(game) {
            this.current_game = game;
            this.game = game;

            /* Now we need to make UI changes for this given game */
            var players_ul = $('#game-players');
            var hole_players_ul = $('#game-hole-players');

            var throws_display = {
                start: 2,
                end: 5,
            };

            $.each(this.current_game.players, function(index, value) {
                players_ul.append($('<li>' + value.name + '</li>'));

                var li = $('<li></li>').attr('id', 'player-id-' + value.id);

                var fieldset = $('<fieldset data-role="controlgroup" ' +
                    'data-type="horizontal"></fieldset>');

                var legend = $('<legend>' + value.name + '</legend>');

                fieldset.append(legend);

                for(var x = throws_display.start; x <= throws_display.end; x++) {
                    var input_name = 'radio-choice-player-' + value.id;
                    var input_id = 'radio-choice-player-' + value.id + '-' + x;

                    var input = $('<input type="radio" id="' + input_id + 
                        '" name="' + input_name + '" value="' + x + '" />');

                    var label = $('<label for="' + input_id + '">' + x + '</label>');

                    fieldset.append(input);
                    fieldset.append(label);
                }

                var throws_input = $('<input type="number" />').
                    attr('name', 'throws-player-' + value.id).
                    addClass('throw-count').
                    data('player-id', value.id);

                fieldset.append(throws_input);

                li.append(fieldset);
                hole_players_ul.append(li);
            });

            /* Force an update of styling for generated markup */
//            $('#game-hole').trigger('create');
        },

        changePrevHole: function() {
            var prev_hole = this.getHoleByOrder(
                this.current_hole.order - 1);

            if(prev_hole) {
                this.setCurrentHole(prev_hole);
            } else {
                throw "Already at first hole, can't go to previous"
            }
        },

        changeNextHole: function() {
            var next_hole = this.getHoleByOrder(
                this.current_hole.order + 1);

            if(next_hole) {
                this.setCurrentHole(next_hole);
            } else {
                throw "Already at last hole, can't go to next"
            }
        },

        getHoleByOrder: function(order) {
            var hole = null;

            $.each(this.current_game.course.holes, function(index, value) {
                if(value.order == order) {
                    hole = value;
                }
            });

            return hole;
        },
    };

    window.GameView = GameView;
    
}(window));



(function(window) {

    var Game = function() {
        this.course = null;
        this.players = [];
        this.scores = {};
    } 

    Game.prototype = {

        start: function() {
            this.current_hole = this.course.holes[0];
        },

        setCourse: function(course) {
            this.course = course;
        },

        setPlayers: function(players) {
            this.players = players;
        },

        setPlayerHoleScore: function(player, hole, score) {
            if(!this.scores[hole.order]) {
                /* No scores for this hole yet */
                this.scores[hole.order] = {};
            }

            this.scores[hole.order][player] = score;
        },

        getScoresByHole: function(hole) {
            if(this.scores[hole.order]) {
                return this.scores[hole.order];
            }

            return false;
        },
    };

    window.Game = Game;
    
}(window));

