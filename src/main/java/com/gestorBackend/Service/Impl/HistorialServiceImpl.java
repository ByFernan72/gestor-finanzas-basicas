package com.gestorBackend.Service.Impl;

import com.gestorBackend.Model.Activo;  
import com.gestorBackend.Model.Historial;
import com.gestorBackend.Repository.ActivoRepository;
import com.gestorBackend.Repository.HistorialRepository;
import com.gestorBackend.Service.HistorialService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialServiceImpl implements HistorialService {

    private final HistorialRepository historialRepository;
    private final ActivoRepository activoRepository;

    @Override
    @Transactional
    public void registrarHistorialActivos() {
        List<Activo> listaActivos = activoRepository.findAll();

        for (int i = 0; i < listaActivos.size(); i++) {
            Activo activoActual = listaActivos.get(i);

            Historial snapshot = new Historial();
            snapshot.setIdCartera(activoActual.getIdCartera());
            snapshot.setIdActivo(activoActual.getIdActivo());
            snapshot.setBalance(activoActual.getBalance());
            snapshot.setFechaHistorial(LocalDateTime.now());

            historialRepository.save(snapshot);
        }
    }
}
