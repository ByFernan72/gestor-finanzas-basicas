package com.gestorBackend.Dto.Request;

import com.gestorBackend.Model.Enum.TipoActivo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObtenerDatosCompletosCarteraRequestDto {
    @NotNull
    @Positive
    private Long idCartera;

    @NotBlank
    private String nombreCartera;
    private String descripcion;
    private LocalDateTime createdAt;
    List<ObtenerDatosCompletosCarteraRequestDto.ObtenerDatosCompletosActivoDto> activos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ObtenerDatosCompletosActivoDto {
        private Long idActivo;
        @NotBlank
        private String nombreActivo;
        private TipoActivo tipoActivo;

        @NotNull
        @Positive
        private BigDecimal balance;
        private LocalDateTime fechaObtencionActivo;
    }

}
