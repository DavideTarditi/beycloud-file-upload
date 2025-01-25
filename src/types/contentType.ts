import path from "path"

export type ContentType =
    | "text/plain"
    | "text/html"
    | "text/css"
    | "text/javascript"
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
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/bmp"
    | "image/webp"
    | "image/svg+xml"
    | "image/tiff"
    | "audio/mpeg"
    | "audio/ogg"
    | "audio/wav"
    | "audio/webm"
    | "video/mp4"
    | "video/mpeg"
    | "video/webm"
    | "video/ogg"
    | "multipart/form-data"
    | "multipart/mixed"
    | "multipart/alternative";

// Mapping ContentType to file extensions
const contentTypeToExtensions: Record<ContentType | string, string[]> = {
    "text/plain": ["txt"],
    "text/html": ["html", "htm"],
    "text/css": ["css"],
    "text/javascript": ["js"],
    "application/json": ["json"],
    "application/xml": ["xml"],
    "application/javascript": ["js"],
    "application/pdf": ["pdf"],
    "application/zip": ["zip"],
    "application/gzip": ["gz"],
    "application/x-www-form-urlencoded": ["urlencoded"],
    "application/msword": ["doc", "dot"],
    "application/vnd.ms-excel": ["xls", "xlt", "xlsx"],
    "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"],
    "application/ogg": ["ogx"],
    "application/rtf": ["rtf"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/gif": ["gif"],
    "image/bmp": ["bmp"],
    "image/webp": ["webp"],
    "image/svg+xml": ["svg"],
    "image/tiff": ["tiff", "tif"],
    "audio/mpeg": ["mp3"],
    "audio/ogg": ["ogg"],
    "audio/wav": ["wav"],
    "audio/webm": ["webm"],
    "video/mp4": ["mp4"],
    "video/mpeg": ["mpeg"],
    "video/webm": ["webm"],
    "video/ogg": ["ogv"],
    "multipart/form-data": [],
    "multipart/mixed": [],
    "multipart/alternative": []
}

export function getExtensions(contentType: ContentType | string): string[] {
    return contentTypeToExtensions[contentType] || []
}

export function setDefaultExtensions(key: string, contentType?: ContentType | string): string {
    if (!contentType) return key

    const { name, ext } = path.parse(key)

    if (ext) return key

    const firstExtension = getExtensions(contentType)?.[0]

    return firstExtension ? `${name}.${firstExtension}` : key
}
