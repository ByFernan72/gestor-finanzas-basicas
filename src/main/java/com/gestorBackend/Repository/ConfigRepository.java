package com.gestorBackend.Repository;

import com.gestorBackend.Model.Config;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfigRepository extends JpaRepository<Config, String> {
}
