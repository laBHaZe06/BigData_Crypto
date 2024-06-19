
async function analyseSentiment(data) {
    try{
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis",
            {
                headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        console.log('analyse sentiment api response', result);
        return result;

    } catch (error) {   
        throw error;
    }
}

module.exports = { analyseSentiment };


