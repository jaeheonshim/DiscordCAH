const usernameCache = new Map<string, string>();

export function cacheUsername(userId: string, username: string) {
    usernameCache.set(userId, username);
}

export function retrieveUsername(userId: string) {
    if(usernameCache.has(userId)) {
        return usernameCache.get(userId);
    } else {
        return "[error: unknown]";
    }
}