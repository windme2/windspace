import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
}

const SITE_NAME = "WindSpace";
const SITE_URL = "https://windspace.vercel.app";
const DEFAULT_DESCRIPTION = "A personal blog sharing insights on web development, technology, travel, food, and lifestyle.";
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`;

/**
 * SEO component for managing meta tags
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  author = "WindSpace Team",
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false,
}: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const pageImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <meta name="author" content={author} />
      <link rel="canonical" href={pageUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="th_TH" />

      {/* Article specific tags */}
      {type === "article" && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@windspace" />
      <meta name="twitter:creator" content="@windspace" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={pageImage} />

      {/* Additional Meta */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
    </Helmet>
  );
}

/**
 * Article SEO wrapper
 */
export function ArticleSEO({
  title,
  description,
  image,
  slug,
  author,
  publishedTime,
  modifiedTime,
  category,
  tags,
}: {
  title: string;
  description: string;
  image?: string;
  slug: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  category?: string;
  tags?: string[];
}) {
  return (
    <SEO
      title={title}
      description={description}
      image={image}
      url={`/article/${slug}`}
      type="article"
      author={author}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      section={category}
      tags={tags}
      keywords={tags}
    />
  );
}

/**
 * Category page SEO
 */
export function CategorySEO({
  category,
  description,
}: {
  category: string;
  description?: string;
}) {
  const categoryDescriptions: Record<string, string> = {
    food: "Discover delicious recipes, food reviews, and culinary adventures from around the world.",
    travel: "Explore travel guides, destination tips, and adventure stories from my journeys.",
    lifestyle: "Lifestyle tips, personal growth insights, and daily life inspiration.",
    technology: "Latest tech news, coding tutorials, and software development insights.",
  };

  return (
    <SEO
      title={category.charAt(0).toUpperCase() + category.slice(1)}
      description={description || categoryDescriptions[category.toLowerCase()] || DEFAULT_DESCRIPTION}
      url={`/${category.toLowerCase()}`}
      keywords={[category, "blog", "articles", "windspace"]}
    />
  );
}

export default SEO;
