import mongoose, {Document, Schema} from 'mongoose';

export interface IFeedItem extends Document {
    uuid: string;            // from CSV to link item to a source
    website_name: string;    // from CSV
    address: string;         // RSS URL
    title: string;
    link: string;
    pubDate?: Date;
    contentSnippet?: string;
    isoDate?: Date;
    created_at: Date;
    reviewed_date?: Date;    // timestamp, initially undefined (not null)
}

const FeedItemSchema = new Schema<IFeedItem>(
{
        uuid: { type: String, required: true },
        website_name: { type: String, required: true },
        address: { type: String, required: true },

        title: { type: String, required: true },
        link: { type: String, required: true },
        pubDate: { type: Date },
        contentSnippet: { type: String },
        isoDate: { type: Date },

        created_at: { type: Date, default: Date.now },

        // reviewed_date is optional and not set by default
        reviewed_date: { type: Date, required: false },
},
{
    indexes: [
        // optional: avoid duplicates by RSS link per uuid
    ],
});

// Example index to prevent duplicates:
FeedItemSchema.index({ uuid: 1, link: 1 }, { unique: true });

export const FeedItem = mongoose.model<IFeedItem>('FeedItem', FeedItemSchema);