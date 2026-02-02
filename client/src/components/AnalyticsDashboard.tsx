import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { articleAPI } from "@/utils/apiUtils";
import { Article } from "@/types";
import { Loading } from "./Loading";

// Color palette for categories
const CATEGORY_COLORS: Record<string, string> = {
  Travel: "#3b82f6",
  Technology: "#8b5cf6",
  Food: "#f59e0b",
  Lifestyle: "#10b981",
  Uncategorized: "#6b7280",
};

interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  totalComments: number;
  totalSubscribers: number;
  popularArticles: Article[];
  recentArticles: Article[];
  viewsByCategory: { name: string; views: number; color: string }[];
  viewsTrend: { date: string; views: number }[];
}

/**
 * Analytics Dashboard component for Admin panel
 */
export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch articles for analytics
        const articlesResponse = await articleAPI.getAll({ published: true });
        const articles = articlesResponse.data || [];

        // Calculate analytics from articles
        const totalViews = articles.reduce((sum: number, a: Article) => sum + (a.view_count || 0), 0);
        const totalArticles = articles.length;

        // Group by category
        const categoryViews: Record<string, { views: number; color: string }> = {};
        articles.forEach((article: Article) => {
          const categoryName = article.category?.name || "Uncategorized";
          const categoryColor = CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.Uncategorized;
          if (!categoryViews[categoryName]) {
            categoryViews[categoryName] = { views: 0, color: categoryColor };
          }
          categoryViews[categoryName].views += article.view_count || 0;
        });

        const viewsByCategory = Object.entries(categoryViews).map(([name, data]) => ({
          name,
          views: data.views,
          color: data.color,
        }));

        // Sort articles by views for popular
        const popularArticles = [...articles]
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5);

        // Sort articles by date for recent
        const recentArticles = [...articles]
          .sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 5);

        // Mock views trend (in production, this would come from analytics service)
        const viewsTrend = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString("en-US", { weekday: "short" }),
            views: Math.floor(Math.random() * 100) + 20,
          };
        });

        setData({
          totalViews,
          totalArticles,
          totalComments: 0, // Would come from comments API
          totalSubscribers: 0, // Would come from newsletter API
          popularArticles,
          recentArticles,
          viewsByCategory,
          viewsTrend,
        });
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data");
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <Loading text="Loading analytics..." />;
  }

  if (error || !data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {error || "No data available"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={data.totalViews.toLocaleString()}
          icon={Eye}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Articles"
          value={data.totalArticles.toString()}
          icon={FileText}
          description="Published"
        />
        <StatCard
          title="Comments"
          value={data.totalComments.toString()}
          icon={MessageSquare}
          description="Approved"
        />
        <StatCard
          title="Subscribers"
          value={data.totalSubscribers.toString()}
          icon={Users}
          description="Newsletter"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Views Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={data.viewsTrend} />
          </CardContent>
        </Card>

        {/* Views by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Views by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={data.viewsByCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Popular Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleList articles={data.popularArticles} showViews />
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Recent Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleList articles={data.recentArticles} showDate />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  description,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p
                className={`text-xs mt-1 ${
                  trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend} from last week
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple bar chart (CSS-based)
 */
function SimpleBarChart({ data }: { data: { date: string; views: number }[] }) {
  const maxViews = Math.max(...data.map((d) => d.views));

  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-muted rounded-t relative" style={{ height: "100%" }}>
            <div
              className="absolute bottom-0 w-full bg-primary rounded-t transition-all duration-500"
              style={{ height: `${(item.views / maxViews) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{item.date}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Category breakdown component
 */
function CategoryBreakdown({
  data,
}: {
  data: { name: string; views: number; color: string }[];
}) {
  const totalViews = data.reduce((sum, d) => sum + d.views, 0);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = totalViews > 0 ? (item.views / totalViews) * 100 : 0;
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground">
                {item.views.toLocaleString()} views ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Article list component
 */
function ArticleList({
  articles,
  showViews,
  showDate,
}: {
  articles: Article[];
  showViews?: boolean;
  showDate?: boolean;
}) {
  if (articles.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">No articles found</p>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-6">
              {index + 1}.
            </span>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate max-w-[200px]">
                {article.title}
              </p>
              {article.category && (
                <span className="text-xs text-muted-foreground">
                  {article.category.name}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            {showViews && (
              <span className="text-sm font-medium">
                {(article.view_count || 0).toLocaleString()} views
              </span>
            )}
            {showDate && (
              <span className="text-sm text-muted-foreground">
                {new Date(article.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AnalyticsDashboard;
