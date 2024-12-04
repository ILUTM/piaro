import random 
import string
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from django.utils import timezone 
from .models import Community, Publication, Hashtag
from django.contrib.auth import get_user_model


User = get_user_model()

class Parser:
    
    PARSING_PLACE = "https://prajdzisvet.org/"

    def __init__(self, url):
        self.url = url
        
    def collect_links(self, driver):
        soup = BeautifulSoup(driver.page_source, 'html.parser') 
        articles = soup.find_all('ul', class_="text-list") 
        links = []
        for article in articles: 
            link = article.find('a') 
            try:
                href = link.get('href')
                full_url = self.PARSING_PLACE + href
                links.append(full_url)
            except Exception as e:
                print(e)
                continue
        print(links)
        return links

    def parse_community_data(self, driver):
        community = {}
        # try:
        #     community_name_box = driver.find_element(By.CLASS_NAME, "flex.items-center.truncate")
        #     full_text = community_name_box.text
        #     parts = full_text.split('\n')
        #     community_name = parts[2][2::]  
            
        #     description_element = driver.find_element(By.TAG_NAME, "shreddit-subreddit-header").text
        #     description = description_element.split('\n')[3]
        # except Exception as e:
        #     return 
        # return {'community_name': community_name, 'community_description': description}
        return {'community_name': 'Прайдзі свет', 'community_description': 'Часопіс перакладной літаратуры “ПрайдзіСвет” узнік у 2008 г. як ідэя віртуальнага перыядычнага выдання, цалкам прысвечанага замежнай літаратуры ў перакладах на беларускую мову. Маладыя перакладчыкі аб’ядналі свае сілы, каб пашырыць прастору беларускай культуры за кошт увядзення ў яе кантэкcт новых перакладаў замежных аўтараў, а таксама знаёмства з новымі імёнамі сусветнай літаратуры. Першы нумар часопіса выйшаў на прасторы інтэрнэту ў траўні 2009 г.'}
    
    def parse_content(self, driver):
        soup = BeautifulSoup(driver.page_source, 'html.parser') 
        try:
            header_section = soup.find('section', class_="12u")
            header = header_section.find('header')
            title = header.find('h1').get_text()
            author = header.find('span').get_text()
            print(author)
            content_elements = soup.find_all('article', class_="content-text")
            content_html = ''.join(str(element) for element in content_elements)
        except Exception as e:
            return 
        return {'Content_title': title, 'content': content_html, 'author': author}
    
    def create_random_password(self, length=12): 
        # Generate a random password 
        characters = string.ascii_letters + string.digits + string.punctuation 
        return ''.join(random.choice(characters) for i in range(length))
        
    def create_object(self, community, content): 
        # Check if the author exists; if not, create a new one 
        author_name = content['author'] 
        author, created = User.objects.get_or_create( username=author_name, defaults={'password': self.create_random_password()}) 
        if created: 
            print(f"Created new author: {author.username}") 
        # Check if the community exists; if not, create it 
        community_obj, created = Community.objects.get_or_create( name=community['community_name'], defaults={'creator': author, 'description': community['community_description']} ) 
        if created: 
            print(f"Created new community: {community_obj.name}") 
        # Create a new publication 
        publication = Publication.objects.create(
            title=content['Content_title'], 
            author=author, 
            date_posted=timezone.now(), 
            content=str(content['content']), 
            community=community_obj
        ) 
        # Add hashtags 
        hashtags = ['poetry', 'belarusian', 'culture'] 
        for tag in hashtags: 
            hashtag_obj, created = Hashtag.objects.get_or_create(name=tag) 
            publication.hashtags.add(hashtag_obj) 
        publication.save()

    def run(self):
        driver = webdriver.Chrome()
        driver.get(self.url)
        links = self.collect_links(driver)
        
        for link in links:
            driver.get(link)
            community_data = self.parse_community_data(driver)
            content_data = self.parse_content(driver)
            if community_data and content_data:
                self.create_object(community=community_data, content=content_data)
        
        driver.quit()  # Ensure the browser is closed
        print('Finished collecting links and parsing data')

if __name__ == '__main__':
    test_url = 'https://prajdzisvet.org/poetry?letter=6590'
    parser = Parser(test_url)
    parser.run()
