# Fix JWT Authentication Issues - TODO List

## Backend Fixes:
- [ ] 1. Fix JwtUtils.java - Replace extractUsernameWithoutValidation() with manual Base64URL decode
- [ ] 2. Fix JwtAuthenticationFilter.java - Add shouldNotFilter() and null/undefined handling
- [ ] 3. Update JwtUtils.java - Add email/role/userId claims to JWT generation

## Frontend Fixes:
- [ ] 4. Fix api.js - Validate token before adding Authorization header
- [ ] 5. Fix AuthContext.jsx - Validate token and check expiration

## Testing:
- [ ] 6. Clean rebuild - Delete backend/target/ and rebuild
