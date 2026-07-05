// Extracts the video ID from any common YouTube URL shape: watch?v=, youtu.be/,
// live/, embed/, and shorts/.
export function extractYouTubeId(url) {
    const m = url?.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/|shorts\/))([^&?/\s]+)/
    );
    return m?.[1] || null;
}
