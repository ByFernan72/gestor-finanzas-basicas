package com.gestorBackend.Controller;

import com.gestorBackend.Dto.Request.OperacionProgramadaRequest;
import com.gestorBackend.Model.OperacionProgramada;
import com.gestorBackend.Service.HistorialService;
import com.gestorBackend.Service.OperacionProgramadaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// @CrossOrigin(origins = "*") // @CrossOrigin(origins = "http://localhost:puerto")
@RequestMapping("/api/v1/operacion-programada")
@RequiredArgsConstructor
@Validated
public class OperacionProgramadaController {
    private final OperacionProgramadaService operacionProgramadaService;
    private final HistorialService historialService;

    @PostMapping("/crear-operacion-programada")
    public ResponseEntity<OperacionProgramada> crearOperacionProgramada(@Valid @RequestBody  OperacionProgramadaRequest op){
        OperacionProgramada nuevaOp = operacionProgramadaService.crearOperacionProgramada(op);
        return ResponseEntity.ok(nuevaOp);
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<Void> eliminarOperacionProgramada(
            @PathVariable @Positive(message = "El id debe ser positivo") Long id){
        operacionProgramadaService.eliminarOperacionProgramada(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listado")
    public ResponseEntity<org.springframework.data.domain.Page<OperacionProgramada>> listarTodasOperacionesProgramadas(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable){
        return ResponseEntity.ok(operacionProgramadaService.listarOperaciones(pageable));
    }

    @PatchMapping(value = "/{id}/estado")
    public ResponseEntity<Void> modificarEstado(
            @PathVariable @Positive(message = "El id debe ser positivo") Long id, 
            @RequestParam Boolean nuevoEstado){
        operacionProgramadaService.pausarOperacionProgramada(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/modificar/{id}")
    public ResponseEntity<OperacionProgramada> modificarOperacionProgramada(
            @PathVariable @Positive(message = "El id debe ser positivo") Long id,
            @Valid @RequestBody OperacionProgramadaRequest request) {

        OperacionProgramada opModificada = operacionProgramadaService.modOperacionProgramada(id, request);
        return ResponseEntity.ok(opModificada);
    }

    @PostMapping("/saved/validar")
    public ResponseEntity<Void> verificarRegistrarFecha(){
        historialService.verificarRegistrarFecha();
        operacionProgramadaService.ejecutarOperacionesPendientes();
        return ResponseEntity.noContent().build();
    }
}
