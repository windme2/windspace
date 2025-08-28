import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ArticleDetail from "./pages/ArticleDetail";
import Food from "./pages/Food";
import Travel from "./pages/Travel";
import Lifestyle from "./pages/Lifestyle";
import Technology from "./pages/Technology";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

const App = () => (
  <>
    <Toaster />
    <HelmetProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/food" element={<Food />} />
              <Route path="/travel" element={<Travel />} />
              <Route path="/lifestyle" element={<Lifestyle />} />
              <Route path="/technology" element={<Technology />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  </>
);

export default App;