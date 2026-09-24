package com.gestorBackend.Service;

import com.gestorBackend.Model.OperacionProgramada;
import com.gestorBackend.Dto.Request.OperacionProgramadaRequest;
import jakarta.validation.Valid;

import java.util.List;

public interface OperacionProgramadaService {
    OperacionProgramada crearOperacionProgramada(@Valid OperacionProgramadaRequest request);
    void pausarOperacionProgramada(Long idOperacionProgramada, Boolean nuevoEstado);
    void eliminarOperacionProgramada(Long idOperacionProgramada);
    OperacionProgramada modOperacionProgramada(Long idOperacionProgramada, @Valid OperacionProgramadaRequest request);
    void ejecutarOperacionesPendientes();
    org.springframework.data.domain.Page<OperacionProgramada> listarOperaciones(org.springframework.data.domain.Pageable pageable);
}
