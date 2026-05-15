const pedidoModel = require('../models/pedidoModel')

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

    const filas = pedidos.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>${nombresTamano[p.tamano]}</td>
            <td>${p.ingredientes.join(', ')}</td>
            <td>$${p.precioUnitario.toLocaleString('es-CL')}</td>
            <td>${p.cantidad}</td>
            <td>$${p.total.toLocaleString('es-CL')}</td>
        </tr>
    `).join('')

    const totalAcumulado = pedidos.reduce((suma, p) => suma + p.total, 0)

    res.send(`
    <h1>Lista de Pedidos</h1>
    ${pedidos.length === 0
        ? '<p>No hay pedidos aún.</p>'
        : `<table border="1">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tamaño</th>
                    <th>Ingredientes</th>
                    <th>Precio unitario</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
            <tfoot>
                <tr>
                    <td colspan="5"><strong>Total acumulado</strong></td>
                    <td><strong>$${totalAcumulado.toLocaleString('es-CL')}</strong></td>
                </tr>
            </tfoot>
        </table>`
    }
    <a href="/">Volver al formulario</a>
`)
}

module.exports = { registrarPedido, listarPedidos }