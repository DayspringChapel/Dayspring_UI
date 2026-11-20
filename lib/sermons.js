export function newestSermonsFirst(sermons) {
    const timestamp = value => {
        const parsed = Date.parse(value || '');
        return Number.isFinite(parsed) ? parsed : -Infinity;
    };
    return [...sermons].sort((a, b) => {
        const first = timestamp(a.sermonDate), second = timestamp(b.sermonDate);
        return first === second ? 0 : first > second ? -1 : 1;
    });
}

export function sermonDateLabel(value) {
    const date = new Date(value || '');
    return Number.isNaN(date.getTime()) ? 'Date to be confirmed' : new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date);
}
