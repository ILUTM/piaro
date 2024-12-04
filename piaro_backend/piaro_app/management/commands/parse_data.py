from django.core.management.base import BaseCommand
from piaro_app.parser import Parser

class Command(BaseCommand):
    help = 'Parse data'

    def handle(self, *args, **kwargs):
        parser = Parser("https://prajdzisvet.org/poetry?letter=6592")
        parser.run()
        self.stdout.write(self.style.SUCCESS('Successfully parsed data!'))
