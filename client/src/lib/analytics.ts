// Google Analytics / Plausible Analytics integration

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (...args: any[]) => void;
  }
}

// Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = function() {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }
};

// Track page view
export const trackPageView = (path: string, title?: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
  
  // Plausible alternative (if using)
  if (typeof window.plausible === 'function') {
    window.plausible('pageview', { props: { path, title } });
  }
};

// Track custom event
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Plausible alternative
  if (typeof window.plausible === 'function') {
    window.plausible(action, {
      props: { category, label, value },
    });
  }
};

// Track article view
export const trackArticleView = (articleSlug: string, articleTitle: string) => {
  trackEvent('Article', 'View', articleSlug);
  trackPageView(`/article/${articleSlug}`, articleTitle);
};

// Track newsletter subscription
export const trackNewsletterSubscription = (email: string) => {
  trackEvent('Newsletter', 'Subscribe', email);
};

// Track search
export const trackSearch = (searchQuery: string) => {
  trackEvent('Search', 'Query', searchQuery);
};

// Track outbound link click
export const trackOutboundLink = (url: string) => {
  trackEvent('Outbound', 'Click', url);
};

export default {
  init: initAnalytics,
  trackPageView,
  trackEvent,
  trackArticleView,
  trackNewsletterSubscription,
  trackSearch,
  trackOutboundLink,
};
