import { Link } from "react-router-dom";
import { Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "./LazyImage";

interface RelatedArticlesProps {
  articles: Article[];
  currentArticleId?: string | number;
  title?: string;
  maxItems?: number;
}

/**
 * Related articles component
 * Displays a list of related articles based on category or tags
 */
export function RelatedArticles({
  articles,
  currentArticleId,
  title = "Related Articles",
  maxItems = 4,
}: RelatedArticlesProps) {
  // Filter out current article and limit items
  const filteredArticles = articles
    .filter((article) => String(article.id) !== String(currentArticleId))
    .slice(0, maxItems);

  if (filteredArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredArticles.map((article) => (
          <RelatedArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}

/**
 * Individual related article card
 */
function RelatedArticleCard({ article }: { article: Article }) {
  const categoryColors: Record<string, string> = {
    food: "bg-blog-food",
    travel: "bg-blog-travel",
    lifestyle: "bg-blog-lifestyle",
    technology: "bg-blog-tech",
    tech: "bg-blog-tech",
  };

  const categoryColor = article.category
    ? categoryColors[article.category.slug?.toLowerCase()] || "bg-primary"
    : "bg-primary";

  return (
    <Link to={`/article/${article.slug}`}>
      <Card className="group h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative aspect-video overflow-hidden">
          <LazyImage
            src={article.featured_image || "/images/placeholder.jpg"}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {article.category && (
            <Badge
              className={`absolute top-2 left-2 ${categoryColor} text-white text-xs`}
            >
              {article.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {article.excerpt}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Compact related articles for sidebar
 */
export function RelatedArticlesSidebar({
  articles,
  currentArticleId,
  title = "You may also like",
  maxItems = 5,
}: RelatedArticlesProps) {
  const filteredArticles = articles
    .filter((article) => String(article.id) !== String(currentArticleId))
    .slice(0, maxItems);

  if (filteredArticles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="space-y-3">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.slug}`}
            className="flex gap-3 group"
          >
            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
              <LazyImage
                src={article.featured_image || "/images/placeholder.jpg"}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              {article.category && (
                <span className="text-xs text-muted-foreground">
                  {article.category.name}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedArticles;
