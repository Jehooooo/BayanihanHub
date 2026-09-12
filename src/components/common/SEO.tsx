import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  openGraphType?: 'website' | 'article' | 'profile';
  image?: string;
  structuredData?: Record<string, any>;
}

export default function SEO({
  title,
  description = 'BayanihanHub connects communities through donations, item requests, and exchanges, making it easier to share useful items and help people in need.',
  canonicalUrl,
  noindex = false,
  openGraphType = 'website',
  image = '/Logo1Revise.png',
  structuredData,
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://bayanihanhub.com';
  // Avoid duplicate suffix if the title already is just "BayanihanHub"
  const fullTitle = title === 'BayanihanHub' ? title : `${title} | BayanihanHub`;
  const url = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={url} />}
      
      {/* Indexing Rules */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={openGraphType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="BayanihanHub" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
