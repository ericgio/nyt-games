import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { solutions } from '../../data/wordle-solutions.json';

const API_URL = 'https://www.nytimes.com/svc/wordle/v2';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date } = req.query;

  let solution = solutions.find((s) => s.print_date === date);

  if (!solution) {
    const { data } = await axios.get(`${API_URL}/${date}.json`);
    solution = data;
  }

  res.status(200).json(solution);
}

export default handler;
