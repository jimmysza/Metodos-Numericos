// =========================================================================
// TRABAJO FINAL DE MÉTODOS NUMÉRICOS - LÓGICA MATEMÁTICA Y FRONTEND
// Fundación Universitaria Tecnológico Comfenalco | Docente: Javier Mendoza
// =========================================================================

let currentMethod = 'all';
let functionChart = null;

// Preprocesador de expresiones matemáticas naturales a sintaxis JS
function prepararExpresionJS(exprStr) {
    let s = exprStr.trim();
    if (!s) return '';

    // Potencias ^ -> **
    s = s.replace(/\^/g, '**');

    // Funciones en español e inglés (protegidas con tokens temporales para no duplicar reemplazos)
    const mapaFunciones = [
        [/\barcsen\b/gi, '__ASIN__'],
        [/\barcsin\b/gi, '__ASIN__'],
        [/\barccos\b/gi, '__ACOS__'],
        [/\barctan\b/gi, '__ATAN__'],
        [/\bsen\b/gi, '__SIN__'],
        [/\bsin\b/gi, '__SIN__'],
        [/\bcos\b/gi, '__COS__'],
        [/\btg\b/gi, '__TAN__'],
        [/\btan\b/gi, '__TAN__'],
        [/\braiz\b/gi, '__SQRT__'],
        [/\bsqrt\b/gi, '__SQRT__'],
        [/\bln\b/gi, '__LOG__'],
        [/\blog10\b/gi, '__LOG10__'],
        [/\blog\b/gi, '__LOG__'],
        [/\bexp\b/gi, '__EXP__'],
        [/\babs\b/gi, '__ABS__']
    ];

    for (const [regex, token] of mapaFunciones) {
        s = s.replace(regex, token);
    }

    // Constantes pi y e
    s = s.replace(/\bpi\b/gi, '__PI__');
    s = s.replace(/\be\b/g, '__E__');

    // Multiplicación implícita:
    // 1) Número seguido de variable, constante, función o paréntesis: 2x -> 2*x, 3(x+1) -> 3*(x+1), 2__SIN__ -> 2*__SIN__
    s = s.replace(/(\d)\s*([a-zA-Z_\(])/g, '$1*$2');
    // 2) Cierre de paréntesis seguido de número, letra o paréntesis: (x+1)(x-1) -> (x+1)*(x-1)
    s = s.replace(/(\))\s*([\da-zA-Z_\(])/g, '$1*$2');
    // 3) Variable x seguida de paréntesis o función: x(x+1) -> x*(x+1)
    s = s.replace(/\b([xX])\s*(\(|__)/g, '$1*$2');

    // Restaurar tokens a Math.*
    const restaurar = {
        '__ASIN__': 'Math.asin',
        '__ACOS__': 'Math.acos',
        '__ATAN__': 'Math.atan',
        '__SIN__': 'Math.sin',
        '__COS__': 'Math.cos',
        '__TAN__': 'Math.tan',
        '__SQRT__': 'Math.sqrt',
        '__LOG10__': 'Math.log10',
        '__LOG__': 'Math.log',
        '__EXP__': 'Math.exp',
        '__ABS__': 'Math.abs',
        '__PI__': 'Math.PI',
        '__E__': 'Math.E'
    };

    for (const [token, jsFunc] of Object.entries(restaurar)) {
        s = s.split(token).join(jsFunc);
    }

    return s;
}

function evaluarFuncion(funcStr, xVal) {
    const jsExpr = prepararExpresionJS(funcStr);
    try {
        const fn = new Function('x', 'X', `"use strict"; return (${jsExpr});`);
        const res = fn(xVal, xVal);
        if (typeof res === 'number' && Number.isFinite(res)) {
            return res;
        }
        return null;
    } catch (e) {
        return null;
    }
}

function evaluarLimite(limStr) {
    const jsExpr = prepararExpresionJS(limStr);
    try {
        const fn = new Function(`"use strict"; return (${jsExpr});`);
        const res = fn();
        if (typeof res === 'number' && Number.isFinite(res)) {
            return res;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// =========================================================================
// IMPLEMENTACIÓN DE LOS 5 MÉTODOS DE LA GUÍA DEL DOCENTE
// =========================================================================

// 1. Método Trapezoidal
function calcularMetodo1Trapezoidal(funcStr, a, b, n) {
    const delta = (b - a) / n;
    const xVals = [];
    const fVals = [];
    const coefs = [];

    for (let i = 0; i <= n; i++) {
        const xi = a + i * delta;
        const fi = evaluarFuncion(funcStr, xi);
        if (fi === null) return { error: `Error matemático al evaluar f(x) en x = ${xi.toFixed(6)}` };
        xVals.push(xi);
        fVals.push(fi);
        coefs.push(i === 0 || i === n ? 1 : 2);
    }

    const sumaPonderada = fVals.reduce((acc, f, idx) => acc + coefs[idx] * f, 0);
    const factorExt = delta / 2;
    const resultado = factorExt * sumaPonderada;

    return {
        id: '1',
        punto: 'Punto 1',
        nombre: 'Método Trapezoidal',
        particionesTexto: `n = ${n}`,
        n,
        delta,
        indiceInicio: 0, // En la hoja del profesor inicia en x_0 hasta x_n
        formulaLatex: 'I = \\frac{\\Delta}{2} \\left[ f(x_0) + 2f(x_1) + 2f(x_2) + 2f(x_3) + \\dots + f(x_n) \\right]',
        deltaLatex: `\\Delta = \\frac{b - a}{n} = \\frac{${formatNum(b)} - (${formatNum(a)})}{${n}} = ${delta.toFixed(8)}`,
        xVals,
        fVals,
        coefs,
        sumaPonderada,
        factorExt,
        factorExtTexto: `${formatNum(delta)} / 2`,
        resultado
    };
}

// 2. Método de Jorge Boole
function calcularMetodo2Boole(funcStr, a, b) {
    const n = 4;
    const delta = (b - a) / 4;
    const coefs = [7, 32, 12, 32, 7];
    const xVals = [];
    const fVals = [];

    for (let i = 0; i <= n; i++) {
        const xi = a + i * delta;
        const fi = evaluarFuncion(funcStr, xi);
        if (fi === null) return { error: `Error matemático al evaluar f(x) en x = ${xi.toFixed(6)}` };
        xVals.push(xi);
        fVals.push(fi);
    }

    const sumaPonderada = fVals.reduce((acc, f, idx) => acc + coefs[idx] * f, 0);
    const factorExt = (2 * delta) / 45;
    const resultado = factorExt * sumaPonderada;

    return {
        id: '2',
        punto: 'Punto 2',
        nombre: 'Método de Jorge Boole',
        particionesTexto: '4 (fijo)',
        n,
        delta,
        indiceInicio: 1, // En la hoja del profesor usa x_1, x_2, x_3, x_4, x_5
        formulaLatex: 'I = \\frac{2\\Delta}{45} \\left[ 7f(x_1) + 32f(x_2) + 12f(x_3) + 32f(x_4) + 7f(x_5) \\right]',
        deltaLatex: `\\Delta = \\frac{b - a}{4} = \\frac{${formatNum(b)} - (${formatNum(a)})}{4} = ${delta.toFixed(8)}`,
        xVals,
        fVals,
        coefs,
        sumaPonderada,
        factorExt,
        factorExtTexto: `(2 * ${formatNum(delta)}) / 45`,
        resultado
    };
}

// 3. Método de T. Simpson 3/8 - Newton-Cotes
function calcularMetodo3Simpson38(funcStr, a, b) {
    const n = 3;
    const delta = (b - a) / 3;
    const coefs = [1, 3, 3, 1];
    const xVals = [];
    const fVals = [];

    for (let i = 0; i <= n; i++) {
        const xi = a + i * delta;
        const fi = evaluarFuncion(funcStr, xi);
        if (fi === null) return { error: `Error matemático al evaluar f(x) en x = ${xi.toFixed(6)}` };
        xVals.push(xi);
        fVals.push(fi);
    }

    const sumaPonderada = fVals.reduce((acc, f, idx) => acc + coefs[idx] * f, 0);
    const factorExt = (3 * delta) / 8;
    const resultado = factorExt * sumaPonderada;

    return {
        id: '3',
        punto: 'Punto 3',
        nombre: 'Método de T. Simpson 3/8 - Newton-Cotes',
        particionesTexto: '3 (fijo)',
        n,
        delta,
        indiceInicio: 1, // En la hoja del profesor usa x_1, x_2, x_3, x_4
        formulaLatex: 'I = \\frac{3\\Delta}{8} \\left[ f(x_1) + 3f(x_2) + 3f(x_3) + f(x_4) \\right]',
        deltaLatex: `\\Delta = \\frac{b - a}{3} = \\frac{${formatNum(b)} - (${formatNum(a)})}{3} = ${delta.toFixed(8)}`,
        xVals,
        fVals,
        coefs,
        sumaPonderada,
        factorExt,
        factorExtTexto: `(3 * ${formatNum(delta)}) / 8`,
        resultado
    };
}

// 4. Método de T. Simpson 1/3 - Newton-Cotes
function calcularMetodo4Simpson13(funcStr, a, b) {
    const n = 2;
    const delta = (b - a) / 2;
    const coefs = [1, 4, 1];
    const xVals = [];
    const fVals = [];

    for (let i = 0; i <= n; i++) {
        const xi = a + i * delta;
        const fi = evaluarFuncion(funcStr, xi);
        if (fi === null) return { error: `Error matemático al evaluar f(x) en x = ${xi.toFixed(6)}` };
        xVals.push(xi);
        fVals.push(fi);
    }

    const sumaPonderada = fVals.reduce((acc, f, idx) => acc + coefs[idx] * f, 0);
    const factorExt = delta / 3;
    const resultado = factorExt * sumaPonderada;

    return {
        id: '4',
        punto: 'Punto 4',
        nombre: 'Método de T. Simpson 1/3 - Newton-Cotes',
        particionesTexto: '2 (fijo)',
        n,
        delta,
        indiceInicio: 1, // En la hoja del profesor usa x_1, x_2, x_3
        formulaLatex: 'I = \\frac{\\Delta}{3} \\left[ f(x_1) + 4f(x_2) + f(x_3) \\right]',
        deltaLatex: `\\Delta = \\frac{b - a}{2} = \\frac{${formatNum(b)} - (${formatNum(a)})}{2} = ${delta.toFixed(8)}`,
        xVals,
        fVals,
        coefs,
        sumaPonderada,
        factorExt,
        factorExtTexto: `${formatNum(delta)} / 3`,
        resultado
    };
}

// 5. Método Simpson Abierto (Para n particiones pares)
function calcularMetodo5SimpsonAbierto(funcStr, a, b, n) {
    if (n <= 0 || n % 2 !== 0) {
        return {
            error: `Para el Punto 5 (Método Simpson Abierto), el número de particiones n DEBE ser par (ingresaste n = ${n}). Prueba con 2, 4, 6, 8, 10...`
        };
    }

    const delta = (b - a) / n;
    const xVals = [];
    const fVals = [];
    const coefs = [];

    for (let i = 0; i <= n; i++) {
        const xi = a + i * delta;
        const fi = evaluarFuncion(funcStr, xi);
        if (fi === null) return { error: `Error matemático al evaluar f(x) en x = ${xi.toFixed(6)}` };
        xVals.push(xi);
        fVals.push(fi);
        if (i === 0 || i === n) {
            coefs.push(1);
        } else {
            coefs.push(i % 2 === 1 ? 4 : 2);
        }
    }

    const sumaPonderada = fVals.reduce((acc, f, idx) => acc + coefs[idx] * f, 0);
    const factorExt = delta / 3;
    const resultado = factorExt * sumaPonderada;

    return {
        id: '5',
        punto: 'Punto 5',
        nombre: 'Método Simpson Abierto (n particiones pares)',
        particionesTexto: `n = ${n} (par)`,
        n,
        delta,
        indiceInicio: 1, // En la hoja del profesor inicia en x_1, x_2, x_3, x_4, x_5...
        formulaLatex: 'I = \\frac{\\Delta}{3} \\left[ f(x_1) + 4f(x_2) + 2f(x_3) + 4f(x_4) + 2f(x_5) + \\dots + f(x_n) \\right]',
        deltaLatex: `\\Delta = \\frac{b - a}{n} = \\frac{${formatNum(b)} - (${formatNum(a)})}{${n}} = ${delta.toFixed(8)}`,
        xVals,
        fVals,
        coefs,
        sumaPonderada,
        factorExt,
        factorExtTexto: `${formatNum(delta)} / 3`,
        resultado
    };
}

// Integral de alta precisión (Simpson compuesto con n = 1000) como referencia para el error absoluto
function calcularReferenciaExacta(funcStr, a, b) {
    const res = calcularMetodo5SimpsonAbierto(funcStr, a, b, 1000);
    return res.error ? null : res.resultado;
}

function formatNum(num) {
    if (Number.isInteger(num)) return num.toString();
    return Number(num.toFixed(6)).toString();
}

// =========================================================================
// RENDERIZADO DE LA INTERFAZ Y GRÁFICA
// =========================================================================

function mostrarError(msg) {
    const box = document.getElementById('errorBox');
    if (!msg) {
        box.classList.add('hidden');
        box.textContent = '';
    } else {
        box.textContent = msg;
        box.classList.remove('hidden');
    }
}

function renderizarMatematica(elemento) {
    if (window.renderMathInElement) {
        window.renderMathInElement(elemento, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    }
}

function actualizarGrafica(funcStr, a, b, metodoPrincipal) {
    const ctx = document.getElementById('functionChart').getContext('2d');
    const pasosCurva = 120;
    const minX = Math.min(a, b);
    const maxX = Math.max(a, b);
    const margen = (maxX - minX) * 0.08 || 0.5;
    const startX = minX - margen;
    const endX = maxX + margen;
    const step = (endX - startX) / pasosCurva;

    const puntosCurva = [];
    const puntosArea = [];

    for (let i = 0; i <= pasosCurva; i++) {
        const x = startX + i * step;
        const y = evaluarFuncion(funcStr, x);
        if (y !== null) {
            puntosCurva.push({ x, y });
            if (x >= minX - 1e-9 && x <= maxX + 1e-9) {
                puntosArea.push({ x, y });
            }
        }
    }

    const puntosNodos = metodoPrincipal.xVals.map((xi, idx) => ({
        x: xi,
        y: metodoPrincipal.fVals[idx]
    }));

    if (functionChart) {
        functionChart.destroy();
    }

    functionChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Nodos evaluados (x_i, f(x_i))',
                    data: puntosNodos,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    pointRadius: 5.5,
                    pointHoverRadius: 7,
                    showLine: false,
                    order: 1
                },
                {
                    label: `f(x) = ${funcStr}`,
                    data: puntosCurva,
                    borderColor: '#38bdf8',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    showLine: true,
                    tension: 0.25,
                    fill: false,
                    order: 2
                },
                {
                    label: 'Área integrada en [a, b]',
                    data: puntosArea,
                    borderColor: 'rgba(56, 189, 248, 0.0)',
                    backgroundColor: 'rgba(56, 189, 248, 0.18)',
                    pointRadius: 0,
                    showLine: true,
                    fill: 'origin',
                    order: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1',
                        font: { family: 'Inter', size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `x = ${ctx.parsed.x.toFixed(4)}, f(x) = ${ctx.parsed.y.toFixed(6)}`
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function crearTarjetaPasoAPaso(m) {
    const filasHTML = m.xVals.map((xi, idx) => {
        const fi = m.fVals[idx];
        const ci = m.coefs[idx];
        const prod = ci * fi;
        const numNodo = m.indiceInicio + idx;
        return `
            <tr>
                <td class="mono"><strong>x<sub>${numNodo}</sub></strong></td>
                <td class="mono">${xi.toFixed(8)}</td>
                <td class="mono">${fi.toFixed(8)}</td>
                <td class="mono">${ci}</td>
                <td class="mono">${prod.toFixed(8)}</td>
            </tr>
        `;
    }).join('');

    return `
        <article class="method-step-card">
            <div class="step-card-banner">
                <div class="step-title-badge">
                    <span class="point-number">${m.punto}</span>
                    <h3>${m.nombre}</h3>
                </div>
                <div class="final-badge">I = ${m.resultado.toFixed(8)}</div>
            </div>

            <div class="step-card-body">
                <div class="formula-grid">
                    <div class="formula-box">
                        <div class="formula-box-label">1. Fórmula de la Guía del Docente</div>
                        <div class="formula-math">$$${m.formulaLatex}$$</div>
                    </div>
                    <div class="formula-box">
                        <div class="formula-box-label">2. Cálculo del Paso ($\\Delta$)</div>
                        <div class="formula-math">$$${m.deltaLatex}$$</div>
                    </div>
                </div>

                <div>
                    <div class="formula-box-label" style="margin-bottom: 0.55rem;">3. Tabla de Nodos y Evaluación Paso a Paso</div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nodo</th>
                                    <th>Valor $x_i$</th>
                                    <th>Evaluación $f(x_i)$</th>
                                    <th>Coeficiente ($c_i$)</th>
                                    <th>Producto $c_i \\cdot f(x_i)$</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filasHTML}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="substitution-box">
                    <div class="formula-box-label" style="color: #6ee7b7;">4. Sustitución en la Fórmula y Resultado</div>
                    <div class="substitution-steps">
                        <div>Suma entre corchetes [ Σ c_i · f(x_i) ] = <strong>${m.sumaPonderada.toFixed(8)}</strong></div>
                        <div>I = (${m.factorExtTexto}) × [${m.sumaPonderada.toFixed(8)}]</div>
                        <div>I = ${m.factorExt.toFixed(8)} × ${m.sumaPonderada.toFixed(8)}</div>
                        <div class="substitution-final">>> Resultado Final de la Integral (I) = ${m.resultado.toFixed(8)}</div>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function ejecutarCalculo() {
    mostrarError('');
    const funcStr = document.getElementById('funcInput').value.trim();
    const aStr = document.getElementById('limitA').value.trim();
    const bStr = document.getElementById('limitB').value.trim();
    const nVal = parseInt(document.getElementById('partitionsN').value, 10);

    if (!funcStr) {
        mostrarError('Por favor ingresa una función f(x).');
        return;
    }

    const a = evaluarLimite(aStr);
    const b = evaluarLimite(bStr);

    if (a === null || b === null) {
        mostrarError('Los límites "a" y "b" deben ser números o expresiones válidas (por ejemplo: 0, 2, pi, pi/2).');
        return;
    }

    if (isNaN(nVal) || nVal <= 0) {
        mostrarError('El número de particiones (n) debe ser un número entero mayor que 0.');
        return;
    }

    // Verificar que la función sea evaluable
    if (evaluarFuncion(funcStr, (a + b) / 2) === null && evaluarFuncion(funcStr, a) === null) {
        mostrarError(`No se pudo evaluar la función "${funcStr}". Revisa la sintaxis (ej: x^3, 2x, sin(x), sqrt(x)).`);
        return;
    }

    // Si estamos en "all" o en el método 5, validar que n sea par
    if ((currentMethod === 'all' || currentMethod === '5') && nVal % 2 !== 0) {
        mostrarError(`Atención: Ingresaste n = ${nVal} (impar). Para el Punto 5 (Método Simpson Abierto), "n" DEBE ser un número PAR (ej. 2, 4, 6, 8, 10).`);
        return;
    }

    const metodosCalculados = [];

    if (currentMethod === 'all' || currentMethod === '1') {
        metodosCalculados.push(calcularMetodo1Trapezoidal(funcStr, a, b, nVal));
    }
    if (currentMethod === 'all' || currentMethod === '2') {
        metodosCalculados.push(calcularMetodo2Boole(funcStr, a, b));
    }
    if (currentMethod === 'all' || currentMethod === '3') {
        metodosCalculados.push(calcularMetodo3Simpson38(funcStr, a, b));
    }
    if (currentMethod === 'all' || currentMethod === '4') {
        metodosCalculados.push(calcularMetodo4Simpson13(funcStr, a, b));
    }
    if (currentMethod === 'all' || currentMethod === '5') {
        metodosCalculados.push(calcularMetodo5SimpsonAbierto(funcStr, a, b, nVal));
    }

    // Verificar si alguno arrojó error matemático
    const conError = metodosCalculados.find(m => m.error);
    if (conError) {
        mostrarError(conError.error);
        return;
    }

    // Actualizar vista previa de la integral en LaTeX
    const previewEl = document.getElementById('integralLatexPreview');
    previewEl.innerHTML = `$$\\int_{${aStr}}^{${bStr}} \\left(${funcStr}\\right)\\,dx$$`;
    renderizarMatematica(previewEl);

    // Tabla comparativa (visible cuando están todos o varios)
    const compSection = document.getElementById('comparisonSection');
    const compBody = document.getElementById('comparisonTableBody');
    const refExacta = calcularReferenciaExacta(funcStr, a, b);

    if (currentMethod === 'all') {
        compSection.classList.remove('hidden');
        compBody.innerHTML = metodosCalculados.map(m => {
            const errAbs = refExacta !== null ? Math.abs(m.resultado - refExacta).toExponential(3) : 'N/A';
            return `
                <tr>
                    <td><span class="point-number">${m.punto}</span></td>
                    <td><strong>${m.nombre}</strong></td>
                    <td class="mono">${m.particionesTexto}</td>
                    <td class="mono">${m.delta.toFixed(6)}</td>
                    <td class="result-highlight">${m.resultado.toFixed(8)}</td>
                    <td class="mono">${errAbs}</td>
                </tr>
            `;
        }).join('');
    } else {
        compSection.classList.add('hidden');
    }

    // Renderizar tarjetas paso a paso
    const container = document.getElementById('stepByStepContainer');
    container.innerHTML = metodosCalculados.map(crearTarjetaPasoAPaso).join('');
    renderizarMatematica(container);

    // Actualizar gráfica usando los nodos del método seleccionado (o el último si son todos)
    const metodoGrafica = currentMethod === 'all' ? metodosCalculados[metodosCalculados.length - 1] : metodosCalculados[0];
    actualizarGrafica(funcStr, a, b, metodoGrafica);
}

// =========================================================================
// EVENTOS DE INTERACCIÓN
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Cambio de pestaña de método
    const tabs = document.querySelectorAll('.method-tab');
    const nGroup = document.getElementById('nGroup');
    const nHint = document.getElementById('nHint');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMethod = tab.dataset.method;

            // Mostrar u ocultar input de particiones n según el método
            if (currentMethod === '2' || currentMethod === '3' || currentMethod === '4') {
                nGroup.style.opacity = '0.45';
                nHint.textContent = 'Fijo por fórmula en este método';
            } else if (currentMethod === '5') {
                nGroup.style.opacity = '1';
                nHint.textContent = 'Obligatorio número PAR (2, 4, 6...)';
            } else {
                nGroup.style.opacity = '1';
                nHint.textContent = 'Debe ser par para el Punto 5';
            }

            ejecutarCalculo();
        });
    });

    // Botones de ejemplos rápidos
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('funcInput').value = btn.dataset.f;
            document.getElementById('limitA').value = btn.dataset.a;
            document.getElementById('limitB').value = btn.dataset.b;
            document.getElementById('partitionsN').value = btn.dataset.n;
            ejecutarCalculo();
        });
    });

    // Envío del formulario
    document.getElementById('calcForm').addEventListener('submit', (e) => {
        e.preventDefault();
        ejecutarCalculo();
    });

    // Renderizar fórmulas estáticas iniciales cuando cargue KaTeX
    const checkKatex = setInterval(() => {
        if (window.renderMathInElement) {
            clearInterval(checkKatex);
            renderizarMatematica(document.body);
            ejecutarCalculo();
        }
    }, 80);
});
