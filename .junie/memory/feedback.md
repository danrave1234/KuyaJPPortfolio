[2026-03-01 21:25] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Hook ordering bug",
    "EXPECTATION": "The theme-sync useEffect must run after activeTheme is initialized, not before.",
    "NEW INSTRUCTION": "WHEN adding an effect that reads activeTheme in Admin.jsx THEN place it after activeTheme useState declaration."
}

[2026-03-01 21:28] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Sitemap generation",
    "EXPECTATION": "They expected the project to auto-generate sitemap.xml rather than maintain a static file.",
    "NEW INSTRUCTION": "WHEN setting up sitemap for this Next.js project THEN implement auto-generation and remove the static sitemap.xml."
}

[2026-03-01 23:38] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Sitemap runtime error",
    "EXPECTATION": "They want an auto-generated sitemap that works with Next.js output: 'export' without causing a runtime error.",
    "NEW INSTRUCTION": "WHEN implementing sitemap in this Next.js project with output: 'export' THEN create app/sitemap.(js|ts) static metadata route and remove public/sitemap.xml."
}

[2026-03-01 23:39] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Sitemap 404",
    "EXPECTATION": "They expect /sitemap.xml to exist and serve a generated sitemap in the Next.js app locally and in export.",
    "NEW INSTRUCTION": "WHEN using Next.js with output: 'export' THEN add app/sitemap.(js|ts) static route so /sitemap.xml resolves."
}

[2026-03-01 23:42] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Sitemap fields removal",
    "EXPECTATION": "They want changefreq and priority tags removed from the sitemap as Google ignores them.",
    "NEW INSTRUCTION": "WHEN generating sitemap in this project THEN omit changefreq and priority tags."
}

[2026-03-04 13:44] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Theme change scroll",
    "EXPECTATION": "When switching between birdlife/astro/landscape themes, the page should reset to top.",
    "NEW INSTRUCTION": "WHEN theme changes between birdlife/astro/landscape THEN scroll window to top immediately."
}

[2026-03-04 13:50] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Unwanted scroll-to-top",
    "EXPECTATION": "Navbar page switches should not trigger automatic scroll-to-top or its animation; only theme changes should reset to top.",
    "NEW INSTRUCTION": "WHEN route changes via navbar or Link THEN do not call scroll-to-top or trigger its animation."
}

[2026-03-04 13:56] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Route change scroll",
    "EXPECTATION": "When switching pages via navbar, the new page should start at the top, not carry over the previous page's scroll.",
    "NEW INSTRUCTION": "WHEN navigating via navbar or internal Link THEN ensure new page loads at top without animation."
}

[2026-03-04 13:59] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Route change scroll animation",
    "EXPECTATION": "On page switches, the site should not trigger a programmatic or animated scroll-to-top; pages should simply load at the top naturally.",
    "NEW INSTRUCTION": "WHEN route changes via navbar or Link THEN do not trigger smooth scroll-to-top or BackToTop animation."
}

[2026-03-04 14:00] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Route scroll carryover",
    "EXPECTATION": "On page switches, scroll should not carry over; each new page should load at the top naturally using Next.js defaults (no programmatic scroll or animations).",
    "NEW INSTRUCTION": "WHEN adding navigation Links THEN omit scroll={false} to allow default top reset."
}

[2026-03-08 19:56] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Gallery theme binding",
    "EXPECTATION": "In /gallery, the 'Primary Focus' for Wildlife should change when the theme changes.",
    "NEW INSTRUCTION": "WHEN theme changes on /gallery THEN update Wildlife Primary Focus text to the active theme."
}

