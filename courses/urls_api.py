from django.conf.urls.defaults import patterns, url
from piston.resource import Resource

from courses.handlers import CourseHandler, CourseHoleHandler

course_handler = Resource(CourseHandler)
coursehole_handler = Resource(CourseHoleHandler)

urlpatterns = patterns('',
    url(r'^courses/$', course_handler),
    url(r'^courses/(?P<pk>\d+)/$', course_handler),
    url(r'^courses/(?P<pk>\d+)/courseholes/$', coursehole_handler),
)
