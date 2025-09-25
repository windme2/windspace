import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: "food" | "travel" | "lifestyle" | "tech";
  imageSrc: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  featured?: boolean;
  slug?: string; // Add slug field
}

const getCategoryClass = (category: string) => {
  switch (category) {
    case "food":
      return "category-food";
    case "travel":
      return "category-travel";
    case "lifestyle":
      return "category-lifestyle";
    case "tech":
      return "category-tech";
    default:
      return "bg-gray-500 text-white";
  }
};

const getCategoryText = (category: string) => {
  switch (category) {
    case "food":
      return "Food";
    case "travel":
      return "Travel";
    case "lifestyle":
      return "Lifestyle";
    case "tech":
      return "Technology";
    default:
      return category;
  }
};

const getCategoryUrl = (category: string) => {
  switch (category) {
    case "food":
      return "/food";
    case "travel":
      return "/travel";
    case "lifestyle":
      return "/lifestyle";
    case "tech":
      return "/technology";
    default:
      return "/article";
  }
};

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  excerpt,
  category,
  imageSrc,
  date,
  author,
  featured = false,
  slug, // Add slug parameter
}) => {
  const articleUrl = slug ? `/article/${slug}` : `/article/${id}`;

  return (
    <Card
      className={`overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 article-card ${
        featured ? "md:col-span-2" : ""
      } flex flex-col h-full`}
    >
      <Link to={articleUrl} className="flex flex-col h-full">
        <div
          className={`relative ${
            featured ? "h-64" : "h-48"
          } w-full overflow-hidden`}
        >
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <Badge
            className={`absolute top-3 left-3 category-badge ${getCategoryClass(
              category
            )}`}
          >
            {getCategoryText(category)}
          </Badge>
        </div>
        <CardContent className="pt-4 flex-grow flex flex-col">
          <h3
            className={`${
              featured ? "text-2xl" : "text-xl"
            } font-semibold mb-3 line-clamp-2 hover:text-blog-${category} transition-colors min-h-[3.5rem] flex items-start`}
          >
            {title}
          </h3>
          <p className="text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
            {excerpt}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="pt-0 pb-4 flex items-center justify-between mt-auto border-t border-gray-100 pt-3">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-xs font-medium bg-gray-100">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600 font-medium">
            {author.name}
          </span>
        </div>
        <span className="text-sm text-gray-400">{date}</span>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
