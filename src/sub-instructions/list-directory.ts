import * as fs from "fs";
import * as path from "path";

function listDirectory(dirPath: string): string {
  try {
    const resolved = path.resolve(dirPath);
    const entries = fs.readdirSync(resolved, { withFileTypes: true });

    if (entries.length === 0) {
      return `📁 *Directory listing: ${resolved}*\n\n_Empty directory._`;
    }

    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => `📁 ${e.name}/`)
      .join("\n");

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => {
        const stats = fs.statSync(path.join(resolved, e.name));
        const size = formatSize(stats.size);
        return `📄 ${e.name} _(${size})_`;
      })
      .join("\n");

    const lines = [folders, files].filter(Boolean).join("\n");

    return `📁 *Directory listing: ${resolved}*\n\n${lines}`;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return `❌ *Path not found:* \`${dirPath}\``;
    }
    if (err.code === "ENOTDIR") {
      return `❌ *Not a directory:* \`${dirPath}\``;
    }
    if (err.code === "EACCES") {
      return `🔒 *Permission denied:* \`${dirPath}\``;
    }
    return `❌ *Error reading directory:* ${err.message}`;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export { listDirectory }