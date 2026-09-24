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
public class CarteraListadoRequestDto {
    @NotNull
    @Positive
    private Long idCartera;
    private String nombreCartera;
    private String descripcion;
    private BigDecimal totalCartera;
    private Long totalActivosCartera;

    public BigDecimal getTotalCartera() {
        // Si totalCartera es nulo. Devuelve BigDecimal con valor 0 si no totalCartera
        return totalCartera == null ? BigDecimal.ZERO : totalCartera;
    }
}
