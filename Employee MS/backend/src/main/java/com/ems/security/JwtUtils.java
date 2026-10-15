package com.ems.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Generates a cryptographically secure secret key for JWT signing.
     * This should be called on user login to generate a unique secret per session.
     * 
     * @return A Base64-encoded 256-bit secret key
     */
    public String generateSecretKey() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] secretBytes = new byte[32]; // 256-bit secret
        secureRandom.nextBytes(secretBytes);
        return Base64.getEncoder().encodeToString(secretBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract username from token without signature validation.
     * This is useful when we need to get the username first to look up the dynamic secret.
     * 
     * Uses manual Base64URL decoding instead of JJWT's parseUnsecuredClaim which doesn't exist in 0.12.x
     */
    public String extractUsernameWithoutValidation(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token");
            }

            // Decode payload (second part of JWT)
            String payloadJson = new String(
                java.util.Base64.getUrlDecoder().decode(parts[1]), 
                StandardCharsets.UTF_8
            );

            // Simple parsing using string manipulation instead of Jackson ObjectMapper dependency
            // The payload format is: {"sub":"email@example.com","role":"ADMIN","exp":1234567890,...}
            String subValue = null;
            
            // Find "sub" value in JSON using simple string parsing
            int subStart = payloadJson.indexOf("\"sub\"");
            if (subStart >= 0) {
                int colonPos = payloadJson.indexOf(":", subStart);
                if (colonPos >= 0) {
                    int valueStart = colonPos + 1;
                    // Skip whitespace and quotes
                    while (valueStart < payloadJson.length() && 
                           (payloadJson.charAt(valueStart) == ' ' || 
                            payloadJson.charAt(valueStart) == '\"')) {
                        valueStart++;
                    }
                    int valueEnd = valueStart;
                    while (valueEnd < payloadJson.length() && 
                           payloadJson.charAt(valueEnd) != '\"') {
                        valueEnd++;
                    }
                    subValue = payloadJson.substring(valueStart, valueEnd);
                }
            }

            if (subValue == null || subValue.isBlank()) {                
                throw new IllegalArgumentException("Subject (sub) not found in JWT token");
            }

            return subValue;            
        } catch (IllegalArgumentException e2){
            throw e2;            
        }catch(Exception e){
           throw new RuntimeException("Could not extract username from token",e);        
       }
    }
    
    public String extractUsername(String token, String secret) {
        return extractClaim(token, secret, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public Date extractExpiration(String token, String secret) {
        return extractClaim(token, secret, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token, null);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract claims from token using a specific secret key (for dynamic secret validation)
     */
    public <T> T extractClaim(String token, String secret, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token, secret);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token, String secret) {
        return Jwts.parser()
                .verifyWith(getSigningKey(secret))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Check if token is expired using a specific secret
     */
    private Boolean isTokenExpired(String token, String secret) {
        return extractExpiration(token, secret).before(new Date());
    }

    /**
     * Generate token using the default static secret (for backward compatibility)
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = buildClaims(userDetails);
        return createToken(claims, userDetails.getUsername(), null);
    }

    /**
     * Generate token using a dynamic secret (per user session)
     */
    public String generateToken(UserDetails userDetails, String secretKey) {
        Map<String, Object> claims = buildClaims(userDetails);
        return createToken(claims, userDetails.getUsername(), secretKey);
    }

    private Map<String, Object> buildClaims(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", userDetails.getUsername());
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
        claims.put("role", role);
        return claims;
    }

    private String createToken(Map<String, Object> claims, String subject, String secret) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(secret))
                .compact();
    }

    /**
     * Validate token using the default static secret (for backward compatibility)
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Validate token using a dynamic secret (per user session)
     */
    public Boolean validateToken(String token, UserDetails userDetails, String secretKey) {
        final String username = extractUsername(token, secretKey);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token, secretKey));
    }

    private SecretKey getSigningKey(String secret) {
        if (secret == null || secret.isEmpty()) {
            // Fallback to default - should not be used in production
            String defaultSecret = "defaultSecretKeyForDevelopmentOnly12345678901234567890";
            byte[] keyBytes = defaultSecret.getBytes(StandardCharsets.UTF_8);
            return Keys.hmacShaKeyFor(keyBytes);
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
