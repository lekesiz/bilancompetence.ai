# Detailed Error Fixes Lookup Table

**Purpose:** Quick reference for all remaining TypeScript errors and their specific fixes
**Updated:** 2025-10-23
**Total Errors Covered:** 114

---

## schedulingService.ts (17 remaining errors)

### Error 1 | Line 194 | Array Type Assertion
**Type:** `Type 'SelectQueryError[]' is not assignable to type 'AvailabilitySlot[]'`

**Location:** `getAvailableSlotsForConsultant()` return statement

**Fix:**
```typescript
// BEFORE (Line 200)
return data || [];

// AFTER
return (data as AvailabilitySlot[]) || [];
```

**Explanation:** Error check exists at line 195-197, so after that we can safely assert the type

---

### Error 2 | Line 234 | Property Access on Union Type
**Type:** `Property 'scheduled_start_time' does not exist on SelectQueryError`

**Location:** `getSessionsByDateRange()` method, line 234

**Fix:**
```typescript
// BEFORE (Lines 233-235)
const slots = data.map((result: any) => ({
  startTime: result.scheduled_start_time,
  endTime: result.scheduled_end_time,

// AFTER
const slots = (data as SessionBooking[]).map((result) => ({
  startTime: result.scheduled_start_time,
  endTime: result.scheduled_end_time,
```

**Explanation:** Add type assertion to array before calling .map()

---

### Error 3 | Line 235 | Property Access on Union Type
**Type:** `Property 'scheduled_end_time' does not exist on SelectQueryError`

**Location:** Same as Error 2 (fixed together)

---

### Error 4-5 | Line 272 | Status Property Access (x2)
**Type:** `Property 'status' does not exist on SelectQueryError`

**Location:** `getSessionBookingDetails()` method

**Fix:**
```typescript
// BEFORE (Line 272)
const isInProgress = booking.status === 'IN_PROGRESS' || booking.status === 'SCHEDULED';

// AFTER
const isInProgress = (booking as SessionBooking).status === 'IN_PROGRESS' || (booking as SessionBooking).status === 'SCHEDULED';

// OR BETTER: Extract assertion once
const typedBooking = booking as SessionBooking;
const isInProgress = typedBooking.status === 'IN_PROGRESS' || typedBooking.status === 'SCHEDULED';
```

---

### Error 6 | Line 278 | Phase Property Access
**Type:** `Property 'phase' does not exist on SelectQueryError`

**Location:** `getSessionBookingDetails()` method, line 278

**Fix:**
```typescript
// BEFORE
const phase = session.phase;

// AFTER
const session = sessions[0] as BilanRow;  // or import correct type
const phase = session.phase;
```

---

### Error 7 | Line 352 | Property Access - ID (x3)
**Type:** `Property 'id' does not exist on SelectQueryError` (and two more property accesses)

**Location:** Lines 352-353 in complex object construction

**Fix:**
```typescript
// BEFORE (Lines 352-353)
return {
  id: result.id,
  scheduled_date: result.scheduled_date,
  scheduled_start_time: result.scheduled_start_time,

// AFTER
const typedResult = result as SessionBooking;
return {
  id: typedResult.id,
  scheduled_date: typedResult.scheduled_date,
  scheduled_start_time: typedResult.scheduled_start_time,
```

---

### Error 8 | Line 354 | Return Type Assertion
**Type:** `Type '{ error: true; } & String' is missing SessionBooking properties`

**Location:** Return statement in same function

**Fix:**
```typescript
// BEFORE
return {
  ...

// AFTER
return {
  ...
} as SessionBooking;  // Add assertion to entire return object
```

---

### Error 9 | Line 442 | Status Property in Filter
**Type:** `Property 'status' does not exist on SelectQueryError`

**Location:** `getSessionBookingsByConsultant()` method

**Fix:**
```typescript
// Extract once at start of method after error check:
if (error) throw new DatabaseError(...);
if (!bookings) return [];
const typedBookings = bookings as SessionBooking[];

// Then use typedBookings throughout
const filtered = typedBookings.filter(b => b.status === status);
```

---

### Error 10 | Line 461 | Complex Assignment
**Type:** `Type 'SelectQueryError' not assignable to SessionBooking`

**Location:** Variable assignment

**Fix:**
```typescript
// BEFORE
const booking = singleBooking;

// AFTER
const booking = singleBooking as SessionBooking;
```

---

### Errors 11-14 | Lines 533, 543, 612, 622 | Union Type Handling
**Type:** `Type 'SelectQueryError[]' not assignable to SessionBooking[]`
AND
**Type:** `Type 'SelectQueryError[]' not assignable to PaginatedResponse<SessionBooking> | SessionBooking[]`

**Location:** `getUpcomingSessions()` and `getPreviousSessions()` return statements

**Fix Pattern:**
```typescript
// BEFORE (Lines 543, 622)
return result;  // result type is union: PaginatedResponse | array

// AFTER - Option 1: Type assertion
return (result as SessionBooking[]);

// AFTER - Option 2: Use helper (preferred)
return extractArrayFromUnion(result, error, 'get upcoming sessions');

// Note: Need to import extractArrayFromUnion from supabaseTypeGuards
```

**Alternative:** If function returns PaginatedResponse<SessionBooking> | SessionBooking[]:
```typescript
// Check actual return type in function signature
// If it should always be PaginatedResponse:
return {
  data: (data as SessionBooking[]) || [],
  count: count || 0,
  total: count || 0,
  page: 1,
  pageSize: 20
} as PaginatedResponse<SessionBooking>;
```

---

### Error 15 | Line 673-675 | Property Access in Analytics (x3)
**Type:** `Property 'consultant_id'/'organization_id'/'scheduled_date' does not exist`

**Location:** `getSessionAnalytics()` method

**Fix:**
```typescript
// Extract type assertion at start:
const typedSession = session as SessionBooking;

// Then use:
const key = `${typedSession.consultant_id}:${typedSession.organization_id}:${typedSession.scheduled_date}`;
```

---

### Error 16-17 | Line 676, 704 | Return Type Assertions
**Type:** `Type 'SelectQueryError' not assignable to SessionBooking`

**Location:** Return statements

**Fix:**
```typescript
// BEFORE
return booking;  // Type might be SelectQueryError

// AFTER
return booking as SessionBooking;
```

---

### Error 18 | Line 747-766, 820 | Multiple Property Accesses
**Type:** Various property access errors

**Fix Strategy:**
```typescript
// Add single assertion at start of processing:
const typedBookings = bookings as SessionBooking[];

// Then all subsequent property access works:
typedBookings.forEach(b => {
  // Now b.status, b.beneficiary_rating, etc. all type-safe
});
```

---

## supabaseService.ts (11 remaining errors)

### Errors 1-7 | Lines 45, 59, 83, 98, 113, 128, 143 | getUserById returns
**Type:** `Type 'SelectQueryError' not assignable to user type`

**Location:** Multiple getUserByEmail/similar functions

**Fix Pattern (applies to all):**
```typescript
// BEFORE
const { data: user, error } = await supabase.from('users').select().eq('email', email).single();

if (error) throw error;

return user;  // ❌ Type: unknown | SelectQueryError

// AFTER
const { data: user, error } = await supabase.from('users').select().eq('email', email).single();

if (error) throw error;

if (!user) throw new NotFoundError('User');

return user as UserRow;  // ✅ Type: UserRow (safe to access properties)
```

**Affected Functions:**
- getUserByEmail() - lines 45, 59
- getUserById() - lines 83, 98, 113, 128, 143
- getCounts functions may have similar issues

---

### Error 8 | Line 398 | getBilansByBeneficiary Return
**Type:** `Type 'SelectQueryError[]' not assignable to 'BilanWithConsultant[]'`

**Location:** Return statement

**Fix:**
```typescript
// BEFORE
return (data as BilanWithConsultant[]) || [];

// Might already be partially fixed, check if error handling exists
// If not, add:
if (error) throw new DatabaseError('fetch bilans', error);

// THEN:
return (data as BilanWithConsultant[]) || [];
```

---

### Error 9 | Line 423 | getBilansByConsultant Return
**Type:** `Type 'SelectQueryError[]' not assignable to 'BilanWithBeneficiary[]'`

**Location:** Return statement

**Fix:**
```typescript
// BEFORE
return (data as BilanWithBeneficiary[]) || [];

// Might already be partially fixed, check if error handling exists
// If not, add:
if (error) throw new DatabaseError('fetch bilans', error);

// THEN:
return (data as BilanWithBeneficiary[]) || [];
```

---

### Errors 10-11 | Lines 439-440 | Beneficiary Property Access (x2)
**Type:** `Property 'beneficiary' does not exist on SelectQueryError`

**Location:** getClientsByConsultant() processing loop

**Fix:**
```typescript
// BEFORE (Lines 439-440)
bilans?.forEach((bilan: any) => {
  if (bilan.beneficiary?.id) {
    uniqueClients.push({
      id: bilan.beneficiary.id,
      email: bilan.beneficiary.email,
    });
  }
});

// AFTER
const typedBilans = (bilans || []) as BilanWithBeneficiary[];
typedBilans.forEach((bilan) => {
  if (bilan.beneficiary?.id) {
    uniqueClients.push({
      id: bilan.beneficiary.id,
      email: bilan.beneficiary.email,
    });
  }
});
```

---

### Error 12 | Line 458 | ID Property Access
**Type:** `Property 'id' does not exist on SelectQueryError`

**Location:** Property access after query

**Fix:**
```typescript
// Add type assertion where org is used:
const typedOrg = org as OrganizationRow;
// Then use: typedOrg.id, etc.
```

---

### Error 13 | Line 516 | Enum Type Mismatch
**Type:** `Argument of type 'string' not assignable to 'NonNullable<BilanStatusType>'`

**Location:** updateBilanStatus() function parameter

**Fix:**
```typescript
// BEFORE
export async function updateBilanStatus(bilanId: string, status: string) {
  const { error } = await supabase
    .from('bilans')
    .update({ status })
    .eq('id', bilanId);

// AFTER
import { isValidBilanStatus } from '../types/enums.js';

export async function updateBilanStatus(bilanId: string, status: string) {
  if (!isValidBilanStatus(status)) {
    throw new ValidationError(`Invalid status: ${status}`);
  }

  const { error } = await supabase
    .from('bilans')
    .update({ status })
    .eq('id', bilanId);
```

---

## analyticsService.ts (6 remaining errors)

### Errors 1-4 | Lines 176-182 | Assessment Properties
**Type:** `Property 'title'/'status'/'start_date'/'end_date' does not exist on SelectQueryError`

**Location:** getAssessmentAnalytics() function

**Fix:**
```typescript
// BEFORE (lines 139-144)
const { data: assessment, error: assessmentError } = await supabase
  .from('bilans')
  .select('*')
  .eq('id', assessmentId)
  .single();

if (assessmentError) {
  throw new DatabaseError('Failed to fetch assessment', assessmentError);
}

if (!assessment) {
  throw new NotFoundError('Assessment');
}

// Then use assessment
analytics = {
  assessmentId,
  title: assessment.title,  // ❌ Error here

// AFTER: Already has error checks, just add assertion
const assessment = data as BilanRow;  // Add type assertion
analytics = {
  assessmentId,
  title: assessment.title,  // ✅ Now safe
```

---

### Errors 5-7 | Lines 220, 296-298 | Recommendation Status
**Type:** `Property 'created_at'/'status' does not exist on SelectQueryError`

**Location:** getAssessmentsTimeSeries() and getRecommendationEffectiveness()

**Fix:**
```typescript
// BEFORE
const count = data.filter((item) => {
  const date = new Date(item.created_at);  // ❌ Error

// AFTER
const typedData = data as RecommendationRow[];  // Add assertion
const count = typedData.filter((item) => {
  const date = new Date(item.created_at);  // ✅ Safe

// Similarly for lines 296-298:
// BEFORE
const completed = recommendations.filter((r) => r.status === 'completed').length;

// AFTER
const typedRecommendations = recommendations as RecommendationRow[];
const completed = typedRecommendations.filter((r) => r.status === 'completed').length;
```

---

## assessmentService.ts (8 remaining errors)

### Error 1 | Line 121 | Type Casting
**Type:** `Conversion of type 'SelectQueryError' to type 'Assessment' may be a mistake`

**Location:** Function return

**Fix:**
```typescript
// Pattern: Assess context around line 121
// If error check exists, use assertion
// If not, add error check first

const assessment = data as unknown as Assessment;  // Double cast for safety
// OR better:
if (error) throw new DatabaseError(...);
return data as Assessment;
```

---

### Error 2 | Line 138 | Property Mismatch
**Type:** `Type 'SelectQueryError' missing Assessment properties`

**Location:** Complex object construction

**Fix:** Add type guard/assertion before using individual properties

---

### Errors 3-4 | Lines 189, 203 | Array Type
**Type:** `Type 'SelectQueryError[]' not assignable to 'Assessment[]'`

**Location:** Return values

**Fix:**
```typescript
// BEFORE
return data;  // Type includes error possibility

// AFTER
return (data as Assessment[]) || [];
```

---

### Error 5 | Line 224 | Type Casting
**Type:** `Conversion may be a mistake`

**Location:** Similar to Error 1

**Fix:** Add error check before assertion

---

### Error 6 | Line 406 | ID Property
**Type:** `Property 'id' does not exist on SelectQueryError`

**Location:** Property access

**Fix:**
```typescript
const assessment = data as Assessment;
const id = assessment.id;
```

---

### Error 7 | Line 521 | ID Property
**Type:** `Property 'id' does not exist on SelectQueryError`

**Location:** Same pattern as Error 6

---

### Error 8 | Line 531, 580 | Type Issues
**Type:** `Conversion may be a mistake / spread on non-object`

**Location:** Return type and spread operation

**Fix:**
```typescript
// For line 531:
return data as Assessment;

// For line 580:
// Ensure spread target is object type before using ...
const baseObject = data as BaseType;
return { ...baseObject, ...additionalProps };
```

---

## userService.ts (8 remaining errors)

### Error 1 | Line 49 | Type Mismatch
**Type:** `Type 'SelectQueryError' missing UserProfile properties`

**Location:** Return statement

**Fix:**
```typescript
// Check if error handling exists
if (error) throw new DatabaseError('...', error);

// Add assertion
return data as UserProfile;
```

---

### Error 2 | Line 90 | Type Casting
**Type:** `Conversion to UserProfile may be a mistake`

**Location:** Function return

**Fix:** Same pattern - add error check then assertion

---

### Error 3 | Line 111 | Enum Validation
**Type:** `Argument of type 'string' not assignable to UserRole enum`

**Location:** updateUserRole() function

**Fix:**
```typescript
// BEFORE
export async function updateUserRole(userId: string, role: string) {

// AFTER
import { isValidUserRole } from '../types/enums.js';

export async function updateUserRole(userId: string, role: string) {
  if (!isValidUserRole(role)) {
    throw new ValidationError(`Invalid role: ${role}`);
  }
```

---

### Error 4 | Line 175 | Type Conversion
**Type:** `Conversion to UserProfile may be a mistake`

**Location:** Similar to Error 1

**Fix:** Add error check and assertion

---

### Errors 5-6 | Lines 304, 315 | .count() Method
**Type:** `Property 'count' does not exist on 'PostgrestFilterBuilder'`

**Location:** Query building

**Fix:**
```typescript
// BEFORE
const { data: bilans, error: bilansError } = await supabase
  .from('bilans')
  .select('id')
  .or(`beneficiary_id.eq.${userId},consultant_id.eq.${userId}`)
  .count('exact');  // ❌ .count() is NOT a method

// AFTER
const { data: bilans, count, error: bilansError } = await supabase
  .from('bilans')
  .select('id', { count: 'exact' })  // ✅ count is an option, not method
  .or(`beneficiary_id.eq.${userId},consultant_id.eq.${userId}`);

// Now 'count' is available in response instead of calling .count()
```

---

### Errors 7-8 | Lines 322-330 | Multiple Property Access
**Type:** `Property 'id'/'email'/'full_name'/'role'/'last_login_at'/'email_verified_at'/'created_at' does not exist`

**Location:** User object construction from query result

**Fix:**
```typescript
// BEFORE (lines 322-330)
return {
  id: user.id,  // ❌ user is SelectQueryError union
  email: user.email,
  ...

// AFTER - Add assertion at start
const typedUser = user as UserRow;
return {
  id: typedUser.id,  // ✅ Safe
  email: typedUser.email,
  ...
};
```

---

## scheduling.ts (String Array Errors)

### Errors at Lines 171, 204, 259, 451, 483 | String Array vs String
**Type:** `Argument of type 'string[]' not assignable to parameter of type 'string'`

**Location:** .filter() calls with 'in' operator

**Fix:**
```typescript
// BEFORE
const consultantIds: string[] = [id1, id2, id3];
.filter('consultant_id', 'in', consultantIds);  // ❌ Expects string

// AFTER
const consultantIds: string[] = [id1, id2, id3];
.filter('consultant_id', 'in', consultantIds.join(','));  // ✅ CSV string

// OR use array-aware filter method if available:
.filter('consultant_id', 'in', `(${consultantIds.join(',')})`);
```

**Note:** The Supabase filter 'in' operator expects a comma-separated string, not an array

---

## Other Services (Quick Fixes)

### emailVerification.ts (3 errors)
- Lines 98, 118: Property access on SelectQueryError
- **Fix:** Add `as TokenType` assertions

### passwordReset.ts (3 errors)
- Lines 124, 148, 193: Property access on SelectQueryError
- **Fix:** Add `as TokenType` assertions

### csvService.ts (2 errors)
- Lines 203-204: Property access
- **Fix:** Add `as TypeName` assertions

### fileService.ts (2 errors)
- Lines 76, 175: Type casting
- **Fix:** Add error checks then assertions

### notificationService.ts (2 errors)
- Lines 58, 135: Type casting
- **Fix:** Add error checks then assertions

---

## Summary of Fix Patterns

| Pattern | Files Affected | Count | Time |
|---------|---|---|---|
| Add `.as TypeName` assertion | 15+ | ~60 | 2h |
| Add error check before property access | 10+ | ~20 | 1h |
| Add `.join(',')` to array parameters | 2 | ~6 | 15m |
| Fix `.count()` method → select option | 1 | 2 | 10m |
| Add enum validation | 2 | 2 | 10m |
| Fix import paths | 4 | 4 | 5m |
| Fix test framework | 1 | 1 | 2m |
| Fix generic type constraint | 1 | 1 | 5m |
| **TOTAL** | **~20** | **~114** | **4h 30m** |

---

## Execution Tips

1. **Start with schedulingService.ts** - Well-documented first error shows pattern
2. **Use find & replace** for repetitive fixes (e.g., all `return data` → `return data as TypeName`)
3. **Test after each file** - Run `npm run type-check | grep filename.ts`
4. **Group similar errors** - Fix all "property access" errors in one file before moving to next
5. **Import statements** - Add once per file, then use helpers throughout

---

**Document Version:** 1.0
**Last Updated:** 2025-10-23
**Estimated Completion:** 4.5 hours from this baseline
