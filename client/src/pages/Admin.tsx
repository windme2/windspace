import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Lock,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { Article, Category } from "../types";
import { articleAPI, ArticleData, PaginatedResponse } from "../utils/apiUtils";

interface LocalArticle
  extends Omit<Article, "id" | "category_id" | "published"> {
  id: string;
  isLocal: boolean;
  category: Category;
}

const Admin = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Original admin states
  const [localArticles, setLocalArticles] = useState<LocalArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<LocalArticle | null>(
    null
  );
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState("articles");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(4);
  const [totalArticles, setTotalArticles] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Loading state for smooth transitions
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const { toast } = useToast();
  const scrollToTop = useScrollToTop();

  // Authentication handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "windme2") {
      setIsFading(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsFading(false);
      }, 400);
      setAuthError("");
    } else {
      setAuthError("Invalid access code");
      setPassword("");
    }
  };

  // Handle page change with smooth scroll to top and loading animation
  const handlePageChange = (newPage: number) => {
    if (isLoadingPage) return; // Prevent multiple clicks
    
    setIsLoadingPage(true);
    setCurrentPage(newPage);
    
    // Smooth scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Reset loading state after scroll completes
    setTimeout(() => {
      setIsLoadingPage(false);
    }, 600); // 600ms for smooth scroll completion
  };

  const loadArticlesFromAPI = useCallback(async () => {
    try {
      const response = (await articleAPI.getAll({
        page: currentPage,
        limit: articlesPerPage,
      })) as PaginatedResponse<Article>;

      // Convert Article[] to LocalArticle[] format
      const articles = (response.data || []).map((article) => ({
        ...article,
        id: article.id.toString(), // Convert to string
        isLocal: false, // Mark as from database
        category: article.category || {
          id: article.category_id || 1,
          name: "General",
          slug: "general",
          description: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }));

      setLocalArticles(articles as LocalArticle[]);
      setTotalArticles(response.meta.total);
      setHasMore(response.meta.hasMore);
    } catch (error) {
      console.error("Error loading articles:", error);
      setLocalArticles([]);
      toast({
        title: "Error",
        description: "Failed to load articles from database.",
        variant: "destructive",
      });
    }
  }, [currentPage, articlesPerPage, toast]);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // Load articles from API with pagination
    loadArticlesFromAPI();
  }, [currentPage, loadArticlesFromAPI]);

  const saveLocalArticles = (articles: LocalArticle[]) => {
    // This function is no longer needed but keeping for compatibility
    setLocalArticles(articles);
  };

  const createNewArticle = () => {
    const newArticle: LocalArticle = {
      id: `local_${Date.now()}`,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "/placeholder.svg",
      author_name: "WindSpace Team",
      author_avatar: "/placeholder.svg",
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isLocal: true,
      category: {
        id: 1,
        name: "Travel",
        slug: "travel",
        description: "Travel related articles",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    setEditingArticle(newArticle);
    setShowEditor(true);
  };

  const saveArticle = async () => {
    if (!editingArticle) return;

    try {
      // Generate slug from title
      const slug = editingArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const articleData: ArticleData = {
        title: editingArticle.title,
        slug,
        content: editingArticle.content,
        excerpt: editingArticle.excerpt,
        featured_image: editingArticle.featured_image,
        category_id: editingArticle.category.id,
        author_name: editingArticle.author_name,
        author_avatar: editingArticle.author_avatar,
        tags: editingArticle.tags,
        published: true,
      };

      // Check if this is an update (existing article) or create new
      if (
        editingArticle.id &&
        !editingArticle.id.toString().startsWith("local_")
      ) {
        // Update existing article
        await articleAPI.update(editingArticle.id, articleData);
      } else {
        // Create new article
        await articleAPI.create(articleData);
      }

      // Refresh articles list by fetching from API
      await loadArticlesFromAPI();

      setShowEditor(false);
      setEditingArticle(null);

      toast({
        title: "Article Saved",
        description: "Article has been saved successfully to database!",
      });
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editArticle = (article: LocalArticle) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const deleteArticle = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        // Only delete from API if it's not a local article
        if (!id.toString().startsWith("local_")) {
          await articleAPI.delete(id);
        }

        // Refresh articles list by fetching from API
        await loadArticlesFromAPI();

        toast({
          title: "Article Deleted",
          description: "Article has been deleted successfully from database!",
        });
      } catch (error) {
        console.error("Error deleting article:", error);
        toast({
          title: "Error",
          description: "Failed to delete article. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const addTag = (tag: string) => {
    if (!editingArticle || !tag.trim()) return;

    const newTags = [...editingArticle.tags, tag.trim()];
    setEditingArticle({
      ...editingArticle,
      tags: newTags,
    });
  };

  const removeTag = (index: number) => {
    if (!editingArticle) return;

    const newTags = editingArticle.tags.filter((_, i) => i !== index);
    setEditingArticle({
      ...editingArticle,
      tags: newTags,
    });
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 transition-opacity duration-400 ${isFading ? 'opacity-0' : 'opacity-100'}`}> 
        <Helmet>
          <title>Admin Access - WindSpace</title>
          <meta name="description" content="Admin panel access" />
        </Helmet>
        <Card className="w-full max-w-md shadow-2xl border border-gray-200 animate-fade-in p-6">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Admin Access</CardTitle>
            <p className="text-gray-600 mt-2">Only authorized users can access this section.</p>
            <p className="text-xs text-gray-400 mt-1">If you are not sure, <a href="/" className="underline hover:text-primary">go back to homepage</a>.</p>
          </CardHeader>
          <CardContent className="pt-2 pb-2">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="mb-2 mt-4">
                <Input
                  type="password"
                  placeholder="Access code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full transition-all duration-300 ${authError ? 'border-red-500 animate-shake' : ''}`}
                  autoFocus
                />
                {authError && (
                  <p className="text-sm text-red-600 mt-2 animate-fade-in">{authError}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-white font-semibold shadow hover:bg-primary/90 transition-all duration-200 mt-2"
              >
                <Lock className="w-4 h-4 mr-2" />
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin Panel - WindSpace</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Extra bottom padding to avoid scroll-to-top button */}
        {/* Simple Tab Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "articles" ? "default" : "outline"}
              onClick={() => setActiveTab("articles")}
            >
              Articles
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            size="sm"
          >
            Sign Out
          </Button>
        </div>

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Articles from Database
                </h2>
                <p className="text-sm text-gray-600">
                  Showing {localArticles.length} of {totalArticles} articles
                </p>
              </div>
              <Button onClick={createNewArticle}>
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </div>

            {/* Articles List */}
            <div className="grid gap-4">
              {localArticles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {article.title || "Untitled"}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {article.excerpt}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">
                            {article.category.name}
                          </Badge>
                          {article.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created:{" "}
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editArticle(article)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteArticle(article.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {localArticles.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No articles found. Click "New Article" to get started.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {totalArticles > articlesPerPage && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoadingPage}
                  className="transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.ceil(totalArticles / articlesPerPage) },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === Math.ceil(totalArticles / articlesPerPage) ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={isLoadingPage}
                          className="transition-all duration-200"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(
                      Math.min(
                        Math.ceil(totalArticles / articlesPerPage),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={!hasMore || isLoadingPage}
                  className="transition-all duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Article Editor Modal */}
      {showEditor && editingArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingArticle.title ? "Edit Article" : "New Article"}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={isPreviewMode ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsPreviewMode(false)}
                  className="px-3"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant={isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMode(true)}
                  className="px-3"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!isPreviewMode ? (
                <div className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title
                    </label>
                    <Input
                      value={editingArticle.title}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          title: e.target.value,
                        })
                      }
                      placeholder="Article title..."
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Excerpt
                    </label>
                    <Textarea
                      value={editingArticle.excerpt}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          excerpt: e.target.value,
                        })
                      }
                      placeholder="Brief description of the article..."
                      rows={3}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={editingArticle.category.slug}
                      onChange={(e) => {
                        const categories = [
                          {
                            id: 1,
                            name: "Travel",
                            slug: "travel",
                            description: "Travel related articles",
                            created_at: "",
                            updated_at: "",
                          },
                          {
                            id: 2,
                            name: "Food",
                            slug: "food",
                            description: "Food related articles",
                            created_at: "",
                            updated_at: "",
                          },
                          {
                            id: 3,
                            name: "Lifestyle",
                            slug: "lifestyle",
                            description: "Lifestyle articles",
                            created_at: "",
                            updated_at: "",
                          },
                          {
                            id: 4,
                            name: "Technology",
                            slug: "technology",
                            description: "Technology articles",
                            created_at: "",
                            updated_at: "",
                          },
                        ];
                        const category =
                          categories.find((c) => c.slug === e.target.value) ||
                          categories[0];
                        setEditingArticle({
                          ...editingArticle,
                          category: {
                            ...category,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          },
                        });
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="travel">Travel</option>
                      <option value="food">Food</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="technology">Technology</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editingArticle.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                        >
                          #{tag}
                          <X
                            className="w-3 h-3 ml-1"
                            onClick={() => removeTag(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content (Use ## for headings, - for lists)
                    </label>
                    <Textarea
                      value={editingArticle.content}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          content: e.target.value,
                        })
                      }
                      placeholder="## Day 1: Getting Started&#10;- First activity&#10;- Second activity&#10;&#10;## Day 2: Exploring&#10;- Another activity"
                      rows={15}
                      className="font-mono"
                    />
                  </div>

                  {/* Featured Image URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Featured Image URL
                    </label>
                    <Input
                      value={editingArticle.featured_image}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          featured_image: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              ) : (
                // Preview Mode
                <div className="p-6">
                  <div className="max-w-4xl mx-auto prose lg:prose-lg">
                    <h1 className="text-3xl font-bold mb-4">
                      {editingArticle.title || "Untitled"}
                    </h1>

                    <div className="flex gap-2 mb-6">
                      <Badge variant="secondary">
                        {editingArticle.category.name}
                      </Badge>
                      {editingArticle.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {editingArticle.featured_image && (
                      <img
                        src={editingArticle.featured_image}
                        alt={editingArticle.title}
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}

                    <p className="text-gray-600 mb-6 text-lg italic">
                      {editingArticle.excerpt}
                    </p>

                    <div className="prose max-w-none">
                      {editingArticle.content.split("\n").map((line, index) => {
                        if (line.startsWith("### ")) {
                          return (
                            <h3
                              key={index}
                              className="text-xl font-semibold mt-6 mb-3"
                            >
                              {line.replace("### ", "")}
                            </h3>
                          );
                        }
                        if (line.startsWith("## ")) {
                          return (
                            <h2
                              key={index}
                              className="text-2xl font-semibold mt-8 mb-4"
                            >
                              {line.replace("## ", "")}
                            </h2>
                          );
                        } else if (line.startsWith("# ")) {
                          return (
                            <h1
                              key={index}
                              className="text-3xl font-bold mt-8 mb-6"
                            >
                              {line.replace("# ", "")}
                            </h1>
                          );
                        } else if (line.startsWith("- ")) {
                          return (
                            <li key={index} className="ml-4">
                              {line.replace("- ", "")}
                            </li>
                          );
                        } else if (line.trim() === "---") {
                          return (
                            <hr
                              key={index}
                              className="my-6 border-t border-gray-300"
                            />
                          );
                        } else if (line.trim() === "") {
                          return <br key={index} />;
                        } else {
                          return (
                            <p key={index} className="mb-4">
                              {line}
                            </p>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Save Button */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button onClick={saveArticle}>
                <Save className="w-4 h-4 mr-2" />
                Save Article
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
