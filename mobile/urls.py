from django.conf.urls.defaults import patterns, url
from django.core.urlresolvers import reverse_lazy

from mobile.views import index

urlpatterns = patterns('',
    url(r'^mobile/$', index, name="golfstats-mobile-index"),
)
