# Testing Guide - Phase 2 Implementation

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend server running on port 3001
- Frontend dev server on port 3000

### 1. Start Backend (Terminal 1)
```bash
cd resumeBuilderBackend
npm run dev
```

Expected output:
```
Server running on http://localhost:3001
```

### 2. Start Frontend (Terminal 2)
```bash
cd resumeBuilderFrontend
npm run dev
```

Expected output:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

## Testing Checklist

### Authentication Flow

#### Signup
1. Navigate to `http://localhost:3000`
2. Click "create a new account"
3. Fill in:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Check "I agree to the Terms"
5. Click "Create account"
6. ✅ Should redirect to `/dashboard`

#### Login
1. Click "Sign out" from dashboard
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Sign in"
4. ✅ Should redirect to `/dashboard`

#### Forgot Password
1. From login page, click "Forgot your password?"
2. Enter email: "test@example.com"
3. Click "Send reset link"
4. ✅ Should show success message

### Dashboard Features

#### Create Resume
1. Click "New Resume" button
2. ✅ Should create a new resume
3. ✅ Should redirect to editor (when implemented)

#### Search Resumes
1. Type in search box
2. ✅ Results should filter in real-time

#### View Toggle
1. Click "Grid" button
2. ✅ Should show grid layout
3. Click "List" button
4. ✅ Should show list layout

#### Resume Actions
1. Click three-dot menu on a resume
2. Test each action:
   - Share: ✅ Should navigate to share page (when implemented)
   - Duplicate: ✅ Should create a copy
   - Delete: ✅ Should show confirmation and delete

### Profile Page
1. Click "Profile" from dashboard
2. Click "Edit Profile"
3. Update name
4. Click "Save Changes"
5. ✅ Should save (when backend implemented)

### Protected Routes
1. Sign out
2. Try to access `http://localhost:3000/dashboard`
3. ✅ Should redirect to `/login`

### Public Routes
1. Sign in
2. Try to access `http://localhost:3000/login`
3. ✅ Should redirect to `/dashboard`

## Expected Behavior

### Loading States
- Spinner shows during authentication check
- "Signing in..." / "Creating account..." during submission
- "Loading resumes..." on dashboard

### Error Handling
- Invalid email format shows error
- Password mismatch shows error
- API errors display in red banner
- Network errors handled gracefully

### Responsive Design
- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: 3-column grid
- All buttons touch-friendly (44x44px minimum)

## Common Issues

### Backend Not Running
**Symptom**: Network errors, "Failed to fetch"
**Solution**: Start backend server on port 3001

### Port Already in Use
**Symptom**: "Port 3000 is already in use"
**Solution**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### CORS Errors
**Symptom**: "CORS policy" errors in console
**Solution**: Check backend CORS configuration allows `http://localhost:3000`

### Authentication Not Persisting
**Symptom**: Logged out after refresh
**Solution**: Check localStorage has `access_token`

## API Endpoints Being Called

### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Login
- `POST /auth/signout` - Logout
- `GET /auth/session` - Get current session

### Resumes
- `GET /resumes` - List resumes
- `POST /resumes` - Create resume
- `GET /resumes/:id` - Get resume
- `PUT /resumes/:id` - Update resume
- `DELETE /resumes/:id` - Delete resume
- `POST /resumes/:id/duplicate` - Duplicate resume

### User
- `GET /user/profile` - Get profile
- `PUT /user/profile` - Update profile

## Browser DevTools

### Check Authentication
```javascript
// In browser console
localStorage.getItem('access_token')
localStorage.getItem('user')
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Watch API calls

### Check React State
1. Install React DevTools extension
2. Inspect AuthContext state
3. Inspect ResumeBackendContext state

## Performance Metrics

### Expected Load Times
- Initial page load: < 2s
- Authentication: < 1s
- Dashboard load: < 1s
- Resume creation: < 500ms

### Auto-save Behavior
- Debounce delay: 2 seconds
- Shows "Saving..." indicator
- Shows "Saved" when complete

## Next Steps

After verifying Phase 2:
1. Proceed to Phase 3: Resume Editor Integration
2. Connect existing editor components
3. Add sharing functionality
4. Implement version management

---

**Need Help?**
- Check browser console for errors
- Check backend logs
- Verify environment variables in `.env`
- Ensure database is accessible
