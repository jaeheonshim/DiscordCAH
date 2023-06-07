const usernameCache = new Map<string, string>();

export function cacheUsername(userId: string, username: string) {
    usernameCache.set(userId, username);
}

export async function retrieveUsername(userId: string): Promise<string> {
    if(usernameCache.has(userId)) {
        return usernameCache.get(userId);
    } else {
        return "[error: unknown]";
    }
}