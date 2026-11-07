package com.gestorBackend.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name ="movimiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @Column(name = "id_cartera_origen")
    private Long idCarteraOrigen;

    @Column(name = "id_cartera_destino")
    private Long idCarteraDestino;

    @Column(name = "id_activo_origen")
    private Long idActivoOrigen;

    @Column(name = "id_activo_destino")
    private Long idActivoDestino;

    @Column(name = "cantidad_origen")
    private BigDecimal cantidadOrigen;

    @Column(name = "cantidad_destino")
    private BigDecimal cantidadDestino;

    @Size(max = 100, message = "El nombre de la cartera origen no puede exceder los 100 caracteres")
    @Column(name = "nombre_cartera_origen", length = 255)
    private String nombreCarteraOrigen;

    @Size(max = 100, message = "El nombre de la cartera destino no puede exceder los 100 caracteres")
    @Column(name = "nombre_cartera_destino", length = 255)
    private String nombreCarteraDestino;

    @Size(max = 100, message = "El nombre del activo origen no puede exceder los 100 caracteres")
    @Column(name = "nombre_activo_origen", length = 255)
    private String nombreActivoOrigen;

    @Size(max = 100, message = "El nombre del activo destino no puede exceder los 100 caracteres")
    @Column(name = "nombre_activo_destino", length = 255)
    private String nombreActivoDestino;

    @Column(name = "fecha")
    private LocalDateTime fechaMovimiento;
}
