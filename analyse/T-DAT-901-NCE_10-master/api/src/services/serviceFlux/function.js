
const { analyseSentiment } = require('../../utils/analyseSentiment');
const { summarizeText } = require('../../utils/summarizeText');
const Parser = require('rss-parser');

let parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    }
});



const motsCles = ['bitcoin', 'ethereum', 'cardano', 'litecoin', 'dogecoin', 'ripple', 'tether', 'tron', 'polkadot', 'worldcoin', 'solana'];
function filtrerMotsCles(article) {
    // Vérifier si les propriétés nécessaires existent dans l'article
    if (!article || !article.title || (!article.content && !article.description && !article['content:encoded'])) {
        return null;
    }

    const titre = article.title;
    const description = article.content || article.description || article['content:encoded'];
    
    const articleAvecMotCle = motsCles.some((mot) => {
        // Vérifie si le titre contient le mot clé ou si la description contient le mot clé
        return titre.includes(mot) || description.includes(mot);
    });

    if (articleAvecMotCle) {
        console.log('Mots-clés trouvés', motsCles);
        console.log('Article avec mots-clés', article);
        return article;
    } else {
        return null;
    }
}
    //function pour récupérer les dernier flux RSS des dernière 24h
async function fluxByDate(article) {
    const date = new Date();
    const date24h = date.setDate(date.getDate() - 1);
    const pubDate = new Date(article.pubDate);
    if(pubDate > date24h) {
        return article;
    } else {
        return null;
    }

}
// Fonction principale pour récupérer et filtrer le flux RSS
async function filtrerFluxRSS(url) {
    try {
        const feed = await parser.parseURL(url);
        const last24h = feed.items.filter(fluxByDate);
        const parsedFeed = await Promise.all(last24h.map(async (item) => {
            const articleFiltered = filtrerMotsCles(item);
            console.log('article filtered', articleFiltered);
            
            const description = item?.content || item?.description || item['content:encoded'];
            const cleanedDescription = await cleanText(description);
            const summarizedDescription = await summarizeText(cleanedDescription);
            await waitModelLoading(21); 
            const result = {
                title: item?.title,
                pubDate: item?.pubDate,
                description:  summarizedDescription,
            };
            console.log('result', result);
            return result;        
        })); 
        return parsedFeed;
    } catch (error) {
        console.error('Error in filtrerFluxRSS:', error);
        return null; 
    }
}
async function cleanText(text) {
    // Supprimer les balises <img> avec leur contenu
    const imgRegex = /<img[^>]*>.*?<\/img>/g;
    text = text.replace(imgRegex, '');

    // Remplacer les caractères spéciaux encodés comme « L8217 » par leurs équivalents
    text = text.replace(/&#(?:\d+);/g, match => String.fromCharCode(match.slice(2, -1)));

    // Supprimer les balises HTML restantes
    const htmlTagsRegex = /<\/?[^>]+(>|$)/g;
    text = text.replace(htmlTagsRegex, '');

    // Supprimer les espaces supplémentaires
    const extraSpacesRegex = /\s+/g;
    text = text.replace(extraSpacesRegex, ' ');

    return text.trim();
}
async function waitModelLoading(estimatedTime) {
    return new Promise(resolve => setTimeout(resolve, estimatedTime * 1000));
}

async function fetchRss(feedUrl) {
    try {
        const feed = await parser.parseURL(feedUrl);            
        console.log('feed', feed);
        const parsedFeed = await Promise.all(feed?.items.map(async (item) => {
            console.log('item', item);
            const description = item['content:encoded'] || item?.content || item?.description;
            const cleanedDescription = await cleanText(description);
            const summarizedDescription = await summarizeText(cleanedDescription);
            await waitModelLoading(21);  
            const result = {
                title: item?.title,
                pubDate: item?.pubDate,
                description: summarizedDescription,
            };
            console.log('result', result);  
            if(result.description === undefined || result.description === null) {
                const description = item?.description
                const cleanedDescription = await cleanText(description);
                const summarizedDescription = await summarizeText(cleanedDescription);
                await waitModelLoading(21);
                result.description = summarizedDescription;
                console.log('result', result);
                return result;
            } else {
                return result;
            }
            
        }));

        return parsedFeed;
    } catch (error) {
        throw error;
    }
}



async function replaceSymbols(cryptoSymbol) {
    try{
        switch(cryptoSymbol) {
            case "bitcoin":
                cryptoSymbol = "BTC";
            case "ethereum":
                cryptoSymbol = "ETH";
            case "litecoin":
                cryptoSymbol = "LTC";
            case "dogecoin":
                cryptoSymbol = "DOGE";
            case "cardano":
                cryptoSymbol = "ADA";
            case "tether":
                cryptoSymbol = "USDT";
            case "tron":
                cryptoSymbol = "TRX";
            case "polkadot":
                cryptoSymbol = "DOT";
            case "rippe":
                cryptoSymbol = "XRP";
            break;
            default:
                return cryptoSymbol;
        }
        return cryptoSymbol;

    } catch (error) {
        throw error;
    }
};

module.exports = { filtrerFluxRSS, fetchRss , replaceSymbols, filtrerMotsCles, fluxByDate };
