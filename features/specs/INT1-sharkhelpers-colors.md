# Shark Helpers Brand Colors

**Source**: Extracted from https://www.sharkhelpers.com/ CSS files
**Date**: 2026-03-04

## Primary Brand Colors (Identified)

Based on CSS analysis, these appear to be the key brand colors:

### Main Brand Colors
- **Primary Blue**: `#0082f3` - Bright blue (likely primary CTA/brand color)
- **Teal/Cyan**: `#2895f7` - Light blue accent
- **Dark Blue**: `#0050bd` - Deep blue (likely for headers/dark elements)
- **Teal Green**: `#006e7f` - Dark teal
- **Green**: `#12b878` - Bright green (success/positive states)

### Accent Colors
- **Orange**: `#ff9014` - Primary orange accent
- **Red/Pink**: `#ea384c` - Alert/error color
- **Red**: `#eb6023` - Secondary red
- **Orange**: `#ed5e02` - Dark orange
- **Coral**: `#ff7d5f` - Light coral

### Neutral Colors
- **Pure Black**: `#000000`
- **Dark Gray**: `#2e2e2e`
- **Medium Gray**: `#727272`
- **Light Gray**: `#d5d5d5`
- **Off-White**: `#f5f5f5`
- **Pure White**: `#ffffff`

### Background Colors
- **Light Blue Bg**: `#f2f5ff` - Very light blue background
- **Light Orange Bg**: `#fffaf7` - Very light orange background
- **Light Gray Bg**: `#f7f8f9` - Light gray background

## Recommended CSS Variables

```css
:root {
  /* Primary Brand Colors */
  --brand-primary: #0082f3;        /* Main blue */
  --brand-primary-dark: #0050bd;   /* Dark blue */
  --brand-secondary: #12b878;      /* Green */
  --brand-accent: #ff9014;         /* Orange */

  /* Interactive States */
  --color-success: #12b878;        /* Green */
  --color-warning: #ff9014;        /* Orange */
  --color-error: #ea384c;          /* Red */
  --color-info: #2895f7;           /* Light blue */

  /* Neutral Colors */
  --color-text-primary: #000000;   /* Black text */
  --color-text-secondary: #727272; /* Gray text */
  --color-border: #d5d5d5;         /* Light gray borders */
  --color-background: #ffffff;     /* White background */
  --color-background-light: #f7f8f9; /* Light gray bg */
  --color-background-blue: #f2f5ff;  /* Light blue bg */

  /* Hover/Active States */
  --brand-primary-hover: #006ed9;  /* Slightly darker blue */
  --brand-accent-hover: #e68010;   /* Slightly darker orange */
}
```

## Visual Verification Needed

**TODO**:
1. Visit https://www.sharkhelpers.com/ in a browser
2. Use DevTools to inspect:
   - Main CTA buttons (likely use primary blue)
   - Navigation/header colors
   - Accent colors in hero section
   - Footer colors
3. Verify which color is actually their PRIMARY brand color
4. Get Shark Helpers logo file (PNG or SVG)

## Notes

- The site uses a Webflow-based design system
- Multiple shades of each color family exist
- The orange (#ff9014) and blue (#0082f3) appear to be the dominant brand colors
- The green (#12b878) is likely used for success states or secondary CTAs
