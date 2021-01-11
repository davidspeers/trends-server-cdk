const googleTrendsAPI = require('google-trends-api');
const moment = require('moment');

exports.handler = async (request, response) => {
    const postData = JSON.parse(request.body);

    //Get Trends results
    const dates = [
        moment()
            .subtract(32, 'day')
            .toDate(),
        moment()
            .subtract(2, 'day')
            .toDate(),
    ];

    Object.keys(postData.values).forEach(key => {
        postData.values[key] = `${postData.query} ${postData.values[key]}`;
    });

    postData.values.push(await getCpuAnswer(postData, dates));

    response.send(await getTrendsScores(postData, dates));
};

async function getCpuAnswer(postData, dates) {
    const relatedQueries = JSON.parse(
        await googleTrendsAPI.relatedQueries({
            keyword: postData.query,
            geo: 'US',
            startTime: dates[0],
            endTime: dates[1],
        })
    );
    const topQueries = relatedQueries.default.rankedList[0];
    // Return the fifth highest answer
    return topQueries.rankedKeyword[4].query;
}

async function getTrendsScores(postData, dates) {
    const interestOverTime = JSON.parse(
        await googleTrendsAPI.interestOverTime({
            keyword: postData.values,
            startTime: dates[0],
            endTime: dates[1],
        })
    );
    let averageScores = interestOverTime.default.averages;

    //If no results return 0s else return results
    if (averageScores.length === 0) {
        postData.values.forEach(() => averageScores.push(0));
    }

    let trendsScores = {};
    postData.values.forEach((value, index) => (trendsScores[value] = averageScores[index]));

    return JSON.stringify(trendsScores);
}
