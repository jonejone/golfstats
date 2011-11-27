

(function(window) {

    var GameView = function() {
        this.game = null;
        this.current_hole = null;
        this.players = null;
        this.courses = null;
        this.bindEventHandlers();
    } 

    GameView.prototype = {
        
        setPlayers: function(players) {
            this.players = players;
        },

        setCourses: function(courses) {
            this.courses = courses;
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

            // Setting of scores
            $('#game-hole input[type=radio]').live('change', function(e) {
                var parent = $(this).parents('li').get(0);
                var throw_count = $(parent).find('input[type=radio]:checked').val();

                $(parent).find('.throw-count').val(throw_count);
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
                    that.game.setPlayerHoleScore(
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
            var scores = that.game.getScoresByHole(hole);

            $.each(scores, function(index, value) {
                var player = $('#player-id-' + index);
                player.find('.throw-count').val(value.throws);

                /* Look for corresponding radio input */
                var radio = $('#radio-choice-player-' + index + '-' + value.throws);

                if(radio) {
                    radio.attr('checked', 'checked');
                    $('label[for=radio-choice-player-' 
                        + index + '-' + value.throws + ']')
                        .addClass('ui-btn-active')
                }
            });

            /* Finally set the new hole as current */
            this.current_hole = hole;

        },

        setCurrentGame: function(game) {
            this.game = game;

            /* Now we need to make UI changes for this given game */
            var players_ul = $('#game-players');
            var hole_players_ul = $('#game-hole-players');

            var throws_display = {
                start: 2,
                end: 5,
            };

            $.each(this.game.players, function(index, value) {
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

            $.each(this.game.course.holes, function(index, value) {
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
        this.current_hole = null;
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

