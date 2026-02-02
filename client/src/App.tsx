import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoading } from "@/components/Loading";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Food = lazy(() => import("./pages/Food"));
const Travel = lazy(() => import("./pages/Travel"));
const Lifestyle = lazy(() => import("./pages/Lifestyle"));
const Technology = lazy(() => import("./pages/Technology"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));

const App = () => (
  <ErrorBoundary>
    <Toaster />
    <HelmetProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoading />}>
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
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </HelmetProvider>
  </ErrorBoundary>
);

export default App;