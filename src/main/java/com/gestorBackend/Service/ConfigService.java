package com.gestorBackend.Service;

import com.gestorBackend.Model.Config;

public interface ConfigService {
    Config actualizarConfig(String clave, String valor);
}
