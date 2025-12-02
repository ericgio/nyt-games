import * as React from 'react';
import styled from 'styled-components';

import Input from '../components/Input';
import Page from '../components/Page';
import Tile from '../components/Tile';

import { formatDistanceToNow } from 'date-fns';

import { solutions, updated } from '../data/wordle-solutions.json';

const TITLE = 'Wordle Solutions';

const $Solution = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 1.5rem 0;
`;

const $Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
`;

function WordleHelper() {
  const [filter, setFilter] = React.useState('');

  const results = solutions
    .map((s) => s.solution)
    .filter((s) => s.toLowerCase().includes(filter.toLowerCase()))
    .sort();

  return (
    <Page faviconSrc="/wordle-favicon.ico" title={TITLE}>
      <Page.Main>
        <Page.Title icon="wordle">{TITLE}</Page.Title>
        <Input
          onChange={(e) => setFilter(e.target.value)}
          type="text"
          value={filter}
        />
        <$Solution>
          <p>
            {results.length} {results.length === 1 ? 'solution' : 'solutions'}
            <br />
            <small>
              <em>
                Last updated: {formatDistanceToNow(new Date(updated))} ago
              </em>
            </small>
          </p>
          {results.map((s) => (
            <$Row key={s}>
              {s.split('').map((char, idx) => (
                <Tile key={`${s}-${idx}`} state="correct">
                  {char}
                </Tile>
              ))}
            </$Row>
          ))}
        </$Solution>
      </Page.Main>
    </Page>
  );
}

export default WordleHelper;
