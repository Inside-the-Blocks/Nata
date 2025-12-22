import Parser from 'rss-parser';
import { FeedItem } from '../models/Feed';
import { FeedSource } from '../csvLoader';

const parser = new Parser();

export async function fetchAndStoreFeed(source: FeedSource): Promise<void> {
    try
    {
        const feed = await parser.parseURL(source.address);

        if (!feed.items || feed.items.length === 0)
        {
            console.log(`No items found for ${source.address}`);

            return;
        }

        for (const item of feed.items)
        {
            // Map RSS fields to our schema
            const doc = {
                uuid: source.uuid,
                website_name: source.website_name,
                address: source.address,
                title: item.title || '(no title)',
                link: item.link || '',
                pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
                contentSnippet: item.contentSnippet,
                isoDate: item.isoDate ? new Date(item.isoDate) : undefined,
                // created_at and reviewed_date are handled by schema defaults
            };

            try
            {
                await FeedItem.updateOne(
                    { uuid: source.uuid, link: doc.link },
                    { $setOnInsert: doc },
                    { upsert: true }
                );
            }
            catch (err: any)
            {
                if (err.code === 11000) {
                    // duplicate key -> item already exists, ignore
                    continue;
                }

                console.error('Error upserting feed item', err);
            }
        }

        console.log(`Processed feed for ${source.website_name} (${source.address})`);
    }
    catch (err)
    {
        console.error(`Failed to fetch RSS for ${source.address}:`, err);
    }
}

export async function fetchAndStoreAllFeeds(sources: FeedSource[]): Promise<void>
{
    for (const source of sources)
    {
        await fetchAndStoreFeed(source);
    }
}
