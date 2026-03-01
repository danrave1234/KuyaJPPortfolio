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

