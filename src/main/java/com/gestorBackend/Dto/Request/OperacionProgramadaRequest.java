package com.gestorBackend.Dto.Request;

import com.gestorBackend.Model.Enum.TipoOperacion;
import com.gestorBackend.Model.Enum.TipoTimeFrame;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.web.bind.annotation.PostMapping;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OperacionProgramadaRequest {

    // Puede ser null si es un ingreso directo a una cartera en vez de transferencia entre carteras
    @Positive
    private Long idCarteraOrigen;

    @NotNull(message = "El id de cartera es obligatorio")
    @Positive
    private Long idCarteraDestino;

    // Puede ser null si es un ingreso general sin activo asociado
    @Positive
    private Long idActivoOrigen;

    // Puede ser null si queremos que se auto-genere el activo por defecto
    @Positive
    private Long idActivoDestino;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;

    @Enumerated(EnumType.STRING)
    private TipoOperacion tipoOperacion;

    private String concepto;

    @NotNull(message = "El time frame es obligatorio")
    private TipoTimeFrame tipoTimeFrame;


    @NotNull(message = "La fecha de inicio (próxima ejecución) es obligatoria")
    private LocalDateTime proximaEjecucion;
}
