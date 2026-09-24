package com.gestorBackend.Repository;

import com.gestorBackend.Model.OperacionProgramada;
import com.gestorBackend.Service.OperacionProgramadaService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OperacionProgramadaRepository extends JpaRepository<OperacionProgramada, Long> {
    @Modifying
    @Query("UPDATE OperacionProgramada op SET op.isActive = :estado WHERE op.idOperacion = :id")
    void actualizarEstado(Long id, Boolean estado);

    @Query("SELECT op FROM OperacionProgramada op WHERE op.isActive = true AND op.proximaEjecucion <= :ahora")
    List<OperacionProgramada> findOperacionesPendientes(LocalDateTime ahora);

    @Query("SELECT op FROM OperacionProgramada op")
    List<OperacionProgramada> listarTodasOperaciones();
}