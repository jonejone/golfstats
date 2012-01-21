from django.conf.urls.defaults import patterns, url, include

# URL includes for API
urlpatterns = patterns('',
    url(r'', include('players.urls_api')),
    url(r'', include('courses.urls_api')),
    url(r'', include('games.urls_api')),
)
