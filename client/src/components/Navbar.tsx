import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLogoClick = () => {
    // Scroll to top when clicking logo
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNavClick = () => {
    // Scroll to top when clicking nav links
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="font-prompt font-bold text-2xl"
              onClick={handleLogoClick}
            >
              WindSpace
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/food"
              className="font-medium hover:text-blog-food transition-colors"
              onClick={handleNavClick}
            >
              Food
            </Link>
            <Link
              to="/travel"
              className="font-medium hover:text-blog-travel transition-colors"
              onClick={handleNavClick}
            >
              Travel
            </Link>
            <Link
              to="/lifestyle"
              className="font-medium hover:text-blog-lifestyle transition-colors"
              onClick={handleNavClick}
            >
              Lifestyle
            </Link>
            <Link
              to="/technology"
              className="font-medium hover:text-blog-tech transition-colors"
              onClick={handleNavClick}
            >
              Technology
            </Link>
            <Link
              to="/about"
              className="font-medium hover:text-primary transition-colors"
              onClick={handleNavClick}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="font-medium hover:text-primary transition-colors"
              onClick={handleNavClick}
            >
              Contact
            </Link>
          </div>

          {/* Search and Mobile Menu Button */}
          <div className="flex items-center">
            <div className="relative" ref={searchRef}>
              <div className="flex items-center">
                <div
                  className={`absolute right-10 top-0 h-full transition-all duration-300 
      ${isSearchOpen ? "w-[120px] md:w-[200px]" : "w-0 overflow-hidden"}`}
                >
                  <form onSubmit={handleSearch} className="w-full">
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-r-0 rounded-r-none focus-visible:ring-0"
                      autoFocus={isSearchOpen}
                    />
                  </form>
                </div>
                <Button
                  variant={isSearchOpen ? "default" : "ghost"}
                  size="icon"
                  onClick={toggleSearch}
                  className={isSearchOpen ? "rounded-l-none" : ""}
                  type={isSearchOpen ? "submit" : "button"}
                  form={isSearchOpen ? "search-form" : undefined}
                >
                  {isSearchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Admin Button */}
            <Link to="/admin" onClick={handleNavClick}>
              <Button variant="ghost" size="icon" className="ml-2">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="md:hidden ml-2 mr-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link
                to="/food"
                className="py-2 px-4 hover:bg-gray-50 rounded-lg font-medium hover:text-blog-food"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavClick();
                }}
              >
                Food
              </Link>
              <Link
                to="/travel"
                className="py-2 px-4 hover:bg-gray-50 rounded-lg font-medium hover:text-blog-travel"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavClick();
                }}
              >
                Travel
              </Link>
              <Link
                to="/lifestyle"
                className="py-2 px-4 hover:bg-gray-50 rounded-lg font-medium hover:text-blog-lifestyle"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavClick();
                }}
              >
                Lifestyle
              </Link>
              <Link
                to="/technology"
                className="py-2 px-4 hover:bg-gray-50 rounded-lg font-medium hover:text-blog-tech"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavClick();
                }}
              >
                Technology
              </Link>
              <Link
                to="/about"
                className="py-2 px-4 hover:bg-gray-50 rounded-lg font-medium hover:text-primary"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavClick();
                }}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="py-2 px-4 hover:bg-gray-50 rounded-lg font-medium hover:text-primary"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavClick();
                }}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
