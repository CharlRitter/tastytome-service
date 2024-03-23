import json
import sys
from recipe_scrapers import scrape_me

def scrape_recipe(recipe_url):
    try:
        scraper = scrape_me(recipe_url)
        recipe_data = {
            'host': scraper.host(),
            'title': scraper.title(),
            'total_time': scraper.total_time(),
            'image': scraper.image(),
            'ingredients': scraper.ingredients(),
            'ingredient_groups': [ig.__dict__ for ig in scraper.ingredient_groups()],
            'instructions': scraper.instructions(),
            'instructions_list': scraper.instructions_list(),
            'yields': scraper.yields(),
            'nutrients': scraper.nutrients(),
        }
        return recipe_data
    except Exception as e:
        print(f"Error scraping recipe: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scraper.py <recipe_url>")
        sys.exit(1)

    recipe_url = sys.argv[1]
    recipe_data = scrape_recipe(recipe_url)
    if recipe_data:
        print(json.dumps(recipe_data))
    else:
        sys.exit(1)
