# Phase 1: Admin Dashboard Layout & Navigation

## Goal
Build a professional admin dashboard with persistent sidebar, top navigation, summary cards with real backend data, and charts matching the prototype's visual style.

---

## Backend Changes

### 1. Add sections list endpoint
**File:** `backend/app/api/v1/modules.py` (academic_router)
- Add `GET /academic/sections` endpoint (list all, or filter by class_id)
- Add `GET /academic/classes/{class_id}/sections` to get sections for a specific class

### 2. Add dashboard statistics endpoint
**New file:** `backend/app/api/v1/dashboard.py`
- Create `GET /dashboard/stats` endpoint (admin-only)
- Returns JSON with:
  - `total_students` — count of students
  - `total_teachers` — count of teachers
  - `total_classes` — count of classes
  - `total_subjects` — count of subjects
  - `today_attendance` — { present, absent, late, excused, total, percentage } for today
  - `fee_collection` — { total_collected, total_due, total_outstanding }
- Use SQLAlchemy `func.count` and `func.sum` queries
- No salary endpoint (no salary model exists yet)

### 3. Register dashboard router
**File:** `backend/app/api/v1/__init__.py`
- Import and include `dashboard_router`

### 4. Add sections list endpoint (needed for class management later)
**File:** `backend/app/api/v1/modules.py`
- Add `GET /academic/sections` with optional `class_id` filter

---

## Frontend Changes

### 5. Install Recharts
- `npm install recharts` in frontend/

### 6. Add TypeScript types
**New file:** `frontend/src/types/index.ts`
- `SessionUser` (move from AuthContext)
- `DashboardStats` — interface matching backend `/dashboard/stats` response
- `Student`, `Teacher`, `Class`, `Section`, `Subject` — matching backend schemas
- `AttendanceRecord`, `Exam`, `Mark`, `Fee`, etc.

### 7. Create API service functions
**New file:** `frontend/src/services/dashboard.ts`
- `fetchDashboardStats()` — calls `GET /dashboard/stats`

### 8. Build layout components

**New file:** `frontend/src/components/layout/Sidebar.tsx`
- Persistent left sidebar with icon + text labels
- Grouped navigation sections:
  - Dashboard (LayoutDashboard icon)
  - People: Students, Teachers (Users, GraduationCap)
  - Academic: Classes, Subjects (BookOpen, Library)
  - Attendance (ClipboardCheck)
  - Examination: Exams, Results (FileText, Award)
  - Finance: Fees (DollarSign)
  - System: Settings (Settings)
- Active route highlighting
- Collapse/expand toggle
- Logo/brand at top
- Logout at bottom

**New file:** `frontend/src/components/layout/Header.tsx`
- Top navigation bar
- Search input (placeholder for now)
- Notification bell icon
- User avatar/name dropdown with Profile and Logout options

**New file:** `frontend/src/components/layout/AdminLayout.tsx`
- Wraps Sidebar + Header + main content area
- Uses `<Outlet />` from react-router-dom for nested routing

### 9. Build dashboard page components

**New file:** `frontend/src/components/dashboard/StatCard.tsx`
- Reusable summary card component
- Props: title, value, icon, color, trend (optional)
- Styled with gradient backgrounds matching prototype

**New file:** `frontend/src/components/dashboard/AttendanceChart.tsx`
- Recharts AreaChart showing attendance trend
- Uses mock data initially (placeholder)

**New file:** `frontend/src/components/dashboard/DonutCard.tsx`
- Recharts PieChart (donut style) for percentages
- Props: title, percentage, color

**New file:** `frontend/src/components/dashboard/FeeCollectionChart.tsx`
- Recharts BarChart for fee collection overview

### 10. Build main dashboard page
**File:** `frontend/src/pages/Dashboard.tsx` (rewrite)
- Fetch `/dashboard/stats` using TanStack Query
- Layout:
  - Row of summary stat cards (Students, Teachers, Classes, Subjects)
  - Second row: Attendance donut, Fee collection donut
  - Charts section: Attendance trend, Fee collection bar chart
  - Welcome message / quick stats

### 11. Update routing
**File:** `frontend/src/App.tsx`
- Wrap admin routes in `AdminLayout` with nested routes
- Routes structure:
  ```
  /login → LoginPage
  / → AdminLayout
    / → Dashboard (index)
    /students → StudentsPage (placeholder for Phase 2)
    /teachers → TeachersPage (placeholder for Phase 3)
    /classes → Placeholder
    /subjects → Placeholder
    /attendance → Placeholder
    /exams → Placeholder
    /results → Placeholder
    /fees → Placeholder
    /settings → Placeholder
  ```

### 12. Update Tailwind config
**File:** `frontend/tailwind.config.js`
- Add custom colors for sidebar, brand, gradients
- Add custom fonts if needed

### 13. Update index.css
**File:** `frontend/src/index.css`
- Add custom utility classes for sidebar, cards
- Scrollbar styling for sidebar

---

## File Creation Summary

### New Files (Backend)
| File | Purpose |
|------|---------|
| `backend/app/api/v1/dashboard.py` | Dashboard statistics endpoint |

### New Files (Frontend)
| File | Purpose |
|------|---------|
| `frontend/src/types/index.ts` | TypeScript interfaces |
| `frontend/src/services/dashboard.ts` | Dashboard API calls |
| `frontend/src/components/layout/Sidebar.tsx` | Sidebar navigation |
| `frontend/src/components/layout/Header.tsx` | Top navigation bar |
| `frontend/src/components/layout/AdminLayout.tsx` | Layout wrapper |
| `frontend/src/components/dashboard/StatCard.tsx` | Summary card |
| `frontend/src/components/dashboard/AttendanceChart.tsx` | Attendance chart |
| `frontend/src/components/dashboard/DonutCard.tsx` | Donut chart card |
| `frontend/src/components/dashboard/FeeCollectionChart.tsx` | Fee chart |

### Modified Files
| File | Change |
|------|--------|
| `backend/app/api/v1/__init__.py` | Register dashboard router |
| `backend/app/api/v1/modules.py` | Add sections list endpoint |
| `frontend/src/App.tsx` | Restructure routes with AdminLayout |
| `frontend/src/pages/Dashboard.tsx` | Rewrite with stats + charts |
| `frontend/src/pages/Modules.tsx` | Remove or update placeholder |
| `frontend/tailwind.config.js` | Add custom theme colors |
| `frontend/src/index.css` | Add custom utilities |
| `frontend/package.json` | Add recharts dependency |

---

## Visual Design (Matching Prototype)

### Sidebar
- Width: 260px expanded, 72px collapsed
- Background: White/light with subtle border
- Icons: Lucide React icons
- Active item: Highlighted with brand color (blue/purple)
- Groups separated by subtle dividers

### Summary Cards
- 4-column grid on desktop
- Gradient backgrounds: blue, green, orange, purple
- White text, large numbers
- Icons on the left side
- Rounded corners (12px)

### Header
- White background, bottom border
- Search bar with magnifying glass icon
- User info with avatar placeholder
- Notification bell

### Charts
- Clean, minimal style
- Responsive containers
- Consistent color palette
- Tooltips on hover

---

## Implementation Order

1. Backend: dashboard stats endpoint + sections endpoint
2. Frontend: install recharts
3. Frontend: types + services
4. Frontend: layout components (Sidebar, Header, AdminLayout)
5. Frontend: dashboard page components (StatCard, charts)
6. Frontend: Dashboard page rewrite
7. Frontend: routing update
8. Frontend: Tailwind config + CSS
9. Test end-to-end
