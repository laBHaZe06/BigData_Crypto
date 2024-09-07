const SENTIMENTS = {
    NEUTRAL: 'neutral',
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
};

async function calculateAverage(items) {
    const averageScores = {
        [SENTIMENTS.NEUTRAL]: 0,
        [SENTIMENTS.POSITIVE]: 0,
        [SENTIMENTS.NEGATIVE]: 0,
    };

    const itemCounts = {
        [SENTIMENTS.NEUTRAL]: 0,
        [SENTIMENTS.POSITIVE]: 0,
        [SENTIMENTS.NEGATIVE]: 0,
    };

    items.forEach((item) => {
        if (Array.isArray(item?.Analysis) && item.Analysis.length > 0) {
            item.Analysis.forEach((analysis) => {
                const { label, score } = analysis;
                averageScores[label] += score;
                itemCounts[label]++;
            });
        }
    });

    Object.keys(averageScores).forEach((label) => {
        if (itemCounts[label] !== undefined && itemCounts[label] !== 0) {
            averageScores[label] = parseFloat((averageScores[label] / itemCounts[label]).toFixed(2)) * 100;
        } else {
            averageScores[label] = 0;
        }
    });

    return {
        averageScores,
        itemCounts,
    };
}


module.exports = {
    calculateAverage,
};
