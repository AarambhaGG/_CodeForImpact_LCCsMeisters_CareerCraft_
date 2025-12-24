from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def home(request):
    return HttpResponse("Welcome to CareerCraft - Your AI-powered career development platform!")
