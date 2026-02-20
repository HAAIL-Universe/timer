# Timer – UI/UX Contract

## 1. App Shell & Layout

### Structure
- **Single-page application** with no navigation required
- **Centered layout**: Timer interface positioned in the center of the viewport
- **Responsive container**: Max-width 600px on desktop, full-width with padding on mobile
- **Minimal chrome**: No header, footer, or sidebar; focus entirely on timer functionality
- **Semantic HTML**: Main content wrapped in `<main>` landmark for accessibility

### Layout Hierarchy
```
<body>
  <main class="app-container">
    <div class="timer-card">
      [Timer Display Component]
      [Timer Controls Component]
    </div>
  </main>
</body>
```

### Viewport & Scaling
- Meta viewport tag: `width=device-width, initial-scale=1`
- Fluid typography and spacing using relative units (rem, em)
- Touch-friendly control sizes (minimum 44×44px tap targets)

## 2. Screens/Views

### Primary View: Timer Interface

**Purpose**: Display timer state and provide start/stop control

**Layout Elements**:
- **Timer Display** (top section)
  - Elapsed time shown in large, readable format: `HH:MM:SS` or `MM:SS` (switch to HH:MM:SS when elapsed ≥ 1 hour)
  - Centered horizontally within card
  - Minimum contrast ratio 7:1 for accessibility
  - Status indicator: subtle visual cue showing "Stopped" or "Running" state

- **Control Button** (bottom section)
  - Single toggle button: "Start" when stopped, "Stop" when running
  - Large, prominent button centered below timer display
  - Visual feedback on hover/active states
  - Disabled state during API calls to prevent double-submission

**Key Interactions**:
- Click/tap Start button → timer begins, button changes to "Stop", display updates every second
- Click/tap Stop button → timer halts, display shows final elapsed time, button changes to "Start"
- On load → fetch current timer state via GET /timers/:id, initialize display and button state

**Error States**:
- API failure: Display inline error message below button ("Unable to connect. Please refresh.")
- Loading state: Show subtle loading indicator on button during API call

**Empty State**:
- On first load (no timer exists): Display 00:00 with "Start" button ready
- Automatically create timer on first start action

## 3. Component List

### TimerDisplay
**Props**: `elapsedSeconds` (number), `isRunning` (boolean)
**Behavior**: 
- Formats elapsed seconds into HH:MM:SS or MM:SS
- Updates display every second when `isRunning` is true via client-side counter between API polls
- Visual pulse or subtle animation when running

### TimerButton
**Props**: `isRunning` (boolean), `onClick` (function), `disabled` (boolean)
**Behavior**:
- Renders "Start" or "Stop" text based on `isRunning`
- Applies appropriate styling for running/stopped states
- Disables interaction when `disabled` is true (during API call)
- Emits click event to parent component

### StatusIndicator
**Props**: `status` (string: "stopped" | "running")
**Behavior**:
- Small text or icon showing current timer status
- Color-coded: neutral (stopped), accent (running)
- Positioned above or beside timer display

### ErrorMessage
**Props**: `message` (string | null)
**Behavior**:
- Conditionally renders error message when present
- Dismissible or auto-hides after timeout
- Alert role for screen reader announcement

## 4. Visual Style

### Color Palette

**Primary Colors**:
- Background: `#FAFAFA` (light neutral)
- Surface (card): `#FFFFFF` (white)
- Primary Accent: `#2563EB` (blue) – for running state, active buttons
- Text Primary: `#1F2937` (near-black)
- Text Secondary: `#6B7280` (gray)

**State Colors**:
- Success/Running: `#10B981` (green)
- Error: `#EF4444` (red)
- Disabled: `#D1D5DB` (light gray)

**Shadows & Borders**:
- Card shadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
- Button shadow (hover): `0 2px 4px rgba(0, 0, 0, 0.15)`
- Border radius: 8px for card, 6px for button

### Typography

**Font Stack**: System fonts for performance and clarity
- Primary: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Monospace (timer display): `"SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace`

**Type Scale**:
- Timer Display: 72px / 4.5rem, bold, tabular-nums
- Button Text: 18px / 1.125rem, medium weight
- Status Text: 14px / 0.875rem, regular
- Error Text: 14px / 0.875rem, regular

**Spacing System** (4px base unit):
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Accessibility
- WCAG 2.1 AA compliance minimum
- Focus visible indicator on all interactive elements (2px outline, primary accent color)
- ARIA labels on button ("Start timer" / "Stop timer")
- Live region for timer display updates (aria-live="polite")

## 5. Key User Flows

### Flow 1: Start Timer from Fresh State

1. User lands on page
2. Timer display shows `00:00`
3. Status shows "Stopped"
4. Button reads "Start"
5. User clicks "Start"
6. Button shows loading indicator briefly
7. API call: `POST /timers` (create) then `POST /timers/:id/start`
8. Timer begins incrementing: `00:01`, `00:02`, `00:03`...
9. Button now reads "Stop"
10. Status shows "Running" with green indicator
11. Display updates every second client-side
12. Background API poll every 5-10 seconds to sync server state

### Flow 2: Stop Running Timer

1. Timer is running (e.g., display shows `03:47`)
2. Button reads "Stop"
3. User clicks "Stop"
4. Button shows loading indicator briefly
5. API call: `POST /timers/:id/stop`
6. Timer halts at current value (e.g., `03:47`)
7. Button changes to "Start"
8. Status shows "Stopped" with neutral indicator
9. Display remains at final elapsed time

### Flow 3: Restart Stopped Timer

1. Timer is stopped (e.g., display shows `05:23`)
2. Button reads "Start"
3. User clicks "Start"
4. Button shows loading indicator briefly
5. API call: `POST /timers/:id/start`
6. Timer continues from previous elapsed value: `05:24`, `05:25`, `05:26`...
7. Button changes to "Stop"
8. Status shows "Running"
9. Display updates continuously

**Note**: Timer accumulates elapsed time across multiple start/stop cycles. Each "start" continues from the last known elapsed value; each "stop" persists the current elapsed time to the backend.

## Implementation Notes

### State Management
- Use React hooks (useState, useEffect) or equivalent in chosen framework
- Local state: `timerId`, `elapsedSeconds`, `isRunning`, `error`, `isLoading`
- Timer ID persisted in localStorage for session continuity on refresh

### Polling Strategy
- When `isRunning` is true:
  - Increment display locally every 1000ms for smooth UX
  - Fetch server state via `GET /timers/:id` every 10 seconds to correct drift
  - On server response, reconcile client display with authoritative server elapsed time

### Error Handling
- Network errors: Retry once, then show error message
- Timer not found (404): Create new timer automatically
- 5xx errors: Display user-friendly message, provide manual retry option

### Performance
- No heavy animations; subtle transitions only (200-300ms ease)
- Lazy-load or defer non-critical resources
- Minimize JavaScript bundle size (target <50KB gzipped for MVP)

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support required
- Progressive enhancement: core functionality works without JavaScript (fallback to static 00:00 display)