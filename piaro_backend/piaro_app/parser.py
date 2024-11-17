from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from django.utils import timezone 
from .models import Community, Publication
from django.contrib.auth import get_user_model


User = get_user_model()

class Parser:
    
    PARSING_PLACE = "https://www.reddit.com/"

    def __init__(self, url):
        self.url = url
        
    def collect_links(self, driver):
        soup = BeautifulSoup(driver.page_source, 'html.parser') 
        articles = soup.find_all('article', class_="w-full m-0") 
        links = []
        for article in articles: 
            link = article.find('a', class_="absolute inset-0") 
            try:
                href = link.get('href')
                full_url = self.PARSING_PLACE + href
                links.append(full_url)
            except Exception as e:
                print(e)
                continue
        return links

    def parse_community_data(self, driver):
        community = {}
        try:
            community_name_box = driver.find_element(By.CLASS_NAME, "flex.items-center.truncate")
            full_text = community_name_box.text
            parts = full_text.split('\n')
            community_name = parts[2][2::]  
            
            description_element = driver.find_element(By.TAG_NAME, "shreddit-subreddit-header").text
            description = description_element.split('\n')[3]
        except Exception as e:
            print(f"Error: {e}")
            return 
        return {'community_name': community_name, 'community_description': description}
    
    def parse_content(self, driver):
        try:
            title = driver.find_element(By.XPATH, "//h1[@slot='title']").text
            content_element = driver.find_element(By.XPATH, "//div[@slot='post-media-container']")
            content_html = content_element.get_attribute('outerHTML')
            print(f"Content HTML: {content_html}")
        except Exception as e:
            print(f'Error: {e}')
            return 
        return {'Content_title': title, 'content': content_html}
        
    def create_object(self, community, content):
        # Ensure user with id=1 is the creator
        creator = User.objects.get(id=1) 
        
        # Check if the community exists; if not, create it
        community_obj, created = Community.objects.get_or_create(
            name=community['community_name'],
            defaults={'creator': creator, 'description': community['community_description']}
        ) 
        
        # Create a new publication
        publication = Publication.objects.create(
            title=content['Content_title'], 
            author=creator, 
            date_posted=timezone.now(), 
            content=content['content']
        ) 
        publication.communities.add(community_obj) 
        print(f"Created community: {community_obj.name} and publication: {publication.title}")

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
    test_url = 'https://www.reddit.com/'
    parser = Parser(test_url)
    parser.run()
