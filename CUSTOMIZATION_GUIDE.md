# 🎨 UI & Color Customization Guide

This guide explains how to customize the UI colors and styling in the Room Finder application.

## 📍 Where Colors Are Defined

### 1. **Tailwind Configuration** (`tailwind.config.js`)
This is the main place to define your color palette. The app uses a custom `primary` color scheme.

### 2. **Component Files**
Individual components use Tailwind classes like `bg-primary-600`, `text-gray-900`, etc.

### 3. **Global Styles** (`app/globals.css`)
For global background colors and custom CSS.

---

## 🎨 Changing the Primary Color Theme

### Step 1: Edit `tailwind.config.js`

The primary color is defined in the `theme.extend.colors` section:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',   // Lightest shade
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',   // Base color
    600: '#0284c7',   // Used in navbar, buttons
    700: '#0369a1',   // Used in navbar gradient
    800: '#075985',
    900: '#0c4a6e',   // Darkest shade
  },
}
```

### Example: Change to Purple Theme

```javascript
primary: {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',   // Main color
  700: '#7e22ce',   // Darker shade
  800: '#6b21a8',
  900: '#581c87',
}
```

### Example: Change to Green Theme

```javascript
primary: {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',   // Main color
  700: '#15803d',   // Darker shade
  800: '#166534',
  900: '#14532d',
}
```

---

## 🎨 Changing Background Colors

### 1. **Page Background** (`app/globals.css`)

Edit the `body` background in `app/globals.css`:

```css
body {
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
```

Or use a solid color:

```css
body {
  background: #f9fafb; /* Light gray */
  /* or */
  background: #ffffff; /* White */
  /* or */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Gradient */
}
```

### 2. **Card Backgrounds**

Cards use `bg-white` class. To change:

- Find components like `RoomCard.tsx`, `SearchFilters.tsx`
- Change `bg-white` to your desired color:
  - `bg-gray-50` - Very light gray
  - `bg-blue-50` - Light blue tint
  - `bg-primary-50` - Light primary color

### 3. **Navbar Background** (`components/Navbar.tsx`)

Current navbar uses:
```tsx
className="bg-gradient-to-r from-primary-600 to-primary-700"
```

Change to:
- Solid color: `bg-primary-600`
- Different gradient: `bg-gradient-to-r from-blue-600 to-purple-600`
- Custom gradient: `bg-gradient-to-r from-[#your-color] to-[#your-color]`

---

## 🎨 Quick Color Change Examples

### Change to Dark Mode Theme

1. **Update `tailwind.config.js`**:
```javascript
primary: {
  600: '#3b82f6', // Blue
  700: '#2563eb',
}
```

2. **Update `app/globals.css`**:
```css
body {
  background: #1f2937; /* Dark gray */
  color: #f9fafb; /* Light text */
}
```

3. **Update components** to use dark backgrounds:
- Cards: `bg-gray-800` instead of `bg-white`
- Text: `text-gray-100` instead of `text-gray-900`

### Change to Warm/Orange Theme

1. **Update `tailwind.config.js`**:
```javascript
primary: {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c', // Main orange
  700: '#c2410c', // Darker orange
  800: '#9a3412',
  900: '#7c2d12',
}
```

---

## 🎨 Component-Specific Color Changes

### Navbar (`components/Navbar.tsx`)
- Background: Line 17 - `bg-gradient-to-r from-primary-600 to-primary-700`
- Text: `text-white`
- Buttons: `bg-white text-primary-600`

### Room Cards (`components/RoomCard.tsx`)
- Card background: Line 73 - `bg-white`
- Price color: Line 186 - `text-primary-600`
- Badges: `bg-primary-100 text-primary-700`

### Search Filters (`components/SearchFilters.tsx`)
- Background: `bg-white`
- Input borders: `border-gray-300`
- Focus ring: `focus:ring-primary-500`

### Buttons
- Primary: `bg-primary-600 hover:bg-primary-700`
- Secondary: `bg-gray-100 hover:bg-gray-200`

---

## 🎨 Using Custom Colors

### Method 1: Add to Tailwind Config

In `tailwind.config.js`, add custom colors:

```javascript
colors: {
  primary: { /* ... */ },
  custom: {
    light: '#your-color',
    dark: '#your-color',
  }
}
```

Then use: `bg-custom-light`, `text-custom-dark`

### Method 2: Use Arbitrary Values

In any component, use:
```tsx
className="bg-[#ff6b6b] text-[#333333]"
```

---

## 🎨 Color Resources

### Color Palette Generators
- [Coolors.co](https://coolors.co) - Generate color palettes
- [Tailwind Color Generator](https://uicolors.app/create) - Generate Tailwind color scales
- [Adobe Color](https://color.adobe.com) - Color wheel and palettes

### Popular Color Schemes
- **Blue**: Professional, trustworthy
- **Green**: Nature, growth, success
- **Purple**: Creative, luxury
- **Orange**: Energy, warmth
- **Red**: Urgency, passion
- **Teal**: Modern, fresh

---

## 🎨 Step-by-Step: Change Entire Theme

1. **Choose your color** (e.g., Purple #9333ea)

2. **Generate color scale** using [uicolors.app](https://uicolors.app/create)

3. **Update `tailwind.config.js`** with new primary colors

4. **Update navbar gradient** in `components/Navbar.tsx`:
   ```tsx
   from-primary-600 to-primary-700
   ```

5. **Test the changes** - All components using `primary-*` will update automatically!

---

## 🎨 Tips

- **Consistency**: Use the same color scale throughout (50-900)
- **Contrast**: Ensure text is readable on backgrounds
- **Accessibility**: Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Test**: Check on both light and dark backgrounds
- **Gradients**: Use `from-` and `to-` classes for smooth gradients

---

## 🎨 Quick Reference: Common Color Classes

| Purpose | Class | Example |
|---------|-------|---------|
| Primary background | `bg-primary-600` | Buttons, navbar |
| Primary text | `text-primary-600` | Links, prices |
| Light background | `bg-gray-50` | Page background |
| White background | `bg-white` | Cards |
| Dark text | `text-gray-900` | Headings |
| Light text | `text-gray-600` | Body text |
| Border | `border-gray-300` | Inputs |
| Hover | `hover:bg-primary-700` | Buttons |

---

Need help with a specific color scheme? Just ask! 🎨

