# Graph Report - HBPN  (2026-11-04)

## Corpus Check
- 7 files · ~11,588 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 599 nodes · 1328 edges · 29 communities (25 shown, 4 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- API Architecture & Namespaces
- Controller Endpoints & Authorization
- Core Services & Dependency Injection
- User Roles & Admin Models
- Patient DTOs & Statistics
- Authentication & User DTOs
- Specialization Data Models
- Launch & Runtime Configuration
- Appointment Data Transfer Models
- Doctor Profile DTOs
- Booking Entity & Configuration
- Clinic Entity & Configuration
- User Entity & Identity Configuration
- Doctor Creation DTOs
- Doctor Update DTOs
- Database Migrations & Snapshot
- Appointment Slot Configuration
- Doctor Model & Entity Configuration
- Slot Management Service & DTOs
- Service Response & Admin Operations
- Doctor Service & Operations
- Doctor Slot DTOs & Scheduling
- Project Dependencies & Solution
- Appointment Status & Grouping DTOs
- Doctor Scheduling DTOs
- Appointment Booking Service
- Appointment Booking Operations
- Booking Status Domain Enums
- Doctor Detail Service Operations

## God Nodes (most connected - your core abstractions)
1. `ServiceResponse` - 83 edges
2. `AppointmentDto` - 33 edges
3. `HospitalBooking.API.DTOs` - 31 edges
4. `DoctorDto` - 24 edges
5. `YusrDbContext` - 23 edges
6. `User` - 21 edges
7. `PatientDto` - 20 edges
8. `HospitalBooking.API.Services.Common` - 19 edges
9. `UserDto` - 17 edges
10. `Doctor` - 16 edges

## Surprising Connections (you probably didn't know these)
- `AdminController` --references--> `IAdminService`  [EXTRACTED]
  HospitalBooking.API/Controllers/AdminController.cs → HospitalBooking.API/Services/Admin/IAdminService.cs
- `AppointmentsController` --references--> `IAppointmentService`  [EXTRACTED]
  HospitalBooking.API/Controllers/AppointmentsController.cs → HospitalBooking.API/Services/Appointments/IAppointmentService.cs
- `AuthController` --references--> `IAuthService`  [EXTRACTED]
  HospitalBooking.API/Controllers/AuthController.cs → HospitalBooking.API/Services/Auth/IAuthService.cs
- `DoctorsController` --references--> `IDoctorService`  [EXTRACTED]
  HospitalBooking.API/Controllers/DoctorsController.cs → HospitalBooking.API/Services/Doctors/IDoctorService.cs
- `PatientsController` --references--> `IPatientService`  [EXTRACTED]
  HospitalBooking.API/Controllers/PatientsController.cs → HospitalBooking.API/Services/Patients/IPatientService.cs

## Import Cycles
- None detected.

## Communities (29 total, 4 thin omitted)

### Community 0 - "API Architecture & Namespaces"
Cohesion: 0.05
Nodes (19): HospitalBooking.API, HospitalBooking.API.Controllers, HospitalBooking.API.Services.Patients, HospitalBooking.API.Services.Auth, HospitalBooking.API.Services.Common, HospitalBooking.API.Services.Doctors, HospitalBooking.API.Common.Enums, HospitalBooking.API.Services.Security (+11 more)

### Community 1 - "Controller Endpoints & Authorization"
Cohesion: 0.10
Nodes (13): AdminController, AppointmentsController, AuthController, BaseApiController, CurrentUserId, CurrentUserRole, IsAdmin, DoctorsController (+5 more)

### Community 2 - "Core Services & Dependency Injection"
Cohesion: 0.05
Nodes (8): YusrDbContext, AppointmentSlots, Bookings, Clinics, Doctors, Users, JwtService, UserService

### Community 3 - "User Roles & Admin Models"
Cohesion: 0.06
Nodes (35): UserRole, Admin, Doctor, None, Patient, AdminDashboardDto, CancelledAppointments, CompletedAppointments (+27 more)

### Community 4 - "Patient DTOs & Statistics"
Cohesion: 0.08
Nodes (26): PatientAppointmentStatsDto, CancelledAppointments, CompletedAppointments, TotalAppointments, UpcomingAppointments, PatientDetailDto, Appointments, PatientDto (+18 more)

### Community 5 - "Authentication & User DTOs"
Cohesion: 0.09
Nodes (21): AuthResponseDto, Message, Role, Token, User, UserId, LoginRequestDto, EmailOrPhone (+13 more)

### Community 6 - "Specialization Data Models"
Cohesion: 0.10
Nodes (19): CreateSpecializationDto, Description, Icon, Name, Status, SpecializationDto, Description, DoctorsCount (+11 more)

### Community 7 - "Launch & Runtime Configuration"
Cohesion: 0.07
Nodes (28): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, launchUrl, applicationUrl (+20 more)

### Community 8 - "Appointment Data Transfer Models"
Cohesion: 0.11
Nodes (18): AppointmentDto, AppointmentDate, AppointmentNumber, Clinic, CreatedAt, DoctorId, DoctorName, EndTime (+10 more)

### Community 9 - "Doctor Profile DTOs"
Cohesion: 0.12
Nodes (16): DoctorDto, AccountStatus, AppointmentsCount, AvailabilityStatus, Bio, Clinic, Email, Experience (+8 more)

### Community 10 - "Booking Entity & Configuration"
Cohesion: 0.17
Nodes (9): BookingConfiguration, Booking, AppointmentSlot, BookingId, CreatedAt, Patient, PatientId, SlotId (+1 more)

### Community 11 - "Clinic Entity & Configuration"
Cohesion: 0.17
Nodes (9): ClinicConfiguration, Clinic, ClinicId, ClinicName, CreatedAt, Description, Doctors, IsActive (+1 more)

### Community 12 - "User Entity & Identity Configuration"
Cohesion: 0.17
Nodes (12): UserConfiguration, User, Bookings, CreatedAt, Doctor, Email, FullName, IsActive (+4 more)

### Community 13 - "Doctor Creation DTOs"
Cohesion: 0.17
Nodes (11): CreateDoctorDto, Bio, Clinic, Email, Experience, FullName, Password, PhoneNumber (+3 more)

### Community 14 - "Doctor Update DTOs"
Cohesion: 0.17
Nodes (11): UpdateDoctorDto, AvailabilityStatus, Bio, Clinic, Email, Experience, FullName, PhoneNumber (+3 more)

### Community 16 - "Appointment Slot Configuration"
Cohesion: 0.18
Nodes (10): AppointmentSlotConfiguration, AppointmentSlot, Bookings, CreatedAt, Doctor, DoctorId, EndDateTime, IsCancelled (+2 more)

### Community 17 - "Doctor Model & Entity Configuration"
Cohesion: 0.18
Nodes (10): DoctorConfiguration, Doctor, AppointmentSlots, Bio, Clinic, ClinicId, DoctorId, ProfileImage (+2 more)

### Community 18 - "Slot Management Service & DTOs"
Cohesion: 0.24
Nodes (7): UpdateSlotDto, Date, EndTime, StartTime, Status, ISlotService, SlotService

### Community 19 - "Service Response & Admin Operations"
Cohesion: 0.20
Nodes (5): ServiceResponse, Data, Message, StatusCode, Success

### Community 21 - "Doctor Slot DTOs & Scheduling"
Cohesion: 0.27
Nodes (7): DoctorSlotDto, Date, DoctorId, EndTime, Id, StartTime, Status

### Community 22 - "Project Dependencies & Solution"
Cohesion: 0.20
Nodes (8): net8.0, Microsoft.AspNetCore.Authentication.JwtBearer (8.0.33), Microsoft.EntityFrameworkCore (8.0.32), Microsoft.EntityFrameworkCore.Design (8.0.32), Microsoft.EntityFrameworkCore.Tools (8.0.32), Npgsql.EntityFrameworkCore.PostgreSQL (8.0.11), Swashbuckle.AspNetCore (6.6.2), Microsoft.NET.Sdk.Web

### Community 23 - "Appointment Status & Grouping DTOs"
Cohesion: 0.25
Nodes (6): MyAppointmentsGroupedDto, Cancelled, Past, Upcoming, UpdateAppointmentStatusDto, Status

### Community 24 - "Doctor Scheduling DTOs"
Cohesion: 0.22
Nodes (5): CreateDoctorSlotDto, Date, EndTime, StartTime, Status

### Community 26 - "Appointment Booking Operations"
Cohesion: 0.33
Nodes (5): CreateAppointmentDto, DoctorId, Notes, ReasonForVisit, SlotId

### Community 27 - "Booking Status Domain Enums"
Cohesion: 0.33
Nodes (5): BookingStatus, Approved, Cancelled, Pending, Rejected

## Knowledge Gaps
- **213 isolated node(s):** `AccountStatus`, `AppointmentsCount`, `AvailabilityStatus`, `Bio`, `Clinic` (+208 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 279 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ServiceResponse` connect `Service Response & Admin Operations` to `Controller Endpoints & Authorization`, `Core Services & Dependency Injection`, `User Roles & Admin Models`, `Patient DTOs & Statistics`, `Authentication & User DTOs`, `Specialization Data Models`, `Doctor Creation DTOs`, `Doctor Update DTOs`, `Slot Management Service & DTOs`, `Doctor Service & Operations`, `Doctor Slot DTOs & Scheduling`, `Appointment Status & Grouping DTOs`, `Appointment Booking Service`, `Appointment Booking Operations`, `Doctor Detail Service Operations`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AppointmentDto` (e.g. with `AdminService.GetDashboardAsync()` and `AppointmentService.GetMyAppointmentsAsync()`) actually correct?**
  _`AppointmentDto` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AccountStatus`, `AppointmentsCount`, `AvailabilityStatus` to the rest of the system?**
  _213 weakly-connected nodes found - possible missing edges._
- **Should `API Architecture & Namespaces` be split into smaller, more focused modules?**
  _Cohesion score 0.05362517099863201 - nodes in this community are weakly interconnected._
- **Why does `HospitalBooking.API.DTOs` connect `API Architecture & Namespaces` to `User Roles & Admin Models`, `Patient DTOs & Statistics`, `Authentication & User DTOs`, `Specialization Data Models`, `Appointment Status & Grouping DTOs`, `Doctor Scheduling DTOs`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Should `Controller Endpoints & Authorization` be split into smaller, more focused modules?**
  _Cohesion score 0.10187553282182438 - nodes in this community are weakly interconnected._
- **Why does `YusrDbContext` connect `Core Services & Dependency Injection` to `API Architecture & Namespaces`, `User Roles & Admin Models`, `Patient DTOs & Statistics`, `Authentication & User DTOs`, `Specialization Data Models`, `Database Migrations & Snapshot`, `Slot Management Service & DTOs`, `Doctor Service & Operations`, `Appointment Booking Service`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._