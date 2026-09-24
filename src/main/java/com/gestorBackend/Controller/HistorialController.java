package com.gestorBackend.Controller;

import com.gestorBackend.Service.HistorialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
// @CrossOrigin(origins = "*") // @CrossOrigin(origins = "http://localhost:puerto")
@RequestMapping("/api/v1/historial")
@RequiredArgsConstructor
public class HistorialController {

    private final HistorialService historialService;

    @PostMapping("/saved/registro")
    public ResponseEntity<Void> registrarHistorialActivos() {
        historialService.registrarHistorialActivos();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/saved/validar")
    public ResponseEntity<Void> verificarRegistrarFecha(){
        historialService.verificarRegistrarFecha();
        return ResponseEntity.noContent().build();
    }
}
