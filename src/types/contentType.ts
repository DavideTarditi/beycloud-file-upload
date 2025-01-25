export type ContentType =
// Text-based content
    | "text/plain"
    | "text/html"
    | "text/css"
    | "text/javascript"

    // Application-specific types
    | "application/json"
    | "application/xml"
    | "application/javascript"
    | "application/pdf"
    | "application/zip"
    | "application/gzip"
    | "application/x-www-form-urlencoded"
    | "application/msword"
    | "application/vnd.ms-excel"
    | "application/vnd.ms-powerpoint"
    | "application/ogg"
    | "application/rtf"

    // Image types
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/bmp"
    | "image/webp"
    | "image/svg+xml"
    | "image/tiff"

    // Audio types
    | "audio/mpeg"
    | "audio/ogg"
    | "audio/wav"
    | "audio/webm"

    // Video types
    | "video/mp4"
    | "video/mpeg"
    | "video/webm"
    | "video/ogg"

    // Multipart types
    | "multipart/form-data"
    | "multipart/mixed"
    | "multipart/alternative";
