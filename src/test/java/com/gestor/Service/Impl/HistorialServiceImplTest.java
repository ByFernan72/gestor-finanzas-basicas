package com.gestor.Service.Impl;

import com.gestorBackend.Model.Activo;
import com.gestorBackend.Model.Config;
import com.gestorBackend.Model.Enum.TipoActivo;
import com.gestorBackend.Model.Historial;
import com.gestorBackend.Repository.ActivoRepository;
import com.gestorBackend.Repository.ConfigRepository;
import com.gestorBackend.Repository.HistorialRepository;
import com.gestor.support.InMemoryRepositories;
import com.gestorBackend.Service.Impl.HistorialServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class HistorialServiceImplTest {

    private Map<Long, Activo> activoStore;
    private Map<Long, Historial> historialStore;
    private AtomicLong activoSequence;
    private AtomicLong historialSequence;
    private ConfigRepository configRepository;
    private HistorialServiceImpl service;

    @BeforeEach
    void setUp() {
        activoStore = new LinkedHashMap<>();
        historialStore = new LinkedHashMap<>();
        activoSequence = new AtomicLong(0);
        historialSequence = new AtomicLong(0);

        ActivoRepository activoRepository = InMemoryRepositories.activoRepository(activoStore, activoSequence);
        HistorialRepository historialRepository = InMemoryRepositories.historialRepository(historialStore, historialSequence);
        configRepository = mock(ConfigRepository.class);
        
        service = new HistorialServiceImpl(configRepository, historialRepository, activoRepository);
    }

    @Test
    void registrarHistorialActivosDebeGuardarUnSnapshotPorCadaActivo() {
        activoStore.put(1L, new Activo(1L, 10L, "BTC", TipoActivo.CRYPTO, new BigDecimal("100"), LocalDateTime.now()));
        activoStore.put(2L, new Activo(2L, 20L, "ETH", TipoActivo.ETF, new BigDecimal("200"), LocalDateTime.now()));

        LocalDateTime antes = LocalDateTime.now();
        service.registrarHistorialActivos();
        LocalDateTime despues = LocalDateTime.now();

        assertThat(historialStore).hasSize(2);
        assertThat(historialStore.values())
                .allSatisfy(historial -> {
                    assertThat(historial.getIdHistorial()).isNotNull();
                    assertThat(historial.getFechaHistorial()).isBetween(antes, despues);
                });
        assertThat(historialStore.values())
                .extracting(Historial::getIdActivo)
                .containsExactlyInAnyOrder(1L, 2L);
        assertThat(historialStore.values())
                .extracting(Historial::getIdCartera)
                .containsExactlyInAnyOrder(10L, 20L);
        assertThat(historialStore.values())
                .extracting(Historial::getBalance)
                .containsExactlyInAnyOrder(new BigDecimal("100"), new BigDecimal("200"));
    }

    @Test
    void registrarHistorialActivosNoDebeGuardarNadaSiNoHayActivos() {
        service.registrarHistorialActivos();

        assertThat(historialStore).isEmpty();
    }

    @Test
    void verificarRegistrarFecha_debeRegistrarSiConfigEstaVacio() {
        when(configRepository.findById("fecha_ultimo_guardado")).thenReturn(Optional.empty());
        activoStore.put(1L, new Activo(1L, 10L, "BTC", TipoActivo.CRYPTO, new BigDecimal("100"), LocalDateTime.now()));

        service.verificarRegistrarFecha();

        assertThat(historialStore).hasSize(1);
        verify(configRepository, times(1)).save(any(Config.class));
    }

    @Test
    void verificarRegistrarFecha_debeRegistrarSiEsUnMesNuevo() {
        Config oldConfig = new Config("fecha_ultimo_guardado", LocalDate.now().minusMonths(1).toString());
        when(configRepository.findById("fecha_ultimo_guardado")).thenReturn(Optional.of(oldConfig));
        activoStore.put(1L, new Activo(1L, 10L, "BTC", TipoActivo.CRYPTO, new BigDecimal("100"), LocalDateTime.now()));

        service.verificarRegistrarFecha();

        assertThat(historialStore).hasSize(1);
        verify(configRepository, times(1)).save(any(Config.class));
    }

    @Test
    void verificarRegistrarFecha_noDebeRegistrarSiEsElMismoMes() {
        Config recentConfig = new Config("fecha_ultimo_guardado", LocalDate.now().toString());
        when(configRepository.findById("fecha_ultimo_guardado")).thenReturn(Optional.of(recentConfig));
        activoStore.put(1L, new Activo(1L, 10L, "BTC", TipoActivo.CRYPTO, new BigDecimal("100"), LocalDateTime.now()));

        service.verificarRegistrarFecha();

        assertThat(historialStore).isEmpty();
        verify(configRepository, never()).save(any(Config.class));
    }
}
