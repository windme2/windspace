import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share, Loader2 } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import ScrollToTop from '../components/ScrollToTop';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { Article } from '../types';
import { articleAPI } from '../utils/apiUtils';

const getCategoryClass = (category: string) => {
  switch (category) {
    case 'food':
      return 'category-food';
    case 'travel':
      return 'category-travel';
    case 'lifestyle':
      return 'category-lifestyle';
    case 'tech':
    case 'technology':
      return 'category-tech';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getCategoryText = (category: string) => {
  switch (category) {
    case 'food':
      return 'Food';
    case 'travel':
      return 'Travel';
    case 'lifestyle':
      return 'Lifestyle';
    case 'tech':
    case 'technology':
      return 'Technology';
    default:
      return category;
  }
};

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        
        // Fetch single article by slug (using fetch because API doesn't have getBySlug)
        const articleResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/articles/${slug}`);
        const articleData = await articleResponse.json();
        
        if (articleData.data) {
          setArticle(articleData.data);
          
          // Fetch related articles (random from all categories)
          const allArticlesData = await articleAPI.getAll();
          
          if (allArticlesData && allArticlesData.data) {
            const filtered = allArticlesData.data.filter((a: Article) => a.id !== articleData.data.id);
            // Shuffle array and take first 3
            const shuffled = filtered.sort(() => Math.random() - 0.5);
            const related = shuffled.slice(0, 3);
            setRelatedArticles(related);
          }
        } else {
          setError('Article not found');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // Scroll to top when article changes
  useEffect(() => {
    if (article) {
      window.scrollTo(0, 0);
    }
  }, [article]);

  const handleShare = async () => {
    try {
      if (navigator.share && article) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Article link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error occurred",
        description: "Unable to share the article",
        variant: "destructive",
      });
    }
  };

  // Function to format article content
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Simple approach: convert markdown to HTML step by step
    let formattedContent = content;
    
    // Convert ## to h2 tags
    formattedContent = formattedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    
    // Convert ### to h3 tags  
    formattedContent = formattedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Convert **text** to <strong>text</strong>
    formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert --- to hr
    formattedContent = formattedContent.replace(/^---$/gm, '<hr>');
    
    // Split into lines and process
    const lines = formattedContent.split('\n');
    const processedLines = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push('');
        continue;
      }
      
      // Handle list items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(`<li>${line.substring(2)}</li>`);
      }
      // Handle headings (already processed)
      else if (line.startsWith('<h2>') || line.startsWith('<h3>') || line.startsWith('<hr>')) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
      // Handle regular paragraphs
      else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(`<p>${line}</p>`);
      }
    }
    
    // Close any remaining list
    if (inList) {
      processedLines.push('</ul>');
    }
    
    return processedLines.join('\n');
  };

  const handleTagClick = (tag: string) => {
    // Navigate to home page with tag search
    navigate(`/?search=${encodeURIComponent(tag)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading article...</span>
        </div>
      </div>
    );
  }

  // Error state or article not found
  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="font-prompt text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The article you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{article.title} | WindSpace</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={article.category?.name || ''} />
        <link rel="canonical" href={`https://windspace.com/article/${article.slug}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://windspace.com/article/${article.slug}`} />
        <meta property="og:image" content={article.featured_image || '/placeholder.svg'} />
        <meta property="article:published_time" content={article.created_at} />
        <meta property="article:section" content={getCategoryText(article.category?.name || '')} />
        {article.tags?.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
      </Helmet>

      {/* Hero section */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <img 
          src={article.featured_image || '/placeholder.svg'} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-black/70"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <Badge className={`mb-4 ${getCategoryClass(article.category?.name || '')} px-3 py-1 text-sm`}>
              {getCategoryText(article.category?.name || '')}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white max-w-3xl mb-4">
              {article.title}
            </h1>
            <div className="flex items-center text-white/90">
              <Avatar className="h-8 w-8 mr-2 border-2 border-white">
                <AvatarImage src={article.author_avatar || '/placeholder.svg'} alt={article.author_name || 'Anonymous'} />
                <AvatarFallback>{(article.author_name || 'A').charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="mr-4">{article.author_name || 'Anonymous'}</span>
              <span className="text-sm opacity-75">{new Date(article.created_at).toLocaleDateString('en-US')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Share and back buttons */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/${article.category?.name?.toLowerCase() || 'travel'}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {getCategoryText(article.category?.name || '')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Share Article
            </Button>
          </div>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-3">
              {article.tags.map((tag, index) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="px-4 py-2 cursor-pointer tag-hover-effect hover:scale-105 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md transform-gpu animate-[slideUp_0.6s_ease-out]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Content */}
          <article 
            className="prose prose-xl prose-slate max-w-none mb-12 
                       prose-headings:font-semibold prose-headings:text-gray-900
                       prose-h1:text-4xl prose-h1:leading-tight prose-h1:mb-8 prose-h1:mt-10
                       prose-h2:text-3xl prose-h2:leading-snug prose-h2:mb-6 prose-h2:mt-10 prose-h2:text-blue-600 prose-h2:border-l-4 prose-h2:border-blue-500 prose-h2:pl-6 prose-h2:bg-gradient-to-r prose-h2:from-blue-50 prose-h2:to-transparent prose-h2:py-3 prose-h2:rounded-r-lg
                       prose-h3:text-xl prose-h3:leading-snug prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-800
                       prose-p:text-gray-700 prose-p:leading-8 prose-p:mb-6 prose-p:text-lg
                       prose-li:text-gray-700 prose-li:leading-8 prose-li:mb-3 prose-li:marker:text-blue-500 prose-li:text-lg
                       prose-ul:my-6 prose-ol:my-6
                       prose-strong:text-blue-600 prose-strong:font-semibold
                       prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                       prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-gradient-to-r prose-blockquote:from-blue-50 prose-blockquote:to-blue-25 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:rounded-r-lg prose-blockquote:shadow-sm
                       prose-hr:my-10 prose-hr:border-gray-300"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
          />
        </div>
      </div>
      
      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.id}
                  id={relatedArticle.id.toString()}
                  title={relatedArticle.title}
                  excerpt={relatedArticle.excerpt}
                  category={relatedArticle.category?.name || "travel"}
                  imageSrc={relatedArticle.featured_image || '/placeholder.svg'}
                  date={new Date(relatedArticle.created_at).toLocaleDateString('en-US')}
                  author={{
                    name: relatedArticle.author_name || 'Anonymous',
                    avatar: relatedArticle.author_avatar || '/placeholder.svg'
                  }}
                  slug={relatedArticle.slug}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default ArticleDetail;
