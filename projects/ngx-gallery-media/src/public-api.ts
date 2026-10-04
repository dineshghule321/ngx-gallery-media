/*
 * Public API of ngx-gallery-media.
 */
export * from './lib/models';
export {
  resolveOptions,
  resolveLabels,
  mediaType,
  isVideo,
  defaultUrl,
  stepIndex,
  nextZoom,
  thumbnailPlace,
  thumbnailColumns,
} from './lib/helpers';
export { NgmUrlStore } from './lib/url-store';
export { NgmIconComponent, type NgmIconName } from './lib/icon.component';
export { NgmMediaComponent } from './lib/media.component';
export { NgmActionsComponent, NgmBulletsComponent } from './lib/parts.component';
export { NgmGalleryImageComponent } from './lib/gallery-image.component';
export { NgmGalleryThumbnailsComponent } from './lib/gallery-thumbnails.component';
export { NgmGalleryPreviewComponent } from './lib/gallery-preview.component';
export { NgmGalleryComponent } from './lib/gallery.component';
export { NgmGalleryPreviewService, type NgmPreviewConfig, type NgmPreviewRef } from './lib/preview.service';
