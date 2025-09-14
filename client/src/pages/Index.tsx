import { useEffect, useState } from "react";
import HeroCarousel from "../components/HeroCarousel";
import ArticleCard from "../components/ArticleCard";
import Newsletter from "../components/Newsletter";
import ScrollToTop from "../components/ScrollToTop";
import AnimatedSection from "../components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Article } from "../types";
import { convertArticle, shuffleArray } from "../utils/articleUtils";
import { articleAPI } from "../utils/apiUtils";

const Index = () => {
  const [articles, setArticles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({
    food: [],
    travel: [],
    lifestyle: [],
    technology: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch all articles from API
        const response = (await articleAPI.getAll()) as { data: Article[] };
        const allArticles = response.data || [];

        // Fetch category-specific articles
        const categoryPromises = [
          articleAPI.getByCategory("food"),
          articleAPI.getByCategory("travel"),
          articleAPI.getByCategory("lifestyle"),
          articleAPI.getByCategory("technology"),
        ];

        const categoryResponses = await Promise.all(categoryPromises);

        // Store category articles separately for filtering
        setCategoryArticles({
          food: (categoryResponses[0] as { data: Article[] }).data || [],
          travel: (categoryResponses[1] as { data: Article[] }).data || [],
          lifestyle: (categoryResponses[2] as { data: Article[] }).data || [],
          technology: (categoryResponses[3] as { data: Article[] }).data || [],
        });

        setArticles(allArticles);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleSearch = () => {
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch.trim() });
      // Scroll to top when performing search
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setLocalSearch("");
    setSearchParams({});
  };

  // Update local search when URL params change
  useEffect(() => {
    setLocalSearch(searchQuery);
    // Scroll to top when search params change (direct URL access)
    if (searchQuery) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Fetch search results
      const fetchSearchResults = async () => {
        try {
          setIsLoading(true);
          const searchResponse = await articleAPI.search(searchQuery);
          if (searchResponse && searchResponse.data) {
            setSearchResults(searchResponse.data.map(article => convertArticle(article)));
          }
          setIsLoading(false);
        } catch (err) {
          console.error("Error searching articles:", err);
          setIsLoading(false);
        }
      };
      fetchSearchResults();
    } else {
      // Clear search results when no search query
      setSearchResults([]);
    }
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading Content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load articles. Please try again later.
          </p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Get featured articles from different categories for carousel (mixed)
  const allCategoryArticles = [
    ...(categoryArticles?.food || []).map((article) => convertArticle(article)),
    ...(categoryArticles?.travel || []).map((article) =>
      convertArticle(article)
    ),
    ...(categoryArticles?.lifestyle || []).map((article) =>
      convertArticle(article)
    ),
    ...(categoryArticles?.technology || []).map((article) =>
      convertArticle(article)
    ),
  ];

  const featuredArticles = shuffleArray(allCategoryArticles).slice(0, 5);

  // Get recent articles with proper categories
  const recentArticles = shuffleArray(allCategoryArticles).slice(5, 8);

  // Group articles by category using category-specific API data
  const foodArticles = shuffleArray(categoryArticles?.food || [])
    .slice(0, 4)
    .map((article) => convertArticle(article));

  const travelArticles = shuffleArray(categoryArticles?.travel || [])
    .slice(0, 4)
    .map((article) => convertArticle(article));

  const lifestyleArticles = shuffleArray(categoryArticles?.lifestyle || [])
    .slice(0, 4)
    .map((article) => convertArticle(article));

  const techArticles = shuffleArray(categoryArticles?.technology || [])
    .slice(0, 4)
    .map((article) => convertArticle(article));

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>WindSpace - Breathing Room for the Mind</title>
        <meta
          name="description"
          content="Discover inspiring stories about food, travel, lifestyle, and technology from Thailand and beyond."
        />
        <meta
          name="keywords"
          content="Thai blog, food blog, travel blog, technology blog, lifestyle blog"
        />
        <link rel="canonical" href="https://windspace.com" />
        <meta property="og:title" content="WindSpace" />
        <meta
          property="og:description"
          content="Modern Thai blog platform showcasing travel, food, lifestyle, and technology content with beautiful design and seamless reading experience"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://windspace.com" />
        <meta
          property="og:image"
          content="https://windspace.com/og-image.jpg"
        />
      </Helmet>

      {/* Hero Carousel Section */}
      {!searchQuery && <HeroCarousel articles={featuredArticles} />}

      {/* Search Section */}
      {searchQuery && (
        <div className="bg-gray-50 py-8">
          <div className="container mx-auto px-4 md:px-12">
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search articles, tags, categories..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {localSearch && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
              <p className="text-gray-600 text-center">
                Found {searchResults.length} articles for "{searchQuery}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Articles Section */}
      <AnimatedSection>
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 md:px-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">
                {searchQuery ? `Search Results` : "Latest Articles"}
              </h2>
            </div>

            <div className="articles-grid">
              {(searchQuery ? searchResults : recentArticles).map(
                (article, index) => (
                  <AnimatedSection key={article.id} delay={index * 100}>
                    <ArticleCard
                      id={article.id}
                      title={article.title}
                      excerpt={article.excerpt}
                      category={article.category}
                      imageSrc={article.imageSrc}
                      date={article.date}
                      author={article.author}
                      slug={article.slug}
                    />
                  </AnimatedSection>
                )
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Category Sections */}
      {[
        {
          title: "Food & Cuisine",
          articles: foodArticles,
          category: "food",
          route: "/food",
        },
        {
          title: "Travel & Adventure",
          articles: travelArticles,
          category: "travel",
          route: "/travel",
        },
        {
          title: "Lifestyle & Wellness",
          articles: lifestyleArticles,
          category: "lifestyle",
          route: "/lifestyle",
        },
        {
          title: "Technology & Innovation",
          articles: techArticles,
          category: "technology",
          route: "/technology",
        },
      ].map((section, index) => (
        <AnimatedSection key={section.category} delay={index * 150}>
          <section className={`py-12 ${index % 2 === 1 ? "bg-gray-50" : ""}`}>
            <div className="container mx-auto px-4 md:px-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <Button variant="ghost" asChild>
                  <Link
                    to={section.route}
                    className={`flex items-center text-blog-${section.category}`}
                  >
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="articles-grid lg:grid-cols-4">
                {section.articles.length > 0 ? (
                  section.articles.map((article, idx) => (
                    <AnimatedSection key={article.id} delay={idx * 100}>
                      <ArticleCard
                        id={article.id}
                        title={article.title}
                        excerpt={article.excerpt}
                        category={
                          article.category as
                            | "food"
                            | "travel"
                            | "lifestyle"
                            | "tech"
                        }
                        imageSrc={article.imageSrc}
                        date={article.date}
                        author={article.author}
                        slug={article.slug}
                      />
                    </AnimatedSection>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p>No articles available in this category yet.</p>
                    <p className="text-sm mt-2">
                      Check back soon for new content!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </AnimatedSection>
      ))}

      {/* Newsletter Section */}
      <AnimatedSection>
        <Newsletter />
      </AnimatedSection>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default Index;
