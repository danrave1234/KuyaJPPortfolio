[2025-12-19 22:23] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "layout structure",
    "EXPECTATION": "Have a single gallery container that includes the gallery controls; remove redundant separate controls container.",
    "NEW INSTRUCTION": "WHEN structuring a gallery layout THEN put controls inside the main gallery container and remove extra wrappers"
}

[2025-12-19 22:32] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "container redundancy",
    "EXPECTATION": "Combine the main gallery container and controls into a single container; remove the separate controls wrapper.",
    "NEW INSTRUCTION": "WHEN building a gallery UI THEN place controls inside the main gallery container only"
}

[2025-12-19 22:34] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "container redundancy",
    "EXPECTATION": "Merge gallery controls into the main gallery container; remove the separate controls container.",
    "NEW INSTRUCTION": "WHEN building a gallery layout THEN place controls inside the main gallery container and remove extra wrappers"
}

[2025-12-19 22:39] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "container redundancy",
    "EXPECTATION": "Merge gallery controls into the main gallery container; remove the separate controls wrapper.",
    "NEW INSTRUCTION": "WHEN building a gallery UI THEN place controls inside the main gallery container only"
}

[2025-12-19 22:41] - Updated by Junie
{
    "TYPE": "negative",
    "CATEGORY": "runtime error",
    "EXPECTATION": "Admin page should load without 'Search is not defined'; ensure any Search component/icon is defined or imported correctly.",
    "NEW INSTRUCTION": "WHEN using a Search component or icon in Admin.jsx THEN ensure it is imported or replace with an existing symbol"
}

[2025-12-19 22:44] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "layout spacing",
    "EXPECTATION": "Remove excessive top whitespace above the 'gallery controls' text so it aligns closely with the top of its container.",
    "NEW INSTRUCTION": "WHEN 'gallery controls' header has large top gap THEN remove header top margin; reduce parent top padding to minimal"
}

[2025-12-19 23:03] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "layout spacing",
    "EXPECTATION": "Reduce the top whitespace above the 'gallery controls' so it sits closer to the container top.",
    "NEW INSTRUCTION": "WHEN 'gallery controls' header has extra top space THEN remove header top margin and minimize parent top padding"
}

[2025-12-19 23:05] - Updated by Junie
{
    "TYPE": "negative",
    "CATEGORY": "sticky overlap",
    "EXPECTATION": "The sticky 'Gallery controls' bar should not cover the photos; content should start below it after reducing the top gap.",
    "NEW INSTRUCTION": "WHEN implementing sticky gallery controls THEN add top spacing below equal to controls height"
}

[2025-12-19 23:17] - Updated by Junie
{
    "TYPE": "negative",
    "CATEGORY": "runtime error",
    "EXPECTATION": "Do not reference state variables in useEffect dependencies before they are declared; ensure hooks are defined prior to use.",
    "NEW INSTRUCTION": "WHEN referencing state in a useEffect dependency array THEN declare the corresponding useState before that effect"
}

