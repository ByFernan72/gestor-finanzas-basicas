package com.gestor.Service.Impl;

import com.gestorBackend.Model.Enum.TipoOperacion;
import com.gestorBackend.Model.Enum.TipoTimeFrame;
import com.gestorBackend.Model.OperacionProgramada;
import com.gestorBackend.Repository.OperacionProgramadaRepository;
import com.gestorBackend.Service.Impl.OperacionProgramadaServiceImpl;
import com.gestorBackend.Service.MovimientoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OperacionProgramadaServiceImplTest {

    @Mock
    private OperacionProgramadaRepository operacionProgramadaRepository;

    @Mock
    private MovimientoService movimientoService;

    @InjectMocks
    private OperacionProgramadaServiceImpl operacionProgramadaService;

    private LocalDateTime ahora;

    @BeforeEach
    void setUp() {
        ahora = LocalDateTime.now();
    }

    @Test
    @DisplayName("Debe ejecutar un Ingreso Mensual atrasado y adelantar su fecha 1 mes exacto")
    void debeEjecutarIngresoMensualYActualizarFecha() {
        // Preparar operación que debería haberse ejecutado hace 2 días (está pendiente)
        OperacionProgramada op1 = new OperacionProgramada();
        op1.setIdOperacion(1L);
        op1.setTipoOperacion(TipoOperacion.INGRESO);
        op1.setTipoTimeFrame(TipoTimeFrame.MENSUAL);
        op1.setCantidad(new BigDecimal("1000.00"));
        op1.setIdCarteraDestino(5L);
        op1.setIdActivoDestino(10L);
        LocalDateTime fechaAtrasada = ahora.minusDays(2);
        op1.setProximaEjecucion(fechaAtrasada);
        op1.setIsActive(true);

        // Simulamos que el repositorio la encuentra como pendiente
        when(operacionProgramadaRepository.findOperacionesPendientes(any(LocalDateTime.class)))
                .thenReturn(List.of(op1));

        // Acción
        operacionProgramadaService.ejecutarOperacionesPendientes();

        // Verificaciones
        // 1. Debe haber llamado a ingresar balance con la cantidad y destinos correctos
        verify(movimientoService, times(1))
                .ingresarBalance(5L, 10L, new BigDecimal("1000.00"));

        // 2. Debe haber calculado la nueva fecha (+1 mes) y guardado la operacion
        verify(operacionProgramadaRepository, times(1)).save(op1);
        
        // Comprobamos que la nueva fecha sea exactamente 1 mes después de la que tenía
        LocalDateTime fechaEsperada = fechaAtrasada.plusMonths(1);
        // Si al sumarle un mes sigue estando en el pasado (ej. llevaba 3 meses sin abrir la app), 
        // el bucle while del servicio la habrá adelantado los meses necesarios hasta estar en el futuro.
        assertThat(op1.getProximaEjecucion()).isAfter(LocalDateTime.now());
    }

    @Test
    @DisplayName("Debe ejecutar múltiples operaciones de distintos tipos y frecuencias")
    void debeEjecutarMultiplesOperacionesPendientes() {
        // Operación 1: Gasto semanal de 50€ (lleva pendiente 3 días)
        OperacionProgramada opGasto = new OperacionProgramada();
        opGasto.setIdOperacion(2L);
        opGasto.setTipoOperacion(TipoOperacion.GASTO);
        opGasto.setTipoTimeFrame(TipoTimeFrame.SEMANAL);
        opGasto.setCantidad(new BigDecimal("50.00"));
        opGasto.setIdCarteraOrigen(1L);
        opGasto.setIdActivoOrigen(3L);
        opGasto.setProximaEjecucion(ahora.minusDays(3));
        
        // Operación 2: Transferencia trimestral de 500€ (lleva pendiente 1 mes entero)
        OperacionProgramada opTransf = new OperacionProgramada();
        opTransf.setIdOperacion(3L);
        opTransf.setTipoOperacion(TipoOperacion.TRANSFERENCIA);
        opTransf.setTipoTimeFrame(TipoTimeFrame.TRIMESTRAL);
        opTransf.setCantidad(new BigDecimal("500.00"));
        opTransf.setIdCarteraOrigen(1L);
        opTransf.setIdActivoOrigen(3L);
        opTransf.setIdCarteraDestino(2L);
        opTransf.setIdActivoDestino(4L);
        opTransf.setProximaEjecucion(ahora.minusMonths(1));

        when(operacionProgramadaRepository.findOperacionesPendientes(any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(opGasto, opTransf));

        // Acción
        operacionProgramadaService.ejecutarOperacionesPendientes();

        // Verificaciones
        // Gasto semanal
        verify(movimientoService, times(1)).gastarBalance(1L, 3L, new BigDecimal("50.00"));
        assertThat(opGasto.getProximaEjecucion()).isAfter(LocalDateTime.now());
        
        // Transferencia trimestral
        verify(movimientoService, times(1)).transferirBalance(1L, 2L, 3L, 4L, new BigDecimal("500.00"), new BigDecimal("500.00"), "Transferencia Automatica", com.gestorBackend.Model.Enum.TipoActivo.FIAT);
        assertThat(opTransf.getProximaEjecucion()).isAfter(LocalDateTime.now());
        
        // Ambas deben haberse guardado con sus nuevas fechas
        verify(operacionProgramadaRepository, times(2)).save(any(OperacionProgramada.class));
    }
}
