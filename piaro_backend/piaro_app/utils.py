import base64
import re
import uuid
from bs4 import BeautifulSoup
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings


class HandleImagesInContent:
    def __init__(self, publication, request):
        self.publication = publication
        self.request = request

    def get_content(self):
        return self.publication.get('content')

    def store_images(self, content):
        soup = BeautifulSoup(content, 'html.parser')
        images = soup.find_all('img')
        if not images:
            return content  # No images to process

        for image in images:
            src = image.get('src')
            if 'data:image/jpeg;base64' not in src:
                continue

            # Extract and decode base64 data
            img_data = src.split('base64,')[1][0:-2]
            img_format = re.search(r'data:image/(.*);base64', src).group(1)
            img_name = f"{uuid.uuid4()}.{img_format}"

            # Save the image
            imgdata = base64.b64decode(img_data)
            image_file = ContentFile(imgdata, name=img_name)
            img_path = default_storage.save(f'publication_images/{img_name}', image_file)

            # Update img src to the saved image's URL
            full_url = self.request.build_absolute_uri(default_storage.url(img_path))
            print(full_url)
            image['src'] = full_url

        return str(soup)

    def run(self):
        content = self.get_content()
        updated_content = self.store_images(content)
        return updated_content
    
class CreateResponse:
    
    @classmethod
    def create_user_response(user, refresh_token=None):
        response_data = {
            'email': user.email,
            'username': user.username,
            'id': user.id,
            'contact_number': user.contact_number,
            'tg_contact': user.tg_contact,
            'profile_photo': user.profile_photo.url if user.profile_photo else None,
            'community_status': user.community_status,
        }
        if refresh_token:
            response_data['access'] = str(refresh_token.access_token)
        return response_data

