(function(window, document, undefined) {

    var Course = Backbone.Model.extend({
        initialize: function() {
            this.courseholes = new CourseHoleList();
            this.courseholes.url = '/api/courses/' +
                this.id + '/courseholes/';
        },

        url: '/api/courses/',

        par: function() {
            var par = 0;

            this.courseholes.forEach(function(hole) {
                par += hole.get('par');
            });

            return par;
        },

        getUrl: function() {
            if(this.id) {
                return this.url + this.id + '/';
            } else {
                return this.url + this.cid + '/';
            }
        },
    });

    var CourseList = Backbone.Collection.extend({
        model: Course,
        url: '/api/courses/',
    });

    // Models for course holes
    var CourseHole = Backbone.Model.extend({
        initialize: function() {
            if(this.get('course').id) {
                this.url = '/api/courses/' + this.get('course').id +
                    '/courseholes/';
            } else {
                this.url = '/api/courses/' + this.get('course').cid +
                    '/courseholes/';
            }
        },

        getUrl: function() {
            if(this.id) {
                return this.url + this.id + '/';
            } else {
                return this.url + this.cid + '/';
            }
        },

    });

    var CourseHoleList = Backbone.Collection.extend({
        model: CourseHole,
    });

    window.GOLFSTATS.Course = Course;
    window.GOLFSTATS.CourseHole = CourseHole;
    window.GOLFSTATS.courses = new CourseList();

}(window));
