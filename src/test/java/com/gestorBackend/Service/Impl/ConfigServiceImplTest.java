package com.gestorBackend.Service.Impl;

import com.gestorBackend.Model.Config;
import com.gestorBackend.Repository.ConfigRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfigServiceImplTest {

    @Mock
    private ConfigRepository configRepository;

    @InjectMocks
    private ConfigServiceImpl configService;

    @Test
    void actualizarConfig_DebeCrearNuevaConfiguracion_SiNoExiste() {
        // Arrange
        String clave = "nueva_clave";
        String valor = "nuevo_valor";
        when(configRepository.findById(clave)).thenReturn(Optional.empty());
        when(configRepository.save(any(Config.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Config result = configService.actualizarConfig(clave, valor);

        // Assert
        assertNotNull(result);
        assertEquals(clave, result.getClave());
        assertEquals(valor, result.getValor());
        verify(configRepository, times(1)).save(any(Config.class));
    }

    @Test
    void actualizarConfig_DebeActualizarConfiguracion_SiYaExiste() {
        // Arrange
        String clave = "clave_existente";
        String valorAntiguo = "valor_antiguo";
        String valorNuevo = "valor_nuevo";
        Config configExistente = new Config(clave, valorAntiguo);
        
        when(configRepository.findById(clave)).thenReturn(Optional.of(configExistente));
        when(configRepository.save(any(Config.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Config result = configService.actualizarConfig(clave, valorNuevo);

        // Assert
        assertEquals(clave, result.getClave());
        assertEquals(valorNuevo, result.getValor());
        verify(configRepository, times(1)).save(configExistente);
    }

    @Test
    void actualizarConfig_NoDebeSobrescribir_SiValorEsNullOEmpty() {
        // Arrange
        String clave = "clave_existente";
        String valorAntiguo = "valor_antiguo";
        Config configExistente = new Config(clave, valorAntiguo);
        
        when(configRepository.findById(clave)).thenReturn(Optional.of(configExistente));
        when(configRepository.save(any(Config.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Config resultNull = configService.actualizarConfig(clave, null);
        Config resultEmpty = configService.actualizarConfig(clave, "");

        // Assert
        assertEquals(valorAntiguo, resultNull.getValor());
        assertEquals(valorAntiguo, resultEmpty.getValor());
        verify(configRepository, times(2)).save(configExistente);
    }
}
