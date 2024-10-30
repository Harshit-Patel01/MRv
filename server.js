const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

const port = process.env.PORT||3000;
let cachedTitles = new Set(); // Using Set for unique titles
let processedLinks = new Set(); // Track processed links

// Configure axios defaults
axios.defaults.timeout = 5000;
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

function getRandomUniqueItems(itemsSet, count) {
    const items = Array.from(itemsSet);
    const result = new Set();
    
    // Shuffle array using Fisher-Yates algorithm
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    
    // Take first 'count' unique items
    for (let i = 0; i < Math.min(count, items.length); i++) {
        result.add(items[i]);
    }
    
    return Array.from(result);
}

async function processMovieData($, titles) {
    const results = [];
    
    for (const el of titles) {
        try {
            const link = $(el).attr('href');
            if (!link || processedLinks.has(link)) {
                continue; // Skip if link is missing or already processed
            }

            console.log('Processing new link:', link);
            processedLinks.add(link); // Mark link as processed

            const { data: linkHtml } = await axios.get(link);
            const $link = cheerio.load(linkHtml);

            const imageSrcSets = $link('.hero-image-loader > source[srcset]')
                .slice(0, 1)
                .map((i, img) => $link(img).attr('srcset'))
                .get();

            const uniqueImages = new Set();
            imageSrcSets.forEach(srcSet => {
                if (srcSet) {
                    srcSet.split(',').forEach(src => {
                        const trimmedSrc = src.trim().split(' ')[0];
                        if (trimmedSrc) uniqueImages.add(trimmedSrc);
                    });
                }
            });

            const images = Array.from(uniqueImages);
            const textData = $link('.details-container')
                .map((i, text) => $link(text).html())
                .get()
                .filter(Boolean);

            if (images.length > 0 && textData.length > 0) {
                results.push({ link, images, textData });
            }

        } catch (error) {
            console.error(`Error processing movie data:`, error);
            results.push({ error: error.message, link: $(el).attr('href') });
        }
    }
    
    return results;
}

app.get('/initial', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).send('Missing URL parameter');
        }

        console.log('Fetching initial data from:', url);
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        // Reset cached data
        cachedTitles = new Set();
        processedLinks = new Set();

        // Collect all unique titles
        $('.nm-collections-title').each((_, el) => {
            const link = $(el).attr('href');
            if (link) {
                cachedTitles.add(el);
            }
        });

        console.log(`Found ${cachedTitles.size} unique titles`);

        // Get first 10 unique items
        const initialTitles = getRandomUniqueItems(cachedTitles, 10);
        console.log(`Processing ${initialTitles.length} initial titles`);

        const results = await processMovieData($, initialTitles);
        
        res.json({
            movies: results,
            hasMore: cachedTitles.size > processedLinks.size,
            totalItems: cachedTitles.size,
            processedItems: processedLinks.size
        });

    } catch (error) {
        console.error('Error in /initial endpoint:', error);
        res.status(500).json({
            error: 'Error scraping website',
            details: error.message
        });
    }
});

app.get('/more', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
        
        console.log(`Fetching ${count} more items. Currently processed: ${processedLinks.size}`);
        
        // Make sure we have a cheerio instance
        const $ = cheerio.load('');
        
        // Filter out already processed titles
        const remainingTitles = new Set(
            Array.from(cachedTitles).filter(el => !processedLinks.has($(el).attr('href')))
        );

        if (remainingTitles.size === 0) {
            console.log('No more unique items available');
            return res.json({ 
                movies: [], 
                hasMore: false,
                processedItems: processedLinks.size,
                totalItems: cachedTitles.size
            });
        }

        const nextTitles = getRandomUniqueItems(remainingTitles, count);
        console.log(`Processing ${nextTitles.length} additional unique titles`);

        const results = await processMovieData($, nextTitles);
        
        res.json({
            movies: results,
            hasMore: processedLinks.size < cachedTitles.size,
            processedItems: processedLinks.size,
            totalItems: cachedTitles.size
        });

    } catch (error) {
        console.error('Error in /more endpoint:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            error: 'Error fetching more items',
            details: error.message
        });
    }
});

// Add a test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        status: 'Server is running',
        processedLinks: processedLinks.size,
        totalUniqueTitles: cachedTitles.size
    });
});

app.listen(port, () => {
    console.log(`Server running at PORT:${port}`);
});