# Tools Collection

A set of lightweight, portable HTML-based utilities for testers and developers. No server required — just open in a browser.

---

## Tools

### FastCopy (FastCopy.html)

A clipboard caching utility for storing, organising, and quickly copying frequently used values.

**Purpose:**  
Save text snippets, URLs, credentials, images, or any value you need to copy repeatedly. Tag and search them for fast retrieval.

**Features:**
- Add text or image entries (paste, type, or drag & drop)
- Chip-style tags with custom colours per tag
- Tag autocomplete suggestions from existing tags
- Remark field for human-readable descriptions
- List view with search, tag filter tabs, and pin/favourite
- Click any entry to copy its value to clipboard
- Edit and delete entries
- Pin important entries to the top
- Export/Import data as portable JSON file
- Data stored in browser localStorage

**How to use:**
1. Open `FastCopy.html` in your browser
2. Click **+ Add** to create a new entry
3. Type or paste a value (text auto-detected; images via Ctrl+V or drag & drop)
4. Add tags (type and press Enter; pick a colour with the circle picker)
5. Add an optional remark to describe the entry
6. Click **Save Entry**
7. On the **List** page, click any card to copy the value
8. Use the search bar or tag tabs to filter entries
9. Pin frequently used entries with the ★ button
10. Use **Export JSON** to back up or transfer data between browsers

---

### ID Generator (IDGenerator.html)

A random Malaysian NRIC (IC number) generator for testing purposes.

**Purpose:**  
Generate valid-format Malaysian IC numbers with configurable options for QA and development testing.

**Features:**
- Generate random NRIC in format `YYMMDD-PB-####`
- Partial DOB input (year, month, day — leave any empty for random)
- Gender filter (male = odd last digit, female = even)
- State/place of birth selection (all 16 states)
- Click to copy (without dashes)
- History of last 10 generated numbers

**How to use:**
1. Open `IDGenerator.html` in your browser
2. Optionally fill in Year, Month, or Day (empty = random)
3. Select Gender and State if needed
4. Click **Generate NRIC**
5. Click the result box or any history item to copy

---

## Shared Navigation (nav.js)

A shared JavaScript file that injects a consistent sticky navigation bar across all tool pages. Edit `nav.js` once to update navigation on all pages.

---

## File Structure

```
├── FastCopy.html     # Clipboard cache utility
├── IDGenerator.html  # Malaysian NRIC generator
├── nav.js            # Shared navigation bar
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

---

## Data Storage

- **FastCopy entries:** `localStorage` key `fastcopy_entries`
- **Tag colours:** `localStorage` key `fastcopy_tagcolors`
- **Portable backup:** Export/Import as `.json` file

---

## Changelog

### v1.0.2
- ID Generator: added Age input field (calculates birth year from age)
- ID Generator: added "Number to generate" field for batch generation
- ID Generator: Copy All button to copy entire history to clipboard
- ID Generator: Clear button to reset history
- ID Generator: Clear All Inputs button to reset form fields
- ID Generator: history no longer capped at 10 items
- ID Generator: page loads empty (no auto-generate on visit)
- ID Generator: fixed history bug caused by `history` variable name conflict

### v1.0.1
- Remark displayed below value as subtle label for better visual hierarchy
- Pin/favourite entries to keep them at the top of the list
- Tag colour picker — assign custom background colours to tags
- Tag autocomplete suggestions when typing (matches existing tags)
- Tag filter tabs on list page (replaces dropdown)
- Edit entry support with "Cancel Edit" reset button
- Shared `nav.js` for consistent sticky navigation across all pages
- Version number shown in nav bar
- List page as default landing page
- Separate DOB fields (year/month/day) with partial input support

### v1.0.0
- Initial release
- FastCopy: add/list entries with text and image support
- FastCopy: chip-style tags, search, click-to-copy, export/import JSON
- ID Generator: random Malaysian NRIC with gender/state options
- Cross-linked navigation between tools
