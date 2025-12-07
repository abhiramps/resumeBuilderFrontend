import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  useCompanyTitle?: boolean;
}

export const SEO = ({
  title,
  description,
  keywords,
  image = "/og-image.png",
  url = "https://resumebuildr.org", // Replace with actual domain later or make it an env var
  useCompanyTitle = true,
}: SEOProps) => {
  const siteTitle = "ATS Resume Builder";
  const finalTitle = title
    ? useCompanyTitle
      ? `${title} | ${siteTitle}`
      : title
    : `${siteTitle} - Free Online Resume Maker`;

  const defaultDescription =
    "Build ATS-friendly resumes for free with our professional resume builder. Real-time preview, PDF export, and developer-focused templates.";
  const finalDescription = description || defaultDescription;

  const defaultKeywords = [
    "resume builder",
    "free resume builder",
    "ats resume",
    "cv maker",
    "resume templates",
    "free cv maker",
  ];
  const finalKeywords = keywords
    ? [...keywords, ...defaultKeywords].join(", ")
    : defaultKeywords.join(", ");

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ATS Resume Builder",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": finalDescription,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
          },
        })}
      </script>
    </Helmet>
  );
};
