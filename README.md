# Nata
Data Scrapping Blockchain &amp; Cryptocurrency RSS Feeds

- Requires MongoDB database and collection (configuration WIP)
- Feeds.csv must contain: `uuid,website_name,address,date_added` as example `019b604d-8d8a-784b-8ad6-16eef6098968,WebSite Name,https://www.google.com/rss?outputType=xml,2025-12-30`
  - Feeds.csv can be updated at anytime, but `npm run start` must be reran.
