package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Cuenta;
import com.alpay.cobranza.repository.CuentaRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.mail.internet.MimeMessage;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.lowagie.text.Font;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportesService {

    private final CuentaRepository cuentaRepository;
    private final JavaMailSender mailSender;

    public ReportesService(CuentaRepository cuentaRepository, JavaMailSender mailSender) {
        this.cuentaRepository = cuentaRepository;
        this.mailSender = mailSender;
    }

    public Map<String, Object> obtenerResumen() {
        Map<String, Object> resumen = new HashMap<>();
        List<Cuenta> cuentas = cuentaRepository.findAll();
        long totalCuentas = cuentas.size();

        BigDecimal totalCredito = cuentas.stream()
                .map(c -> c.getLimiteCredito() != null ? c.getLimiteCredito() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSaldo = cuentas.stream()
                .map(c -> c.getSaldo() != null ? c.getSaldo() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        resumen.put("totalCuentas", totalCuentas);
        resumen.put("totalCredito", totalCredito);
        resumen.put("totalSaldo", totalSaldo);
        resumen.put("totalRecaudado", totalCredito.subtract(totalSaldo));
        resumen.put("promedioSaldo", totalCuentas > 0 ? totalSaldo.divide(
                BigDecimal.valueOf(totalCuentas), 2, RoundingMode.HALF_UP
        ) : BigDecimal.ZERO);

        return resumen;
    }

    public byte[] exportarResumenPDF() throws DocumentException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, false);
            Font titleFont = new Font(baseFont, 18, Font.BOLD, new Color(15, 23, 42));
            Font subtitleFont = new Font(baseFont, 10, Font.NORMAL, new Color(100, 116, 139));
            Font sectionFont = new Font(baseFont, 12, Font.BOLD, new Color(30, 41, 59));
            Font tableHeader = new Font(baseFont, 10, Font.BOLD, Color.WHITE);
            Font tableCell = new Font(baseFont, 10, Font.NORMAL, new Color(30, 41, 59));

            Paragraph title = new Paragraph("ALPAY | Reporte Ejecutivo", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);
            document.add(new Paragraph("Fecha: " + LocalDate.now(), subtitleFont));
            document.add(new Paragraph("Resumen de cobranza y cartera activa", subtitleFont));
            document.add(new Paragraph(" "));

            Map<String, Object> datos = obtenerResumen();

            document.add(new Paragraph("Indicadores clave", sectionFont));
            PdfPTable kpiTable = new PdfPTable(2);
            kpiTable.setWidthPercentage(100);
            kpiTable.setWidths(new float[]{2f, 1f});

            addHeaderCell(kpiTable, "Indicador", tableHeader);
            addHeaderCell(kpiTable, "Valor", tableHeader);

            addRow(kpiTable, "Total cuentas", datos.get("totalCuentas"), tableCell);
            addRow(kpiTable, "Credito total", "$" + datos.get("totalCredito"), tableCell);
            addRow(kpiTable, "Saldo pendiente", "$" + datos.get("totalSaldo"), tableCell);
            addRow(kpiTable, "Total recaudado", "$" + datos.get("totalRecaudado"), tableCell);
            addRow(kpiTable, "Promedio saldo", "$" + datos.get("promedioSaldo"), tableCell);

            document.add(kpiTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Top cuentas con mayor saldo", sectionFont));
            PdfPTable topTable = new PdfPTable(4);
            topTable.setWidthPercentage(100);
            topTable.setWidths(new float[]{2.2f, 1f, 1f, 1f});

            addHeaderCell(topTable, "Cliente", tableHeader);
            addHeaderCell(topTable, "Saldo", tableHeader);
            addHeaderCell(topTable, "Limite", tableHeader);
            addHeaderCell(topTable, "Estatus", tableHeader);

            List<Cuenta> topCuentas = cuentaRepository.findAll().stream()
                    .sorted(Comparator.comparing(Cuenta::getSaldo, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(5)
                    .toList();

            if (topCuentas.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("Sin cuentas registradas", tableCell));
                emptyCell.setColspan(4);
                emptyCell.setPadding(8f);
                topTable.addCell(emptyCell);
            } else {
                for (Cuenta cuenta : topCuentas) {
                    topTable.addCell(new Phrase(cuenta.getClienteNombre() != null ? cuenta.getClienteNombre() : "-", tableCell));
                    topTable.addCell(new Phrase("$" + (cuenta.getSaldo() != null ? cuenta.getSaldo() : BigDecimal.ZERO), tableCell));
                    topTable.addCell(new Phrase("$" + (cuenta.getLimiteCredito() != null ? cuenta.getLimiteCredito() : BigDecimal.ZERO), tableCell));
                    topTable.addCell(new Phrase(cuenta.getEstatus() != null ? cuenta.getEstatus() : "-", tableCell));
                }
            }

            document.add(topTable);
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            DocumentException de = new DocumentException("Error generando PDF");
            de.initCause(e);
            throw de;
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(37, 99, 235));
        cell.setPadding(8f);
        cell.setBorderColor(new Color(226, 232, 240));
        table.addCell(cell);
    }

    private void addRow(PdfPTable table, String label, Object value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setPadding(7f);
        labelCell.setBorderColor(new Color(226, 232, 240));
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(String.valueOf(value), font));
        valueCell.setPadding(7f);
        valueCell.setBorderColor(new Color(226, 232, 240));
        table.addCell(valueCell);
    }

    public byte[] exportarResumenExcel() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Reporte");

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle moneyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            moneyStyle.setDataFormat(format.getFormat("$#,##0.00"));

            int rowIdx = 0;
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.createCell(0).setCellValue("ALPAY - Reporte Ejecutivo");

            rowIdx++;

            Row header = sheet.createRow(rowIdx++);
            header.createCell(0).setCellValue("Indicador");
            header.createCell(1).setCellValue("Valor");
            header.getCell(0).setCellStyle(headerStyle);
            header.getCell(1).setCellStyle(headerStyle);

            Map<String, Object> datos = obtenerResumen();
            rowIdx = writeRow(sheet, rowIdx, "Total cuentas", datos.get("totalCuentas"));
            rowIdx = writeRow(sheet, rowIdx, "Credito total", datos.get("totalCredito"), moneyStyle);
            rowIdx = writeRow(sheet, rowIdx, "Saldo pendiente", datos.get("totalSaldo"), moneyStyle);
            rowIdx = writeRow(sheet, rowIdx, "Total recaudado", datos.get("totalRecaudado"), moneyStyle);
            rowIdx = writeRow(sheet, rowIdx, "Promedio saldo", datos.get("promedioSaldo"), moneyStyle);

            rowIdx += 2;

            Row topHeader = sheet.createRow(rowIdx++);
            topHeader.createCell(0).setCellValue("Top cuentas con mayor saldo");

            Row topCols = sheet.createRow(rowIdx++);
            topCols.createCell(0).setCellValue("Cliente");
            topCols.createCell(1).setCellValue("Saldo");
            topCols.createCell(2).setCellValue("Limite");
            topCols.createCell(3).setCellValue("Estatus");
            for (int i = 0; i < 4; i++) {
                topCols.getCell(i).setCellStyle(headerStyle);
            }

            List<Cuenta> topCuentas = cuentaRepository.findAll().stream()
                    .sorted(Comparator.comparing(Cuenta::getSaldo, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(5)
                    .toList();

            if (topCuentas.isEmpty()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue("Sin cuentas registradas");
            } else {
                for (Cuenta cuenta : topCuentas) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(cuenta.getClienteNombre() != null ? cuenta.getClienteNombre() : "-");
                    Cell saldoCell = row.createCell(1);
                    saldoCell.setCellValue(cuenta.getSaldo() != null ? cuenta.getSaldo().doubleValue() : 0);
                    saldoCell.setCellStyle(moneyStyle);
                    Cell limiteCell = row.createCell(2);
                    limiteCell.setCellValue(cuenta.getLimiteCredito() != null ? cuenta.getLimiteCredito().doubleValue() : 0);
                    limiteCell.setCellStyle(moneyStyle);
                    row.createCell(3).setCellValue(cuenta.getEstatus() != null ? cuenta.getEstatus() : "-");
                }
            }

            for (int i = 0; i < 4; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando Excel", e);
        }
    }

    private int writeRow(Sheet sheet, int rowIdx, String label, Object value) {
        Row row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value != null ? value.toString() : "0");
        return rowIdx;
    }

    private int writeRow(Sheet sheet, int rowIdx, String label, Object value, CellStyle style) {
        Row row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue(label);
        Cell cell = row.createCell(1);
        if (value instanceof BigDecimal) {
            cell.setCellValue(((BigDecimal) value).doubleValue());
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else {
            cell.setCellValue(value != null ? value.toString() : "0");
        }
        cell.setCellStyle(style);
        return rowIdx;
    }

    public void enviarReportePorEmail(String email) {
        try {
            byte[] pdf = exportarResumenPDF();

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject("Reporte ALPAY");
            helper.setText("Adjunto encontraras el reporte de cobranza.");

            helper.addAttachment(
                    "Reporte_Alpay.pdf",
                    new ByteArrayResource(pdf)
            );

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
