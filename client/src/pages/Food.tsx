import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import ScrollToTop from "../components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { Article } from "../types";
import { convertArticle } from "../utils/articleUtils";
import { articleAPI } from "../utils/apiUtils";
import AnimatedSection from "../components/AnimatedSection";

const Food = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const articlesPerPage = 6;
  const scrollToTop = useScrollToTop();

  // Fetch food articles from API with pagination
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    const fetchFoodArticles = async () => {
      try {
        setIsLoading(true);
        const data = await articleAPI.getByCategory("food", {
          page: currentPage,
          limit: articlesPerPage,
        });

        if (data.data) {
          setArticles(data.data);
          setTotalArticles(data.pagination?.total || 0);
          setHasMore(
            data.pagination
              ? data.pagination.page * data.pagination.limit <
                  data.pagination.total
              : false
          );
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching food articles:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    fetchFoodArticles();
  }, [currentPage]);

  const convertedArticles =
    articles?.map((article) => convertArticle(article)) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load articles. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>WindSpace - Food & Cuisine</title>
        <meta
          name="description"
          content="Discover articles about Thai cuisine, restaurant reviews, recipes, and the latest food trends"
        />
        <meta property="og:title" content="WindSpace - Food & Cuisine" />
        <meta
          property="og:description"
          content="Discover articles about Thai cuisine, restaurant reviews, recipes, and the latest food trends"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-red-500 text-white relative overflow-hidden animate-[slideInFromTop_0.8s_ease-out]">
          {/* Background Image */}
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80"
              alt="Thai Food Background"
              className="w-full h-full object-cover animate-[zoomIn_1.2s_ease-out]"
            />
          </div>
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6 animate-[bounceIn_0.6s_ease-out_0.3s_both]">
              <ChefHat className="w-16 h-16 drop-shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg animate-[slideInFromTop_0.8s_ease-out_0.5s_both]">
              Food & Cuisine
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto drop-shadow-lg animate-[slideInFromTop_0.8s_ease-out_0.7s_both]">
              Discover the rich flavors of Thai cuisine, from street food
              adventures to fine dining experiences.
            </p>
          </div>
        </div>

        {/* Articles Section */}
        <div className="container mx-auto px-4 py-16">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span className="text-lg">Loading articles...</span>
            </div>
          ) : convertedArticles.length > 0 ? (
            <>
              <AnimatedSection delay={200}>
                <div className="articles-grid">
                  {convertedArticles.map((article, index) => (
                    <AnimatedSection key={article.id} delay={300 + index * 100}>
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
                  ))}
                </div>
              </AnimatedSection>

              {/* Pagination */}
              {totalArticles > articlesPerPage && (
                <AnimatedSection delay={400}>
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-12">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>

                    <div className="flex items-center space-x-2">
                      {Array.from(
                        { length: Math.ceil(totalArticles / articlesPerPage) },
                        (_, i) => i + 1
                      )
                        .filter(
                          (page) =>
                            page === 1 ||
                            page ===
                              Math.ceil(totalArticles / articlesPerPage) ||
                            Math.abs(page - currentPage) <= 2
                        )
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="min-w-[40px] bg-orange-500 hover:bg-orange-600 text-white"
                              style={
                                currentPage === page
                                  ? {}
                                  : {
                                      background: "transparent",
                                      color: "#ea580c",
                                    }
                              }
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            Math.ceil(totalArticles / articlesPerPage),
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(totalArticles / articlesPerPage)
                      }
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-center mt-4 text-sm text-gray-600">
                    Page {currentPage} of{" "}
                    {Math.ceil(totalArticles / articlesPerPage)} ({totalArticles}{" "}
                    total articles)
                  </div>
                </AnimatedSection>
              )}
            </>
          ) : (
            <AnimatedSection delay={200}>
              <div className="text-center py-16">
                <ChefHat className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  No Food Articles Yet
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  We're preparing delicious food content for you. Stay tuned for
                  amazing culinary stories!
                </p>
                <Link to="/">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Back to Home
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          )}
        </div>

        {/* Call to Action */}
        {convertedArticles.length > 0 && (
          <AnimatedSection delay={500}>
            <div className="bg-white py-16">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Explore Other Categories
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Discover more stories and experiences from our other amazing
                  categories
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/travel" onClick={scrollToTop}>
                    <Button
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                      Travel
                    </Button>
                  </Link>
                  <Link to="/lifestyle" onClick={scrollToTop}>
                    <Button
                      variant="outline"
                      className="border-amber-600 text-amber-700 hover:bg-amber-50"
                    >
                      Lifestyle
                    </Button>
                  </Link>
                  <Link to="/technology" onClick={scrollToTop}>
                    <Button
                      variant="outline"
                      className="border-purple-500 text-purple-500 hover:bg-purple-50"
                    >
                      Technology
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
};

export default Food;
