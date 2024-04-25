package com.chilbaeksan.mokaknyang.exception;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex){
        return ResponseEntity.status(ex.getErrorCode().getResultCode())
                .body(new ErrorResponse(ex.getErrorCode().getResultCode(), ex.getErrorCode().getMessage()));
    }
}
