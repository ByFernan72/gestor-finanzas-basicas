package com.gestorBackend.Repository;

import com.gestorBackend.Model.Config;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfigRepository extends JpaRepository<Config, String> {
    List<Config> clave(String clave);
}
