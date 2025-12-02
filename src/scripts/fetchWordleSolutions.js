const axios = require('axios');
const { addDays, format, parseISO, formatISO } = require('date-fns');
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../data/wordle-solutions.json');

let wordleSolutions = {
  solutions: [],
};

console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);
console.log(dataPath);
console.log(fs.existsSync(dataPath));

if (fs.existsSync(dataPath)) {
  try {
    wordleSolutions = require(dataPath);
  } catch (err) {
    console.error(`Error loading ${dataPath}:`, err);
  }
}

const MAX_DATE = format(addDays(new Date(), -1), 'yyyy-MM-dd');
const MIN_DATE = '2021-06-19';

const API_URL = 'https://www.nytimes.com/svc/wordle/v2';

console.log(wordleSolutions);

async function fetchWordleSolutions() {
  const solutions = wordleSolutions.solutions || [];

  let date = MIN_DATE;
  while (date <= MAX_DATE) {
    const nextDate = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');

    // Skip fetching solutions for dates we already have.
    if (solutions.find((s) => s.print_date === date)) {
      date = nextDate;
      continue;
    }

    const { data } = await axios.get(`${API_URL}/${date}.json`);
    console.log(`Fetched solution for ${date}`);
    solutions.push(data);

    // Increment the date.
    date = nextDate;
  }

  return {
    solutions,
    updated: formatISO(new Date()),
  };
}

module.exports = fetchWordleSolutions;
