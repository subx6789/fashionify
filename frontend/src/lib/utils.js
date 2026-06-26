/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: utils.js
 * Purpose: Core application module.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Optimizes Cloudinary URLs by injecting quality, format, and dimension parameters.
 * If the URL is not a Cloudinary image or is invalid, returns it unchanged.
 * 
 * @param {string} url - The original image URL.
 * @param {number} [width] - Desired width of the image.
 * @param {number} [height] - Desired height of the image.
 * @returns {string} - The optimized image URL.
 */
export function getOptimizedImageUrl(url, width, height) {
  if (!url || typeof url !== 'string') return url;
  
  // Only optimize Cloudinary hosted images
  if (!url.includes('res.cloudinary.com')) return url;
  
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  // f_auto: automatic format detection (WebP, AVIF)
  // q_auto: automatic quality compression
  let transformations = 'f_auto,q_auto';
  
  if (width) {
    transformations += `,w_${width}`;
  }
  if (height) {
    transformations += `,h_${height},c_limit`; // c_limit scales down if larger, preserving aspect ratio
  }
  
  return `${url.substring(0, uploadIndex)}/upload/${transformations}${url.substring(uploadIndex + 7)}`;
}
