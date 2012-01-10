from piston.handler import BaseHandler
from piston.utils import rc

from datetime import datetime

from courses.models import Course, CourseHole


class CourseHandler(BaseHandler):
    allowed_methods = ("GET",)
    model = Course
    fields = ("id", "name", )

    def read(self, req, pk=None):
        base = Course.objects

        if pk is not None:
            return self._get_course(base.get(pk=pk))

        return [self._get_course(c) for c in base.all()]

    def _get_course(self, course):
        return {
            'id': course.id,
            'name': course.name,
            'courseholes': self._get_courseholes(course),
        }

    def _get_courseholes(self, course):
        courseholes = []

        for coursehole in course.courseholes.all():
            courseholes.append({
                'id': coursehole.id,
                'par': coursehole.hole.par,
                'order': coursehole.order,
                'name': coursehole.name,
            })

        return courseholes


class CourseHoleHandler(BaseHandler):
    allowed_methods = ("GET",)
    model = CourseHole

    def read(self, req, pk):
        pass
