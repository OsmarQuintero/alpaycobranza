package com.alpay.cobranza.model;

public class ConfiguracionRequest {
    private ConfiguracionUsuarioRequest userConfig;
    private ConfiguracionSistemaRequest systemConfig;

    public ConfiguracionUsuarioRequest getUserConfig() {
        return userConfig;
    }

    public void setUserConfig(ConfiguracionUsuarioRequest userConfig) {
        this.userConfig = userConfig;
    }

    public ConfiguracionSistemaRequest getSystemConfig() {
        return systemConfig;
    }

    public void setSystemConfig(ConfiguracionSistemaRequest systemConfig) {
        this.systemConfig = systemConfig;
    }
}
