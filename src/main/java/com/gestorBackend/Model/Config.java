package com.gestorBackend.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name ="config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Config {
    @Id
    private String clave;
    private String valor;
}
