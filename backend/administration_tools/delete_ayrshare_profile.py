import requests
from django.conf import settings
from api_ayrshare.models import ImageUpload

'''
from administration_tools.delete_ayrshare_profile import delete_profile
from api_ayrshare.models import Profiles
profile = Profiles.objects.get(user__username='lario')
delete_profile(profile)
'''
def delete_profile(profile):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {settings.AYRSHARE_TOKEN}',
        'Profile-Key': profile.key,
    }
    print(f'Deleting profile {profile} ayrshare...')
    r = requests.delete(
        'https://app.ayrshare.com/api/profiles/profile', headers=headers
    )

    if r.status_code == 200:
        print(f'{profile} profile deleted from ayrshare.')
        print(f'Deleting profile {profile} database..')
        images = ImageUpload.objects.filter(post__profile=profile)
        for image in images:
            image.delete()
        profile.delete()
        print(f'{profile} profile deleted from database.')
        return True
    else:
        print(
            f'error when deleting ayrshare {profile} profile. Status code: {r.status_code}'
        )
        return False