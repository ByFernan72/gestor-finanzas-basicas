package com.gestorBackend.Dto.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarteraTopRequestDto {
    @NotNull
    @Positive
    private Long idCartera;
    private String nombreCartera;
    private BigDecimal totalCartera;

    public BigDecimal getTotalCartera() {
        return totalCartera == null ? BigDecimal.ZERO : totalCartera;
    }
}