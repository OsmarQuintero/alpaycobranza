package com.alpay.cobranza.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeocodeService {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, Object>> buscarDirecciones(String query) {
        String q = URLEncoder.encode(query + ", Mexico", StandardCharsets.UTF_8);

        List<Map<String, Object>> photon = buscarEnPhoton(q);
        if (!photon.isEmpty()) {
            return photon;
        }

        return buscarEnNominatim(q);
    }

    private List<Map<String, Object>> buscarEnPhoton(String q) {
        try {
            String url = "https://photon.komoot.io/api/?q=" + q + "&limit=8&lang=es";
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .header("User-Agent", "AlpayBackend/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode features = root.path("features");
            if (!features.isArray()) return List.of();

            List<Map<String, Object>> out = new ArrayList<>();
            for (JsonNode f : features) {
                JsonNode p = f.path("properties");
                JsonNode coords = f.path("geometry").path("coordinates");

                if (!coords.isArray() || coords.size() < 2) continue;

                double lng = coords.get(0).asDouble(Double.NaN);
                double lat = coords.get(1).asDouble(Double.NaN);
                if (Double.isNaN(lat) || Double.isNaN(lng)) continue;

                String calle = text(p, "street");
                String numero = text(p, "housenumber");
                String colonia = firstNonEmpty(text(p, "district"), text(p, "suburb"), text(p, "neighbourhood"));
                String municipio = firstNonEmpty(text(p, "city"), text(p, "county"));
                String estado = text(p, "state");
                String cp = text(p, "postcode");
                String nombre = text(p, "name");

                String l1 = join(" ", calle, numero);
                String l2 = join(", ", colonia, municipio);
                String l3 = join(", ", estado, cp);
                String display = firstNonEmpty(join(", ", l1, l2, l3), nombre);

                if (!display.isBlank()) {
                    out.add(Map.of("display", display, "lat", lat, "lng", lng));
                }
            }
            return out;
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<Map<String, Object>> buscarEnNominatim(String q) {
        try {
            String url = "https://nominatim.openstreetmap.org/search?q=" + q + "&format=jsonv2&addressdetails=1&countrycodes=mx&limit=8";
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .header("Accept-Language", "es-MX,es")
                    .header("User-Agent", "AlpayBackend/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return List.of();
            }

            JsonNode arr = objectMapper.readTree(response.body());
            if (!arr.isArray()) return List.of();

            List<Map<String, Object>> out = new ArrayList<>();
            for (JsonNode item : arr) {
                JsonNode addr = item.path("address");

                double lat = parseDouble(item.path("lat").asText());
                double lng = parseDouble(item.path("lon").asText());
                if (Double.isNaN(lat) || Double.isNaN(lng)) continue;

                String calle = firstNonEmpty(text(addr, "road"), text(addr, "pedestrian"), text(addr, "footway"));
                String numero = text(addr, "house_number");
                String colonia = firstNonEmpty(text(addr, "suburb"), text(addr, "neighbourhood"), text(addr, "city_district"));
                String municipio = firstNonEmpty(text(addr, "city"), text(addr, "town"), text(addr, "village"), text(addr, "county"));
                String estado = text(addr, "state");
                String cp = text(addr, "postcode");
                String displayName = item.path("display_name").asText("");

                String l1 = join(" ", calle, numero);
                String l2 = join(", ", colonia, municipio);
                String l3 = join(", ", estado, cp);
                String display = firstNonEmpty(join(", ", l1, l2, l3), displayName);

                if (!display.isBlank()) {
                    out.add(Map.of("display", display, "lat", lat, "lng", lng));
                }
            }
            return out;
        } catch (Exception e) {
            return List.of();
        }
    }

    private String text(JsonNode node, String field) {
        return node.path(field).asText("").trim();
    }

    private String join(String sep, String... parts) {
        List<String> values = new ArrayList<>();
        for (String p : parts) {
            if (p != null && !p.isBlank()) values.add(p.trim());
        }
        return String.join(sep, values).trim();
    }

    private String firstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v.trim();
        }
        return "";
    }

    private double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return Double.NaN;
        }
    }
}
