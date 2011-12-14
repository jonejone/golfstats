(function(window, document, undefined) {

    var Player = Backbone.Model.extend({
        url: '/api/players/',

        getUrl: function() {
            if(this.id) {
                return this.url + this.id + '/';
            } else {
                return this.url + this.cid + '/';
            }
        }
    });

    var PlayerList = Backbone.Collection.extend({
        model: Player,
        url: '/api/players/',
    });

    window.GOLFSTATS.players = new PlayerList();
    window.GOLFSTATS.Player = Player;
    window.GOLFSTATS.PlayerList = PlayerList;

}(window));

