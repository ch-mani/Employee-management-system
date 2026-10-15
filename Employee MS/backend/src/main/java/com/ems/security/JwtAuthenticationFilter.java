package com.ems.security;

import com.ems.entity.User;
import com.ems.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import static java.rmi.server.LogStream.log;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);
            
            // Ignore garbage tokens like "null" or "undefined"
            if ("null".equalsIgnoreCase(jwt) || "undefined".equalsIgnoreCase(jwt)) {
                filterChain.doFilter(request, response);
                return;
            }
            
            if (StringUtils.hasText(jwt)) {
                // Extract username without validation first (username is in the token payload)
                String username = jwtUtils.extractUsernameWithoutValidation(jwt);
                log.debug("Extracted username from token: {}", username);
                
                // First try to get user details
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                if (userDetails != null) {
                    // Get the user from database to fetch the dynamic jwtSecret
                    Optional<User> userOpt = userRepository.findByEmail(username);
                    
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        String storedSecret = user.getJwtSecret();
                        
                        if (storedSecret != null && !storedSecret.isEmpty()) {
                            log.debug("Using dynamic jwtSecret for user: {}", username);
                            // Validate using the dynamic secret from the user record
                            if (jwtUtils.validateToken(jwt, userDetails, storedSecret)) {
                                setAuthentication(userDetails, request);
                                log.debug("Token validated successfully with dynamic secret for user: {}", username);
                            } else {
                                log.warn("Token validation failed with dynamic secret for user: {}", username);
                            }
                        } else {
                            // No dynamic secret stored - this user needs to log in again
                            // to generate a new dynamic secret
                            log.warn("No jwtSecret found for user: {}. User needs to log in again.", username);
                            // We don't fallback to default validation anymore since it won't work
                            // Instead, we force the user to log in again
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }
        filterChain.doFilter(request, response);
    }

    private void setAuthentication(UserDetails userDetails, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Skip JWT filter for auth endpoints to prevent login issues
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
return path.startsWith("/api/auth/");
    }
}
