package com.ferticare.ferticareback.common.config;

import com.ferticare.ferticareback.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                403,
                "Forbidden",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(403).body(error);
    }
}