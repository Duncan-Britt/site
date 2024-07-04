document.addEventListner('DOMContentLoaded', () => {
    // To fix Github pages broken links:
    const GITHUB_PAGES_ORIGIN = 'https://duncan-britt.github.io';
    const GITHUB_REPO_NAME = 'site';
    const NEW_BASE_URI = GITHUB_PAGES_ORIGIN + '/' + GITHUB_REPO_NAME;
    const HOME_PAGE = 'https://duncan-britt.github.io/site/';
    
    if (window.location.origin == GITHUB_PAGES_ORIGIN) { // <-- Don't do anything in when running locally.
        const links = (window.location.href == HOME_PAGE ? document.querySelectorAll('a') : document.querySelectorAll('#preamble a'));
        
        links.forEach(link => {
            if (link.origin == GITHUB_PAGES_ORIGIN) {
                link.href = NEW_BASE_URI + link.href.slice(link.origin.length);
            }
        });

        const links_css = document.querySelectorAll('link');
        links_css.forEach(link => {
            if (link.rel == 'stylesheet') {
                link.href = NEW_BASE_URI + link.href.slice(GITHUB_PAGES_ORIGIN.length);
            }
        });
    }
});
