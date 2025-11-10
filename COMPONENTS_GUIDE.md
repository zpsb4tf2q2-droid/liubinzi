# UI Components Guide

This guide provides examples and best practices for using the shared UI components in this application.

## Button Component

The `Button` component provides consistent button styling with multiple variants and sizes.

### Props

- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `fullWidth`: `boolean` (default: `false`)
- All standard HTML button attributes

### Examples

```tsx
import { Button } from '@/components/ui'

// Primary button (default)
<Button>Click me</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Danger button
<Button variant="danger">Delete</Button>

// Ghost button (minimal styling)
<Button variant="ghost">View Details</Button>

// Small button
<Button size="sm">Small</Button>

// Large button
<Button size="lg">Large</Button>

// Full width button
<Button fullWidth>Full Width</Button>

// Disabled button
<Button disabled>Disabled</Button>

// With loading state
<Button disabled aria-busy="true">
  Loading...
</Button>
```

## Input Component

The `Input` component provides form inputs with built-in label, error, and helper text support.

### Props

- `label`: `string` (optional)
- `error`: `string` (optional)
- `helperText`: `string` (optional)
- All standard HTML input attributes

### Examples

```tsx
import { Input } from '@/components/ui'

// Basic input with label
<Input label="Email" type="email" />

// Required input
<Input label="Password" type="password" required />

// Input with helper text
<Input 
  label="Username" 
  helperText="Choose a unique username" 
/>

// Input with error
<Input 
  label="Email" 
  type="email"
  error="Please enter a valid email address" 
/>

// Input with placeholder
<Input 
  label="Full Name" 
  placeholder="John Doe"
  autoComplete="name"
/>
```

## Card Components

Card components provide consistent container styling for grouping related content.

### Available Components

- `Card`: The main card container
- `CardHeader`: Card header section
- `CardBody`: Card body section
- `CardFooter`: Card footer section

### Props

#### Card
- `hover`: `boolean` (default: `false`) - Adds hover effect
- All standard HTML div attributes

#### CardHeader, CardBody, CardFooter
- All standard HTML div attributes

### Examples

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui'

// Simple card
<Card>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
</Card>

// Card with header
<Card>
  <CardHeader>
    <h2 className="text-lg font-semibold">Card Title</h2>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
</Card>

// Full card with all sections
<Card>
  <CardHeader>
    <h2 className="text-lg font-semibold">User Profile</h2>
  </CardHeader>
  <CardBody>
    <p>User details and information</p>
  </CardBody>
  <CardFooter>
    <Button size="sm">Edit Profile</Button>
  </CardFooter>
</Card>

// Card with hover effect
<Card hover>
  <CardBody>
    <p>This card has a hover effect</p>
  </CardBody>
</Card>
```

## Modal Component

The `Modal` component provides an accessible modal dialog with keyboard support.

### Props

- `isOpen`: `boolean` (required) - Controls modal visibility
- `onClose`: `() => void` (required) - Callback when modal should close
- `title`: `string` (optional) - Modal title
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `children`: `ReactNode` (required) - Modal content

### Features

- Click outside to close
- Press Escape to close
- Prevents body scroll when open
- Accessible with proper ARIA attributes
- Keyboard navigable

### Examples

```tsx
import { useState } from 'react'
import { Modal, Button } from '@/components/ui'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
      >
        <p className="mb-4">Are you sure you want to proceed?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            // Handle confirmation
            setIsOpen(false)
          }}>
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  )
}
```

## Toast Notifications

The toast system provides temporary notifications for user feedback.

### Setup

Wrap your app with `ToastProvider` in the root layout (already done in this project).

### Usage

```tsx
'use client'

import { useToast } from '@/components/ui'

function MyComponent() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast('success', 'Action completed successfully!')
  }

  const handleError = () => {
    showToast('error', 'Something went wrong. Please try again.')
  }

  const handleInfo = () => {
    showToast('info', 'This is an informational message.')
  }

  const handleWarning = () => {
    showToast('warning', 'Please review your input.')
  }

  // With custom duration (default is 5000ms)
  const handleCustomDuration = () => {
    showToast('success', 'This toast will disappear in 3 seconds', 3000)
  }

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
      <Button onClick={handleInfo}>Show Info</Button>
      <Button onClick={handleWarning}>Show Warning</Button>
    </div>
  )
}
```

### Toast Types

- `success`: Green toast for successful operations
- `error`: Red toast for errors
- `info`: Blue toast for informational messages
- `warning`: Yellow toast for warnings

## Theme System

The application includes a built-in theme system with dark mode support.

### Using Theme

```tsx
'use client'

import { useTheme } from '@/components/ThemeProvider'

function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

### Dark Mode Classes

Use Tailwind's `dark:` prefix to style elements for dark mode:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <h1 className="text-blue-600 dark:text-blue-400">
    This adapts to theme
  </h1>
</div>
```

## Best Practices

### Accessibility

1. **Always provide labels for inputs**
   ```tsx
   <Input label="Email" type="email" />
   ```

2. **Use semantic HTML**
   ```tsx
   <Button type="submit">Submit Form</Button>
   <Button type="button">Cancel</Button>
   ```

3. **Provide ARIA labels when needed**
   ```tsx
   <Button aria-label="Close dialog">
     <XIcon />
   </Button>
   ```

4. **Use proper heading hierarchy**
   ```tsx
   <CardHeader>
     <h2>Section Title</h2>
   </CardHeader>
   ```

### Forms

1. **Use Input component for consistent styling**
   ```tsx
   <form>
     <Input label="Email" type="email" required />
     <Input label="Password" type="password" required />
     <Button type="submit" fullWidth>Sign In</Button>
   </form>
   ```

2. **Show validation errors**
   ```tsx
   <Input 
     label="Email" 
     type="email"
     error={errors.email}
   />
   ```

3. **Provide helper text**
   ```tsx
   <Input 
     label="Password" 
     type="password"
     helperText="Must be at least 8 characters"
   />
   ```

### Notifications

1. **Use appropriate toast types**
   - Success: For completed actions
   - Error: For failures that need user attention
   - Info: For general information
   - Warning: For actions that need caution

2. **Keep messages concise**
   ```tsx
   showToast('success', 'Profile updated')
   showToast('error', 'Failed to save changes')
   ```

### Layout

1. **Use Cards for content grouping**
   ```tsx
   <Card>
     <CardHeader>
       <h2>Statistics</h2>
     </CardHeader>
     <CardBody>
       <StatsList />
     </CardBody>
   </Card>
   ```

2. **Use appropriate button variants**
   - Primary: Main call-to-action
   - Secondary: Alternative actions
   - Danger: Destructive actions
   - Ghost: Minimal emphasis actions

## Responsive Design

All components are responsive by default. Use Tailwind's responsive prefixes:

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

<Button size="sm" className="sm:size-md lg:size-lg">
  Responsive Button
</Button>
```

## Component Composition

Combine components for complex UIs:

```tsx
<Card hover>
  <CardBody>
    <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
    <Input label="Email" type="email" />
    <Input label="Password" type="password" />
    <Button fullWidth>Create Account</Button>
  </CardBody>
</Card>
```
