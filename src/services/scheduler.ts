import type {FeedSource} from '../csvLoader';
import {fetchAndStoreAllFeeds} from './rssService';

export function startScheduler(sources: FeedSource[])
{
    console.log('Starting 1-minute scheduler for RSS feeds...');

    // Initial run
    fetchAndStoreAllFeeds(sources).catch((err) =>
        console.error('Initial fetch error:', err)
    );

    // Every minute
    setInterval(() => {
        console.log(`[${new Date().toISOString()}] Running scheduled RSS check...`);
        fetchAndStoreAllFeeds(sources).catch((err) =>
            console.error('Scheduled fetch error:', err)
        );
    }, 60 * 1000);
}
