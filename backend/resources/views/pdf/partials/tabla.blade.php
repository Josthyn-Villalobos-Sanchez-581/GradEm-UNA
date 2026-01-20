@if(!empty($tabla) && count($tabla) > 0)
    <h3 style="margin-top:20px;">Detalle de Egresados</h3>

    <table width="100%" cellspacing="0" cellpadding="5" border="1">
        <thead style="background:#f2f2f2;">
            <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Género</th>
                <th>Nivel académico</th>
                <th>Año graduación</th>
                <th>Estado laboral</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tabla as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $row['nombre_completo'] ?? '-' }}</td>
                    <td>{{ $row['genero'] ?? '-' }}</td>
                    <td>{{ $row['nivel_academico'] ?? '-' }}</td>
                    <td>{{ $row['anio_graduacion'] ?? '-' }}</td>
                    <td>{{ $row['estado_empleo'] ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p><strong>Total de resultados:</strong> {{ count($tabla) }}</p>
@endif
