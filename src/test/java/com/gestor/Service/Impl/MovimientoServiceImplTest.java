package com.gestor.Service.Impl;

import com.gestor.support.InMemoryRepositories;
import com.gestorBackend.Model.Activo;
import com.gestorBackend.Model.Cartera;
import com.gestorBackend.Model.Enum.TipoActivo;
import com.gestorBackend.Repository.ActivoRepository;
import com.gestorBackend.Repository.CarteraRepository;
import com.gestorBackend.Repository.MovimientoRepository;
import com.gestorBackend.Service.Impl.MovimientoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MovimientoServiceImplTest {

    private Map<Long, Cartera> carteraStore;
    private Map<Long, Activo> activoStore;
    private AtomicLong carteraSequence;
    private AtomicLong activoSequence;
    private MovimientoServiceImpl service;

    @BeforeEach
    void setUp() {
        carteraStore = new LinkedHashMap<>();
        activoStore = new LinkedHashMap<>();
        carteraSequence = new AtomicLong(0);
        activoSequence = new AtomicLong(0);

        CarteraRepository carteraRepository = InMemoryRepositories.carteraRepository(carteraStore, carteraSequence);
        ActivoRepository activoRepository = InMemoryRepositories.activoRepository(activoStore, activoSequence);
        MovimientoRepository movimientoRepository = InMemoryRepositories.movimientoRepository();

        org.springframework.transaction.PlatformTransactionManager transactionManager = new org.springframework.transaction.support.AbstractPlatformTransactionManager() {
            @Override
            protected Object doGetTransaction() { return new Object(); }
            @Override
            protected void doBegin(Object transaction, org.springframework.transaction.TransactionDefinition definition) {}
            @Override
            protected void doCommit(org.springframework.transaction.support.DefaultTransactionStatus status) {}
            @Override
            protected void doRollback(org.springframework.transaction.support.DefaultTransactionStatus status) {}
        };

        service = new MovimientoServiceImpl(carteraRepository, activoRepository, movimientoRepository, transactionManager);
    }

    @Test
    @DisplayName("Ejecuta dos transferencias desde cartera 50 (activo 61) hacia cartera 54 (activo 77 y nuevo activo) en memoria")
    void transferirBalanceDebeEjecutarDosTransferenciasDesdeCartera50Hacia54() {
        carteraStore.put(50L, new Cartera(50L, "Cartera 50", "Origen", LocalDateTime.now()));
        carteraStore.put(54L, new Cartera(54L, "Cartera 54", "Destino", LocalDateTime.now()));

        activoStore.put(61L, new Activo(61L, 50L, "EUR", TipoActivo.FIAT, new BigDecimal("100"), LocalDateTime.now()));
        activoStore.put(77L, new Activo(77L, 54L, "EUR_77", TipoActivo.FIAT, new BigDecimal("20"), LocalDateTime.now()));

        // 1. Primera transferencia: 10€ hacia activo existente 77
        service.transferirBalance(
                50L,
                54L,
                61L,
                77L,
                new BigDecimal("10"),
                new BigDecimal("10"),
                null,
                null
        );

        // 2. Segunda transferencia: 11€ hacia un nuevo activo
        service.transferirBalance(
                50L,
                54L,
                61L,
                null,
                new BigDecimal("11"),
                new BigDecimal("11"),
                "EUR_NUEVO",
                TipoActivo.FIAT
        );

        // Verificaciones
        assertThat(activoStore.get(61L).getBalance()).isEqualByComparingTo("79"); // 100 - 21 = 79
        assertThat(activoStore.get(77L).getBalance()).isEqualByComparingTo("30"); // 20 + 10 = 30
        assertThat(activoStore.values())
                .anySatisfy(activo -> {
                    assertThat(activo.getIdCartera()).isEqualTo(54L);
                    assertThat(activo.getNombreActivo()).isEqualTo("EUR_NUEVO");
                    assertThat(activo.getTipoActivo()).isEqualTo(TipoActivo.FIAT);
                    assertThat(activo.getBalance()).isEqualByComparingTo("11");
                });
    }

    @Test
    @DisplayName("Verifica que la transferencia descuenta y suma en activos existentes")
    void transferirBalanceDebeMoverSaldoEntreActivosExistentes() {
        carteraStore.put(1L, new Cartera(1L, "Origen", "", LocalDateTime.now()));
        carteraStore.put(2L, new Cartera(2L, "Destino", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 1L, "BTC", TipoActivo.CRYPTO, new BigDecimal("100"), LocalDateTime.now()));
        activoStore.put(20L, new Activo(20L, 2L, "ETH", TipoActivo.CRYPTO, new BigDecimal("50"), LocalDateTime.now()));

        service.transferirBalance(
                1L,
                2L,
                10L,
                20L,
                new BigDecimal("25"),
                new BigDecimal("30"),
                "NuevoActivo",
                TipoActivo.FIAT
        );

        assertThat(activoStore.get(10L).getBalance()).isEqualByComparingTo("75");
        assertThat(activoStore.get(20L).getBalance()).isEqualByComparingTo("80");
        assertThat(activoStore).hasSize(2);
    }

    @Test
    @DisplayName("Verifica que se crea un activo nuevo si el destino no existe")
    void transferirBalanceDebeCrearUnActivoNuevoSiElDestinoNoExiste() {
        carteraStore.put(1L, new Cartera(1L, "Origen", "", LocalDateTime.now()));
        carteraStore.put(2L, new Cartera(2L, "Destino", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 1L, "BTC", TipoActivo.CRYPTO, new BigDecimal("100"), LocalDateTime.now()));

        service.transferirBalance(
                1L,
                2L,
                10L,
                null,
                new BigDecimal("40"),
                new BigDecimal("35"),
                "USD",
                TipoActivo.FIAT
        );

        assertThat(activoStore.get(10L).getBalance()).isEqualByComparingTo("60");
        assertThat(activoStore.values())
                .anySatisfy(activo -> {
                    assertThat(activo.getIdCartera()).isEqualTo(2L);
                    assertThat(activo.getNombreActivo()).isEqualTo("USD");
                    assertThat(activo.getTipoActivo()).isEqualTo(TipoActivo.FIAT);
                    assertThat(activo.getBalance()).isEqualByComparingTo("35");
                });
    }

    @Test
    @DisplayName("Verifica que falla si el activo origen no pertenece a la cartera origen")
    void transferirBalanceDebeFallarSiActivoOrigenNoPerteneceACarteraOrigen() {
        carteraStore.put(1L, new Cartera(1L, "Origen", "", LocalDateTime.now()));
        carteraStore.put(2L, new Cartera(2L, "Destino", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 999L, "BTC", TipoActivo.CRYPTO, new BigDecimal("100"), LocalDateTime.now()));

        assertThatThrownBy(() -> service.transferirBalance(
                1L,
                2L,
                10L,
                null,
                new BigDecimal("10"),
                new BigDecimal("10"),
                "USD",
                TipoActivo.FIAT
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessage("El activo con id 10 no existe en la cartera con id 1");
    }

    @Test
    @DisplayName("Verifica que falla si la cartera origen no existe")
    void transferirBalanceDebeFallarSiLaCarteraOrigenNoExiste() {
        carteraStore.put(2L, new Cartera(2L, "Destino", "", LocalDateTime.now()));

        assertThatThrownBy(() -> service.transferirBalance(
                1L,
                2L,
                10L,
                20L,
                new BigDecimal("10"),
                new BigDecimal("10"),
                "Nuevo",
                TipoActivo.FIAT
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessage("La cartera con id 1 no existe");
    }

    @Test
    @DisplayName("Verifica que falla si la cartera destino no existe")
    void transferirBalanceDebeFallarSiLaCarteraDestinoNoExiste() {
        carteraStore.put(1L, new Cartera(1L, "Origen", "", LocalDateTime.now()));

        assertThatThrownBy(() -> service.transferirBalance(
                1L,
                2L,
                10L,
                20L,
                new BigDecimal("10"),
                new BigDecimal("10"),
                "Nuevo",
                TipoActivo.FIAT
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessage("La cartera con id 2 no existe");
    }

    @Test
    @DisplayName("Verifica que falla si el activo origen no existe")
    void transferirBalanceDebeFallarSiElActivoOrigenNoExiste() {
        carteraStore.put(1L, new Cartera(1L, "Origen", "", LocalDateTime.now()));
        carteraStore.put(2L, new Cartera(2L, "Destino", "", LocalDateTime.now()));

        assertThatThrownBy(() -> service.transferirBalance(
                1L,
                2L,
                10L,
                20L,
                new BigDecimal("10"),
                new BigDecimal("10"),
                "Nuevo",
                TipoActivo.FIAT
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessage("El activo con id 10 no existe");
    }

    @Test
    @DisplayName("Verifica que falla si el saldo disponible es insuficiente")
    void transferirBalanceDebeFallarSiElBalanceEsInsuficiente() {
        carteraStore.put(1L, new Cartera(1L, "Origen", "", LocalDateTime.now()));
        carteraStore.put(2L, new Cartera(2L, "Destino", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 1L, "BTC", TipoActivo.CRYPTO, new BigDecimal("5"), LocalDateTime.now()));

        assertThatThrownBy(() -> service.transferirBalance(
                1L,
                2L,
                10L,
                20L,
                new BigDecimal("10"),
                new BigDecimal("10"),
                "Nuevo",
                TipoActivo.FIAT
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessage("El balance del activo con id 10 es insuficiente para la transferencia");
    }

    @Test
    @DisplayName("Verifica que falla si se intenta transferir un activo hacia sí mismo en la misma cartera")
    void transferirBalanceDebeFallarSiSeTransfiereAlMismoActivoEnMismaCartera() {
        carteraStore.put(1L, new Cartera(1L, "Origen", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 1L, "EUR", TipoActivo.FIAT, new BigDecimal("100"), LocalDateTime.now()));

        assertThatThrownBy(() -> service.transferirBalance(
                1L,
                1L,
                10L,
                10L,
                new BigDecimal("10"),
                new BigDecimal("10"),
                null,
                null
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessage("No se puede transferir un activo hacia sí mismo en la misma cartera");
    }

    @Test
    @DisplayName("Verifica que ingresarBalance suma la cantidad correctamente")
    void ingresarBalanceSumaCantidadCorrectamente() {
        carteraStore.put(1L, new Cartera(1L, "Mi Cartera", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 1L, "EUR", TipoActivo.FIAT, new BigDecimal("100"), LocalDateTime.now()));

        service.ingresarBalance(1L, 10L, new BigDecimal("50"));

        assertThat(activoStore.get(10L).getBalance()).isEqualByComparingTo("150");
    }

    @Test
    @DisplayName("Verifica que gastarBalance resta la cantidad correctamente")
    void gastarBalanceRestaCantidadCorrectamente() {
        carteraStore.put(1L, new Cartera(1L, "Mi Cartera", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 1L, "EUR", TipoActivo.FIAT, new BigDecimal("100"), LocalDateTime.now()));

        service.gastarBalance(1L, 10L, new BigDecimal("30"));

        assertThat(activoStore.get(10L).getBalance()).isEqualByComparingTo("70");
    }

    @Test
    @DisplayName("Verifica que gastarBalance elimina el activo si el saldo llega a cero")
    void gastarBalanceEliminaActivoSiSaldoCero() {
        carteraStore.put(1L, new Cartera(1L, "Mi Cartera", "", LocalDateTime.now()));
        activoStore.put(10L, new Activo(10L, 1L, "EUR", TipoActivo.FIAT, new BigDecimal("100"), LocalDateTime.now()));

        service.gastarBalance(1L, 10L, new BigDecimal("100"));

        assertThat(activoStore.containsKey(10L)).isFalse();
    }
}