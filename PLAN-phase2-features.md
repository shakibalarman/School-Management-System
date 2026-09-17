# Implementation Plan: Student/Teacher Creation, Subjects, Classes, Attendance

## Overview
Fix student/teacher account creation with new fields, implement subject management, class structure (Nursery-Play-1-10 with Arts/Commerce groups), and attendance system.

---

## Phase 1: Backend Model Changes

### 1.1 Add new fields to Student model
**File:** `backend/app/models/people.py`
- Add `blood_group` (String(10), nullable)
- Add `nationality` (String(50), nullable)
- Add `religion` (String(50), nullable)

### 1.2 Add new fields to Teacher model
**File:** `backend/app/models/people.py`
- Add `blood_group` (String(10), nullable)
- Add `nationality` (String(50), nullable)
- Add `religion` (String(50), nullable)

### 1.3 Create Alembic migration
- Run `alembic revision --autogenerate -m "add blood_group nationality religion to students and teachers"`
- Run `alembic upgrade head`

---

## Phase 2: Backend Schema & API Changes

### 2.1 Update schemas
**File:** `backend/app/schemas/__init__.py`
- Add `blood_group`, `nationality`, `religion` to StudentCreate, StudentUpdate, StudentOut
- Add `blood_group`, `nationality`, `religion` to TeacherCreate, TeacherOut

### 2.2 Update student API
**File:** `backend/app/api/v1/students.py`
- Include new fields in create/update logic

### 2.3 Update teacher API
**File:** `backend/app/api/v1/teachers.py`
- Include new fields in create logic

### 2.4 Add attendance list endpoints
**File:** `backend/app/api/v1/modules.py`
- Add `GET /attendance` - list attendance records (with filters: class_id, section_id, date, student_id)
- Add `GET /attendance/student/{student_id}` - student's own attendance history
- Add `GET /attendance/today` - today's attendance summary by class

### 2.5 Add subject delete endpoint
**File:** `backend/app/api/v1/modules.py`
- Add `DELETE /academic/subjects/{subject_id}` - delete subject

---

## Phase 3: Seed Script Update

### 3.1 Update seed with new class structure
**File:** `backend/seed.py`
- Nursery, Play, Class 1-8 (sections A, B)
- Class 9 Arts, Class 9 Commerce, Class 9 Science (sections A, B)
- Class 10 Arts, Class 10 Commerce, Class 10 Science (sections A, B)
- Add all 18 predefined subjects

---

## Phase 4: Frontend - Student Management

### 4.1 Create student service
**New file:** `frontend/src/services/students.ts`
- `createStudent(data)` - POST /students
- `listStudents(params)` - GET /students
- `getStudent(id)` - GET /students/{id}
- `updateStudent(id, data)` - PATCH /students/{id}`
- `deleteStudent(id)` - DELETE /students/{id}

### 4.2 Create student form component
**New file:** `frontend/src/components/students/StudentForm.tsx`
- Fields: First Name, Last Name, Date of Birth, Gender, Blood Group, Nationality, Religion, Email, Phone, Address, Class, Section, Roll Number
- react-hook-form + zod validation

### 4.3 Create student list page
**New file:** `frontend/src/pages/Students.tsx`
- Data table with search, filter by class/section/status
- Pagination
- Actions: View, Edit, Delete
- Add Student button opens form modal

---

## Phase 5: Frontend - Teacher Management

### 5.1 Create teacher service
**New file:** `frontend/src/services/teachers.ts`
- `createTeacher(data)` - POST /teachers
- `listTeachers(params)` - GET /teachers
- `getTeacher(id)` - GET /teachers/{id}
- `deactivateTeacher(id)` - PATCH /teachers/{id}/deactivate
- `activateTeacher(id)` - PATCH /teachers/{id}/activate

### 5.2 Create teacher form component
**New file:** `frontend/src/components/teachers/TeacherForm.tsx`
- Fields: First Name, Last Name, Date of Birth, Gender, Blood Group, Nationality, Religion, Email, Phone, Department, Designation, Joining Date
- Option to create login account

### 5.3 Create teacher list page
**New file:** `frontend/src/pages/Teachers.tsx`
- Data table with search
- Actions: View, Edit, Deactivate/Activate

---

## Phase 6: Frontend - Subject Management

### 6.1 Create subject service
**New file:** `frontend/src/services/subjects.ts`
- `listSubjects()` - GET /academic/subjects
- `createSubject(data)` - POST /academic/subjects
- `deleteSubject(id)` - DELETE /academic/subjects/{id}

### 6.2 Create subject management page
**New file:** `frontend/src/pages/Subjects.tsx`
- List all subjects in a grid/table
- Add new subject form (inline or modal)
- Delete subject with confirmation
- Show subject code and name

---

## Phase 7: Frontend - Class Management

### 7.1 Create class service
**New file:** `frontend/src/services/classes.ts`
- `listClasses()` - GET /academic/classes
- `listSections(classId?)` - GET /academic/sections
- `createClass(data)` - POST /academic/classes
- `createSection(data)` - POST /academic/sections

### 7.2 Create class management page
**New file:** `frontend/src/pages/Classes.tsx`
- Tree view: Class → Sections
- Add Class form
- Add Section form (within class)
- Show student count per section

---

## Phase 8: Frontend - Attendance System

### 8.1 Create attendance service
**New file:** `frontend/src/services/attendance.ts`
- `takeAttendance(data)` - POST /attendance/take
- `listAttendance(params)` - GET /attendance
- `getStudentAttendance(studentId)` - GET /attendance/student/{student_id}

### 8.2 Create teacher attendance page
**New file:** `frontend/src/pages/TakeAttendance.tsx`
- Select class → Select section → Select date
- List students with radio buttons (Present/Absent/Late/Excused)
- Submit bulk attendance

### 8.3 Create admin attendance view
**New file:** `frontend/src/pages/AttendanceView.tsx`
- Filter by class, section, date
- View attendance records
- Update individual records

### 8.4 Create student attendance view
**New file:** `frontend/src/pages/MyAttendance.tsx`
- Show own attendance history
- Monthly calendar view
- Attendance percentage

---

## Phase 9: Update Routing & Sidebar

### 9.1 Update App.tsx routes
- Add routes for all new pages
- Role-based route protection

### 9.2 Update Sidebar
- Add attendance sub-items (Take Attendance for teachers, View Attendance for admin)

---

## File Summary

### New Backend Files
None (modifying existing)

### New Frontend Files
| File | Purpose |
|------|---------|
| `src/services/students.ts` | Student API calls |
| `src/services/teachers.ts` | Teacher API calls |
| `src/services/subjects.ts` | Subject API calls |
| `src/services/classes.ts` | Class/Section API calls |
| `src/services/attendance.ts` | Attendance API calls |
| `src/components/students/StudentForm.tsx` | Student create/edit form |
| `src/components/teachers/TeacherForm.tsx` | Teacher create/edit form |
| `src/pages/Students.tsx` | Student management page |
| `src/pages/Teachers.tsx` | Teacher management page |
| `src/pages/Subjects.tsx` | Subject management page |
| `src/pages/Classes.tsx` | Class management page |
| `src/pages/TakeAttendance.tsx` | Teacher attendance page |
| `src/pages/AttendanceView.tsx` | Admin attendance view |
| `src/pages/MyAttendance.tsx` | Student attendance view |

### Modified Backend Files
| File | Changes |
|------|---------|
| `app/models/people.py` | Add blood_group, nationality, religion |
| `app/schemas/__init__.py` | Add new fields to schemas |
| `app/api/v1/students.py` | Handle new fields |
| `app/api/v1/teachers.py` | Handle new fields |
| `app/api/v1/modules.py` | Add attendance list endpoints, subject delete |
| `seed.py` | New class structure + subjects |

### Modified Frontend Files
| File | Changes |
|------|---------|
| `src/App.tsx` | Add new routes |
| `src/pages/Modules.tsx` | Remove old StudentsPage (moved to Students.tsx) |
| `src/components/layout/Sidebar.tsx` | Add attendance sub-items |
| `src/types/index.ts` | Add new fields to types |
