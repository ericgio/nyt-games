import axios from 'axios';
import { format } from 'date-fns';
import * as React from 'react';
import styled, { keyframes } from 'styled-components';

import Page from '../components/Page';
import Tile, { TileState } from '../components/Tile';
import TileInput from '../components/TileInput';

import { solutions } from '../data/wordle-solutions.json';
import list from '../data/wordle.json';
import { useMultiInput, UseMultiInputOptions } from '../hooks';
import { wordleSolver } from '../utils';

const LETTER_COUNT = 5;
const MAX_DATE = format(new Date(), 'yyyy-MM-dd');
const MAX_GUESSES = 6;
const TITLE = 'Wordle Helper';

const shake = keyframes`
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
`;

const $Shake = styled.div`
  &.animate {
    animation: ${shake} 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
`;

interface ShakeProps {
  animate: boolean;
  children: React.ReactNode;
  onAnimationEnd: () => void;
}

function Shake({ animate, ...props }: ShakeProps) {
  return <$Shake {...props} className={animate ? 'animate' : ''} />;
}

const pop = keyframes`
  50%  {
    transform: scale(1.1);
  }
`;

const $TileInput = styled(TileInput)`
  &.animate {
    animation: ${pop} 50ms linear 1;
  }
`;

const $Flipper = styled.div<{ $index: number }>`
  position: relative;
  transform-style: preserve-3d;
  transition: 0.5s;
  transition-delay: ${({ $index }) => `${$index * 200}ms`};

  &.animate {
    transform: rotateX(180deg);
  }
`;

const $Tile = styled(Tile)<{ $isFront?: boolean }>`
  backface-visibility: hidden;
  ${({ $isFront }) => !$isFront && 'position: absolute;'}
  left: 0;
  top: 0;
  transform: rotateX(${({ $isFront }) => ($isFront ? 0 : 180)}deg);
`;

interface FlipTileProps extends React.HTMLProps<HTMLDivElement> {
  index: number;
  state: TileState;
}

function FlipTile(props: FlipTileProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Set the `animate` classname only after the component has mounted.
    setMounted(true);
  }, []);

  return (
    <$Flipper className={mounted ? 'animate' : ''} $index={props.index}>
      <$Tile $isFront={true} state="tbd">
        {props.children}
      </$Tile>
      <$Tile state={props.state}>{props.children}</$Tile>
    </$Flipper>
  );
}

const $Solution = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 1.5rem 0;
`;

const $RowButton = styled.a.attrs({
  href: '#',
  role: 'button',
})`
  text-decoration: none;
`;

const $Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
`;

interface MultiInputProps extends Omit<UseMultiInputOptions, 'count'> {
  disabled?: boolean;
}

function MultiInput({ disabled, ...props }: MultiInputProps) {
  const containerRef = useMultiInput({
    ...props,
    count: LETTER_COUNT,
  });

  return (
    <$Row ref={containerRef}>
      {Array.from(Array(LETTER_COUNT).keys()).map((idx) => {
        const value = props.value[idx] || '';

        return (
          <$TileInput
            className={value ? 'animate' : ''}
            key={idx}
            maxLength={1}
            onChange={() => {
              // No-op to avoid React warning.
            }}
            readOnly={disabled}
            state={value ? 'tbd' : 'empty'}
            value={value}
          />
        );
      })}
    </$Row>
  );
}

function WordleHelper() {
  const [guesses, setGuesses] = React.useState<string[]>([]);
  const [solution, setSolution] = React.useState<string>('');
  const [value, setValue] = React.useState<string>('');
  const [isInvalid, setIsInvalid] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Fetch today's solution
    async function fetchSolution() {
      const { data } = await axios.get(`/api/wordle?date=${MAX_DATE}`);
      setSolution(data.solution);
    }

    fetchSolution();
  }, []);

  const onSetGuess = React.useCallback(
    (guess: string) => {
      setGuesses([...guesses, guess]);
    },
    [guesses]
  );

  const onEnter = React.useCallback(() => {
    // Validate guesses
    if (
      value.length === LETTER_COUNT &&
      guesses.length < MAX_GUESSES &&
      list.includes(value)
    ) {
      onSetGuess(value);
      setValue('');
      return;
    }

    // Feedback animation if guess is invalid.
    setIsInvalid(true);
  }, [guesses.length, onSetGuess, value]);

  const onChange = React.useCallback((value: string) => {
    setValue(value);
  }, []);

  const { filterResults, getState } = wordleSolver(guesses, solution);
  const results = list.filter(filterResults);
  const isPuzzleSolved = guesses.at(-1) === solution;

  return (
    <Page faviconSrc="/wordle-favicon.ico" title={TITLE}>
      <Page.Main>
        <Page.Title icon="wordle">{TITLE}</Page.Title>
        <$Solution>
          <p>Enter a guess for today’s puzzle</p>
          {guesses.map((guess) => (
            <$Row key={guess}>
              {guess.split('').map((char, idx) => (
                <FlipTile
                  index={idx}
                  key={`${guess}-${char}-${idx}`}
                  state={getState(guess, idx)}>
                  {char}
                </FlipTile>
              ))}
            </$Row>
          ))}
          {guesses.length < MAX_GUESSES && !isPuzzleSolved && (
            <Shake
              animate={isInvalid}
              onAnimationEnd={() => setIsInvalid(false)}>
              <MultiInput onChange={onChange} onEnter={onEnter} value={value} />
            </Shake>
          )}
        </$Solution>
        {!!guesses.length && (
          <$Solution>
            <p>
              {results.length}{' '}
              {results.length === 1 ? 'possibility' : 'possibilities'} remaining
            </p>
            {results.map((word) => {
              const isPastSolution = solutions.find(
                ({ solution }) => solution === word
              );

              const row = (
                <$Row key={word}>
                  {word.split('').map((char, idx) => (
                    <Tile
                      key={`${word}-${idx}`}
                      state={isPastSolution ? 'correct' : 'tbd'}>
                      {char}
                    </Tile>
                  ))}
                </$Row>
              );

              return !isPastSolution && !isPuzzleSolved ? (
                <$RowButton
                  key={word}
                  onClick={(e) => {
                    e.preventDefault();
                    !isPastSolution && !isPuzzleSolved && onSetGuess(word);
                  }}>
                  {row}
                </$RowButton>
              ) : (
                row
              );
            })}
          </$Solution>
        )}
      </Page.Main>
    </Page>
  );
}

export default WordleHelper;
