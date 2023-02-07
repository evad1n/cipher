import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      <Head>
        <title>Cipher</title>
        <meta name="description" content="Concept" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h2>HEY</h2>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/demo">Demo</Link>
          </li>
        </ul>
      </div>
      <main>{children}</main>
    </>
  );
}
