import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
from datetime import datetime

class F1StatsCrawler:
    def __init__(self):
        self.base_url = "https://www.statsf1.com/en"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.data_dir = "data"
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def get_page(self, url):
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {str(e)}")
            return None

    def parse_driver_standings(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        standings = []
        tables = soup.find_all('table', {'class': 'tableau'})
        if not tables or len(tables) < 1:
            return standings
        table = tables[0]
        rows = table.find_all('tr')[1:]
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 5:
                position = cols[0].text.strip()
                driver = cols[2].text.strip()
                team = cols[3].text.strip()
                points = cols[4].text.strip()
                standings.append({
                    'Position': position,
                    'Driver': driver,
                    'Team': team,
                    'Points': points
                })
        return standings

    def parse_constructor_standings(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        standings = []
        tables = soup.find_all('table', {'class': 'tableau'})
        if not tables or len(tables) < 2:
            return standings
        table = tables[1]
        rows = table.find_all('tr')[1:]
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 4:
                position = cols[0].text.strip()
                team = cols[2].text.strip()
                points = cols[3].text.strip()
                standings.append({
                    'Position': position,
                    'Team': team,
                    'Points': points
                })
        return standings

    def parse_race_results(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        results = []
        table = soup.find('table', {'class': 'tableau'})
        if not table:
            return results
        for row in table.find_all('tr')[1:]:
            cols = row.find_all('td')
            if len(cols) >= 5:
                position = cols[0].text.strip()
                driver = cols[1].text.strip()
                team = cols[2].text.strip()
                time = cols[3].text.strip()
                points = cols[4].text.strip()
                results.append({
                    'Position': position,
                    'Driver': driver,
                    'Team': team,
                    'Time': time,
                    'Points': points
                })
        return results

    def write_csv(self, data, filename, year):
        """Write data to CSV with the new naming convention"""
        if not data:
            print(f"No data to write for {filename}")
            return False

        df = pd.DataFrame(data)
        filepath = os.path.join(self.data_dir, f"Formula1_{year}season_{filename}.csv")
        df.to_csv(filepath, index=False)
        print(f"Successfully wrote {filepath}")
        return True

    def crawl_season_stats(self, year):
        print(f"Crawling stats for {year} season...")
        
        # Create directory for the year if it doesn't exist
        year_dir = os.path.join(self.data_dir, str(year))
        if not os.path.exists(year_dir):
            os.makedirs(year_dir)

        season_url = f"{self.base_url}/{year}.aspx"
        season_html = self.get_page(season_url)
        
        if season_html:
            # Parse and save driver standings
            driver_standings = self.parse_driver_standings(season_html)
            self.write_csv(driver_standings, "driverStandings", year)

            # Parse and save constructor standings
            constructor_standings = self.parse_constructor_standings(season_html)
            self.write_csv(constructor_standings, "constructorStandings", year)

        # Get race results for each race
        races_url = f"{self.base_url}/{year}/gp.aspx"
        races_html = self.get_page(races_url)
        if races_html:
            soup = BeautifulSoup(races_html, 'html.parser')
            race_links = soup.find_all('a', href=lambda x: x and f"/{year}/" in x and "gp" in x)
            
            all_race_results = []
            for link in race_links:
                race_url = f"{self.base_url}{link['href']}"
                race_name = link.text.strip()
                race_html = self.get_page(race_url)
                
                if race_html:
                    results = self.parse_race_results(race_html)
                    if results:
                        # Add race name to each result
                        for result in results:
                            result['Race'] = race_name
                        all_race_results.extend(results)
                
                time.sleep(1)  # Be nice to the server

            # Save all race results in one file
            if all_race_results:
                self.write_csv(all_race_results, "raceResults", year)

        print(f"Finished crawling stats for {year} season")

    def crawl_multiple_seasons(self, start_year, end_year):
        for year in range(start_year, end_year + 1):
            self.crawl_season_stats(year)
            time.sleep(2)  # Be nice to the server

if __name__ == "__main__":
    crawler = F1StatsCrawler()
    # Crawl seasons from 2022 to 2025
    crawler.crawl_multiple_seasons(2022, 2025) 