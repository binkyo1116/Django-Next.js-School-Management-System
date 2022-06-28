export function getCookie(name) {
    let cname = name + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split('; ');
    for (let i = 0; i <ca.length; i++) {
        let c = ca[i];
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return '';
}

export function setCookie(name, value, opts) {
    let _value = value || '';
    let header = name + '=' + _value;

    if (opts.path) header += '; path=' + opts.path;
    if (opts.domain) header += '; domain=' + opts.domain;
    if (opts.maxAge) header += '; max-age=' + opts.maxAge;
    if (opts.expires) header += '; expires=' + opts.expires.toUTCString();
    if (opts.secure) header += '; secure';
    if (opts.samesite) header += '; samesite=' + (opts.samesite === true ? 'strict' : opts.samesite.toLowerCase());

    document.cookie = header;
}

export const sleep = sec => { return new Promise(resolve => { setTimeout(resolve, (sec * 1000)); }); };
