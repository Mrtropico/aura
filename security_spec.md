# L'Atelier - Security Specification

## 1. Data Invariants
- A profile must belong to a user and have a `user_type`.
- Artworks, Finances, and Sales must be linked to the profile of the authenticated creator.
- Members belong exclusively to an Association.
- Only an Association can invite an Artist to a Membership, and only that Artist can respond.

## 2. Global Safety Helpers
```javascript
function isSignedIn() { return request.auth != null; }
function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); }
function incoming() { return request.resource.data; }
function existing() { return resource.data; }
```

## 3. The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a profile with someone else's UID.
2. Modifying the `user_type` of a profile after creation.
3. Reading someone else's financial records.
4. Creating an artwork for a profile ID different from the auth UID.
5. Deleting a member record belonging to another association.
6. A user marking themselves as `email_verified` via client SDK (not possible but rules must ignore it).
7. Updating a sale amount after it's been recorded (immutability check).
8. Injecting a 1MB string into an artwork title.
9. An artist adding themselves to an association without an invitation.
10. Reading another association's member list.
11. Updating `createdAt` field on any document.
12. Creating a finance record with a negative amount (if not intended).

## 4. Resource Rules
- `profiles/{uid}`: Allow read if signed in. Allow write if isOwner(uid).
- `artworks/{id}`: Allow read if isOwner(existing().profile_id). Allow write if isOwner(incoming().profile_id).
- `members/{id}`: Allow read/write if isOwner(existing/incoming().association_id).
- `finances/{id}`: Allow read/write if isOwner(existing/incoming().profile_id).
- `sales/{id}`: Allow read/write if isOwner(existing/incoming().profile_id).
- `memberships/{id}`: Allow read if involved. Allow write with tiered actor check.
