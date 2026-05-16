// Image SEO Engine - Image discoverability and structured metadata for visual-heavy platform
export interface ImageMetadata {
  url: string;
  alt: string;
  caption?: string;
  title?: string;
  contentType?: string;
  width?: number;
  height?: number;
  isCompressed?: boolean;
  hasStructuredData?: boolean;
}

export interface ImageSeoHealth {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithCaption: number;
  imagesWithStructuredData: number;
  optimizedPercentage: number;
  recommendations: string[];
}

export class ImageSeoEngine {
  private static imageRegistry: Map<string, ImageMetadata> = new Map();
  private static lastAudit: Date = new Date();

  /**
   * Register image with metadata for SEO optimization
   */
  static registerImage(metadata: ImageMetadata): void {
    this.imageRegistry.set(metadata.url, metadata);
  }

  /**
   * Generate structured data for images (schema.org/ImageObject)
   */
  static generateImageStructuredData(image: ImageMetadata): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      url: image.url,
      name: image.title || image.alt,
      description: image.caption || image.alt,
      alternateName: image.alt,
      contentUrl: image.url,
      ...(image.width && { width: image.width }),
      ...(image.height && { height: image.height }),
      ...(image.contentType && { encodingFormat: image.contentType }),
      uploadDate: new Date().toISOString(),
      copyrightYear: new Date().getFullYear(),
    };
  }

  /**
   * Get optimized alt text for image types
   */
  static generateOptimalAltText(imageType: string, context: any): string {
    switch (imageType) {
      case 'artist':
        return `${context.artistName} - ${context.genre} artist profile image`;
      case 'performer':
        return `${context.performerName} performing live on stage`;
      case 'venue':
        return `${context.venueName} venue entrance and stage setup`;
      case 'event':
        return `${context.eventName} live event at ${context.venue}`;
      case 'billboard':
        return `${context.billboardTitle} - Music promotion billboard`;
      case 'article':
        return `${context.articleTitle} featured image`;
      case 'battle':
        return `${context.battleType} battle featuring ${context.competitors.join(' vs ')}`;
      case 'ticket':
        return `Ticket for ${context.eventName} - ${context.price}`;
      default:
        return `TMI Platform image - ${context.title || 'content image'}`;
    }
  }

  /**
   * Get image compression recommendations
   */
  static getCompressionRecommendations(image: ImageMetadata): string[] {
    const recommendations: string[] = [];

    if (!image.isCompressed) {
      recommendations.push(`Compress image: ${image.url} for faster loading`);
    }

    if (!image.width || !image.height) {
      recommendations.push(`Add width/height attributes to ${image.url} to prevent layout shift`);
    }

    if (image.width && image.width > 2000) {
      recommendations.push(`Image ${image.url} exceeds recommended width of 2000px`);
    }

    if (!image.alt || image.alt.length < 10) {
      recommendations.push(`Alt text for ${image.url} is too short, should be at least 10 characters`);
    }

    if (!image.contentType) {
      recommendations.push(`Specify content type for ${image.url} (e.g., image/webp, image/jpeg)`);
    }

    return recommendations;
  }

  /**
   * Audit image SEO health
   */
  static auditImageSeoHealth(): ImageSeoHealth {
    const images = Array.from(this.imageRegistry.values());

    if (images.length === 0) {
      return {
        totalImages: 0,
        imagesWithAlt: 0,
        imagesWithCaption: 0,
        imagesWithStructuredData: 0,
        optimizedPercentage: 0,
        recommendations: ['No images registered. Start by registering images with metadata.'],
      };
    }

    const imagesWithAlt = images.filter((img) => img.alt && img.alt.length > 0).length;
    const imagesWithCaption = images.filter((img) => img.caption && img.caption.length > 0).length;
    const imagesWithStructuredData = images.filter((img) => img.hasStructuredData).length;

    const recommendations: string[] = [];

    if (imagesWithAlt < images.length) {
      recommendations.push(`${images.length - imagesWithAlt} images missing alt text`);
    }

    if (imagesWithCaption < images.length * 0.5) {
      recommendations.push(`Only ${imagesWithCaption}/${images.length} images have captions`);
    }

    if (imagesWithStructuredData < images.length * 0.5) {
      recommendations.push(`Add structured data to at least 50% of images (currently ${imagesWithStructuredData})`);
    }

    const optimizedPercentage = Math.round(
      ((imagesWithAlt + imagesWithCaption + imagesWithStructuredData * 2) / (images.length * 3)) * 100
    );

    this.lastAudit = new Date();

    return {
      totalImages: images.length,
      imagesWithAlt,
      imagesWithCaption,
      imagesWithStructuredData,
      optimizedPercentage,
      recommendations,
    };
  }

  /**
   * Generate image SEO recommendations for a page
   */
  static generatePageImageRecommendations(imageUrls: string[]): string[] {
    const recommendations: string[] = [];

    imageUrls.forEach((url) => {
      const metadata = this.imageRegistry.get(url);

      if (!metadata) {
        recommendations.push(`Register image ${url} with metadata`);
        return;
      }

      if (!metadata.alt || metadata.alt.length === 0) {
        recommendations.push(`Add descriptive alt text to image: ${url}`);
      }

      if (!metadata.caption) {
        recommendations.push(`Add caption to image: ${url} for better context`);
      }

      if (!metadata.hasStructuredData) {
        recommendations.push(`Add structured data (schema.org) to image: ${url}`);
      }

      if (!metadata.isCompressed) {
        recommendations.push(`Optimize image size for: ${url}`);
      }
    });

    return recommendations;
  }

  /**
   * Get top images by engagement (for sitemap image extension)
   */
  static getTopImages(limit: number = 50): ImageMetadata[] {
    return Array.from(this.imageRegistry.values()).slice(0, limit);
  }

  /**
   * Generate image sitemap extension
   */
  static generateImageSitemapExtension(): string {
    const images = this.getTopImages(1000);
    let xml = '';

    images.forEach((image) => {
      xml += '  <image:image>\n';
      xml += `    <image:loc>${image.url}</image:loc>\n`;
      if (image.caption) {
        xml += `    <image:caption>${image.caption}</image:caption>\n`;
      }
      if (image.title) {
        xml += `    <image:title>${image.title}</image:title>\n`;
      }
      xml += '  </image:image>\n';
    });

    return xml;
  }

  /**
   * Get image metadata
   */
  static getImageMetadata(url: string): ImageMetadata | undefined {
    return this.imageRegistry.get(url);
  }

  /**
   * Clear image registry
   */
  static clearRegistry(): void {
    this.imageRegistry.clear();
  }

  /**
   * Get registry size
   */
  static getRegistrySize(): number {
    return this.imageRegistry.size;
  }
}
