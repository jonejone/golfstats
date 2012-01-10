$(function() {

    module('Golfstats.Courses');

    function make_course(holes, par) {
        var course = new GOLFSTATS.Course({
            name: 'Some random course',
        });

        // Generate 18 holes
        _.each(_.range(1, holes + 1), function(i) {
            var ch = new GOLFSTATS.CourseHole({
                order: i + 1,
                name: 'Hole ' + i,
                par: par,
                course: course,
            });
            course.courseholes.add(ch);
            GOLFSTATS.courseholes.add(ch);

        });

        GOLFSTATS.courses.add(course);

        return course;
    }

    test('Create new course', function() {
        var course = make_course(18, 3);

        // Check for 18 holes
        equals(18, course.courseholes.length, "Created 18 holes")

        // Check that course got correct par
        equals(18 * 3, course.par(), "Course par is correct");
    });

    if(!window.GOLFSTATS_DEBUG) {
        window.GOLFSTATS_DEBUG = {};
    }

    window.GOLFSTATS_DEBUG.make_course = make_course;
});
