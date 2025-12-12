import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import styled from 'styled-components';
import Icon from './Icon';

const HEADER_HEIGHT = 45;

const $Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const $Header = styled.header`
  background-color: ${({ theme }) => theme.colors.white}f2;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ${({ theme }) => theme.fontFamily.header};
  height: ${HEADER_HEIGHT}px;
  position: fixed;
  width: 100%;
  z-index: 5;
`;

const $Logo = styled.h1`
  font-size: 21px;
  margin: 0;

  & a {
    color: ${({ theme }) => theme.colors.black};
    padding: 12px;
    text-decoration: none;
  }
`;

const $Main = styled.main`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  min-width: 330px;
  padding: ${32 + HEADER_HEIGHT}px 0 32px;
  text-align: center;
`;

const $Title = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.title};
  font-size: 42px;
  margin: 0.5rem 0 1rem 0;
`;

interface TitleProps {
  children: string;
  icon: 'wordle' | 'spelling-bee';
}

function Title({ children, icon }: TitleProps) {
  return (
    <>
      <Icon src={`/${icon}.svg`} />
      <$Title>{children}</$Title>
    </>
  );
}

interface PageProps {
  children?: React.ReactNode;
  faviconSrc?: string;
  title: string;
}

function Page(props: PageProps) {
  return (
    <>
      <Head>
        <title>{props.title}</title>
        {props.faviconSrc && (
          <link rel="shortcut icon" href={props.faviconSrc} />
        )}
      </Head>
      <$Page>
        <$Header>
          <$Logo>
            <Link href="/">WordGames</Link>
          </$Logo>
        </$Header>
        {props.children}
      </$Page>
    </>
  );
}

Page.Main = $Main;
Page.Title = Title;

export default Page;
