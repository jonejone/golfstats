from django.conf.urls.defaults import patterns, url, include
from django.views.generic import TemplateView

urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(
        template_name="index.html",
    ), name="golfstats-index"),
)

urlpatterns += patterns('',
    url(r'', include('courses.urls')),
)