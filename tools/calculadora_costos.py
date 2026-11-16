#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Calculadora de Costos y Precios - Vicunia
Herramienta de terminal para calcular costos y precios sugeridos basados
en el estudio de viabilidad de Cajamarca 2026.
"""

import sys

# Tarifas Base de Cajamarca 2026 (según reporte Deep Research)
COSTO_PLA_GRAMO = 55.0 / 1000.0       # S/. 55 por kg
COSTO_LANA_GRAMO = 10.0 / 100.0       # S/. 10 por 100g (Silvia/Quesito)
TARIFA_LUZ_KWH = 0.6888               # BT5B Cajamarca
POTENCIA_IMPRESORA_KW = 0.10          # 100 Watts
DEPRECIACION_3D_HORA = 950.0 / 4000.0 # S/. 950 de inversión / 4000 horas
MANO_OBRA_CROCHET_HORA = 1130.0 / 192.0 # RMV S/. 1130 / 192 horas (S/. 5.89)
MANO_OBRA_3D_HORA = 10.0              # Tarifa de Jair por post-procesado/diseño

def calcular_producto(nombre, pla_g, horas_3d, lana_g, horas_crochet, insumos_extra, empaque):
    # Cálculos 3D
    costo_pla = pla_g * COSTO_PLA_GRAMO
    costo_luz = horas_3d * POTENCIA_IMPRESORA_KW * TARIFA_LUZ_KWH
    costo_depr = horas_3d * DEPRECIACION_3D_HORA
    costo_mo_3d = (horas_3d * 0.1) * MANO_OBRA_3D_HORA # Asumimos 10% de tiempo de supervisión/post-proceso
    subtotal_3d = costo_pla + costo_luz + costo_depr + costo_mo_3d
    
    # Cálculos Crochet
    costo_lana = lana_g * COSTO_LANA_GRAMO
    costo_mo_crochet = horas_crochet * MANO_OBRA_CROCHET_HORA
    subtotal_crochet = costo_lana + costo_mo_crochet
    
    # Costo Total de Producción
    costo_total = subtotal_3d + subtotal_crochet + insumos_extra + empaque
    
    # Precios sugeridos y márgenes
    precio_minimo = costo_total * 2.0  # Regla de oro: mínimo 2x costo directo
    precio_sugerido = costo_total * 2.5 # Recomendado para ferias
    precio_premium = costo_total * 3.0  # Para encargos personalizados o ferias turísticas
    
    print("\n" + "="*50)
    print(f"📊 DESGLOSE DE COSTOS: {nombre.upper()}")
    print("="*50)
    print(f"🔩 COMPONENTE IMPRESIÓN 3D ({pla_g}g, {horas_3d}h):")
    print(f"  - Filamento PLA mate:   S/. {costo_pla:.2f}")
    print(f"  - Energía eléctrica:    S/. {costo_luz:.2f}")
    print(f"  - Depreciación máquina: S/. {costo_depr:.2f}")
    print(f"  - Post-procesado (MO):  S/. {costo_mo_3d:.2f}")
    print(f"  * Subtotal 3D:          S/. {subtotal_3d:.2f}")
    print("-"*50)
    print(f"🧶 COMPONENTE CROCHET ({lana_g}g, {horas_crochet}h):")
    print(f"  - Lana / Hilo algodón:  S/. {costo_lana:.2f}")
    print(f"  - Mano de obra tejedor: S/. {costo_mo_crochet:.2f}")
    print(f"  * Subtotal Crochet:     S/. {subtotal_crochet:.2f}")
    print("-"*50)
    print("📦 OTROS COSTOS:")
    print(f"  - Insumos varios (ojos, relleno): S/. {insumos_extra:.2f}")
    print(f"  - Empaque (bolsa, etiqueta):      S/. {empaque:.2f}")
    print("="*50)
    print(f"💰 COSTO DE PRODUCCIÓN TOTAL:  S/. {costo_total:.2f}")
    print("="*50)
    print("📈 ESTRATEGIA DE PRECIOS SUGERIDA:")
    print(f"  - Precio Mínimo (2x - 50% Margen):   S/. {precio_minimo:.2f}")
    print(f"  - Precio Sugerido (2.5x - 60% Margen):S/. {precio_sugerido:.2f}")
    print(f"  - Precio Premium (3x - 66% Margen):  S/. {precio_premium:.2f}")
    print("="*50)

def main():
    print("🦙 Calculadora de Costeo Comercial - Vicunia 🦙")
    print("Estudio de Viabilidad y Costos en Cajamarca (2026)\n")
    
    try:
        nombre = input("Nombre del producto: ")
        pla_g = float(input("Gramos de filamento PLA: "))
        horas_3d = float(input("Horas de impresión 3D: "))
        lana_g = float(input("Gramos de lana / hilo: "))
        horas_crochet = float(input("Horas de tejido a crochet: "))
        insumos_extra = float(input("Costo de insumos extras (ojitos, relleno, etc) [S/.]: "))
        empaque = float(input("Costo de empaque y etiquetas [S/.]: "))
        
        calcular_producto(nombre, pla_g, horas_3d, lana_g, horas_crochet, insumos_extra, empaque)
    except ValueError:
        print("\n🚨 Error: Ingresa valores numéricos válidos.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Calculadora cerrada.")
        sys.exit(0)

if __name__ == "__main__":
    main()
