package com.gestor.Controller;

import com.gestorBackend.Controller.HistorialController;
import com.gestorBackend.Service.HistorialService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import com.gestorBackend.MainApp;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HistorialController.class)
@ContextConfiguration(classes = MainApp.class)
class HistorialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HistorialService historialService;

    @Test
    void registrarHistorial_debeLlamarServicioYDevolverNoContent() throws Exception {
        mockMvc.perform(post("/api/v1/historial/saved/registro"))
                .andExpect(status().isNoContent());

        verify(historialService).registrarHistorialActivos();
    }

    @Test
    void verificarRegistrarFecha_debeLlamarServicioYDevolverNoContent() throws Exception {
        mockMvc.perform(post("/api/v1/historial/saved/validar"))
                .andExpect(status().isNoContent());

        verify(historialService).verificarRegistrarFecha();
    }
}