const googleTrendsAPI = require("google-trends-api");
const moment = require("moment");

exports.handler = async (event) => {
  const { query, values } = JSON.parse(event.body);

  const dates = [
    moment().subtract(366, "day").toDate(),
    moment().subtract(2, "day").toDate(),
  ];

  const cpuAnswer = await getCpuAnswer(query, dates);
  values.push(cpuAnswer);

  const queries = values.map((value) => query + " " + value);
  return getTrendsScores(queries, dates);
};

async function getCpuAnswer(query, dates) {
  const relatedQueries = JSON.parse(
    await googleTrendsAPI.relatedQueries({
      keyword: query,
      geo: "US",
      startTime: dates[0],
      endTime: dates[1],
    })
  );
  const topQueries = relatedQueries.default.rankedList[0];
  // Return the fifth highest answer
  return topQueries.rankedKeyword[4].query;
}

async function getTrendsScores(queries, dates) {
  const {
    default: { timelineData, averages },
  } = JSON.parse(
    await googleTrendsAPI.interestOverTime({
      keyword: queries,
      startTime: dates[0],
      endTime: dates[1],
    })
  );

  if (averages.length === 0) {
    return {
      statusCode: 404,
      body: "No results for these queries",
    };
  }

  let trendsScores = {
    user: {
      answer: queries[0],
      weeklyScore: timelineData.map((entry) => entry.value[0]),
    },
    cpu: {
      answer: queries[1],
      weeklyScore: timelineData.map((entry) => entry.value[1]),
    },
  };

  return {
    statusCode: 200,
    body: JSON.stringify(trendsScores),
  };
}
