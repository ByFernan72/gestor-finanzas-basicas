package com.gestorBackend.Service.Impl;

import com.gestorBackend.Model.Config;
import com.gestorBackend.Repository.ConfigRepository;
import com.gestorBackend.Service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@RequiredArgsConstructor
public class ConfigServiceImpl implements ConfigService {

    private final ConfigRepository configRepository;
    @Override
    public Config actualizarConfig(String clave, String valor){
        Config configExistente = configRepository.findById(clave).orElse(new Config(clave, ""));

        if(valor != null && !valor.isEmpty()){
            configExistente.setValor(valor);
        }

        return configRepository.save(configExistente);
    }
}

