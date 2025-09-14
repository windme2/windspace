import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Send, CheckCircle, MapPin } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";
import AnimatedSection from "../components/AnimatedSection";

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get In Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Feel free to reach out for feedback, suggestions, or interesting
              project collaborations.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Side - Contact Information */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    Contact Information
                  </h2>

                  <div className="space-y-6">
                    <a
                      href="https://github.com/windme2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    >
                      <div className="p-2 bg-gray-900 text-white rounded-lg">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">GitHub</p>
                        <p className="text-gray-600">github.com/windme2</p>
                      </div>
                    </a>

                    <a
                      href="https://linkedin.com/in/intouch-charoenphon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    >
                      <div className="p-2 bg-blue-700 text-white rounded-lg">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">LinkedIn</p>
                        <p className="text-gray-600">
                          linkedin.com/in/intouch-charoenphon
                        </p>
                      </div>
                    </a>

                    <a
                      href="https://instagram.com/withcrpn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    >
                      <div className="p-2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white rounded-lg">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Instagram</p>
                        <p className="text-gray-600">@withcrpn</p>
                      </div>
                    </a>

                    <a
                      href="mailto:intouch.crp@gmail.com"
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    >
                      <div className="p-2 bg-red-500 text-white rounded-lg">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Gmail</p>
                        <p className="text-gray-600">intouch.crp@gmail.com</p>
                      </div>
                    </a>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Areas of Interest
                      </h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-700">
                          🌐 Web Development
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-700">
                          📱 Mobile Apps
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-700">
                          🎨 UI/UX Design
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-700">
                          ⚙️ Backend API
                        </div>
                      </div>
                      <p className="text-gray-600 mt-4 text-sm text-center">
                        Open to discussing interesting projects!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* Right Side - Map and Contact Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Map Section */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Location
                    </h3>
                  </div>
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31014.909369518336!2d100.61652025000001!3d13.6660525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2a00bb218f43d%3A0x30100b25de25070!2sBang%20Na%2C%20Bangkok!5e0!3m2!1sen!2sth!4v1758020303932!5m2!1sen!2sth"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                      title="Bangkok Location Map"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Bangkok, Thailand
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                    <Send className="h-5 w-5 text-gray-600" />
                    Send Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2 text-gray-700"
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="h-12"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2 text-gray-700"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-12"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2 text-gray-700"
                        htmlFor="message"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Your message..."
                        rows={6}
                        className="resize-none"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className={`w-full h-12 text-lg ${
                        isSubmitted
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      disabled={isSubmitted}
                    >
                      {isSubmitted ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Message Sent!
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
        </div>
        </AnimatedSection>

        <ScrollToTop />
      </div>
    </div>
  );
};

export default Contact;
