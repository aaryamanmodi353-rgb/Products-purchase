package com.example.ecommerce.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatusCode status = ex.getStatusCode();
        String detail = ex.getReason() == null ? "The request could not be completed" : ex.getReason();
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(HttpStatus.valueOf(status.value()).getReasonPhrase());
        problem.setProperty("message", detail);
        return ResponseEntity.status(status).body(problem);
    }

    // Handle @Valid validation failures → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
        problem.setTitle("Validation failed");
        problem.setProperty("message", message);
        return ResponseEntity.badRequest().body(problem);
    }

    // Handle invalid enum values (e.g., bad paymentMethod string) → 400
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> handleBadRequest(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {
        String message = "Invalid request body";
        if (ex.getMessage() != null && ex.getMessage().contains("PaymentMethod")) {
            message = "Invalid payment method. Accepted values: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, CASH_ON_DELIVERY";
        }
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
        problem.setTitle("Bad request");
        problem.setProperty("message", message);
        return ResponseEntity.badRequest().body(problem);
    }

    // Handle all RuntimeExceptions from service layer → 400
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ProblemDetail> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage() == null ? "Request failed" : ex.getMessage();
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
        problem.setTitle("Request failed");
        problem.setProperty("message", message);
        return ResponseEntity.badRequest().body(problem);
    }
}
