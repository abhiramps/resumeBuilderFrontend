# Quick Start Tutorial

Interactive onboarding tutorial for new users of the Resume Builder application.

## Features

### Step-by-Step Walkthrough
- **6 guided steps** covering the main features:
  1. Welcome message
  2. Choose a template
  3. Fill personal information
  4. Add work experience
  5. Customize layout
  6. Export PDF

### Interactive Overlays
- **Spotlight effect** highlighting relevant UI elements
- **Animated borders** drawing attention to target elements
- **Smart positioning** (top, bottom, left, right, center)
- **Auto-scrolling** to bring elements into view

### Progress Tracking
- **Visual progress bar** showing completion percentage
- **Step indicators** with clickable navigation
- **Persistent storage** remembering completion status

### User Controls
- **Skip for now** - Dismiss tutorial temporarily
- **Don't show again** - Permanently disable tutorial
- **Previous/Next** navigation between steps
- **Direct step access** via indicator dots
- **Replay option** available in Profile settings

## Usage

### Basic Integration

```tsx
import { QuickStartTutorial } from '../components/Tutorial';

function EditorPage() {
  return (
    <div>
      <QuickStartTutorial />
      {/* Your page content */}
    </div>
  );
}
```

### With Callbacks

```tsx
<QuickStartTutorial
  onComplete={() => console.log('Tutorial completed')}
  onSkip={() => console.log('Tutorial skipped')}
  forceShow={false}
/>
```

### Replay Tutorial

```tsx
import { useReplayTutorial } from '../components/Tutorial';

function SettingsPage() {
  const { replayTutorial } = useReplayTutorial();
  
  return (
    <button onClick={replayTutorial}>
      Replay Tutorial
    </button>
  );
}
```

## Adding Tutorial Targets

To make UI elements targetable by the tutorial, add the `data-tutorial` attribute:

```tsx
<button data-tutorial="template-selector">
  Choose Template
</button>

<div data-tutorial="personal-info">
  <PersonalInfoEditor />
</div>

<button data-tutorial="work-experience">
  Add Experience
</button>

<button data-tutorial="layout-controls">
  <Settings />
</button>

<button data-tutorial="export-button">
  Export PDF
</button>
```

## Tutorial Steps Configuration

Steps are configured in `QuickStartTutorial.tsx`:

```typescript
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Step Title',
    description: 'Step description text',
    targetSelector: '[data-tutorial="element-id"]',
    position: 'right', // 'top' | 'bottom' | 'left' | 'right' | 'center'
    action: 'Optional action hint for user',
  },
  // ... more steps
];
```

## Local Storage Keys

The tutorial uses localStorage to track completion:

- `resumeBuilder_tutorialCompleted` - Set to 'true' when completed with "don't show again"
- `resumeBuilder_tutorialSkipped` - Set to 'true' when skipped with "don't show again"

## Styling

The tutorial uses Tailwind CSS classes and includes:

- **Overlay**: Semi-transparent backdrop with blur effect
- **Spotlight**: Animated border highlighting target elements
- **Tooltip**: White card with shadow, positioned relative to target
- **Progress bar**: Blue gradient showing completion
- **Animations**: Smooth transitions and pulse effects

## Accessibility

- **Keyboard navigation**: Arrow keys and Enter/Escape support
- **ARIA labels**: Proper labeling for screen readers
- **Focus management**: Automatic focus on interactive elements
- **High contrast**: Clear visual indicators

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses CSS Grid and Flexbox
- Backdrop blur effect (graceful degradation)

## Performance

- **Lazy loading**: Tutorial only loads when needed
- **Debounced positioning**: Efficient element tracking
- **Minimal re-renders**: Optimized with useCallback and useMemo
- **Small bundle size**: ~8KB gzipped

## Customization

### Changing Tutorial Steps

Edit the `TUTORIAL_STEPS` array in `QuickStartTutorial.tsx`:

```typescript
const TUTORIAL_STEPS: TutorialStep[] = [
  // Add, remove, or modify steps
];
```

### Styling Customization

Override Tailwind classes or add custom CSS:

```tsx
<QuickStartTutorial className="custom-tutorial" />
```

### Storage Keys

Change the localStorage keys at the top of the file:

```typescript
const TUTORIAL_STORAGE_KEY = 'your_app_tutorialCompleted';
const TUTORIAL_SKIP_KEY = 'your_app_tutorialSkipped';
```

## Testing

### Manual Testing Checklist

- [ ] Tutorial appears on first visit
- [ ] All steps display correctly
- [ ] Target elements are highlighted
- [ ] Navigation buttons work
- [ ] Progress bar updates
- [ ] Skip functionality works
- [ ] "Don't show again" persists
- [ ] Replay tutorial works
- [ ] Mobile responsive
- [ ] Keyboard navigation

### Reset Tutorial

To test the tutorial again, clear localStorage:

```javascript
localStorage.removeItem('resumeBuilder_tutorialCompleted');
localStorage.removeItem('resumeBuilder_tutorialSkipped');
```

Or use the replay function:

```typescript
const { replayTutorial } = useReplayTutorial();
replayTutorial(); // Clears storage and reloads page
```

## Troubleshooting

### Tutorial doesn't appear
- Check localStorage for completion flags
- Verify `forceShow` prop is not set to false
- Ensure component is mounted in the page

### Target elements not highlighted
- Verify `data-tutorial` attributes are present
- Check that elements are rendered when tutorial runs
- Ensure selectors match in `TUTORIAL_STEPS`

### Positioning issues
- Adjust `position` property in step configuration
- Check for CSS conflicts with z-index
- Verify viewport has enough space

## Future Enhancements

Potential improvements for future versions:

- [ ] Video tutorials embedded in steps
- [ ] Interactive practice mode
- [ ] Progress analytics tracking
- [ ] Multi-language support
- [ ] Contextual help tooltips
- [ ] Advanced user segmentation
- [ ] A/B testing capabilities
- [ ] Custom themes support

## License

Part of the Resume Builder application.
