from django.http import JsonResponse
from django.contrib.contenttypes.models import ContentType

def get_content_types(request):
    content_types = ContentType.objects.all()
    data = {ct.model: ct.id for ct in content_types}
    return JsonResponse(data)

