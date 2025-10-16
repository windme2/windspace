import { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, CircleDot, Circle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useInterval } from "@/hooks/use-interval";
import useEmblaCarousel from "embla-carousel-react";

interface HeroArticle {
  id: string;
  title: string;
  excerpt: string;
  category: "food" | "travel" | "lifestyle" | "tech";
  imageSrc: string;
  date: string;
  slug?: string;
}

interface HeroCarouselProps {
  articles: HeroArticle[];
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

const HeroCarousel: React.FC<HeroCarouselProps> = ({ articles }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    duration: 15,
  });

  // Set loaded state after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update current slide index when the carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setPrevSlide(currentSlide);
      const newSlide = emblaApi.selectedScrollSnap();

      setIsFading(true);
      setTimeout(() => {
        setCurrentSlide(newSlide);
        setIsFading(false);
      }, 300); // Match this with the CSS transition duration
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, currentSlide]);

  // Auto-scrolling functionality
  const nextSlide = useCallback(() => {
    if (!isPaused && emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi, isPaused]);

  useInterval(nextSlide, 5000); // Change slide every 5 seconds

  const goToSlide = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      className={`relative transition-all duration-1000 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-[500px] overflow-hidden relative" ref={emblaRef}>
        <div className="flex h-full">
          {articles.map((article, index) => (
            <div key={article.id} className="flex-[0_0_100%] h-full min-w-0">
              {/* Hero Image */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={article.imageSrc}
                  alt={article.title}
                  className={`w-full h-full object-cover transition-all duration-1000 ease-in-out scale-105 ${
                    currentSlide === index
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  }`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70 transition-opacity duration-500 ${
                    currentSlide === index ? "opacity-100" : "opacity-0"
                  }`}
                ></div>

                {/* Content */}
                <div
                  className={`absolute inset-0 flex items-end transition-opacity duration-500 ${
                    currentSlide === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="container mx-auto px-4 pb-20 md:pb-24">
                    <Badge
                      className={`mb-4 ${getCategoryClass(
                        article.category
                      )} px-3 py-1 text-sm category-badge transform transition-all duration-500 ${
                        currentSlide === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                    >
                      {getCategoryText(article.category)}
                    </Badge>
                    <h1
                      className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl transform transition-all duration-500 delay-100 ${
                        currentSlide === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                    >
                      {article.title}
                    </h1>
                    <p
                      className={`text-white/80 mb-6 max-w-2xl text-lg transform transition-all duration-500 delay-200 ${
                        currentSlide === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                    >
                      {article.excerpt}
                    </p>
                    <Button
                      asChild
                      className={`group transform transition-all duration-500 delay-300 ${
                        currentSlide === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                    >
                      <Link to={`/article/${article.slug || article.id}`}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bubble navigation indicators at center bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="flex space-x-2 bg-black/30 px-4 py-3 rounded-full backdrop-blur-sm transform transition-all duration-700 delay-500 animate-fade-in">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex items-center justify-center p-1 focus:outline-none transform transition-all duration-300 ${
                index === currentSlide ? "scale-110" : "scale-100"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentSlide ? (
                <CircleDot className="w-5 h-5 text-white transition-all duration-300 hover:text-white/90 animate-pulse" />
              ) : (
                <Circle className="w-5 h-5 text-white/50 transition-all duration-300 hover:text-white/70" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
