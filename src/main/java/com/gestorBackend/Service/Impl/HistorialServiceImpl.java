package com.gestorBackend.Service.Impl;

import com.gestorBackend.Model.Activo;
import com.gestorBackend.Model.Config;
import com.gestorBackend.Model.Historial;
import com.gestorBackend.Repository.ActivoRepository;
import com.gestorBackend.Repository.ConfigRepository;
import com.gestorBackend.Repository.HistorialRepository;
import com.gestorBackend.Service.HistorialService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HistorialServiceImpl implements HistorialService {

    private final ConfigRepository configRepository;
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

    @Override
    public void verificarRegistrarFecha() {
        Optional<Config> configOpt = configRepository.findById("fecha_ultimo_guardado");

        if (configOpt.isEmpty()) {
            registrarHistorialActivos();
            configRepository.save(new Config("fecha_ultimo_guardado", LocalDate.now().toString()));
            return;
        }

        String textoFecha = configOpt.get().getValor();
        LocalDate fechaGuardada = LocalDate.parse(textoFecha);
        YearMonth mesGuardado = YearMonth.from(fechaGuardada);
        YearMonth mesActual = YearMonth.from(LocalDate.now());

        if (mesActual.isAfter(mesGuardado)) {
            registrarHistorialActivos();
            Config configToUpdate = configOpt.get();
            configToUpdate.setValor(LocalDate.now().toString());
            configRepository.save(configToUpdate);
        }
    }
}
