import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  X,
  Trash2,
  RefreshCw,
  MessageSquare,
  User,
  Mail,
  Calendar,
  FileText,
  CheckCheck,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { getAuthToken } from "@/utils/apiUtils";

interface Comment {
  id: number;
  article_id: number;
  author_name: string;
  author_email: string;
  content: string;
  parent_id: number | null;
  is_approved: boolean;
  created_at: string;
  articles?: {
    title: string;
    slug: string;
  };
}

const CommentModeration = () => {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComments, setSelectedComments] = useState<Set<number>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchPendingComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/comments/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending comments");
      }

      const result = await response.json();
      setPendingComments(result.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load pending comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, toast]);

  useEffect(() => {
    fetchPendingComments();
  }, [fetchPendingComments]);

  const handleApprove = async (commentId: number) => {
    setProcessingIds((prev) => new Set(prev).add(commentId));
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/comments/${commentId}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to approve comment");
      }

      setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
      setSelectedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });

      toast({
        title: "Comment Approved",
        description: "The comment is now visible on the article",
      });
    } catch (error) {
      console.error("Error approving comment:", error);
      toast({
        title: "Error",
        description: "Failed to approve comment",
        variant: "destructive",
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleReject = async (commentId: number) => {
    setProcessingIds((prev) => new Set(prev).add(commentId));
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
      setSelectedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });

      toast({
        title: "Comment Rejected",
        description: "The comment has been deleted",
      });
    } catch (error) {
      console.error("Error rejecting comment:", error);
      toast({
        title: "Error",
        description: "Failed to reject comment",
        variant: "destructive",
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleBulkApprove = async () => {
    const selectedIds = Array.from(selectedComments);
    if (selectedIds.length === 0) return;

    setProcessingIds(new Set(selectedIds));

    const results = await Promise.allSettled(
      selectedIds.map(async (id) => {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/api/comments/${id}/approve`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Failed to approve comment ${id}`);
        return id;
      })
    );

    const approved = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    setPendingComments((prev) =>
      prev.filter((c) => !selectedIds.includes(c.id))
    );
    setSelectedComments(new Set());
    setProcessingIds(new Set());

    toast({
      title: "Bulk Approve Complete",
      description: `${approved} approved, ${failed} failed`,
    });
  };

  const handleBulkReject = async () => {
    const selectedIds = Array.from(selectedComments);
    if (selectedIds.length === 0) return;

    setProcessingIds(new Set(selectedIds));

    const results = await Promise.allSettled(
      selectedIds.map(async (id) => {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/api/comments/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Failed to delete comment ${id}`);
        return id;
      })
    );

    const rejected = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    setPendingComments((prev) =>
      prev.filter((c) => !selectedIds.includes(c.id))
    );
    setSelectedComments(new Set());
    setProcessingIds(new Set());

    toast({
      title: "Bulk Reject Complete",
      description: `${rejected} rejected, ${failed} failed`,
    });
  };

  const toggleSelectAll = () => {
    if (selectedComments.size === pendingComments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(pendingComments.map((c) => c.id)));
    }
  };

  const toggleSelect = (commentId: number) => {
    setSelectedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Comment Moderation</h2>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading pending comments...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Comment Moderation</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pendingComments.length} comments pending review
          </p>
        </div>
        <Button variant="outline" onClick={fetchPendingComments}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Bulk Actions */}
      {pendingComments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedComments.size === pendingComments.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">
                  Select All ({selectedComments.size} selected)
                </span>
              </label>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkApprove}
                  disabled={selectedComments.size === 0 || processingIds.size > 0}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Approve Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={selectedComments.size === 0 || processingIds.size > 0}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {pendingComments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No Pending Comments
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                All comments have been moderated. Great job!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingComments.map((comment) => (
            <Card
              key={comment.id}
              className={`transition-all ${
                selectedComments.has(comment.id)
                  ? "ring-2 ring-primary"
                  : ""
              } ${processingIds.has(comment.id) ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedComments.has(comment.id)}
                      onChange={() => toggleSelect(comment.id)}
                      disabled={processingIds.has(comment.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Article Reference */}
                    {comment.articles && (
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          On: {comment.articles.title}
                        </span>
                        <a
                          href={`/article/${comment.articles.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Author Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{comment.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Mail className="w-4 h-4" />
                        <span>{comment.author_email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                      {comment.parent_id && (
                        <Badge variant="secondary">Reply</Badge>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(comment.id)}
                        disabled={processingIds.has(comment.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(comment.id)}
                        disabled={processingIds.has(comment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentModeration;
