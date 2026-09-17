package com.gestorBackend.Controller;

import com.gestorBackend.Model.Config;
import com.gestorBackend.Service.ConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
// @CrossOrigin(origins = "*") // @CrossOrigin(origins = "http://localhost:puerto")
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
@Validated
public class ConfigController {
    private final ConfigService configService;

    @PostMapping("/update-config")
    public ResponseEntity<Config> actualizarConfig(
            String clave,
            String valor
    ){
        Config nuevoValor = configService.actualizarConfig(clave, valor);
        return ResponseEntity.ok(nuevoValor);
    }
}
