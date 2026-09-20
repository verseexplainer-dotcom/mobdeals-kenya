import type { ProductImage } from './types';

const categoryLabels: Record<string, string> = {
  laptops: 'Laptop', tablets: 'Tablet', monitors: 'Monitor', printers: 'Printer',
  projectors: 'Projector', software: 'Software', ups: 'UPS and power equipment'
};

export function categoryImage(category: string): ProductImage {
  const key = Object.hasOwn(categoryLabels, category) ? category : 'laptops';
  return {
    src: `/images/home/category-${key}.webp`,
    alt: `Representative ${categoryLabels[key].toLowerCase()} image, not an exact product photo`,
    width: 800, height: 800, representative: true
  };
}

export function usableProductImages(images: ProductImage[]): ProductImage[] {
  return images.filter((image) => {
    if (image.representative || !image.src?.trim()) return false;
    if (image.src.startsWith('/') && !image.src.startsWith('//')) return true;
    try { return new URL(image.src).protocol === 'https:'; }
    catch { return false; }
  });
}
