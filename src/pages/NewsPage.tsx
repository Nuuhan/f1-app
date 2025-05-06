import React, { useState, useEffect } from 'react';
import './NewsPage.css';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
}

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.formula1.com%2Fen%2Flatest%2Fall.xml');
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        const formattedArticles = data.items.map((item: any) => ({
          title: item.title,
          description: item.description,
          url: item.link,
          imageUrl: item.enclosure?.link || '',
          publishedAt: item.pubDate
        }));

        setArticles(formattedArticles);
        setLoading(false);
      } catch (err) {
        setError('Failed to load news articles. Please try again later.');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="news-container">Loading news...</div>;
  }

  if (error) {
    return <div className="news-container error">{error}</div>;
  }

  return (
    <div className="news-container">
      <h1>Latest F1 News</h1>
      <div className="news-grid">
        {articles.map((article, index) => (
          <div key={index} className="news-card">
            {article.imageUrl && (
              <div className="news-image">
                <img src={article.imageUrl} alt={article.title} />
              </div>
            )}
            <div className="news-content">
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <div className="news-meta">
                <span className="source">Formula 1</span>
                
              </div>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
                Read More
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage; 