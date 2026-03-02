package com.alpay.cobranza.service;

import com.alpay.cobranza.model.HistorialCobranza;
import com.alpay.cobranza.repository.HistorialRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HistorialService {

    private final HistorialRepository historialRepository;

    public HistorialService(HistorialRepository historialRepository) {
        this.historialRepository = historialRepository;
    }

    public List<HistorialCobranza> listarTodo() {
        return historialRepository.findAll();
    }

    public List<HistorialCobranza> obtenerHistorialPorCuenta(Integer idCuenta) {
        // Cambiar el nombre de la llamada para que coincida con el Repository
        return historialRepository.findByCuenta_IdOrderByFechaDesc(idCuenta);
    }
}
