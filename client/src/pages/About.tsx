import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Code, User } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";
import AnimatedSection from "../components/AnimatedSection";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Me
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate developer exploring the world of modern web
              technologies
            </p>
          </div>
        </AnimatedSection>

        {/* Profile Section */}
        <AnimatedSection delay={200}>
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  {/* Image Side */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        className="w-56 h-56 rounded-full object-cover shadow-lg border-4 border-white"
                        src="/images/profile/intouch.jpg"
                        alt="Intouch Charoenphon"
                      />
                      <div className="absolute -bottom-4 -right-4 bg-white text-gray-600 p-3 rounded-full shadow-lg">
                        <Code className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Intouch Charoenphon
                    </h2>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-gray-700">
                        Senior Inventory Management
                      </span>
                    </div>

                    <hr className="my-3 border-gray-200" />

                    <div className="space-y-3 text-gray-700">
                      <p>
                        I have several years of experience in inventory
                        management, focusing on process optimization and data
                        accuracy. Currently, I am pursuing a Higher Vocational
                        Certificate (Year 2) in Information Technology, with
                        plans to continue my studies at the Bachelor’s level.
                      </p>
                      <p>
                        Through self-learning and classroom projects, built a
                        strong foundation in front-end frameworks, web
                        technologies, and collaborative practices, preparing me
                        for a career as a front-end or full-stack developer.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* WindSpace Project & Blog Categories Section */}
        <AnimatedSection delay={400}>
          <div className="max-w-4xl mx-auto mb-20">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <p className="text-gray-700 mb-10 leading-relaxed">
                  <span className="float-left text-5xl font-extrabold mr-2 leading-none text-primary">
                    W
                  </span>
                  <span className="font-bold text-gray-900">indSpace</span> is
                  more than just a blog. It reflects my journey as a developer
                  and serves as a personal space to share stories, ideas, and
                  lessons learned along the way. I use this platform to document
                  my growth in web development, experiment with modern tools,
                  and connect technology with real-life experiences in travel,
                  food, and lifestyle. It represents my passion for continuous
                  learning and building meaningful projects that inspire others.
                </p>

                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    Blog Categories
                  </h4>
                  <div className="grid grid-cols-2 gap-5">
                    <Link
                      to="/food"
                      className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-lg hover:bg-blog-food/10 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                        🍜
                      </span>
                      <span className="font-medium text-gray-900 group-hover:text-blog-food">
                        Food & Cuisine
                      </span>
                      <p className="text-gray-600 text-sm text-center">
                        Discover Thai flavors from street food to fine dining.
                      </p>
                    </Link>

                    <Link
                      to="/travel"
                      className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-lg hover:bg-blog-travel/10 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                        ✈️
                      </span>
                      <span className="font-medium text-gray-900 group-hover:text-blog-travel">
                        Travel & Adventure
                      </span>
                      <p className="text-gray-600 text-sm text-center">
                        Discover destinations, unforgettable journeys.
                      </p>
                    </Link>

                    <Link
                      to="/lifestyle"
                      className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-lg hover:bg-blog-lifestyle/10 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                        🎨
                      </span>
                      <span className="font-medium text-gray-900 group-hover:text-blog-lifestyle">
                        Lifestyle & Wellness
                      </span>
                      <p className="text-gray-600 text-sm text-center">
                        Discover modern trends, wellness tips, and inspiration.
                      </p>
                    </Link>

                    <Link
                      to="/technology"
                      className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-lg hover:bg-blog-tech/10 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                        💻
                      </span>
                      <span className="font-medium text-gray-900 group-hover:text-blog-tech">
                        Technology & Innovation
                      </span>
                      <p className="text-gray-600 text-sm text-center">
                        Discover tech trends, innovations, and the future ahead.
                      </p>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        <ScrollToTop />
      </div>
    </div>
  );
};

export default About;
