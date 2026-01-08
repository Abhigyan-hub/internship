# 🔘 Button & Link Modification Guide

This guide shows you how to change button functions and hrefs (links) throughout the application.

## 📍 Common Button Locations

### 1. **Navbar Buttons** (`components/Navbar.tsx`)

#### Sign In / Get Started Button
```tsx
<Link
  href="/auth"  // ← Change this to your desired route
  className="..."
>
  Get Started
</Link>
```

**To change:**
- Change `href="/auth"` to any route like `href="/login"`, `href="/signup"`, etc.
- Or change to external link: `href="https://example.com"`

#### Add Room Button (for owners)
```tsx
<Link
  href="/add-room"  // ← Change this
  className="..."
>
  ➕ Add Room
</Link>
```

#### My Rooms Button
```tsx
<Link
  href="/my-rooms"  // ← Change this
  className="..."
>
  My Rooms
</Link>
```

#### Sign Out Button
```tsx
<button
  onClick={handleSignOut}  // ← Change this function
  className="..."
>
  Sign Out
</button>
```

**To change the sign out function:**
```tsx
const handleSignOut = async () => {
  // Add your custom logic here
  await signOut()
  router.push('/')  // ← Change redirect destination
  // Or add: router.push('/goodbye')
}
```

---

### 2. **Home Page Buttons** (`app/page.tsx`)

#### "Start Searching" Button
```tsx
<button
  onClick={() => document.getElementById('search-filters')?.scrollIntoView({ behavior: 'smooth' })}
  // ↑ This scrolls to search filters
  className="..."
>
  Start Searching
</button>
```

**To change:**
- **Navigate to a page:**
```tsx
<button
  onClick={() => router.push('/search')}
  className="..."
>
  Start Searching
</button>
```

- **Open a modal:**
```tsx
<button
  onClick={() => setShowModal(true)}
  className="..."
>
  Start Searching
</button>
```

- **Execute custom function:**
```tsx
const handleSearch = () => {
  // Your custom logic
  console.log('Search clicked')
  router.push('/search')
}

<button
  onClick={handleSearch}
  className="..."
>
  Start Searching
</button>
```

#### "List Your Room" Button
```tsx
<Link
  href="/auth"  // ← Change this
  className="..."
>
  List Your Room
</Link>
```

**To change:**
- Direct to add room page: `href="/add-room"`
- Direct to signup: `href="/auth?mode=signup"`
- External link: `href="https://example.com"`

---

### 3. **Room Card Buttons** (`components/RoomCard.tsx`)

#### Contact Button (Phone Link)
```tsx
<a
  href={`tel:${room.contact_number}`}  // ← Phone link
  className="..."
>
  {room.contact_number}
</a>
```

**To change:**
- **Email instead:**
```tsx
<a
  href={`mailto:${room.contact_number}@example.com`}
  className="..."
>
  Contact
</a>
```

- **WhatsApp:**
```tsx
<a
  href={`https://wa.me/${room.contact_number.replace(/\D/g, '')}`}
  className="..."
>
  WhatsApp
</a>
```

- **Custom function:**
```tsx
<button
  onClick={() => {
    // Your custom logic
    alert('Contact clicked')
    window.open(`tel:${room.contact_number}`)
  }}
  className="..."
>
  Contact
</button>
```

---

### 4. **Add Room Form Button** (`app/add-room/page.tsx`)

#### Submit Button
```tsx
<button
  type="submit"
  onClick={handleSubmit}  // ← Form submission handler
  className="..."
>
  Add Room
</button>
```

**To change the submit function:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Add your custom logic before submission
  console.log('Form submitted')
  
  // Or redirect before submitting
  // router.push('/preview')
  
  // Your existing submission code...
}
```

---

### 5. **My Rooms Page Buttons** (`app/my-rooms/page.tsx`)

#### Edit Button
```tsx
<button
  onClick={() => handleEdit(room)}  // ← Edit function
  className="..."
>
  Edit
</button>
```

**To change:**
```tsx
const handleEdit = (room: Room) => {
  // Add custom logic
  console.log('Editing room:', room.id)
  
  // Or redirect to edit page
  // router.push(`/edit-room/${room.id}`)
  
  setEditingRoom(room)
  setShowEditForm(true)
}
```

#### Delete Button
```tsx
<button
  onClick={() => handleDelete(room.id)}  // ← Delete function
  className="..."
>
  Delete
</button>
```

**To change:**
```tsx
const handleDelete = async (roomId: string) => {
  // Add confirmation or custom logic
  const confirmed = window.confirm('Are you sure?')
  if (!confirmed) return
  
  // Your delete logic...
}
```

---

## 🔧 Common Modifications

### Change Button to Link

**Before (Button):**
```tsx
<button onClick={() => router.push('/page')}>
  Click Me
</button>
```

**After (Link):**
```tsx
<Link href="/page">
  Click Me
</Link>
```

### Change Link to Button

**Before (Link):**
```tsx
<Link href="/page">
  Click Me
</Link>
```

**After (Button):**
```tsx
<button onClick={() => router.push('/page')}>
  Click Me
</button>
```

### Add Custom Function to Button

```tsx
const handleCustomAction = () => {
  // Your custom logic
  console.log('Button clicked')
  
  // Navigate
  router.push('/destination')
  
  // Or show modal
  setShowModal(true)
  
  // Or call API
  fetch('/api/endpoint')
}

<button onClick={handleCustomAction}>
  Custom Action
</button>
```

### Add Query Parameters to Links

```tsx
<Link href="/auth?mode=signup&redirect=/dashboard">
  Sign Up
</Link>
```

### External Links

```tsx
<Link 
  href="https://example.com"
  target="_blank"  // Opens in new tab
  rel="noopener noreferrer"  // Security
>
  External Link
</Link>
```

---

## 📝 Quick Reference

| Action | Code |
|--------|------|
| Navigate to page | `router.push('/page')` |
| External link | `href="https://example.com"` |
| Phone link | `href="tel:+1234567890"` |
| Email link | `href="mailto:email@example.com"` |
| WhatsApp | `href="https://wa.me/1234567890"` |
| Scroll to element | `document.getElementById('id')?.scrollIntoView()` |
| Open modal | `setShowModal(true)` |
| Call function | `onClick={handleFunction}` |

---

## 🎯 Examples

### Example 1: Change "Get Started" to go to Signup Page

**File:** `components/Navbar.tsx`

```tsx
<Link
  href="/signup"  // Changed from "/auth"
  className="..."
>
  Get Started
</Link>
```

### Example 2: Add Confirmation to Delete Button

**File:** `app/my-rooms/page.tsx`

```tsx
const handleDelete = async (roomId: string) => {
  // Custom confirmation
  const confirmed = window.confirm(
    'Are you sure you want to delete this room? This action cannot be undone.'
  )
  
  if (!confirmed) return
  
  // Existing delete logic...
  const { error } = await supabase.from('rooms').delete().eq('id', roomId)
  // ...
}
```

### Example 3: Change Hero Button to Open Search Modal

**File:** `app/page.tsx`

```tsx
const [showSearchModal, setShowSearchModal] = useState(false)

// In JSX:
<button
  onClick={() => setShowSearchModal(true)}
  className="..."
>
  Start Searching
</button>
```

---

## 💡 Tips

1. **Always import required hooks:**
   ```tsx
   import { useRouter } from 'next/navigation'
   const router = useRouter()
   ```

2. **For external links, use target="_blank":**
   ```tsx
   <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
   ```

3. **For buttons that submit forms, use type="submit":**
   ```tsx
   <button type="submit" onClick={handleSubmit}>
   ```

4. **For navigation buttons, use Link component:**
   ```tsx
   <Link href="/page">Navigate</Link>
   ```

Need help with a specific button? Just ask! 🚀

