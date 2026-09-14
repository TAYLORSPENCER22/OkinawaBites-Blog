// Deterministically maps a username to a consistent pastel color,
// so every post shows the same author badge color across the site.
export function getAuthorColor(username) {
    if (!username) return '#ACEBF1';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 78%)`;
}
