# 🧵 DESIGN.md: Fundsroom Wholesale ERP Design System

> **Visual Source of Truth**: Google Stitch Project `Fundsroom Wholesale ERP` (`projects/11610696082544165384`)  
> **Target Platform**: Fundsroom Mini ERP + CRM Operations Portal  
> **Status**: Approved Specification  

---

## 1. Brand & Visual Direction

### Overall Visual Style
The design system for **Fundsroom Wholesale ERP** is defined by **Refined Minimalism** and **Organic Professionalism**. It moves away from the cold, sterile blues of traditional enterprise SaaS in favor of a calm, mature, and grounded aesthetic. The interface prioritizes clarity, structural order, and density without feeling cluttered.

### Design Personality
* **Grounded & Mature**: Earth-toned palette replacing clinical pure whites and bright corporate blues.
* **Architectural & Intentional**: Visual structure communicated primarily through thin, precise 1px borders rather than heavy decorative shadows or colored glows.
* **Calm Efficiency**: Designed for long operational sessions to minimize eye strain and cognitive fatigue for financial controllers, warehouse managers, and CRM operators.

### Information Density
* **High Density**: Compact component sizing (14px font for data rows, 8px–10px vertical padding in table cells, 38px–40px input field heights) ensuring high record count on screen without sacrificing readability.

### Business & Enterprise Characteristics
* Conservative corner rounding (4px for standard UI controls, 8px for major containers/modals).
* Crisp typography with uppercase tracking on table headers and metadata labels.
* Tabular number formatting for monetary figures and stock counts.

---

## 2. Color System

The palette is anchored in natural earth tones, warm ivory, pure white card surfaces, and subtle sage green accents.

| Role | Color Name | Hex / Code | Usage & Context |
|---|---|---|---|
| **Primary** | Sage Green | `#4E635A` | Primary action buttons, active navigation states, key action triggers |
| **Primary Container** | Soft Sage Tint | `#8DA399` | Hover states on primary buttons, active tab backgrounds, primary badge fills |
| **Primary Fixed Light** | Light Sage Tint | `#D1E8DD` | Active sidebar row tint, subtle highlighted container backgrounds |
| **Secondary** | Muted Sage | `#53625A` | Secondary buttons, secondary icons, complementary action controls |
| **Secondary Container** | Pale Sage | `#CEDED4` / `#D6E6DD` | Neutral tag backgrounds, secondary chip fills |
| **Background** | Warm Ivory | `#FCF9F8` | Main application workspace canvas background (replaces harsh white) |
| **Surface** | Pure White | `#FFFFFF` | Container cards, data tables, form input fields, modal dialogs |
| **Surface Container Low** | Off-Ivory | `#F6F3F2` | Alternating table row zebra striping, search bar background |
| **Surface Container High** | Light Neutral Gray | `#EAE7E7` / `#F0EDED` | Table header row fill, subtle divider lines |
| **Border / Outline** | Muted Sage Gray | `#E2E8E4` / `#C2C8C4` | Thin 1px architectural lines (`.erp-border`) separating containers and cells |
| **Border Focus** | Focus Sage | `#4E635A` | 1px input focus border with 10% opacity halo ring |
| **Text Primary** | Deep Charcoal | `#1B1C1C` / `#2D3030` | Main readable body text and section titles (avoids harsh `#000000`) |
| **Text Muted / Variant** | Slate Gray | `#424845` / `#727875` | Secondary text, table headers, metadata, field placeholders |
| **Accent / Highlight** | Warm Terracotta | `#7D562D` / `#C49566` | Tertiary status accents, warning badges, secondary indicators |
| **Status: Success** | Forest Green | `#2D5A27` | Text/Icon for Shipped, Active, Paid status |
| **Status: Success BG** | Soft Mint | `#E6F4EA` / `#BCF0AE` | Pill background for positive status chips |
| **Status: Warning** | Terracotta Amber | `#7D562D` / `#C49566` | Text/Icon for Pending, Low Stock, Reorder Required |
| **Status: Warning BG** | Soft Cream | `#FFF8E1` / `#FFDCBD` | Pill background for warning status chips |
| **Status: Danger** | Crimson Red | `#BA1A1A` | Text/Icon for Overdue, Out of Stock, Failed |
| **Status: Danger BG** | Soft Rose | `#FCE8E6` / `#FFDAD6` | Pill background for urgent/error status chips |

---

## 3. Typography

* **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`
* **Icon System**: `Material Symbols Outlined` (stroke weight 400, linear style)

### Typographic Scale & Hierarchy

| Token Name | Size (px / rem) | Weight | Line Height | Letter Spacing | Applied Elements |
|---|---|---|---|---|---|
| **Display** | 32px / 2.0rem | 600 (Semi-Bold) | 400px / 2.5rem | `0.02em` | Main dashboard titles, analytics hero figures |
| **Headline Large** | 24px / 1.5rem | 600 (Semi-Bold) | 32px / 2.0rem | `0.01em` | Major section headers, modal titles |
| **Headline Medium** | 20px / 1.25rem | 600 (Semi-Bold) | 28px / 1.75rem | `0.01em` | Card titles, widget headers |
| **Title Large** | 18px / 1.125rem | 600 (Semi-Bold) | 24px / 1.5rem | `0` | Sub-section headers, form group titles |
| **Body Large** | 16px / 1.0rem | 400 (Regular) | 24px / 1.5rem | `0` | Lead paragraphs, modal body text |
| **Body Medium** | 14px / 0.875rem | 400 (Regular) | 20px / 1.25rem | `0` | Primary table row text, form field text |
| **Body Small** | 13px / 0.8125rem | 400 (Regular) | 18px / 1.125rem | `0` | Auxiliary notes, table sub-text |
| **Label Medium** | 12px / 0.75rem | 500 (Medium) | 16px / 1.0rem | `0.04em` (Uppercase) | Table headers, form field labels, status badges |
| **Label Small** | 11px / 0.6875rem | 500 (Medium) | 14px / 0.875rem | `0.02em` | Micro-badges, timestamp footers |

---

## 4. Spacing & Rhythm

All spacing measurements adhere to a strict **4px modular grid**.

* **Page Workspace Padding**: `24px` (`1.5rem`) on desktop canvas; compact views reduce to `16px`.
* **Section Spacing**: `24px` to `32px` vertical gap between major content containers.
* **Card Internal Padding**: `16px` to `24px`.
* **Card Stack / Grid Gap**: `16px` (`1.0rem`).
* **Table Spacing**:
  * Header Cell Padding: `10px 16px`
  * Row Cell Padding: `8px 16px` (compact 8px vertical padding for high data density)
* **Form Field Spacing**:
  * Stack Gap between Form Groups: `16px`
  * Label-to-Input Vertical Gap: `6px`
  * Action Button Group Gap: `8px`–`12px`

---

## 5. Component Visual Specifications

### Buttons
* **Primary Button**:
  * Background: Solid Sage Green (`#4E635A`)
  * Text: `#FFFFFF`, `Inter 14px Medium`
  * Border: None
  * Radius: `4px` (`rounded`)
  * Height: `40px` (standard) / `36px` (compact)
  * Hover State: Background `#3A4B44` (`opacity: 0.9`)
* **Secondary / Ghost Button**:
  * Background: Transparent or `#FFFFFF`
  * Border: `1px solid #E2E8E4`
  * Text: Deep Charcoal (`#1B1C1C`) or Sage Green (`#4E635A`)
  * Hover State: Background `#F6F3F2`
* **Danger Button**:
  * Background: Crimson Red (`#BA1A1A`), Text: `#FFFFFF`, Radius: `4px`
* **Icon-Only Button**:
  * Square `36px x 36px` or `32px x 32px`, transparent background, 1px `#E2E8E4` border on hover.

### Inputs & Textareas
* Background: Pure White (`#FFFFFF`)
* Border: `1px solid #E2E8E4`
* Corner Radius: `4px` (`rounded`)
* Height: `38px`–`40px`
* Text Color: `#1B1C1C` (`body-md`), Placeholder: `#727875`
* Focus State: Border shifts to `#4E635A` with a 2px 10% opacity Sage Green focus ring (`ring-2 ring-primary/20`).

### Select Dropdowns
* White background (`#FFFFFF`), `1px solid #E2E8E4` border, `4px` corner radius.
* Custom SVG chevron indicator down-arrow (`bg-[url(...)]`), `appearance-none`, right-padded `36px`.

### Search Bars
* Pure White or Off-Ivory (`#F6F3F2`) background, 1px border (`#E2E8E4`), `4px` radius.
* Left icon: `Material Symbols Outlined: search` in `#727875`.
* Right keyboard shortcut badge: `Ctrl + K` pill in `#EAE7E7` background with `#424845` text.

### Cards & Containers
* Background: Pure White (`#FFFFFF`)
* Border: `1px solid #E2E8E4`
* Corner Radius: `4px` (`rounded`) for dashboard widgets; `8px` (`rounded-lg`) for major modals.
* Elevation: Flat by default (zero shadow). Diffused shadow `0 4px 12px rgba(141, 163, 153, 0.1)` used only when elevated.
* Card Header: Separated by a faint `1px solid #E2E8E4` bottom border.

### Tables
* Container: White background with surrounding `1px solid #E2E8E4` border.
* Header Row: Background `#F0EDED`, text `label-md` uppercase in `#424845`, height `40px`.
* Row Styling: Alternating zebra rows (`#FCF9F8` / `#FFFFFF`), height `44px` (compact).
* Row Dividers: `1px solid #E2E8E4` horizontal lines only.
* Hover State: Row background shifts to `#F2F4F6`.
* Numeric Alignments: Quantities, unit prices, totals right-aligned with tabular figures.

### Status Badges & Chips
* Shape: Rounded pill (`rounded-full` or `4px` radius), height `22px`–`24px`, horizontal padding `8px 12px`.
* Typography: `Inter 12px`, weight `500`.
* Variants:
  * **Success**: `#E6F4EA` background, `#2D5A27` text (e.g. *Shipped*, *Active*, *Paid*)
  * **Warning**: `#FFF8E1` background, `#7D562D` text (e.g. *Pending*, *Low Stock*)
  * **Danger**: `#FCE8E6` background, `#BA1A1A` text (e.g. *Overdue*, *Out of Stock*)
  * **Neutral**: `#F0EDED` background, `#424845` text (e.g. *Draft*, *Archived*)

### Tabs
* Style: Horizontal border tab rail.
* Active Tab: Text `#4E635A` with a 2px bottom indicator line in Primary Sage (`#4E635A`).
* Inactive Tab: Text `#424845`, transparent background, hover text `#1B1C1C`.

### Dropdowns & Popovers
* Background: Pure White (`#FFFFFF`), `1px solid #E2E8E4` border, `8px` corner radius.
* Elevation: Shadow `0 4px 16px rgba(0, 0, 0, 0.08)`.
* Menu Items: Padding `8px 12px`, hover background `#F6F3F2`, font `Inter 14px`.

### Modals & Dialogs
* Backdrop: Semi-transparent dark overlay (`rgba(27, 28, 28, 0.4)`).
* Modal Container: Pure White (`#FFFFFF`), `8px` corner radius, `1px solid #E2E8E4`, max-width `600px` (standard) / `900px` (large grid).
* Modal Header: Title in `headline-lg` (`24px`), right close icon button (`X`).
* Modal Footer: Sticky bottom action bar with Secondary (Cancel) and Primary (Save/Publish) buttons.

### Sidebar Navigation
* Position: Fixed left rail, width `230px`, height `100vh`.
* Background: Warm Ivory (`#FCF9F8`), right border `1px solid #E2E8E4`.
* Logo Area: Top height `64px`, `1px solid #E2E8E4` bottom divider, brand text `Fundsroom ERP`.
* Navigation Item: Height `40px`, padding `0 16px`, `Inter 14px Medium`.
* Active State: 3px vertical Sage Green (`#4E635A`) indicator bar on left edge, background fill `#D1E8DD` / `#E2E8E4`, text `#1B1C1C` semi-bold.

### Top Application Header
* Position: Sticky top bar (`margin-left: 230px`), height `64px`.
* Background: Pure White (`#FFFFFF`), bottom border `1px solid #E2E8E4`.
* Layout: Flex alignment with breadcrumb page title on left, global search in center, notification bell & profile avatar on right.

### Pagination
* Placement: Bottom footer attached to data tables.
* Content: "Showing 1–10 of 124 records" summary text on left, rows-per-page dropdown, and page number buttons on right.
* Active Page Button: Solid Sage Green (`#4E635A`) background, white text; Inactive buttons: `1px solid #E2E8E4` white background.

### Empty States
* Centered layout inside container with `48px` linear Material Symbol icon in `#727875`.
* Heading: `headline-md` (`20px`) in `#1B1C1C`.
* Body text: `body-md` (`14px`) in `#424845`.
* Action: Primary Sage Green button ("+ Add Record").

### Loading States
* Animated pulse skeleton placeholders (`bg-surface-container-high` / `#EAE7E7` with CSS pulse animation).
* Table row skeletons with muted gray blocks.

---

## 6. Layout & Responsive Architecture

* **Sidebar Width**: `230px` (fixed left rail).
* **Header Height**: `64px` (sticky top bar).
* **Main Content Area**: Starts at `margin-left: 230px`, `padding: 24px`.
* **Grid System**: 12-column responsive flex grid with `16px` gutter.
* **Responsive Breakpoints**:
  * **Desktop (1280px+)**: Full expanded 230px sidebar + fluid 12-column grid workspace.
  * **Tablet (768px – 1024px)**: Sidebar collapses to 64px icon-only rail; table columns scroll horizontally if needed.
  * **Mobile (<768px)**: Sidebar shifts to a slide-out drawer; metric cards stack in a single column.

---

## 7. Screen Inventory

| Screen Name | Viewport / Type | Purpose & Core Layout Components |
|---|---|---|
| **Executive Dashboard** | Desktop (1280px+) | Operational command center with 4 KPI summary cards (Sales, Pending Orders, Low Stock Alerts, Revenue), Recent Sales Challans table, and Inventory Health status panel. |
| **Login** | Desktop / Responsive | Authentication screen featuring a centered single card on Warm Ivory background, email/password fields, Remember Me checkbox, and Sign In action. |
| **New Sales Challan** | Desktop (1280px+) | Form interface for issuing sales invoices with Customer select, Date/Payment terms, dynamic Line Items data grid (Product select, Quantity, Price, Tax, Line Total), and summary calculation sidebar. |
| **Inventory Management** | Desktop (1280px+) | Warehouse stock management view with SKU metrics, filterable data grid (SKU, Name, Category, In-Stock, Reorder Level), and Recent Stock Movements log. |
| **Customer CRM** | Desktop (1280px+) | B2B wholesale client management portal with customer directory table (Client Name, Contact, Outstanding Balance, Credit Limit, Status), filter toolbar, and client activity panel. |

---

## 8. Design Implementation Rules

1. **Stitch as Single Source of Truth**: Strictly match the colors, typography, spacing, and components specified in this document.
2. **No Arbitrary Blue or Violet Accents**: Do not introduce corporate blue (`#1E40AF`), purple, or glowing colored outlines under any circumstances.
3. **Architectural 1px Borders Over Shadows**: Use thin 1px `#E2E8E4` borders for visual boundaries. Shadows are reserved exclusively for dropdowns, popovers, and modal dialogs.
4. **Maintain High Data Density**: Table cell vertical padding must stay compact (`8px`–`10px`), and font size for table data must remain `14px` (`body-md`).
5. **Strict Inter Typography**: Use Inter font with uppercase tracking on labels, badge text, and table headers.
6. **Responsive Layout Discipline**: The main workspace must maintain `margin-left: 230px` on desktop with `24px` padding.
