package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class APIResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> APIResponse<T> success(T data) {
        return new APIResponse<>(true, "Success", data);
    }

    public static <T> APIResponse<T> success(String message, T data) {
        return new APIResponse<>(true, message, data);
    }

    public static <T> APIResponse<T> error(String message) {
        return new APIResponse<>(false, message, null);
    }
}
