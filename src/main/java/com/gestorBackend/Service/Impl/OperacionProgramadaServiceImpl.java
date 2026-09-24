package com.gestorBackend.Service.Impl;

import com.gestorBackend.Dto.Request.OperacionProgramadaRequest;
import com.gestorBackend.Model.Activo;
import com.gestorBackend.Model.Enum.TipoOperacion;
import com.gestorBackend.Model.OperacionProgramada;
import com.gestorBackend.Repository.OperacionProgramadaRepository;
import com.gestorBackend.Service.ActivoService;
import com.gestorBackend.Service.MovimientoService;
import com.gestorBackend.Service.OperacionProgramadaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Validated
@RequiredArgsConstructor
public class OperacionProgramadaServiceImpl implements OperacionProgramadaService {

    private final OperacionProgramadaRepository operacionProgramadaRepository;
    private final MovimientoService movimientoService;

    @Override
    public OperacionProgramada crearOperacionProgramada(OperacionProgramadaRequest request) {
        OperacionProgramada op = new OperacionProgramada();
        op.setIdCarteraOrigen(request.getIdCarteraOrigen());
        op.setIdCarteraDestino(request.getIdCarteraDestino());
        op.setIdActivo(request.getIdActivo());
        op.setCantidad(request.getCantidad());
        op.setTipoTimeFrame(request.getTipoTimeFrame());
        op.setProximaEjecucion(request.getProximaEjecucion());
        op.setTipoOperacion(request.getTipoOperacion());
        op.setConcepto(request.getConcepto());
        
        op.setIsActive(true);
        op.setCreatedAt(java.time.LocalDateTime.now());
        
        return operacionProgramadaRepository.save(op);
    }

    @Override
    @Transactional
    public void pausarOperacionProgramada(Long idOperacionProgramada, Boolean nuevoEstado) {
        operacionProgramadaRepository.actualizarEstado(idOperacionProgramada, nuevoEstado);
    }

    @Override
    public void eliminarOperacionProgramada(Long idOperacionProgramada) {
        if (!operacionProgramadaRepository.existsById(idOperacionProgramada)) {
            throw new IllegalArgumentException("La operación con id " + idOperacionProgramada + " no existe");
        }
        operacionProgramadaRepository.deleteById(idOperacionProgramada);
    }

    @Override
    @Transactional
    public OperacionProgramada modOperacionProgramada(Long idOperacionProgramada, OperacionProgramadaRequest request) {
        if (!operacionProgramadaRepository.existsById(idOperacionProgramada)) {
            throw new IllegalArgumentException("La operación con id " + idOperacionProgramada + " no existe");
        }

        OperacionProgramada op = operacionProgramadaRepository.getReferenceById(idOperacionProgramada);
        op.setIdCarteraOrigen(request.getIdCarteraOrigen());
        op.setIdCarteraDestino(request.getIdCarteraDestino());
        op.setIdActivo(request.getIdActivo());
        op.setCantidad(request.getCantidad());
        op.setTipoTimeFrame(request.getTipoTimeFrame());
        op.setProximaEjecucion(request.getProximaEjecucion());
        op.setTipoOperacion(request.getTipoOperacion());
        op.setConcepto(request.getConcepto());

        return operacionProgramadaRepository.save(op);
    }
    @Override
    public void ejecutarOperacionesPendientes() {
        List<OperacionProgramada> operacionesPendientes = operacionProgramadaRepository.findOperacionesPendientes(LocalDateTime.now());

        for (OperacionProgramada op : operacionesPendientes) {
            ejecutarOperacion(op);
        }
    }

    @Override
    public org.springframework.data.domain.Page<OperacionProgramada> listarOperaciones(org.springframework.data.domain.Pageable pageable) {
        return operacionProgramadaRepository.findAll(pageable);
    }


    private LocalDateTime calcularProximaFecha(OperacionProgramada op) {
        LocalDateTime proxima = op.getProximaEjecucion();
        while (!proxima.isAfter(LocalDateTime.now())) {
            switch (op.getTipoTimeFrame()) {
                case MENSUAL:
                    proxima = proxima.plusMonths(1);
                    break;
                case SEMANAL:
                    proxima = proxima.plusWeeks(1);
                    break;
                case QUINCENAL:
                    proxima = proxima.plusWeeks(2);
                    break;
                case TRIMESTRAL:
                    proxima = proxima.plusMonths(3);
                    break;
                case ANUAL:
                    proxima = proxima.plusYears(1);
                    break;
            }
        }
        return proxima;
    }

    private void ejecutarOperacion(OperacionProgramada op) {
        if (op.getTipoOperacion() == TipoOperacion.INGRESO) {
            movimientoService.ingresarBalance(op.getIdCarteraDestino(), op.getIdActivo(), op.getCantidad());
        }
        else if (op.getTipoOperacion() == TipoOperacion.TRANSFERENCIA) {
            // Lógica de transferencia
            // Actualmente no esta implementado
        }
        else if (op.getTipoOperacion() == TipoOperacion.GASTO) {
            // Lógica de gastos
            // Actualmente no esta implementado
        }

        LocalDateTime nuevaFecha = calcularProximaFecha(op);
        op.setProximaEjecucion(nuevaFecha);

        operacionProgramadaRepository.save(op);
    }
}
