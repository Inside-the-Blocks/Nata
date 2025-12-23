import 'dotenv/config';
import mongoose from 'mongoose';
import {loadFeedsFromCSV} from './csvLoader';
import {startScheduler} from './services/scheduler';

async function main()
{
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rss_scraper';
    const csvPath = process.env.CSV_PATH || './feeds.csv';

    try
    {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
    }
    catch (err)
    {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }

    try
    {
        const sources = await loadFeedsFromCSV(csvPath);
        console.log(`Loaded ${sources.length} feed sources from CSV`);

        if (sources.length === 0) {
            console.warn('No feeds to process. Check your CSV file.');
            return;
        }

        startScheduler(sources);
    }
    catch (err)
    {
        console.error('Error loading feeds:', err);
        process.exit(1);
    }
}

main().catch((err) =>
{
    console.error('Fatal error:', err);
    process.exit(1);
});
