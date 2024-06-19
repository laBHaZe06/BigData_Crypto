
async function summarizeText(data)  {
    try{
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Falconsai/text_summarization",
            {
                headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = { summarizeText };
