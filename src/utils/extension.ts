/**
 * Extracts the file extension from a given filename.
 * @param filename - The name of the file to extract the extension from
 * @returns The file extension (including the dot) if found, or null if no extension exists
 *
 * Examples:
 * - extractExtension("document.pdf") returns ".pdf"
 * - extractExtension("image.PNG") returns ".PNG"
 * - extractExtension("readme") returns null
 */
export function extractExtension(filename: string | undefined): string | null {
    if (!filename) return null

    const match = filename.match(/\.[0-9a-z]+$/i)
    return match ? match[0].slice(1) : null
}

/**
 * Determines if a given path represents a folder/directory.
 * @param path - The file system path to check
 * @returns True if the path ends with a forward slash or backslash (indicating a folder), false otherwise
 *
 * Examples:
 * - isFolder("documents/") returns true
 * - isFolder("documents\\") returns true
 * - isFolder("file.txt") returns false
 */
export function isFolder(path: string | undefined): boolean {
    if (!path) return false

    return path.endsWith('/') || path.endsWith('\\')
}
