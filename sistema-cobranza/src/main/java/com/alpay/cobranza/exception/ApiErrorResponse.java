package com.alpay.cobranza.exception;

import java.time.OffsetDateTime;

public record ApiErrorResponse(
        int status,
        String code,
        String message,
        Object details,
        String path,
        String timestamp
) {
    public static ApiErrorResponse of(int status, String code, String message, Object details, String path) {
        return new ApiErrorResponse(
                status,
                code,
                message,
                details,
                path,
                OffsetDateTime.now().toString()
        );
    }
}
