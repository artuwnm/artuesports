# Local Development Guide

## Running the Site Locally

Since this is a static website (HTML/CSS/JavaScript only), you just need a simple web server to run it locally.

## Option 1: Using Python (Recommended - Easiest)

If you have Python installed (most Macs come with it):

```bash
# Navigate to the project directory
cd /Users/fredmchale/Documents/GitHub/artuesports

# Python 3 (recommended)
python3 -m http.server 8000

# OR Python 2 (if Python 3 not available)
python -m SimpleHTTPServer 8000
```

Then open your browser to:
- Main site: http://localhost:8000
- Admin login: http://localhost:8000/admin-login.html

## Option 2: Using Node.js (http-server)

If you have Node.js installed:

```bash
# Install http-server globally (only need to do this once)
npm install -g http-server

# Navigate to the project directory
cd /Users/fredmchale/Documents/GitHub/artuesports

# Start the server
http-server -p 8000
```

Then open: http://localhost:8000

## Option 3: Using VS Code Live Server

If you use Visual Studio Code:

1. Install the "Live Server" extension by Ritwick Dey
2. Open the project folder in VS Code
3. Right-click on `index.html`
4. Select "Open with Live Server"

It will automatically open in your browser (usually at http://127.0.0.1:5500)

## Option 4: Using PHP

If you have PHP installed:

```bash
cd /Users/fredmchale/Documents/GitHub/artuesports
php -S localhost:8000
```

Then open: http://localhost:8000

## Quick Start Script

I've created a simple script to make this even easier. Just run:

```bash
./start-server.sh
```

Or if you prefer Python specifically:

```bash
./start-server.sh python
```

## Important Notes

### Supabase Connection
- The site connects to your live Supabase database (no local database needed)
- All admin operations will affect your production database
- Make sure your Supabase project is running (not paused)

### CORS & Authentication
- Supabase is configured to work with localhost
- No additional CORS setup needed
- Authentication will work the same as production

### Making Changes
- Any changes to HTML/CSS/JS files are immediately reflected
- Just refresh your browser to see changes
- No build or compile step needed

## Testing Admin Features

1. **Start the server** using any method above
2. **Navigate to** http://localhost:8000/admin-login.html
3. **Login with:**
   - Email: `fmchale@academyart.edu`
   - Password: (the one you set in Supabase Auth)
4. **You should see:**
   - Players page (admin.html)
   - "Admins" link in navigation (because you're a super admin)

## Common Issues

### "Port already in use"
If port 8000 is already being used, try a different port:

```bash
# Python
python3 -m http.server 8001

# Node
http-server -p 8001
```

### "Cannot find module" or "Command not found"
Make sure you have the required tool installed:

```bash
# Check Python
python3 --version

# Check Node
node --version

# Check PHP
php --version
```

### Supabase Authentication Errors
Make sure:
1. Your Supabase project is active (not paused)
2. You've created a user in Supabase Auth with email: `fmchale@academyart.edu`
3. The user exists in the `admin_users` table (already done ✅)

### Page Loads but No Data
Check the browser console (F12) for errors. Common issues:
- Supabase project is paused
- RLS policies blocking access
- Network connectivity issues

## File Structure

```
artuesports/
├── index.html              # Homepage
├── admin-login.html        # Admin login page
├── admin.html             # Players management
├── events-admin.html      # Events management
├── admins-admin.html      # Admin management (super admins only)
├── teams.html             # Public teams page
├── events.html            # Public events page
├── lounge.html            # Lounge page
├── styles.css             # Global styles
├── script.js              # Global JavaScript
└── migrations/            # Database migrations
    └── create_admin_users.sql
```

## Development Workflow

1. **Start server** (one of the methods above)
2. **Open in browser** (http://localhost:8000)
3. **Make changes** to HTML/CSS/JS files
4. **Refresh browser** to see changes
5. **Test admin features** at /admin-login.html

## Deploying Changes

When you're ready to deploy:

1. Commit your changes to git
2. Push to your repository
3. Deploy to your hosting service (Netlify, Vercel, GitHub Pages, etc.)

Since there's no build process, deployment is as simple as uploading the files!

## Stopping the Server

- **Python/PHP**: Press `Ctrl + C` in the terminal
- **http-server**: Press `Ctrl + C` in the terminal
- **VS Code Live Server**: Click "Port: 5500" in the status bar to stop
