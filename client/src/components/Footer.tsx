import { Link } from "react-router-dom";
import { Mail, Github, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-prompt font-bold text-lg mb-3">About Us</h3>
            <p className="text-gray-600 mb-4">
              WindSpace is a blog that curates stories about food, travel,
              lifestyle, and technology, providing inspiration for your daily
              life.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-prompt font-bold text-lg mb-3">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/food"
                  className="text-gray-600 hover:text-blog-food transition-colors"
                >
                  Food
                </Link>
              </li>
              <li>
                <Link
                  to="/travel"
                  className="text-gray-600 hover:text-blog-travel transition-colors"
                >
                  Travel
                </Link>
              </li>
              <li>
                <Link
                  to="/lifestyle"
                  className="text-gray-600 hover:text-blog-lifestyle transition-colors"
                >
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link
                  to="/technology"
                  className="text-gray-600 hover:text-blog-tech transition-colors"
                >
                  Technology
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-prompt font-bold text-lg mb-3">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-prompt font-bold text-lg mb-3">Contact</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/windme2"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full shadow hover:shadow-md transition-all duration-300 hover:scale-110 hover:bg-gray-900 group"
              >
                <Github className="h-5 w-5 text-gray-900 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://linkedin.com/in/intouch-charoenphon"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full shadow hover:shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#0077B5] group"
              >
                <Linkedin className="h-5 w-5 text-[#0077B5] group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://instagram.com/withcrpn"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full shadow hover:shadow-md transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-[#E4405F] hover:to-[#F56040] group"
              >
                <Instagram className="h-5 w-5 text-[#E4405F] group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="mailto:intouch.crp@gmail.com"
                className="bg-white p-2 rounded-full shadow hover:shadow-md transition-all duration-300 hover:scale-110 hover:bg-blue-500 group"
              >
                <Mail className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} WindSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
