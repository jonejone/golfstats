from piston.handler import BaseHandler
from piston.utils import rc

from datetime import datetime

from courses.models import Course, CourseHole


class CourseHandler(BaseHandler):
    allowed_methods = ("GET",)
    model = Course
    fields = ("id", "name",)

    def read(self, req, pk=None):
        base = Course.objects

        if pk is not None:
            return base.get(pk=pk)

        return base.all()


class CourseHoleHandler(BaseHandler):
    allowed_methods = ("GET",)
    model = CourseHole

    def read(self, req, pk):
        pass
