# Admin Panel Documentation

## Overview
The Art U Esports admin system provides complete interfaces for managing both player and event data:
- **`admin.html`** - Player management
- **`events-admin.html`** - Events management

Both panels share the same navigation bar for easy switching between management views.

## Features

### ✅ Player Management
- **Add Players**: Create new player profiles with all relevant information
- **Edit Players**: Update existing player information
- **Delete Players**: Remove players (automatically deletes associated images)
- **Image Upload**: Upload player photos directly to Supabase Storage

### ✅ Automatic Image Management
- Images are automatically uploaded to Supabase Storage (`player-images` bucket)
- When a player is deleted, their image is also removed from storage
- When editing a player with a new image, the old image is replaced
- Supported formats: JPEG, JPG, PNG, WebP
- Maximum file size: 5MB

### ✅ Events Management
- **Add Events**: Create new events with complete details
- **Edit Events**: Update existing event information
- **Delete Events**: Remove events (automatically deletes associated images)
- **Image Upload**: Upload event banners directly to Supabase Storage
- **Event Filtering**: Filter events by type (esports/community) or date (upcoming/past)

### ✅ Event Features
- **Event Types**: Categorize as Esports or Community events
- **Date & Time**: Schedule events with specific dates and times
- **Location Tracking**: Store event venue information
- **Image Storage**: Event images stored in `event-images` bucket
- **Auto-Cleanup**: Old images removed when replaced or deleted

## Getting Started

### 1. Access the Admin Panels
Open either panel in your web browser:

**Players Admin:**
```
http://localhost:8000/admin.html
```

**Events Admin:**
```
http://localhost:8000/events-admin.html
```

Or serve it through a local web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server
```

**Navigation:** Use the navigation links at the top of each admin panel to switch between Players and Events management.

### 2. Authentication (Currently Disabled)
**For Development**: Authentication is currently disabled for easier development. The admin panel is accessible without login.

**For Production**: You'll need to enable authentication by:
1. Uncomment the authentication code in `admin.html` (see TODO comment in the `init()` function)
2. Set up Supabase Auth in your project
3. Create user accounts for administrators

## Using the Admin Panel

### Adding a New Player

1. Click the **"Add New Player"** button
2. Fill in the required fields:
   - **Name*** (required)
   - **Team*** (required) - Select from dropdown
3. Fill in optional fields:
   - Position
   - Major
   - Hometown
   - Quote
4. Upload a player image (optional but recommended)
5. Click **"Save Player"**

### Editing a Player

1. Find the player in the table
2. Click the **"Edit"** button in the Actions column
3. Update the desired fields
4. Optionally upload a new image (this will replace the old one)
5. Click **"Save Player"**

### Deleting a Player

1. Find the player in the table
2. Click the **"Delete"** button in the Actions column
3. Confirm the deletion in the popup
4. The player record and their image will be permanently deleted

## Managing Events

### Adding a New Event

1. Click the **"Add New Event"** button
2. Fill in the required fields:
   - **Event Title*** (required)
   - **Event Type*** (required) - Select Esports or Community
   - **Event Date*** (required)
3. Fill in optional fields:
   - Event Time (HH:MM format)
   - Description
   - Location
4. Upload an event image (optional but recommended)
5. Click **"Save Event"**

### Editing an Event

1. Find the event in the table
2. Click the **"Edit"** button in the Actions column
3. Update the desired fields
4. Optionally upload a new image (this will replace the old one)
5. Click **"Save Event"**

### Deleting an Event

1. Find the event in the table
2. Click the **"Delete"** button in the Actions column
3. Confirm the deletion in the popup
4. The event record and its image will be permanently deleted

### Filtering Events

Use the filter buttons above the events table to view:
- **All Events** - Show all events
- **Esports** - Only esports events
- **Community** - Only community events
- **Upcoming** - Events scheduled for today or future dates
- **Past** - Events that have already occurred

## Data Structure

### Players Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | Yes | Player's full name |
| Team | Dropdown | Yes | Team affiliation (Overwatch, Valorant, etc.) |
| Position | Text | No | Player's role/position |
| Major | Text | No | Academic major |
| Hometown | Text | No | Player's hometown |
| Quote | Text Area | No | Player's personal quote |
| Image | File Upload | No | Player photo (max 5MB) |

### Events Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Event Title | Text | Yes | Name of the event |
| Event Type | Dropdown | Yes | Esports or Community |
| Description | Text Area | No | Detailed event description |
| Event Date | Date | Yes | Date when event occurs |
| Event Time | Time | No | Specific time (HH:MM format) |
| Location | Text | No | Venue/location information |
| Image | File Upload | No | Event banner (max 5MB) |

## Image Guidelines

### Player Images
- **Format**: JPEG or PNG
- **Size**: 800x800 pixels (square)
- **File Size**: Under 2MB for optimal performance
- **Aspect Ratio**: 1:1 (square) or 3:4 (portrait)
- **Storage Bucket**: `player-images`

### Event Images
- **Format**: JPEG or PNG
- **Size**: 1200x600 pixels (landscape)
- **File Size**: Under 2MB for optimal performance
- **Aspect Ratio**: 2:1 (landscape banner)
- **Storage Bucket**: `event-images`

### Image Storage
- Images are stored in Supabase Storage buckets
- Each image gets a unique filename with timestamp
- Public URLs are automatically generated
- Old images are cleaned up when replaced or deleted

## Troubleshooting

### Players Not Loading
1. Check browser console for errors (F12)
2. Verify Supabase credentials in `admin.html` are correct
3. Check internet connection (Supabase requires internet access)

### Image Upload Fails
1. Check file size (must be under 5MB)
2. Verify file format (JPEG, PNG, WebP only)
3. Check Supabase storage bucket exists and has correct policies

### Delete Operation Fails
1. Check browser console for specific error
2. Verify RLS policies allow deletion
3. Ensure you have proper permissions

## Security Notes

### Current Setup (Development)
- ⚠️ **No authentication required** - Anyone can access the admin panel
- ✅ RLS policies are enabled on the database
- ✅ Storage bucket has proper access controls

### Production Recommendations
1. **Enable Authentication**: Uncomment the auth code in `admin.html`
2. **Set up Supabase Auth**: Configure email/password or OAuth
3. **Restrict Access**: Update RLS policies to require authentication for writes
4. **Use HTTPS**: Deploy behind HTTPS for secure connections
5. **Environment Variables**: Move Supabase keys to environment variables

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  picture_url TEXT,
  team VARCHAR(100) NOT NULL,
  position VARCHAR(100),
  major VARCHAR(255),
  hometown VARCHAR(255),
  quote TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Events Table
```sql
CREATE TYPE event_type AS ENUM ('esports', 'community');

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type event_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(255),
  picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Integration

### Players API

```javascript
// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch all players
const { data: players, error } = await supabase
  .from('players')
  .select('*')
  .order('name');

// Fetch players by team
const { data: overwatchPlayers } = await supabase
  .from('players')
  .select('*')
  .eq('team', 'Overwatch');
```

### Events API

```javascript
// Fetch all upcoming events
const { data: upcomingEvents } = await supabase
  .from('events')
  .select('*')
  .gte('event_date', new Date().toISOString().split('T')[0])
  .order('event_date', { ascending: true });

// Fetch only esports events
const { data: esportsEvents } = await supabase
  .from('events')
  .select('*')
  .eq('type', 'esports')
  .order('event_date', { ascending: true });

// Fetch only community events
const { data: communityEvents } = await supabase
  .from('events')
  .select('*')
  .eq('type', 'community')
  .order('event_date', { ascending: true });

// Fetch events for a specific month
const { data: monthEvents } = await supabase
  .from('events')
  .select('*')
  .gte('event_date', '2025-11-01')
  .lt('event_date', '2025-12-01')
  .order('event_date', { ascending: true });
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review Supabase dashboard for database/storage issues
3. Verify all migrations were applied successfully

## Future Enhancements

Potential improvements:
- [ ] Bulk player import from CSV
- [ ] Image cropping/resizing tool
- [ ] Player statistics tracking
- [ ] Team roster management
- [ ] Email notifications for updates
- [ ] Audit log of changes
- [ ] Advanced search and filtering
