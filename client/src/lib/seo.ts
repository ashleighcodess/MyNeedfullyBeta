import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  structuredData?: object;
  noIndex?: boolean;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  structuredData,
  noIndex = false
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update canonical link
    const updateCanonical = (href: string) => {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', href);
    };

    // Update structured data
    const updateStructuredData = (data: object) => {
      let script = document.querySelector('script[type="application/ld+json"]#dynamic-seo');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'dynamic-seo');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    };

    // Apply SEO updates
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description, true);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    if (canonical) {
      updateCanonical(canonical);
    }

    if (title) {
      updateMetaTag('og:title', title, true);
      updateMetaTag('twitter:title', title, true);
      updateMetaTag('og:url', window.location.href, true);
      updateMetaTag('twitter:url', window.location.href, true);
    }

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
      updateMetaTag('twitter:image', ogImage, true);
    }

    updateMetaTag('og:type', ogType, true);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    if (structuredData) {
      updateStructuredData(structuredData);
    }
  }, [title, description, keywords, canonical, ogImage, ogType, structuredData, noIndex]);
};

// SEO helper functions
export const generatePageTitle = (pageName: string, includePrefix = true) => {
  const prefix = includePrefix ? 'MyNeedfully - ' : '';
  return `${prefix}${pageName}`;
};

export const generatePageDescription = (content: string, maxLength = 160) => {
  return content.length > maxLength ? `${content.substring(0, maxLength - 3)}...` : content;
};

export const generateKeywords = (baseKeywords: string[], pageKeywords: string[] = []) => {
  const defaultKeywords = [
    'donation platform',
    'crisis relief',
    'disaster recovery',
    'medical emergency',
    'family support',
    'needs list',
    'community help',
    'charitable giving'
  ];
  
  return [...defaultKeywords, ...baseKeywords, ...pageKeywords].join(', ');
};

export const generateCanonicalUrl = (path: string) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://myneedfully.app';
  return `${baseUrl}${path}`;
};

export const generateOgImage = (imagePath?: string) => {
  const defaultImage = `${typeof window !== 'undefined' ? window.location.origin : 'https://myneedfully.app'}/attached_assets/Logo_6_1752017502495.png`;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://myneedfully.app';
  return imagePath ? `${baseUrl}${imagePath}` : defaultImage;
};

// Structured data generators
export const generateWishlistStructuredData = (wishlist: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": wishlist.title,
    "description": wishlist.description,
    "url": `${typeof window !== 'undefined' ? window.location.origin : 'https://myneedfully.app'}/wishlist/${wishlist.id}`,
    "creator": {
      "@type": "Person",
      "name": `${wishlist.user?.firstName || ''} ${wishlist.user?.lastName || ''}`.trim()
    },
    "dateCreated": wishlist.createdAt,
    "category": wishlist.category,
    "location": wishlist.location,
    "itemListElement": wishlist.items?.map((item: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.title,
      "description": item.description,
      "url": item.link,
      "offers": {
        "@type": "Offer",
        "price": item.price,
        "priceCurrency": "USD"
      }
    })) || []
  };
};

export const generatePersonStructuredData = (user: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    "description": `Member of MyNeedfully community`,
    "url": `${typeof window !== 'undefined' ? window.location.origin : 'https://myneedfully.app'}/profile/${user.id}`,
    "image": user.profileImageUrl || 'https://myneedfully.app/attached_assets/Logo_6_1752017502495.png',
    "memberOf": {
      "@type": "Organization",
      "name": "MyNeedfully",
      "url": "https://myneedfully.app"
    }
  };
};

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};