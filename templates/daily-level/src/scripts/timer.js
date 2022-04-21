export function getNextGameTime () {
    var d = new Date();
    d.setHours(24,0,0,0);
    return d;
}

export function getHoursUntil (date) {
    var now = new Date().getTime();
    return Math.floor(((date - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
}

export function getMinutesUntil (date) {
    var now = new Date().getTime();
    return Math.floor(((date - now) % (1000 * 60 * 60)) / (1000 * 60));
}

export function getSecondsUntil (date) {
    var now = new Date().getTime();
    return Math.floor(((date - now) % (1000 * 60)) / 1000);
}
    