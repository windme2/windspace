import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Mail } from "lucide-react";

const Newsletter = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription logic would go here
  };

  return (
    <section className="bg-gray-50 py-16 md:py-24 w-full">
      <div className="container-fluid px-4 w-full max-w-none">
        <div className="max-w-6xl mx-auto bg-white p-8 md:p-12 shadow-md rounded-lg">
          <div className="flex items-center justify-center mb-6">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-center text-gray-600 mb-8 text-lg max-w-3xl mx-auto">
            Stay updated with our latest articles, travel tips, and exclusive
            content. Join our community of readers and get weekly updates
            delivered straight to your inbox.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 text-lg py-6"
            />
            <Button type="submit" size="lg" className="text-lg py-6">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
