import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

async function createDirectoryIfNotExists(path) {
    try {
        if (!existsSync(path)) {
            await mkdir(path, { recursive: true });
            return true
        }
        return false
    } catch (e) {
        return false
    }
}

async function createFileIfNotExists(path, content) {
    try {
        if (!existsSync(path)) {
            await writeFile(path, content, "utf8");
            return true
        }
    } catch (e) {
        return false
    }
}

export {
    createDirectoryIfNotExists,
    createFileIfNotExists
}