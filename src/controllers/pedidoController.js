const pedidoModel = require('../models/pedidoModel')
const PDFDocument = require('pdfkit')

const precioBase = {
    chica: 3990,
    mediana: 5990,
    grande: 8490
}

const precioExtra = {
    chica: 500,
    mediana: 800,
    grande: 1200
}

function registrarPedido(req, res) {
    const { nombre, tamano, ingredientes, cantidad } = req.body

    if (!ingredientes) {
        return res.send(`
            <p>Debes seleccionar al menos un ingrediente.</p>
            <a href="/">Volver</a>
        `)
    }

    const listaIngredientes = [].concat(ingredientes)
    const cantidadNum = parseInt(cantidad)
    const extras = listaIngredientes.length > 3 ? listaIngredientes.length - 3 : 0
    const precioUnitario = precioBase[tamano] + (extras * precioExtra[tamano])
    const total = precioUnitario * cantidadNum

    const nuevoPedido = {
        nombre,
        tamano,
        ingredientes: listaIngredientes,
        precioUnitario,
        cantidad: cantidadNum,
        total
    }

    pedidoModel.guardar(nuevoPedido)
    res.redirect('/pedidos/lista')
}

function listarPedidos(req, res) {
    const pedidos = pedidoModel.obtenerTodos()

    const nombresTamano = {
        chica: 'Chica',
        mediana: 'Mediana',
        grande: 'Grande'
    }

    const filas = pedidos.map((p, index) => `
        <tr>
            <td>${p.nombre}</td>
            <td>${nombresTamano[p.tamano]}</td>
            <td>${p.ingredientes.join(', ')}</td>
            <td>$${p.precioUnitario.toLocaleString('es-CL')}</td>
            <td>${p.cantidad}</td>
            <td>$${p.total.toLocaleString('es-CL')}</td>
            <td><a href="/pedidos/boleta/${index}" class="btn-boleta">Descargar boleta</a></td>
        </tr>
    `).join('')

    const totalAcumulado = pedidos.reduce((suma, p) => suma + p.total, 0)

    res.send(`
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        .btn-boleta {
            background-color: red;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            text-decoration: none;
        }
        .btn-boleta:hover {
            background-color: darkred;
        }
    </style>

    <div class="container mt-4">
        <h1>Lista de Pedidos</h1>
        ${pedidos.length === 0
            ? '<p>No hay pedidos aún.</p>'
            : `<table class="table table-bordered table-striped">
                <thead class="table-danger">
                    <tr>
                        <th>Nombre</th>
                        <th>Tamaño</th>
                        <th>Ingredientes</th>
                        <th>Precio unitario</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th>Boleta</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
                <tfoot>
                    <tr class="table-dark">
                        <td colspan="6"><strong>Total acumulado</strong></td>
                        <td><strong>$${totalAcumulado.toLocaleString('es-CL')}</strong></td>
                    </tr>
                </tfoot>
            </table>`
        }
        <a href="/" class="btn btn-danger">Volver al formulario</a>
    </div>
`)
}

function descargarBoleta(req, res) {
    const pedidos = pedidoModel.obtenerTodos()
    const index = parseInt(req.params.index)
    const p = pedidos[index]

    if (!p) {
        return res.send('<p>Pedido no encontrado</p>')
    }

    const doc = new PDFDocument()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=boleta-${index}.pdf`)

    doc.pipe(res)

    doc.fontSize(20).text('Pizzería Don Node', { align: 'center' })
    doc.moveDown()
    doc.fontSize(14).text(`Cliente: ${p.nombre}`)
    doc.text(`Tamaño: ${p.tamano}`)
    doc.text(`Ingredientes: ${p.ingredientes.join(', ')}`)
    doc.text(`Cantidad: ${p.cantidad}`)
    doc.text(`Precio unitario: $${p.precioUnitario}`)
    doc.text(`Total: $${p.total}`)

    doc.end()
}

module.exports = { registrarPedido, listarPedidos, descargarBoleta }
