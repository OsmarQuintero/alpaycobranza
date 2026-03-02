package com.alpay.cobranza.model;

public class ConfiguracionResponse {
    private ConfiguracionUsuario userConfig;
    private ConfiguracionSistema systemConfig;

    public ConfiguracionResponse(ConfiguracionUsuario userConfig, ConfiguracionSistema systemConfig) {
        this.userConfig = userConfig;
        this.systemConfig = systemConfig;
    }

    public ConfiguracionUsuario getUserConfig() {
        return userConfig;
    }

    public ConfiguracionSistema getSystemConfig() {
        return systemConfig;
    }
}
