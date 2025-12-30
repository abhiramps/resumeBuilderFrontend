# Tutorial - Show Only for New Resumes

## Implementation Summary

The tutorial has been updated to show only for newly created resumes on their first visit, preventing it from appearing every time a user opens an existing resume.

## How It Works

### 1. **Resume Age Detection**
When a resume is loaded, the system checks if it was created within the last 30 seconds:

```typescript
const createdAt = new Date(currentResume.createdAt);
const now = new Date();
const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
setIsNewResume(diffInSeconds < 30);
```

### 2. **Per-Resume Tracking**
The tutorial tracks which resumes have already shown the tutorial using localStorage:

```typescript
// Storage key for tracking shown resumes
const TUTORIAL_SHOWN_RESUMES_KEY = 'resumeBuilder_tutorialShownResumes';

// Check if tutorial was shown for this specific resume
const wasTutorialShownForResume = (id: string): boolean => {
    const shownResumes = localStorage.getItem(TUTORIAL_SHOWN_RESUMES_KEY);
    if (!shownResumes) return false;
    const resumeIds = JSON.parse(shownResumes) as string[];
    return resumeIds.includes(id);
};

// Mark tutorial as shown for this resume
const markTutorialShownForResume = (id: string) => {
    const shownResumes = localStorage.getItem(TUTORIAL_SHOWN_RESUMES_KEY);
    const resumeIds = shownResumes ? JSON.parse(shownResumes) : [];
    if (!resumeIds.includes(id)) {
        resumeIds.push(id);
        localStorage.setItem(TUTORIAL_SHOWN_RESUMES_KEY, JSON.stringify(resumeIds));
    }
};
```

### 3. **Display Logic**
The tutorial will show if ALL of these conditions are met:

1. ✅ User hasn't globally disabled the tutorial
2. ✅ Resume is newly created (< 30 seconds old)
3. ✅ Tutorial hasn't been shown for this specific resume before
4. ✅ Resume ID is available

```typescript
useEffect(() => {
    const hasCompletedGlobally = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
    const hasSkippedGlobally = localStorage.getItem(TUTORIAL_SKIP_KEY) === 'true';
    
    // Don't show if user has globally disabled it
    if (hasCompletedGlobally || hasSkippedGlobally) {
        return;
    }

    // Show if forced (for replay functionality)
    if (forceShow) {
        setTimeout(() => setIsVisible(true), 500);
        return;
    }

    // Show only for new resumes that haven't seen the tutorial yet
    if (isNewResume && resumeId && !wasTutorialShownForResume(resumeId)) {
        setTimeout(() => {
            setIsVisible(true);
            markTutorialShownForResume(resumeId);
        }, 500);
    }
}, [forceShow, resumeId, isNewResume, wasTutorialShownForResume, markTutorialShownForResume]);
```

## Component Props

### QuickStartTutorial Props

```typescript
interface QuickStartTutorialProps {
    /** Callback when tutorial is completed */
    onComplete?: () => void;
    /** Callback when tutorial is skipped */
    onSkip?: () => void;
    /** Force show tutorial even if completed */
    forceShow?: boolean;
    /** Resume ID to track if tutorial was shown for this resume */
    resumeId?: string;
    /** Whether this is a newly created resume */
    isNewResume?: boolean;
}
```

### Usage in EditorPage

```typescript
<QuickStartTutorial 
    resumeId={id}
    isNewResume={isNewResume}
/>
```

## LocalStorage Keys

The tutorial uses three localStorage keys:

1. **`resumeBuilder_tutorialCompleted`** - Global completion flag (when user checks "don't show again")
2. **`resumeBuilder_tutorialSkipped`** - Global skip flag (when user skips with "don't show again")
3. **`resumeBuilder_tutorialShownResumes`** - Array of resume IDs that have shown the tutorial

Example localStorage data:
```json
{
  "resumeBuilder_tutorialShownResumes": [
    "bb9c3150-80d4-4fda-9a66-9c14cfdc7619",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  ]
}
```

## User Scenarios

### Scenario 1: New User Creates First Resume
1. User creates a new resume
2. Resume is < 30 seconds old ✅
3. Tutorial hasn't been shown for this resume ✅
4. **Result:** Tutorial shows

### Scenario 2: User Opens Existing Resume
1. User opens a resume created 2 days ago
2. Resume is > 30 seconds old ❌
3. **Result:** Tutorial doesn't show

### Scenario 3: User Creates Second Resume
1. User creates another new resume
2. Resume is < 30 seconds old ✅
3. Tutorial hasn't been shown for this specific resume ✅
4. User hasn't globally disabled tutorial ✅
5. **Result:** Tutorial shows again (for this new resume)

### Scenario 4: User Globally Disables Tutorial
1. User checks "Don't show this tutorial again"
2. Global flag is set ✅
3. **Result:** Tutorial never shows again (even for new resumes)

### Scenario 5: User Replays Tutorial
1. User clicks "Replay Tutorial" in Profile settings
2. `forceShow` prop is set to true ✅
3. **Result:** Tutorial shows regardless of other conditions

## Benefits

### ✅ Better User Experience
- Tutorial only appears when relevant (new resumes)
- Doesn't annoy users by showing repeatedly
- Still available via replay option

### ✅ Smart Tracking
- Per-resume tracking prevents duplicate shows
- Global disable option for users who don't want it
- Respects user preferences

### ✅ Flexible Control
- 30-second window catches newly created resumes
- Force show option for replay functionality
- Easy to adjust timing threshold

## Configuration

### Adjusting the "New Resume" Time Window

To change how long a resume is considered "new", modify this line in `EditorPage.tsx`:

```typescript
// Current: 30 seconds
setIsNewResume(diffInSeconds < 30);

// Example: 60 seconds
setIsNewResume(diffInSeconds < 60);

// Example: 5 minutes
setIsNewResume(diffInSeconds < 300);
```

### Clearing Tutorial History

To reset tutorial tracking for testing:

```javascript
// Clear all tutorial data
localStorage.removeItem('resumeBuilder_tutorialCompleted');
localStorage.removeItem('resumeBuilder_tutorialSkipped');
localStorage.removeItem('resumeBuilder_tutorialShownResumes');
```

Or use the replay function:
```typescript
const { replayTutorial } = useReplayTutorial();
replayTutorial(); // Clears all flags and reloads
```

## Testing Checklist

- [x] Tutorial shows for newly created resumes (< 30 seconds)
- [x] Tutorial doesn't show for existing resumes (> 30 seconds)
- [x] Tutorial doesn't show twice for the same resume
- [x] Tutorial respects global "don't show again" setting
- [x] Tutorial can be replayed from Profile settings
- [x] Tutorial tracking persists across sessions
- [x] Build successful with no errors

## Files Modified

1. **`src/components/Tutorial/QuickStartTutorial.tsx`**
   - Added `resumeId` and `isNewResume` props
   - Implemented per-resume tracking logic
   - Added localStorage management functions

2. **`src/pages/EditorPage.tsx`**
   - Added `isNewResume` state
   - Implemented resume age detection
   - Passed props to QuickStartTutorial component

## Future Enhancements

Potential improvements:

1. **Backend tracking** - Store tutorial completion in database
2. **Analytics** - Track tutorial completion rates
3. **Customizable timing** - Let users set their own preferences
4. **Tutorial variants** - Different tutorials for different user types
5. **Progress persistence** - Resume tutorial from where user left off

## Summary

The tutorial now intelligently shows only for newly created resumes on their first visit, providing a better user experience while still being accessible via the replay option. The implementation uses a combination of resume age detection and per-resume tracking to ensure users see the tutorial when it's most helpful without being repetitive.
