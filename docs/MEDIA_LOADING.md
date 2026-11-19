# Public media loading

Public photos use `PublicImage`: local images use Next's cached responsive image optimisation, unsigned Cloudinary image uploads use screen-sized CDN renditions with automatic format/quality, and supported YouTube thumbnails use the image optimiser. Grid photos declare their actual column sizes. Unknown external hosts and signed/token-bearing URLs remain original URLs. If a Cloudinary image transformation fails, the component retries the original image before invoking its existing error handler.

`PageHero` now uses a responsive image instead of a full-size CSS background. White cards, image dimensions and the public light palette are preserved. Next image optimisation was previously disabled globally; it is now enabled with a one-day minimum cache period. Existing social secrets and upload settings are not changed.

The default homepage background has separate delivery renditions:

| File | Original | Delivery rendition |
| --- | ---: | ---: |
| Desktop video | 6,722,780 bytes | 3,226,559 bytes |
| Mobile video | 6,715,605 bytes | 2,868,834 bytes |

The renditions retain the full duration, use compatible H.264 with the playback metadata at the start, and omit the audio track because these backgrounds are muted. Original files remain intact. Small JPG posters paint immediately; the video starts after the first rendering work. One matching video is mounted, replacing the two hidden/visible videos that browsers could both download. Reduced-motion, Save-Data and slow-2G/2G connections retain the poster instead of downloading a background video.

Cloudinary video delivery uses bounded-width H.264 renditions with a poster where available, and retries the original video if rendition playback fails. Stored URLs are not rewritten. Non-autoplay native players use `preload="none"`. VideoEmbed waits until near the viewport; regular YouTube players display a thumbnail/play button and mount the iframe on selection. Background players autoplay only when motion/data preferences allow. Event listing cards use photos/posters and link to the event's full videos instead of initialising a player on every card. The footer map remains lazy loaded.

Deploy the frontend, including the four new poster/video assets. No backend change or database migration is needed. First requests may generate a CDN/image rendition; later requests benefit from caching. These changes reduce delivery size and competing requests; they do not measure or guarantee a particular connection speed.

Verification: unit tests cover delivery transformations and protected URLs. `tests/runtime-media-loading.mjs` uses a local mock backend on port 5310 and a local production frontend to check mobile/desktop selection, data-saving/reduced-motion behaviour, Cloudinary srcsets and deferred YouTube playback. It also requests an actual local image rendition: `library-hero-sm.png` at 640 pixels was 39,594 bytes as WebP, compared with the 1,955,757-byte original. Actual sizes vary by source and requested width.

References: [Next Image](https://nextjs.org/docs/app/api-reference/components/image), [Cloudinary image optimisation](https://cloudinary.com/documentation/image_optimization), [Cloudinary transformation reference](https://cloudinary.com/documentation/transformation_reference).
