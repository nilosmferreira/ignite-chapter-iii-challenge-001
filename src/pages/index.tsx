import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formataData } from '../util/DateFormat';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination);
  async function handleOnLoadingMore(url: string) {
    fetch(url).then(res =>
      res.json().then(ret => {
        ret.results.forEach(x => {
          posts.results.push({
            first_publication_date: formataData(
              x.first_publication_date,
              'dd MMM yyyy'
            ),
            uid: x.uid,
            data: {
              author: x.data.author,
              subtitle: x.data.subtitle,
              title: x.data.title,
            },
          });
        });
        setPosts({
          next_page: ret.next_page,
          results: posts.results,
        });
      })
    );
  }
  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <header className={commonStyles.headerContainer}>
        <div className={commonStyles.headerContent}>
          <Link href="/">
            <img src="/logo.svg" alt="logo" />
          </Link>
        </div>
      </header>
      <main className={styles.containerPosts}>
        <div className={styles.content}>
          {posts?.results.map(post => (
            <Link key={post.uid} href={`post/${post.uid}`}>
              <a>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <time className={commonStyles.timeIcon}>
                  <FiCalendar />
                  {formataData(post.first_publication_date, 'dd MMM yyyy')}
                </time>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </a>
            </Link>
          ))}
        </div>
        {posts.next_page && (
          <button
            type="button"
            onClick={() => handleOnLoadingMore(posts.next_page)}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );
  const posts: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(
      x =>
        ({
          first_publication_date: x.first_publication_date,
          uid: x.uid,
          data: {
            author: x.data.author,
            subtitle: x.data.subtitle,
            title: x.data.title,
          },
        } as Post)
    ),
  };
  // TODO
  return {
    props: {
      postsPagination: posts,
    },
  };
};
