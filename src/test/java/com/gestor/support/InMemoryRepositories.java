package com.gestor.support;

import com.gestorBackend.Model.Activo;
import com.gestorBackend.Model.Cartera;
import com.gestorBackend.Model.Historial;
import com.gestorBackend.Repository.ActivoRepository;
import com.gestorBackend.Repository.CarteraRepository;
import com.gestorBackend.Repository.HistorialRepository;
import com.gestorBackend.Repository.MovimientoRepository;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

public final class InMemoryRepositories {

    private InMemoryRepositories() {
    }

    // Crea un proxy de ActivoRepository respaldado por un mapa en memoria.
    public static ActivoRepository activoRepository(Map<Long, Activo> store, AtomicLong sequence) {
        return proxy(ActivoRepository.class, (proxy, method, args) -> handleActivo(store, sequence, method, args));
    }

    // Crea un proxy de CarteraRepository respaldado por un mapa en memoria.
    public static CarteraRepository carteraRepository(Map<Long, Cartera> store, AtomicLong sequence) {
        return proxy(CarteraRepository.class, (proxy, method, args) -> handleCartera(store, sequence, method, args));
    }

    // Crea un proxy simple de MovimientoRepository.
    public static MovimientoRepository movimientoRepository() {
        return proxy(MovimientoRepository.class, (proxy, method, args) -> defaultAnswer(method));
    }

    // Crea un proxy de HistorialRepository respaldado por un mapa en memoria.
    public static HistorialRepository historialRepository(Map<Long, Historial> store, AtomicLong sequence) {
        return proxy(HistorialRepository.class, (proxy, method, args) -> handleHistorial(store, sequence, method, args));
    }

    // Devuelve un almacén vacío para activos.
    public static Map<Long, Activo> newActivoStore() {
        return new LinkedHashMap<>();
    }

    // Devuelve un almacén vacío para carteras.
    public static Map<Long, Cartera> newCarteraStore() {
        return new LinkedHashMap<>();
    }

    // Devuelve un almacén vacío para historiales.
    public static Map<Long, Historial> newHistorialStore() {
        return new LinkedHashMap<>();
    }

    // Simula el comportamiento del repositorio de activos.
    private static Object handleActivo(Map<Long, Activo> store, AtomicLong sequence, Method method, Object[] args) {
        return switch (method.getName()) {
            case "save", "saveAndFlush" -> {
                Activo activo = (Activo) args[0];
                if (activo.getIdActivo() == null) {
                    activo.setIdActivo(sequence.incrementAndGet());
                }
                store.put(activo.getIdActivo(), activo);
                yield activo;
            }
            case "existsByIdActivo" -> store.containsKey((Long) args[0]);
            case "getActivoByIdActivo" -> store.get((Long) args[0]);
            case "deleteById" -> {
                store.remove((Long) args[0]);
                yield null;
            }
            case "delete" -> {
                Activo a = (Activo) args[0];
                if (a != null && a.getIdActivo() != null) {
                    store.remove(a.getIdActivo());
                }
                yield null;
            }
            case "findAll" -> new ArrayList<>(store.values());
            case "findAllByIdCartera" -> store.values().stream().filter(a -> a.getIdCartera().equals((Long) args[0])).toList();
            case "findById" -> Optional.ofNullable(store.get((Long) args[0]));
            case "count" -> (long) store.size();
            default -> defaultAnswer(method);
        };
    }

    // Simula el comportamiento del repositorio de carteras.
    private static Object handleCartera(Map<Long, Cartera> store, AtomicLong sequence, Method method, Object[] args) {
        return switch (method.getName()) {
            case "save", "saveAndFlush" -> {
                Cartera cartera = (Cartera) args[0];
                if (cartera.getIdCartera() == null) {
                    cartera.setIdCartera(sequence.incrementAndGet());
                }
                store.put(cartera.getIdCartera(), cartera);
                yield cartera;
            }
            case "existsByIdCartera" -> store.containsKey((Long) args[0]);
            case "getCarteraByIdCartera" -> store.get((Long) args[0]);
            case "deleteById" -> {
                store.remove((Long) args[0]);
                yield null;
            }
            case "findAll" -> new ArrayList<>(store.values());
            case "findById" -> Optional.ofNullable(store.get((Long) args[0]));
            case "count" -> (long) store.size();
            default -> defaultAnswer(method);
        };
    }

    // Simula el comportamiento del repositorio de historiales.
    private static Object handleHistorial(Map<Long, Historial> store, AtomicLong sequence, Method method, Object[] args) {
        return switch (method.getName()) {
            case "save" -> {
                Historial historial = (Historial) args[0];
                if (historial.getIdHistorial() == null) {
                    historial.setIdHistorial(sequence.incrementAndGet());
                }
                store.put(historial.getIdHistorial(), historial);
                yield historial;
            }
            case "findAll" -> new ArrayList<>(store.values());
            case "deleteById" -> {
                store.remove((Long) args[0]);
                yield null;
            }
            case "findById" -> Optional.ofNullable(store.get((Long) args[0]));
            case "count" -> (long) store.size();
            default -> defaultAnswer(method);
        };
    }

    // Devuelve un valor por defecto según el tipo de retorno del método.
    private static Object defaultAnswer(Method method) {
        Class<?> returnType = method.getReturnType();
        if (returnType.equals(void.class)) {
            return null;
        }
        if (returnType.equals(boolean.class)) {
            return false;
        }
        if (returnType.equals(byte.class)) {
            return (byte) 0;
        }
        if (returnType.equals(short.class)) {
            return (short) 0;
        }
        if (returnType.equals(int.class)) {
            return 0;
        }
        if (returnType.equals(long.class)) {
            return 0L;
        }
        if (returnType.equals(float.class)) {
            return 0F;
        }
        if (returnType.equals(double.class)) {
            return 0D;
        }
        if (returnType.equals(char.class)) {
            return '\0';
        }
        if (returnType.equals(Optional.class)) {
            return Optional.empty();
        }
        if (returnType.isAssignableFrom(ArrayList.class)) {
            return new ArrayList<>();
        }
        if (Iterable.class.isAssignableFrom(returnType)) {
            return new ArrayList<>();
        }
        if (returnType.isPrimitive()) {
            return null;
        }
        return null;
    }

    // Construye el proxy dinámico para la interfaz indicada.
    @SuppressWarnings("unchecked")
    private static <T> T proxy(Class<T> type, InvocationHandler handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, handler);
    }
}
