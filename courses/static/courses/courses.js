(function(window, document, undefined) {

    var Course = Backbone.Model.extend({
        initialize: function(attrs) {
            this.courseholes = new CourseHoleList();

            if(this.id) {
                this.courseholes.url = '/api/courseholes/'
                    + this.id + '/';

                _.each(attrs.courseholes, function(ch) {
                    var coursehole = new CourseHole(ch);

                    this.courseholes.add(coursehole);

                    /* Add to global collection of courseholes */
                    GOLFSTATS.courseholes.add(coursehole);
                }, this);
            }
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

        getByUrl: function(url) {
            var course_id = url.split('/')[3];
            return this.get(course_id);
        },
    });

    // Models for course holes
    var CourseHole = Backbone.Model.extend({
        initialize: function(attrs) {
            this.url = '/api/courseholes/';
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

        getByUrl: function(url) {
            var coursehole_id = url.split('/')[3];
            return this.get(coursehole_id);
        },

        getByOrder: function(order) {
            var coursehole = this.filter(function(ch) {
                if(ch.get('order') == order) {
                    return true;
                }
            });

            if(coursehole.length) {
                return coursehole[0];
            } else {
                return false;
            }
        },
    });

    window.GOLFSTATS.Course = Course;
    window.GOLFSTATS.CourseHole = CourseHole;
    window.GOLFSTATS.courses = new CourseList();
    window.GOLFSTATS.courseholes = new CourseHoleList();

}(window));
