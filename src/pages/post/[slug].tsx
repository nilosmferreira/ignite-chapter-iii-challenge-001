import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Primisc from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formataData } from '../../util/DateFormat';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  console.log(post);
  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="" />
        <section className={styles.content}>
          <strong>{post.data.title}</strong>
          <span className={commonStyles.timeIcon}>
            <FiCalendar />
            {post.first_publication_date}
          </span>
          <span className={commonStyles.timeIcon}>
            <FiUser />
            {post.data.author}
          </span>
          <span className={commonStyles.timeIcon}>
            <FiClock /> 5 Min
          </span>
          <div className={styles.body}>
            {post.data.content.map((c, index) => (
              <div key={String(index)}>
                <h2>{c.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(c.body) }}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Primisc.predicates.at('document.type', 'post')],
    {
      fetch: 1000,
    }
  );

  return {
    paths: posts?.results.map(post => `/post/${post.uid}`) || [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  const post: Post = {
    first_publication_date: formataData(
      response.first_publication_date,
      'dd MMM yyyy'
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(c => ({
        heading: c.header,
        body: c.body,
      })),
    },
  };
  return {
    props: { post },
  };
};
