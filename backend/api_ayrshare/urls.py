from django.urls import path
from api_ayrshare import views

app_name = 'Ayrshare'

urlpatterns = [
    path('profiles/', views.ProfilesListView.as_view(), name='profiles_list'),
    path(
        'profiles/<int:id_profile>/posts/<int:id>/',
        views.PostsDetailView.as_view(),
        name='posts_detail',
    ),
    path(
        'profiles/<int:id>/posts/',
        views.PostsListView.as_view(),
        name='posts_list',
    ),
    path('profiles/<int:pk>/', views.ProfilesDetailView.as_view(), name='profiles_detail'),
    path(
        'profilekey/<int:pk>/',
        views.ProfileKeyView.as_view(),
        name='profile_key',
    ),
]