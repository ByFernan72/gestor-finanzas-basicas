package com.gestorBackend.Service;

import com.gestorBackend.Dto.TransferenciaDto;
import com.gestorBackend.Model.Enum.TipoActivo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

public interface MovimientoService {
    void transferirBalance(Long idCarteraOrigen, Long idCarteraDestino, Long idActivoOrigen, Long idActivoDestino, BigDecimal cantidadOrigen, BigDecimal cantidadDestino, String nombreNuevoActivo, TipoActivo tipoNuevoActivo);
    void ingresarBalance(Long idCartera, Long idActivo, BigDecimal cantidad);
    void gastarBalance(Long idCartera, Long idActivo, BigDecimal cantidad);
    Page<TransferenciaDto> listarTransferencias(Pageable pageable);
}