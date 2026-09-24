package com.gestorBackend.Service.Impl;

import com.gestorBackend.Dto.TransferenciaDto;
import com.gestorBackend.Model.Activo;
import com.gestorBackend.Model.Enum.TipoActivo;
import com.gestorBackend.Model.Movimiento;
import com.gestorBackend.Repository.ActivoRepository;
import com.gestorBackend.Repository.CarteraRepository;
import com.gestorBackend.Repository.MovimientoRepository;
import com.gestorBackend.Service.MovimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Validated
@RequiredArgsConstructor
public class MovimientoServiceImpl implements MovimientoService {

    private final CarteraRepository carteraRepository;
    private final ActivoRepository activoRepository;
    private final MovimientoRepository movimientoRepository;
    private final PlatformTransactionManager transactionManager;


    private final Object transferLock = new Object();

    @Override
    public void transferirBalance(Long idCarteraOrigen, Long idCarteraDestino, Long idActivoOrigen, Long idActivoDestino, BigDecimal cantidadOrigen, BigDecimal cantidadDestino, String nombreNuevoActivo, TipoActivo tipoNuevoActivo) {
        synchronized (transferLock) {
            new TransactionTemplate(transactionManager).execute(status -> {
                if (!carteraRepository.existsByIdCartera(idCarteraOrigen)) {
                    throw new IllegalArgumentException("La cartera con id " + idCarteraOrigen + " no existe");
                }
                if (!carteraRepository.existsByIdCartera(idCarteraDestino)) {
                    throw new IllegalArgumentException("La cartera con id " + idCarteraDestino + " no existe");
                }

                if (!activoRepository.existsByIdActivo(idActivoOrigen)) {
                    throw new IllegalArgumentException("El activo con id " + idActivoOrigen + " no existe");
                }

                Activo activoOrigen = activoRepository.getActivoByIdActivo(idActivoOrigen);

                if (!activoOrigen.getIdCartera().equals(idCarteraOrigen)) {
                    throw new IllegalArgumentException("El activo con id " + idActivoOrigen + " no existe en la cartera con id " + idCarteraOrigen);
                }

                if (activoOrigen.getBalance().compareTo(cantidadOrigen) < 0) {
                    throw new IllegalArgumentException("El balance del activo con id " + idActivoOrigen + " es insuficiente para la transferencia");
                }

                if (idCarteraOrigen.equals(idCarteraDestino) && idActivoOrigen.equals(idActivoDestino)) {
                    throw new IllegalArgumentException("No se puede transferir un activo hacia sí mismo en la misma cartera");
                }

                String nombreCarteraOrigen = carteraRepository.getCarteraByIdCartera(idCarteraOrigen).getNombreCartera();
                String nombreCarteraDestino = carteraRepository.getCarteraByIdCartera(idCarteraDestino).getNombreCartera();
                String nombreActivoOrigen = activoOrigen.getNombreActivo();
                String nombreActivoDestino;

                BigDecimal balanceRestante = activoOrigen.getBalance().subtract(cantidadOrigen);
                if (balanceRestante.compareTo(BigDecimal.ZERO) <= 0) {
                    activoRepository.delete(activoOrigen);
                } else {
                    activoOrigen.setBalance(balanceRestante);
                    activoRepository.saveAndFlush(activoOrigen);
                }

                Long targetIdActivoDestino = idActivoDestino;
                if (targetIdActivoDestino != null && activoRepository.existsByIdActivo(targetIdActivoDestino)) {
                    Activo activoDestino = activoRepository.getActivoByIdActivo(targetIdActivoDestino);
                    if (!activoDestino.getIdCartera().equals(idCarteraDestino)) {
                        throw new IllegalArgumentException("El activo con id " + targetIdActivoDestino + " no existe en la cartera con id " + idCarteraDestino);
                    }
                    nombreActivoDestino = activoDestino.getNombreActivo();
                    activoDestino.setBalance(activoDestino.getBalance().add(cantidadDestino));
                    activoRepository.saveAndFlush(activoDestino);
                } else {
                    Activo nuevoActivo = new Activo();
                    nuevoActivo.setIdCartera(idCarteraDestino);
                    nuevoActivo.setNombreActivo(nombreNuevoActivo);
                    nuevoActivo.setTipoActivo(tipoNuevoActivo);
                    if (nuevoActivo.getNombreActivo() == null || nuevoActivo.getTipoActivo() == null) {
                        throw new IllegalArgumentException("El activo tiene campos vacios o nulos");
                    }
                    nuevoActivo.setBalance(cantidadDestino);
                    nuevoActivo.setFechaObtencionActivo(LocalDateTime.now());
                    activoRepository.saveAndFlush(nuevoActivo);
                    targetIdActivoDestino = nuevoActivo.getIdActivo();
                    nombreActivoDestino = nuevoActivo.getNombreActivo();
                }

                Movimiento movimiento = new Movimiento();
                movimiento.setIdCarteraOrigen(idCarteraOrigen);
                movimiento.setIdCarteraDestino(idCarteraDestino);
                movimiento.setIdActivoOrigen(idActivoOrigen);
                movimiento.setCantidadOrigen(cantidadOrigen);
                movimiento.setCantidadDestino(cantidadDestino);
                movimiento.setIdActivoDestino(targetIdActivoDestino);
                movimiento.setNombreCarteraOrigen(nombreCarteraOrigen);
                movimiento.setNombreCarteraDestino(nombreCarteraDestino);
                movimiento.setNombreActivoOrigen(nombreActivoOrigen);
                movimiento.setNombreActivoDestino(nombreActivoDestino);
                movimiento.setFechaMovimiento(LocalDateTime.now());

                movimientoRepository.saveAndFlush(movimiento);
                return null;
            });
        }
    }

    @Override
    public void ingresarBalance(Long idCartera, Long idActivo, BigDecimal cantidad) {
        synchronized (transferLock) {
            new TransactionTemplate(transactionManager).execute(status -> {
                if (!carteraRepository.existsByIdCartera(idCartera)) {
                    throw new IllegalArgumentException("La cartera con id " + idCartera + " no existe");
                }
                if (!activoRepository.existsByIdActivo(idActivo)) {
                    throw new IllegalArgumentException("El activo con id " + idActivo + " no existe");
                }

                Activo activo = activoRepository.getActivoByIdActivo(idActivo);
                if (!activo.getIdCartera().equals(idCartera)) {
                    throw new IllegalArgumentException("El activo con id " + idActivo + " no pertenece a la cartera " + idCartera);
                }

                activo.setBalance(activo.getBalance().add(cantidad));
                activoRepository.saveAndFlush(activo);

                Movimiento movimiento = new Movimiento();
                movimiento.setIdCarteraDestino(idCartera);
                movimiento.setIdActivoDestino(idActivo);
                movimiento.setCantidadDestino(cantidad);
                movimiento.setNombreCarteraDestino(carteraRepository.getCarteraByIdCartera(idCartera).getNombreCartera());
                movimiento.setNombreActivoDestino(activo.getNombreActivo());
                movimiento.setFechaMovimiento(LocalDateTime.now());
                movimientoRepository.saveAndFlush(movimiento);

                return null;
            });
        }
    }

    @Override
    public void gastarBalance(Long idCartera, Long idActivo, BigDecimal cantidad) {
        synchronized (transferLock) {
            new TransactionTemplate(transactionManager).execute(status -> {
                if (!carteraRepository.existsByIdCartera(idCartera)) {
                    throw new IllegalArgumentException("La cartera con id " + idCartera + " no existe");
                }
                if (!activoRepository.existsByIdActivo(idActivo)) {
                    throw new IllegalArgumentException("El activo con id " + idActivo + " no existe");
                }

                Activo activo = activoRepository.getActivoByIdActivo(idActivo);
                if (!activo.getIdCartera().equals(idCartera)) {
                    throw new IllegalArgumentException("El activo con id " + idActivo + " no pertenece a la cartera " + idCartera);
                }

                BigDecimal balanceRestante = activo.getBalance().subtract(cantidad);
                if (balanceRestante.compareTo(BigDecimal.ZERO) <= 0) {
                    activoRepository.delete(activo);
                } else {
                    activo.setBalance(balanceRestante);
                    activoRepository.saveAndFlush(activo);
                }

                Movimiento movimiento = new Movimiento();
                movimiento.setIdCarteraOrigen(idCartera);
                movimiento.setIdActivoOrigen(idActivo);
                movimiento.setCantidadOrigen(cantidad);
                movimiento.setNombreCarteraOrigen(carteraRepository.getCarteraByIdCartera(idCartera).getNombreCartera());
                movimiento.setNombreActivoOrigen(activo.getNombreActivo());
                movimiento.setFechaMovimiento(LocalDateTime.now());
                movimientoRepository.saveAndFlush(movimiento);

                return null;
            });
        }
    }

    @Override
    public Page<TransferenciaDto> listarTransferencias(Pageable pageable) {
        return movimientoRepository.findAllTransferencias(pageable);
    }
}
