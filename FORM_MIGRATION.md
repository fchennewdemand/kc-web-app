# Form Migration Summary

All 9 forms have been migrated from AngularJS to Nuxt with Nuxt UI 4 and Valibot validation.

## Completed Forms

### 1. **general.vue** - Other Topics Feedback
- Comment Type dropdown
- Contact Preference dropdown
- ORCA Card Number
- File upload
- Form submission via `submitCase` lambda

### 2. **website.vue** - Website Feedback
- Comment Type dropdown
- Contact Preference dropdown
- Web Address/URL field
- File upload
- Form submission

### 3. **trip-planner.vue** - Trip Planner Feedback
- Comment Type dropdown
- Contact Preference dropdown
- Section of Trip Planner dropdown
- File upload
- Form submission

### 4. **ro.vue** - Mobility Services Comments
- Comment Type dropdown
- Date and Time fields
- Service Type dropdown
- Vehicle Number
- Direction of Travel
- Location field
- Anonymous checkbox option
- File upload
- Form submission

### 5. **shelter.vue** - Bus Stop/Shelter Feedback
- Issue Type dropdown
- Comment Type dropdown
- Contact Preference dropdown
- ORCA Card Number
- Date and Time of Observation
- Route Number dropdown
- Stop ID field
- File upload
- Form submission

### 6. **driver.vue** - Bus Driver Feedback
- Comment Type dropdown
- Contact Preference dropdown
- ORCA Card Number
- Date and Time of Ride
- Service Type dropdown (with dynamic route filtering)
- Route Number dropdown (conditional)
- Bus/Vehicle Number
- Direction of Travel (required if no bus number)
- Stop ID field
- Location field
- Operator Description textarea
- File upload
- Form submission

### 7. **ride.vue** - Bus Ride Feedback
- Same as driver.vue but without Operator Description
- All other fields identical to driver form
- File upload
- Form submission

### 8. **lost-found.vue** - Lost & Found
- Item Type, Item Color, Item Color Style dropdowns
- Item Description textarea
- Date and Time of Ride
- Service Type dropdown
- Route Number dropdown (conditional, required)
- Bus/Vehicle Number
- Location field
- Phone is REQUIRED (not optional)
- File upload for pictures (image/* only)
- Form submission

### 9. **a3.vue** - Access Paratransit Comments
- Comment Type dropdown
- Category selection (Rider/Proxy/Saw) with conditional fields:
  - **Rider**: Access ID, Home Phone, Email
  - **Proxy**: Contact Person, Contact Phone/Email, Relationship, Contact Target (me/rider), Access Rider info
  - **Saw**: Contact Name, Phone, Email
- Contact Preference with conditional contact data field
- Category of feedback dropdown
- "My other issue" conditional field
- Incident Date and Time
- Location field
- File upload
- Form submission

## Key Features Implemented

1. **Valibot Validation** - All forms have proper validation schemas
2. **File Upload** - Shared composable `useFileUpload` for consistent file handling
3. **Dynamic Dropdowns** - Data loaded from `initCase` lambda on mount
4. **Conditional Fields** - Forms show/hide fields based on selections
5. **Form Submission** - All forms submit via `submitCase` lambda
6. **Success Notifications** - Toast notifications on successful submission
7. **Navigation** - Cancel button returns to home, submit redirects after success

## API Integration

All forms call two lambdas:
- `initCase` - Loads dropdown options and initial data on page load
- `submitCase` - Submits the form data

## File Upload

Files are uploaded via `$nd.upload()` which:
1. Validates file size (default 25MB limit)
2. Requests upload URL from backend
3. Uploads to S3
4. Returns file metadata to include in form submission
