package com.gestorBackend.Controller;

import com.gestorBackend.Model.Config;
import com.gestorBackend.Service.ConfigService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ConfigController.class)
class ConfigControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Nota: Dependiendo de tu versión exacta, podría ser @MockitoBean en lugar de @MockBean
    @MockBean
    private ConfigService configService;

    @Test
    void actualizarConfig_DebeRetornarConfiguracionActualizada() throws Exception {
        // Arrange
        String clave = "ultima_fecha";
        String valor = "2026-09-17";
        Config configMock = new Config(clave, valor);

        when(configService.actualizarConfig(anyString(), anyString())).thenReturn(configMock);

        // Act & Assert
        mockMvc.perform(post("/api/v1/config/update-config")
                .param("clave", clave)
                .param("valor", valor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clave").value(clave))
                .andExpect(jsonPath("$.valor").value(valor));
    }
}
