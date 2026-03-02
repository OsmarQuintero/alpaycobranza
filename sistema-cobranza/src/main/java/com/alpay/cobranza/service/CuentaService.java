package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Cliente;
import com.alpay.cobranza.model.Cuenta;
import com.alpay.cobranza.model.CuentaCreateRequest;
import com.alpay.cobranza.repository.ClienteRepository;
import com.alpay.cobranza.repository.CuentaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CuentaService {

    private final CuentaRepository cuentaRepository;
    private final ClienteRepository clienteRepository;

    public CuentaService(CuentaRepository cuentaRepository, ClienteRepository clienteRepository) {
        this.cuentaRepository = cuentaRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<Cuenta> listarTodas() {
        return cuentaRepository.findAll();
    }

    public List<Cuenta> findByClienteId(Integer clienteId) {
        return cuentaRepository.findByClienteId(clienteId);
    }

    public Cuenta crearCuenta(CuentaCreateRequest request) {
        if (request == null || request.idCliente() == null) {
            throw new RuntimeException("Cliente requerido para crear credito");
        }

        Cliente cliente = clienteRepository.findById(request.idCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        BigDecimal limite = request.limiteCredito();
        if (limite == null || limite.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Limite de credito invalido");
        }

        Float tasa = request.tasaInteres();
        if (tasa == null || tasa < 0 || tasa > 1) {
            throw new RuntimeException("Tasa de interes invalida [0..1]");
        }

        Integer diaCorte = request.diaCorte() == null ? 1 : request.diaCorte();
        if (diaCorte < 1 || diaCorte > 28) {
            throw new RuntimeException("Dia de corte invalido (1-28)");
        }

        Cuenta cuenta = new Cuenta();
        cuenta.setCliente(cliente);
        cuenta.setLimiteCredito(limite);
        cuenta.setSaldo(BigDecimal.ZERO);
        cuenta.setTasaInteres(tasa);
        cuenta.setFechaApertura(LocalDate.now());
        cuenta.setEstatus("ACTIVA");
        cuenta.setDiaCorte(diaCorte);

        return cuentaRepository.save(cuenta);
    }

    public List<Cuenta> obtenerDeudoresAltos() {
        return cuentaRepository.findByEstatusAndSaldoGreaterThan("ACTIVA", BigDecimal.valueOf(1000));
    }
}
