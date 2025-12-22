import fs from 'fs';
import path from 'path';
import {parse} from 'csv-parse';

export interface FeedSource {
    uuid: string;
    website_name: string;
    address: string;      // RSS URL
    date_added: Date;
}

export async function loadFeedsFromCSV(csvPath: string): Promise<FeedSource[]>
{
    return new Promise((resolve, reject) => {
        const records: FeedSource[] = [];

        const fullPath = path.resolve(csvPath);

        fs.createReadStream(fullPath)
            .pipe(
                parse({
                    columns: true,         // use header row
                    trim: true,
                    skip_empty_lines: true,
                })
            )
            .on('data', (row: any) => {
                const { uuid, website_name, address, date_added } = row;

                records.push({
                    uuid,
                    website_name,
                    address,
                    date_added: date_added ? new Date(date_added) : new Date(),
                });
            })
            .on('end', () => {
                resolve(records);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}
