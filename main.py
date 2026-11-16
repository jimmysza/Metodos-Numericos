'''
===========================================================================================

                    TRABAJO FINAL DE MÉTODOS NUMÉRICOS CON PYTHON

                    
                                    PRESENTADO POR

                                    
               DEIVI LUIS ALEMÁN CATALÁN,
               JAIME ALEJANDRO PEREZ RODRIGUEZ,
               JESÚS DAVID SANCHEZ CASTILLO, 
               KEVIN JESÚS PACHECO GÓMEZ
               & SEBASTIAN ALESSANDRO CASTRO JIMENEZ

                       
                                JAVIER MENDOZA, DOCENTE

                                
                        FUNDACIÓN UNIVERSITARIA TECNOLÓGICO
                                     COMFENALCO

                                    
                                INGENIERÍA DE SISTEMAS

===========================================================================================
'''

import math
import os
import re


def limpiar():
    os.system('cls' if os.name == 'nt' else 'clear')


# ==========================================
#     PROCESADOR Y EVALUADOR MATEMÁTICO
# ==========================================

def preparar_expresion(expr_str):
    """
    Convierte expresiones matemáticas escritas de forma natural a sintaxis válida de Python.
    Soporta: ^ para potencias, sen(x), tg(x), ln(x), raiz(x), multiplicación implícita (2x, 3(x+1)).
    """
    s = expr_str.strip()
    # Reemplazar coma decimal si se usa sin funciones de varios argumentos
    # Cambiar ^ por **
    s = s.replace('^', '**')

    # Traducciones de funciones comunes en español/matemáticas
    reemplazos = [
        (r'\bsen\b', 'sin'),
        (r'\btg\b', 'tan'),
        (r'\bln\b', 'log'),
        (r'\braiz\b', 'sqrt'),
        (r'\barcsen\b', 'asin'),
        (r'\barccos\b', 'acos'),
        (r'\barctan\b', 'atan'),
    ]
    for patron, reemplazo in reemplazos:
        s = re.sub(patron, reemplazo, s, flags=re.IGNORECASE)

    # Multiplicación implícita:
    # 1) Número seguido de variable o función o paréntesis: 2x -> 2*x, 3(x) -> 3*(x), 2sin(x) -> 2*sin(x)
    s = re.sub(r'(\d)\s*([a-zA-Z\(])', r'\1*\2', s)
    # 2) Cierre de paréntesis seguido de número, variable o apertura de paréntesis: (x+1)2 -> (x+1)*2, (x)(y) -> (x)*(y)
    s = re.sub(r'(\))\s*([\da-zA-Z\(])', r'\1*\2', s)
    # 3) Variable 'x' seguida de paréntesis: x(x+1) -> x*(x+1)
    s = re.sub(r'\b(x)\s*(\()', r'\1*\2', s)

    return s


def obtener_entorno(x_val=None):
    entorno = {k: v for k, v in math.__dict__.items() if not k.startswith("__")}
    entorno['ln'] = math.log
    entorno['sen'] = math.sin
    entorno['tg'] = math.tan
    entorno['raiz'] = math.sqrt
    entorno['abs'] = abs
    if x_val is not None:
        entorno['x'] = x_val
        entorno['X'] = x_val
    return entorno


def evaluar_funcion(func_str, x_val):
    expr = preparar_expresion(func_str)
    entorno = obtener_entorno(x_val)
    try:
        resultado = eval(expr, {"__builtins__": None}, entorno)
        if isinstance(resultado, (int, float)) and not math.isnan(resultado) and not math.isinf(resultado):
            return float(resultado)
        return None
    except Exception:
        return None


def evaluar_limite(lim_str):
    expr = preparar_expresion(lim_str)
    entorno = obtener_entorno()
    try:
        resultado = eval(expr, {"__builtins__": None}, entorno)
        if isinstance(resultado, (int, float)) and not math.isnan(resultado) and not math.isinf(resultado):
            return float(resultado)
        return None
    except Exception:
        return None


# ==========================================
#     IMPRESIÓN DE TABLAS PASO A PASO
# ==========================================

def mostrar_tabla_paso_a_paso(titulo, formula_i, formula_delta, a, b, n, delta, indice_inicio, coefs, x_vals, f_vals, factor_ext, factor_ext_str, resultado):
    print("\n" + "=" * 78)
    print(f"  {titulo}")
    print("=" * 78)
    print(f"  FÓRMULA DE LA GUÍA:")
    print(f"    {formula_i}")
    print(f"    {formula_delta}")
    print("-" * 78)
    print(f"  1. CÁLCULO DE DELTA (Δ):")
    print(f"     Δ = ({b:.6g} - ({a:.6g})) / {n} = {delta:.8f}")
    print("-" * 78)
    print(f"  2. TABLA DE NODOS Y EVALUACIÓN DE LA FUNCIÓN:")
    print(f"  {'Nodo':<8} | {'Valor x_i':<16} | {'f(x_i)':<18} | {'Coef (c_i)':<10} | {'c_i * f(x_i)':<16}")
    print("  " + "-" * 74)

    suma_ponderada = 0.0
    mostrar_todo = len(x_vals) <= 22

    for idx, (x_i, f_i, c_i) in enumerate(zip(x_vals, f_vals, coefs)):
        num_nodo = indice_inicio + idx
        termino = c_i * f_i
        suma_ponderada += termino

        if mostrar_todo or idx < 10 or idx >= len(x_vals) - 5:
            etiqueta = f"x_{num_nodo}"
            print(f"  {etiqueta:<8} | {x_i:<16.8f} | {f_i:<18.8f} | {c_i:<10} | {termino:<16.8f}")
        elif idx == 10:
            print(f"  {'...':<8} | {'...':<16} | {'...':<18} | {'...':<10} | {'...':<16}")

    print("  " + "-" * 74)
    print(f"  Suma ponderada entre corchetes [ Σ c_i * f(x_i) ] = {suma_ponderada:.8f}")
    print("-" * 78)
    print(f"  3. SUSTITUCIÓN EN LA FÓRMULA:")
    print(f"     I = ({factor_ext_str}) * [{suma_ponderada:.8f}]")
    print(f"     I = {factor_ext:.8f} * {suma_ponderada:.8f}")
    print("=" * 78)
    print(f"  >> RESULTADO DE LA INTEGRAL (I) = {resultado:.8f}")
    print("=" * 78)


# ==========================================
#     LOS 5 MÉTODOS DE LA HOJA DEL DOCENTE
# ==========================================

def metodo_1_trapezoidal(func_str, a, b, n, mostrar=True):
    """
    1. Método TRAPEZOIDAL:
       I = (Δ / 2) * [ f(x_0) + 2f(x_1) + 2f(x_2) + 2f(x_3) + ... + f(x_n) ]
       Δ = (b - a) / n
    """
    if n <= 0:
        return None, "[!] Error: El número de particiones (n) debe ser mayor que 0."

    delta = (b - a) / n
    x_vals = [a + i * delta for i in range(n + 1)]
    f_vals = []

    for x in x_vals:
        val = evaluar_funcion(func_str, x)
        if val is None:
            return None, f"[!] Error matemático al evaluar f(x) en x = {x}."
        f_vals.append(val)

    coefs = [1] + [2] * (n - 1) + [1]
    suma = sum(c * f for c, f in zip(coefs, f_vals))
    factor_ext = delta / 2.0
    resultado = factor_ext * suma

    if mostrar:
        mostrar_tabla_paso_a_paso(
            titulo="1. MÉTODO TRAPEZOIDAL",
            formula_i="I = (Δ / 2) * [ f(x_0) + 2f(x_1) + 2f(x_2) + 2f(x_3) + ... + f(x_n) ]",
            formula_delta="Δ = (b - a) / n",
            a=a, b=b, n=n, delta=delta,
            indice_inicio=0,  # En la hoja el método 1 inicia en x_0 hasta x_n
            coefs=coefs, x_vals=x_vals, f_vals=f_vals,
            factor_ext=factor_ext,
            factor_ext_str=f"{delta:.6g} / 2",
            resultado=resultado
        )
    return resultado, None


def metodo_2_boole(func_str, a, b, mostrar=True):
    """
    2. Método de JORGE BOOLE:
       I = (2Δ / 45) * [ 7f(x_1) + 32f(x_2) + 12f(x_3) + 32f(x_4) + 7f(x_5) ]
       Δ = (b - a) / 4
    """
    n = 4
    delta = (b - a) / n
    x_vals = [a + i * delta for i in range(n + 1)]
    f_vals = []

    for x in x_vals:
        val = evaluar_funcion(func_str, x)
        if val is None:
            return None, f"[!] Error matemático al evaluar f(x) en x = {x}."
        f_vals.append(val)

    coefs = [7, 32, 12, 32, 7]
    suma = sum(c * f for c, f in zip(coefs, f_vals))
    factor_ext = (2.0 * delta) / 45.0
    resultado = factor_ext * suma

    if mostrar:
        mostrar_tabla_paso_a_paso(
            titulo="2. MÉTODO DE JORGE BOOLE",
            formula_i="I = (2Δ / 45) * [ 7f(x_1) + 32f(x_2) + 12f(x_3) + 32f(x_4) + 7f(x_5) ]",
            formula_delta="Δ = (b - a) / 4",
            a=a, b=b, n=n, delta=delta,
            indice_inicio=1,  # En la hoja el método 2 usa x_1, x_2, x_3, x_4, x_5
            coefs=coefs, x_vals=x_vals, f_vals=f_vals,
            factor_ext=factor_ext,
            factor_ext_str=f"2 * {delta:.6g} / 45",
            resultado=resultado
        )
    return resultado, None


def metodo_3_simpson_38(func_str, a, b, mostrar=True):
    """
    3. Método de T. SIMPSON 3/8 - NEWTON-COTES:
       I = (3Δ / 8) * [ f(x_1) + 3f(x_2) + 3f(x_3) + f(x_4) ]
       Δ = (b - a) / 3
    """
    n = 3
    delta = (b - a) / n
    x_vals = [a + i * delta for i in range(n + 1)]
    f_vals = []

    for x in x_vals:
        val = evaluar_funcion(func_str, x)
        if val is None:
            return None, f"[!] Error matemático al evaluar f(x) en x = {x}."
        f_vals.append(val)

    coefs = [1, 3, 3, 1]
    suma = sum(c * f for c, f in zip(coefs, f_vals))
    factor_ext = (3.0 * delta) / 8.0
    resultado = factor_ext * suma

    if mostrar:
        mostrar_tabla_paso_a_paso(
            titulo="3. MÉTODO DE T. SIMPSON 3/8 - NEWTON-COTES",
            formula_i="I = (3Δ / 8) * [ f(x_1) + 3f(x_2) + 3f(x_3) + f(x_4) ]",
            formula_delta="Δ = (b - a) / 3",
            a=a, b=b, n=n, delta=delta,
            indice_inicio=1,  # En la hoja el método 3 usa x_1, x_2, x_3, x_4
            coefs=coefs, x_vals=x_vals, f_vals=f_vals,
            factor_ext=factor_ext,
            factor_ext_str=f"3 * {delta:.6g} / 8",
            resultado=resultado
        )
    return resultado, None


def metodo_4_simpson_13(func_str, a, b, mostrar=True):
    """
    4. Método de T. SIMPSON 1/3 - NEWTON-COTES:
       I = (Δ / 3) * [ f(x_1) + 4f(x_2) + f(x_3) ]
       Δ = (b - a) / 2
    """
    n = 2
    delta = (b - a) / n
    x_vals = [a + i * delta for i in range(n + 1)]
    f_vals = []

    for x in x_vals:
        val = evaluar_funcion(func_str, x)
        if val is None:
            return None, f"[!] Error matemático al evaluar f(x) en x = {x}."
        f_vals.append(val)

    coefs = [1, 4, 1]
    suma = sum(c * f for c, f in zip(coefs, f_vals))
    factor_ext = delta / 3.0
    resultado = factor_ext * suma

    if mostrar:
        mostrar_tabla_paso_a_paso(
            titulo="4. MÉTODO DE T. SIMPSON 1/3 - NEWTON-COTES",
            formula_i="I = (Δ / 3) * [ f(x_1) + 4f(x_2) + f(x_3) ]",
            formula_delta="Δ = (b - a) / 2",
            a=a, b=b, n=n, delta=delta,
            indice_inicio=1,  # En la hoja el método 4 usa x_1, x_2, x_3
            coefs=coefs, x_vals=x_vals, f_vals=f_vals,
            factor_ext=factor_ext,
            factor_ext_str=f"{delta:.6g} / 3",
            resultado=resultado
        )
    return resultado, None


def metodo_5_simpson_abierto(func_str, a, b, n, mostrar=True):
    """
    5. Método SIMPSON ABIERTO (Para n particiones pares, n debe ser un número par):
       I = (Δ / 3) * [ f(x_1) + 4f(x_2) + 2f(x_3) + 4f(x_4) + 2f(x_5) + ... + f(x_{n+1}) ]
       Δ = (b - a) / n
    """
    if n <= 0 or n % 2 != 0:
        return None, "[!] Error: Para el método SIMPSON ABIERTO, 'n' DEBE ser un número entero par mayor que 0 (ej. 2, 4, 6, 8, 10...)."

    delta = (b - a) / n
    x_vals = [a + i * delta for i in range(n + 1)]
    f_vals = []

    for x in x_vals:
        val = evaluar_funcion(func_str, x)
        if val is None:
            return None, f"[!] Error matemático al evaluar f(x) en x = {x}."
        f_vals.append(val)

    coefs = [1]
    for i in range(1, n):
        coefs.append(4 if i % 2 == 1 else 2)
    coefs.append(1)

    suma = sum(c * f for c, f in zip(coefs, f_vals))
    factor_ext = delta / 3.0
    resultado = factor_ext * suma

    if mostrar:
        mostrar_tabla_paso_a_paso(
            titulo="5. MÉTODO SIMPSON ABIERTO (n particiones pares)",
            formula_i="I = (Δ / 3) * [ f(x_1) + 4f(x_2) + 2f(x_3) + 4f(x_4) + 2f(x_5) + ... + f(x_n) ]",
            formula_delta="Δ = (b - a) / n   (con n par)",
            a=a, b=b, n=n, delta=delta,
            indice_inicio=1,  # En la hoja el método 5 inicia en x_1, x_2, x_3, x_4, x_5...
            coefs=coefs, x_vals=x_vals, f_vals=f_vals,
            factor_ext=factor_ext,
            factor_ext_str=f"{delta:.6g} / 3",
            resultado=resultado
        )
    return resultado, None


# ==========================================
#        MENÚS Y ENTRADA DE USUARIO
# ==========================================

def mostrar_portada():
    print("=" * 78)
    print("          TRABAJO FINAL DE MÉTODOS NUMÉRICOS - INGENIERÍA DE SISTEMAS")
    print("               FUNDACIÓN UNIVERSITARIA TECNOLÓGICO COMFENALCO")
    print("                          DOCENTE: JAVIER MENDOZA")
    print("-" * 78)
    print("  INTEGRANTES:")
    print("   1. DEIVI LUIS ALEMÁN CATALÁN")
    print("   2. JAIME ALEJANDRO PEREZ RODRIGUEZ")
    print("   3. JESÚS DAVID SANCHEZ CASTILLO")
    print("   4. KEVIN JESÚS PACHECO GÓMEZ")
    print("   5. SEBASTIAN ALESSANDRO CASTRO JIMENEZ")
    print("=" * 78)


def pedir_datos_basicos():
    print("\n" + "-" * 78)
    print("  GUÍA RÁPIDA PARA ESCRIBIR LA FUNCIÓN f(x) Y LOS LÍMITES:")
    print("   • Potencias:         x^2  o  x**2       • Multiplicación:  2*x  o  2x")
    print("   • Raíz cuadrada:     sqrt(x) o raiz(x)  • Trigonométricas: sin(x), cos(x), tan(x)")
    print("   • Exponencial / Log: exp(x), ln(x)      • Constantes:      pi, e  (ej. pi/2)")
    print("-" * 78)

    funcion = input("  1) Ingresa la función f(x): ").strip()
    if not funcion:
        print("\n  [!] Error: Debes ingresar una función f(x).")
        return None, None, None

    a_str = input("  2) Límite inferior (a): ").strip()
    b_str = input("  3) Límite superior (b): ").strip()

    a = evaluar_limite(a_str)
    b = evaluar_limite(b_str)

    if a is None or b is None:
        print("\n  [!] Error: Los límites 'a' y 'b' deben ser números o expresiones válidas (ej. 0, 2, pi/2).")
        return None, None, None

    # Prueba rápida de evaluación en el punto medio para verificar sintaxis
    prueba = evaluar_funcion(funcion, (a + b) / 2.0)
    if prueba is None and evaluar_funcion(funcion, a) is None:
        print(f"\n  [!] Error: No se pudo evaluar la función '{funcion}'. Revisa cómo está escrita.")
        return None, None, None

    print(f"  [OK] Función interpretada como: f(x) = {preparar_expresion(funcion)} en [{a:.6g}, {b:.6g}]")
    return funcion, a, b


def pedir_n(solo_par=False):
    while True:
        mensaje = "  4) Número de particiones (n, DEBE SER PAR): " if solo_par else "  4) Número de particiones (n): "
        n_str = input(mensaje).strip()
        try:
            n = int(n_str)
            if n <= 0:
                print("  [!] Error: 'n' debe ser mayor que 0.")
                continue
            if solo_par and n % 2 != 0:
                print(f"  [!] Error: Ingresaste n = {n} (impar). Para este método, 'n' DEBE ser un número PAR (ej. 2, 4, 6, 8, 10).")
                continue
            return n
        except ValueError:
            print("  [!] Error: 'n' debe ser un número entero válido.")


def comparar_todos_los_metodos():
    print("\n--- 6. CALCULAR Y COMPARAR LOS 5 MÉTODOS DE LA GUÍA A LA VEZ ---")
    f, a, b = pedir_datos_basicos()
    if not f:
        return
    n = pedir_n(solo_par=True)

    r1, err1 = metodo_1_trapezoidal(f, a, b, n, mostrar=True)
    r2, err2 = metodo_2_boole(f, a, b, mostrar=True)
    r3, err3 = metodo_3_simpson_38(f, a, b, mostrar=True)
    r4, err4 = metodo_4_simpson_13(f, a, b, mostrar=True)
    r5, err5 = metodo_5_simpson_abierto(f, a, b, n, mostrar=True)

    print("\n" + "=" * 78)
    print(f"  RESUMEN COMPARATIVO DE LOS 5 MÉTODOS")
    print(f"  Integral de f(x) = {f}  desde a = {a:.6g} hasta b = {b:.6g}  (con n = {n})")
    print("=" * 78)
    print(f"  {'#':<4} | {'Método de la Guía':<42} | {'Particiones':<12} | {'Resultado (I)':<14}")
    print("  " + "-" * 74)
    print(f"  {'1':<4} | {'Método Trapezoidal':<42} | {f'n = {n}':<12} | {r1 if r1 is not None else err1:<14.8f}")
    print(f"  {'2':<4} | {'Método de Jorge Boole':<42} | {'4 (fijo)':<12} | {r2 if r2 is not None else err2:<14.8f}")
    print(f"  {'3':<4} | {'Método de T. Simpson 3/8 - Newton-Cotes':<42} | {'3 (fijo)':<12} | {r3 if r3 is not None else err3:<14.8f}")
    print(f"  {'4':<4} | {'Método de T. Simpson 1/3 - Newton-Cotes':<42} | {'2 (fijo)':<12} | {r4 if r4 is not None else err4:<14.8f}")
    print(f"  {'5':<4} | {'Método Simpson Abierto (n par)':<42} | {f'n = {n} (par)':<12} | {r5 if r5 is not None else err5:<14.8f}")
    print("=" * 78)


def main():
    while True:
        limpiar()
        mostrar_portada()
        print("\n  MENÚ PRINCIPAL (PUNTOS DE LA GUÍA DEL DOCENTE):")
        print("  1. Método TRAPEZOIDAL")
        print("  2. Método de JORGE BOOLE")
        print("  3. Método de T. SIMPSON 3/8 - NEWTON-COTES")
        print("  4. Método de T. SIMPSON 1/3 - NEWTON-COTES")
        print("  5. Método SIMPSON ABIERTO (Para n particiones pares)")
        print("  6. Calcular y comparar los 5 métodos a la vez")
        print("  7. Salir del programa")
        print("=" * 78)

        opcion = input("\n  Elige una opción del menú (1-7): ").strip()

        if opcion == '7':
            print("\n  Saliendo del programa. ¡Éxitos en la entrega!")
            break

        limpiar()
        mostrar_portada()

        if opcion == '1':
            print("\n--- PUNTO 1: MÉTODO TRAPEZOIDAL ---")
            f, a, b = pedir_datos_basicos()
            if f:
                n = pedir_n(solo_par=False)
                res, err = metodo_1_trapezoidal(f, a, b, n, mostrar=True)
                if err:
                    print(f"\n  {err}")

        elif opcion == '2':
            print("\n--- PUNTO 2: MÉTODO DE JORGE BOOLE ---")
            f, a, b = pedir_datos_basicos()
            if f:
                res, err = metodo_2_boole(f, a, b, mostrar=True)
                if err:
                    print(f"\n  {err}")

        elif opcion == '3':
            print("\n--- PUNTO 3: MÉTODO DE T. SIMPSON 3/8 - NEWTON-COTES ---")
            f, a, b = pedir_datos_basicos()
            if f:
                res, err = metodo_3_simpson_38(f, a, b, mostrar=True)
                if err:
                    print(f"\n  {err}")

        elif opcion == '4':
            print("\n--- PUNTO 4: MÉTODO DE T. SIMPSON 1/3 - NEWTON-COTES ---")
            f, a, b = pedir_datos_basicos()
            if f:
                res, err = metodo_4_simpson_13(f, a, b, mostrar=True)
                if err:
                    print(f"\n  {err}")

        elif opcion == '5':
            print("\n--- PUNTO 5: MÉTODO SIMPSON ABIERTO (n particiones pares) ---")
            f, a, b = pedir_datos_basicos()
            if f:
                n = pedir_n(solo_par=True)
                res, err = metodo_5_simpson_abierto(f, a, b, n, mostrar=True)
                if err:
                    print(f"\n  {err}")

        elif opcion == '6':
            comparar_todos_los_metodos()

        else:
            print("\n  [!] Opción no válida. Por favor ingresa un número del 1 al 7.")

        input("\n  Presiona ENTER para volver al menú principal...")


if __name__ == "__main__":
    main()
