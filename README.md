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
- Optional value masking in the list (e.g. `pa****rd`) — display-only, copy uses the full value
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

### BRN Generator (BRNGenerator.html)

A random Malaysian SSM Business Registration Number (BRN) generator for testing purposes.

**Purpose:**  
Generate valid-format Malaysian business registration numbers — both the new 12-digit SSM format and the legacy (pre 11 Oct 2019) format — for QA and development testing.

**Features:**
- Generate **New Format** (12-digit) numbers: `YYYY` + entity type code + 6-digit sequence
- Generate **Old Format** numbers: company style (`1312525-A`) or sole prop/partnership style (`0012345678-P`)
- Generate **Both** — new number with the old number in brackets (e.g. `201901000005 (1312525-A)`)
- Entity type selection (01 Local Company, 02 Foreign Company, 03 Business, 04 Local LLP, 05 Foreign LLP, 06 Professional LLP)
- Optional registration year (empty = random, 2019 onward)
- Batch generation with "Number to generate" field
- Click to copy, Copy All, and Clear history

**Entity Type Codes (new format):**

| Code | Entity Type |
|------|-------------|
| 01 | Local Company |
| 02 | Foreign Company |
| 03 | Business (Sole Prop / Partnership) |
| 04 | Local LLP |
| 05 | Foreign LLP |
| 06 | Professional LLP |

**How to use:**
1. Open `BRNGenerator.html` in your browser
2. Choose the format (New, Old, or Both)
3. Select entity type and optional year (new format), or old entity style (old format)
4. Set how many to generate
5. Click **Generate BRN**
6. Click the result box or any history item to copy

---

## Shared Navigation (nav.js)

A shared JavaScript file that injects a consistent sticky navigation bar across all tool pages. Edit `nav.js` once to update navigation on all pages.

---

## File Structure

```
├── FastCopy.html     # Clipboard cache utility
├── IDGenerator.html  # Malaysian NRIC generator
├── BRNGenerator.html # Malaysian SSM BRN generator
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

### v1.1.0
- FastCopy: search now debounces (~200ms) so the list re-renders once you pause typing instead of on every keystroke — smoother on large lists
- FastCopy: empty results now show a contextual message — distinguishing no entries yet, no search match, and no match for the selected tag
- FastCopy: empty search/tag results include a one-click "Clear search" / "Show all" button to quickly return to the full list

### v1.0.9
- FastCopy: entry action buttons (pin/edit/delete) are now fully visible by default on touch devices, which have no hover state
- FastCopy: on touch devices the buttons use a solid white background for better contrast against the card
- FastCopy: desktop hover behaviour is unchanged — buttons stay subtle until you hover the card

### v1.0.8
- FastCopy: tag labels now auto-pick black or white text based on the tag colour's brightness, so light colours stay readable
- FastCopy: auto-contrast applies to tag chips in the form, tag pills in the list, and the active filter tab
- FastCopy: very light tag colours are darkened on the inactive filter tabs so they remain legible on the white background
- FastCopy: display-only change — stored tag colours and copied values are unchanged

### v1.0.7
- FastCopy: tag colour picks in the Add/Edit form are now held as a draft and only saved when you click Save Entry
- FastCopy: cancelling an add/edit (or switching entries) discards unsaved colour changes instead of persisting them

### v1.0.6
- FastCopy: added a "Mask value in list" toggle when adding or editing an entry (default off)
- FastCopy: masked text entries display partially hidden in the list (e.g. `pa****rd`)
- FastCopy: masking is display-only — clicking an entry always copies the full, actual value
- FastCopy: masking applies to text entries only; existing entries without the setting show the full value

### v1.0.5
- New tool: BRN Generator (`BRNGenerator.html`) for Malaysian SSM Business Registration Numbers
- BRN Generator: new 12-digit format, old format, and combined "New (Old)" output
- BRN Generator: entity type codes, optional registration year, batch generation, copy/history
- Added BRN Generator to shared navigation bar

### v1.0.4
- FastCopy: export JSON now includes tag colours so colours are preserved on import
- FastCopy: import detects duplicates by entry ID and overwrites instead of creating duplicates
- FastCopy: import supports both new format and legacy plain-array format
- FastCopy: import toast now shows breakdown of new vs updated entries

### v1.0.3
- FastCopy: tag filter now updates URL with `?tag=` parameter (e.g. `FastCopy.html?tag=AlphaSAT`)
- FastCopy: bookmarkable filtered views — visit a URL with `?tag=` to load pre-filtered list
- FastCopy: clicking "All" tab clears the `?tag=` parameter from URL

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
