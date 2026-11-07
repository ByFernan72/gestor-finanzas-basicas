package com.gestorBackend.Model;

import com.gestorBackend.Model.Enum.TipoOperacion;
import com.gestorBackend.Model.Enum.TipoTimeFrame;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name ="operacion_programada")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperacionProgramada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Positive
    @Column(name = "id_operacion")
    private Long idOperacion;

    @Positive
    @Column(name = "id_cartera_origen")
    private Long idCarteraOrigen;

    @Positive
    @NotNull(message = "La cartera de destino debe ser valida para realizar la operación")
    @Column(name = "id_cartera_destino")
    private Long idCarteraDestino;

    @Positive
    @Column(name = "id_activo_origen")
    private Long idActivoOrigen;

    @Column(name = "id_activo_destino")
    private Long idActivoDestino;

    @NotNull(message = "La cantidad destino es obligatoria")
    @Positive(message = "La cantidad destino debe ser mayor a 0")
    @Column(name = "cantidad")
    private BigDecimal cantidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_operacion")
    private TipoOperacion tipoOperacion;

    @Column(name = "concepto")
    private String concepto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_time_frame")
    private TipoTimeFrame tipoTimeFrame;

    @Column(name = "proxima_ejecucion ")
    private LocalDateTime proximaEjecucion ;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
