import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
}

function AdBanner({ slot, className, style }: AdBannerProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignoring adsbygoogle push errors
    }
  }, []);
  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-7627137162388314"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
export default AdBanner;
