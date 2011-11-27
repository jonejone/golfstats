from django.shortcuts import render
import simplejson

from courses.models import Course
from players.models import Player
from games.models import Game

def index(request):
    context = {
        'players': _get_players_json(),
        'courses': _get_courses_json(),
    }

    return render(request, 'mobile/index.html', context)


def _get_courses_json():
    data = []

    for course in Course.objects.all():
        data.append({
            'id': course.id,
            'par': course.get_course_par(),
            'name': course.name,
            'holes': [],
        })

    return simplejson.dumps(data)


def _get_players_json():
    data = []

    for player in Player.objects.all():
        data.append({
            'id': player.id,
            'name': player.name
        })

    return simplejson.dumps(data)
