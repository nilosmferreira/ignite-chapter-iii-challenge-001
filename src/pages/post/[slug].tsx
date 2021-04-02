import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Primisc from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formataData } from '../../util/DateFormat';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
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
  const router = useRouter();

  const readingTime = post.data.content.reduce((total, content) => {
    let counter = 0;

    if (content.body) {
      counter += RichText.asText(content.body).split(' ').length;
    }
    return total + counter;
  }, 0);

  if (router.isFallback) return <span>Carregando...</span>;
  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>
      <Header />

      <main className={styles.container}>
        <img src={post.data.banner.url} alt="" />
        <section className={styles.content}>
          <strong>{post.data.title}</strong>
          <span className={commonStyles.timeIcon}>
            <FiCalendar />
            {formataData(post.first_publication_date, 'dd MMM yyyy')}
          </span>
          <span className={commonStyles.timeIcon}>
            <FiUser />
            {post.data.author}
          </span>
          <span className={commonStyles.timeIcon}>
            <FiClock />
            {Math.ceil(readingTime / 200)} min
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
      fetch: 10,
    }
  );
  // posts.results.forEach(p => console.log(`slug: ${p.uid}`));
  return {
    paths: posts?.results.map(post => {
      return { params: { slug: `${post.uid}` } };
    }),

    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post: Post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(c => ({
        heading: c.heading ? c.heading : null,
        body: c.body,
      })),
    },
  };
  return {
    props: { post },
    redirect: 30 * 60,
  };
};
