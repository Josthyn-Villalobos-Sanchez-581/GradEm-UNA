<?php

namespace App\Services\CatalogoServices;

use App\Repositories\CatalogoRepositories\CatalogoRepository;
use Illuminate\Support\Facades\Auth;

class CatalogoService
{
    protected CatalogoRepository $catalogoRepository;

    public function __construct(CatalogoRepository $catalogoRepository)
    {
        $this->catalogoRepository = $catalogoRepository;
    }

    /**
     * Obtener todos los catálogos necesarios para la vista principal.
     */
    public function obtenerDatosCatalogos(): array
    {
        $paises         = $this->catalogoRepository->obtenerPaisesOrdenados();
        $provincias     = $this->catalogoRepository->obtenerProvinciasOrdenadas();
        $cantones       = $this->catalogoRepository->obtenerCantonesOrdenados();
        $universidades  = $this->catalogoRepository->obtenerUniversidadesOrdenadas();
        $carreras       = $this->catalogoRepository->obtenerCarrerasOrdenadas();
        $estados        = $this->catalogoRepository->obtenerEstadosOrdenados();
        $modalidades    = $this->catalogoRepository->obtenerModalidadesOrdenadas();
        $idiomas        = $this->catalogoRepository->obtenerIdiomasOrdenados();
        $areasLaborales = $this->catalogoRepository->obtenerAreasLaboralesOrdenadas();

        return [
            'paises' => $paises->map(fn($p) => [
                'id' => $p->id_pais,
                'nombre' => $p->nombre,
            ]),
            'provincias' => $provincias->map(fn($p) => [
                'id' => $p->id_provincia,
                'nombre' => $p->nombre,
                'id_pais' => $p->id_pais,
            ]),
            'cantones' => $cantones->map(fn($c) => [
                'id' => $c->id_canton,
                'nombre' => $c->nombre,
                'id_provincia' => $c->id_provincia,
            ]),
            'universidades' => $universidades->map(fn($u) => [
                'id' => $u->id_universidad,
                'nombre' => $u->nombre,
                'sigla' => $u->sigla,
            ]),
            'carreras' => $carreras->map(fn($c) => [
                'id' => $c->id_carrera,
                'nombre' => $c->nombre,
                'id_universidad' => $c->id_universidad,
            ]),
            'estados' => $estados->map(fn($e) => [
                'id' => $e->id_estado,
                'nombre_estado' => $e->nombre_estado,
            ]),
            'modalidades' => $modalidades->map(fn($m) => [
                'id' => $m->id_modalidad,
                'nombre' => $m->nombre,
            ]),
            'idiomas' => $idiomas->map(fn($i) => [
                'id' => $i->id_idioma_catalogo,
                'nombre' => $i->nombre,
            ]),
            'areas_laborales' => $areasLaborales->map(fn($a) => [
                'id' => $a->id_area_laboral,
                'nombre' => $a->nombre,
            ]),
        ];
    }

    /**
     * Registrar cambio en bitácora.
     */
    private function registrarBitacora(string $tabla, string $operacion, string $descripcion): void
    {
        $this->catalogoRepository->registrarBitacora(
            $tabla,
            $operacion,
            $descripcion,
            Auth::id()
        );
    }

    // ========================= PAISES =========================

    public function guardarPais(?int $id, string $nombre): void
    {
        if ($id) {
            // Obtener datos anteriores
            $pais = $this->catalogoRepository->obtenerPaisPorId($id);
            $nombreAnterior = $pais->nombre;

            // Actualizar
            $this->catalogoRepository->guardarPais($id, $nombre);

            // Bitácora
            $texto = "País actualizado: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('paises', 'ACTUALIZAR', $texto);
        } else {

            // Crear nuevo
            $nuevoPais = $this->catalogoRepository->guardarPais(null, $nombre);

            $texto = "País creado: {$nuevoPais->nombre} (ID: {$nuevoPais->id_pais})";

            $this->registrarBitacora('paises', 'CREAR', $texto);
        }
    }

    public function puedeEliminarPais(int $idPais): bool
    {
        return !$this->catalogoRepository->paisTieneProvincias($idPais);
    }

    public function eliminarPais(int $idPais): void
    {
        $pais = $this->catalogoRepository->obtenerPaisPorId($idPais);

        $this->catalogoRepository->eliminarPais($idPais);

        $this->registrarBitacora(
            'paises',
            'ELIMINAR',
            "País eliminado: {$pais->nombre} (ID: {$idPais})"
        );
    }

    // ========================= PROVINCIAS =========================

    public function guardarProvincia(?int $id, string $nombre, int $idPais): void
    {
        if ($id) {
            $provincia = $this->catalogoRepository->obtenerProvinciaPorId($id);
            $nombreAnterior = $provincia->nombre;

            $this->catalogoRepository->guardarProvincia($id, $nombre, $idPais);

            $texto = "Provincia actualizada: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('provincias', 'ACTUALIZAR', $texto);
        } else {
            $nuevaProvincia = $this->catalogoRepository->guardarProvincia(null, $nombre, $idPais);

            $texto = "Provincia creada: {$nuevaProvincia->nombre} (ID: {$nuevaProvincia->id_provincia})";

            $this->registrarBitacora('provincias', 'CREAR', $texto);
        }
    }

    public function puedeEliminarProvincia(int $idProvincia): bool
    {
        return !$this->catalogoRepository->provinciaTieneCantones($idProvincia);
    }

    public function eliminarProvincia(int $idProvincia): void
    {
        $provincia = $this->catalogoRepository->obtenerProvinciaPorId($idProvincia);

        $this->catalogoRepository->eliminarProvincia($idProvincia);

        $this->registrarBitacora(
            'provincias',
            'ELIMINAR',
            "Provincia eliminada: {$provincia->nombre} (ID: {$idProvincia})"
        );
    }

    // ========================= CANTONES =========================

    public function guardarCanton(?int $id, string $nombre, int $idProvincia): void
    {
        if ($id) {
            $canton = $this->catalogoRepository->obtenerCantonPorId($id);
            $nombreAnterior = $canton->nombre;

            $this->catalogoRepository->guardarCanton($id, $nombre, $idProvincia);

            $texto = "Cantón actualizado: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('cantones', 'ACTUALIZAR', $texto);
        } else {
            $nuevoCanton = $this->catalogoRepository->guardarCanton(null, $nombre, $idProvincia);

            $texto = "Cantón creado: {$nuevoCanton->nombre} (ID: {$nuevoCanton->id_canton})";

            $this->registrarBitacora('cantones', 'CREAR', $texto);
        }
    }

    public function eliminarCanton(int $idCanton): void
    {
        $canton = $this->catalogoRepository->obtenerCantonPorId($idCanton);

        $this->catalogoRepository->eliminarCanton($idCanton);

        $this->registrarBitacora(
            'cantones',
            'ELIMINAR',
            "Cantón eliminado: {$canton->nombre} (ID: {$idCanton})"
        );
    }

    // ========================= UNIVERSIDADES =========================

    public function guardarUniversidad(?int $id, string $nombre, string $sigla): void
    {
        if ($id) {
            $universidad = $this->catalogoRepository->obtenerUniversidadPorId($id);
            $nombreAnterior = $universidad->nombre;

            $this->catalogoRepository->guardarUniversidad($id, $nombre, $sigla);

            $texto = "Universidad actualizada: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('universidades', 'ACTUALIZAR', $texto);
        } else {
            $nuevaUniversidad = $this->catalogoRepository->guardarUniversidad(null, $nombre, $sigla);

            $texto = "Universidad creada: {$nuevaUniversidad->nombre} (ID: {$nuevaUniversidad->id_universidad})";

            $this->registrarBitacora('universidades', 'CREAR', $texto);
        }
    }

    public function eliminarUniversidad(int $idUniversidad): void
    {
        $universidad = $this->catalogoRepository->obtenerUniversidadPorId($idUniversidad);

        $this->catalogoRepository->eliminarUniversidad($idUniversidad);

        $this->registrarBitacora(
            'universidades',
            'ELIMINAR',
            "Universidad eliminada: {$universidad->nombre} (ID: {$idUniversidad})"
        );
    }

    // ========================= CARRERAS =========================

    public function guardarCarrera(?int $id, string $nombre, int $idUniversidad): void
    {
        if ($id) {
            $carrera = $this->catalogoRepository->obtenerCarreraPorId($id);
            $nombreAnterior = $carrera->nombre;

            $this->catalogoRepository->guardarCarrera($id, $nombre, $idUniversidad);

            $texto = "Carrera actualizada: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('carreras', 'ACTUALIZAR', $texto);
        } else {
            $nuevaCarrera = $this->catalogoRepository->guardarCarrera(null, $nombre, $idUniversidad);

            $texto = "Carrera creada: {$nuevaCarrera->nombre} (ID: {$nuevaCarrera->id_carrera})";

            $this->registrarBitacora('carreras', 'CREAR', $texto);
        }
    }

    public function eliminarCarrera(int $idCarrera): void
    {
        $carrera = $this->catalogoRepository->obtenerCarreraPorId($idCarrera);

        $this->catalogoRepository->eliminarCarrera($idCarrera);

        $this->registrarBitacora(
            'carreras',
            'ELIMINAR',
            "Carrera eliminada: {$carrera->nombre} (ID: {$idCarrera})"
        );
    }

    // ========================= ESTADOS =========================

    public function guardarEstado(?int $id, string $nombreEstado): void
    {
        if ($id) {
            $estado = $this->catalogoRepository->obtenerEstadoPorId($id);
            $nombreAnterior = $estado->nombre_estado;

            $this->catalogoRepository->guardarEstado($id, $nombreEstado);

            $texto = "Estado actualizado: {$nombreAnterior} -> {$nombreEstado} (ID: {$id})";

            $this->registrarBitacora('estados', 'ACTUALIZAR', $texto);
        } else {
            $nuevoEstado = $this->catalogoRepository->guardarEstado(null, $nombreEstado);

            $texto = "Estado creado: {$nuevoEstado->nombre_estado} (ID: {$nuevoEstado->id_estado})";

            $this->registrarBitacora('estados', 'CREAR', $texto);
        }
    }

    public function eliminarEstado(int $idEstado): void
    {
        $estado = $this->catalogoRepository->obtenerEstadoPorId($idEstado);

        $this->catalogoRepository->eliminarEstado($idEstado);

        $this->registrarBitacora(
            'estados',
            'ELIMINAR',
            "Estado eliminado: {$estado->nombre_estado} (ID: {$idEstado})"
        );
    }

    // ========================= MODALIDADES =========================

    public function guardarModalidad(?int $id, string $nombre): void
    {
        if ($id) {
            $modalidad = $this->catalogoRepository->obtenerModalidadPorId($id);
            $nombreAnterior = $modalidad->nombre;

            $this->catalogoRepository->guardarModalidad($id, $nombre);

            $texto = "Modalidad actualizada: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('modalidades', 'ACTUALIZAR', $texto);
        } else {
            $nuevaModalidad = $this->catalogoRepository->guardarModalidad(null, $nombre);

            $texto = "Modalidad creada: {$nuevaModalidad->nombre} (ID: {$nuevaModalidad->id_modalidad})";

            $this->registrarBitacora('modalidades', 'CREAR', $texto);
        }
    }

    public function eliminarModalidad(int $idModalidad): void
    {
        $modalidad = $this->catalogoRepository->obtenerModalidadPorId($idModalidad);

        $this->catalogoRepository->eliminarModalidad($idModalidad);

        $this->registrarBitacora(
            'modalidades',
            'ELIMINAR',
            "Modalidad eliminada: {$modalidad->nombre} (ID: {$idModalidad})"
        );
    }

    // ========================= IDIOMAS =========================

    public function guardarIdioma(?int $id, string $nombre): void
    {
        if ($id) {
            $idioma = $this->catalogoRepository->obtenerIdiomaPorId($id);
            $nombreAnterior = $idioma->nombre;

            $this->catalogoRepository->guardarIdioma($id, $nombre);

            $texto = "Idioma actualizado: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('idiomas', 'ACTUALIZAR', $texto);
        } else {
            $nuevoIdioma = $this->catalogoRepository->guardarIdioma(null, $nombre);

            $texto = "Idioma creado: {$nuevoIdioma->nombre} (ID: {$nuevoIdioma->id_idioma_catalogo})";

            $this->registrarBitacora('idiomas', 'CREAR', $texto);
        }
    }

    public function eliminarIdioma(int $idIdioma): void
    {
        $idioma = $this->catalogoRepository->obtenerIdiomaPorId($idIdioma);

        $this->catalogoRepository->eliminarIdioma($idIdioma);

        $this->registrarBitacora(
            'idiomas',
            'ELIMINAR',
            "Idioma eliminado: {$idioma->nombre} (ID: {$idIdioma})"
        );
    }

    // ========================= ÁREAS LABORALES =========================

    public function guardarAreaLaboral(?int $id, string $nombre): void
    {
        if ($id) {
            $area = $this->catalogoRepository->obtenerAreaLaboralPorId($id);
            $nombreAnterior = $area->nombre;

            $this->catalogoRepository->guardarAreaLaboral($id, $nombre);

            $texto = "Área laboral actualizada: {$nombreAnterior} -> {$nombre} (ID: {$id})";

            $this->registrarBitacora('areas_laborales', 'ACTUALIZAR', $texto);
        } else {
            $nuevaArea = $this->catalogoRepository->guardarAreaLaboral(null, $nombre);

            $texto = "Área laboral creada: {$nuevaArea->nombre} (ID: {$nuevaArea->id_area_laboral})";

            $this->registrarBitacora('areas_laborales', 'CREAR', $texto);
        }
    }

    public function eliminarAreaLaboral(int $idAreaLaboral): void
    {
        $area = $this->catalogoRepository->obtenerAreaLaboralPorId($idAreaLaboral);

        $this->catalogoRepository->eliminarAreaLaboral($idAreaLaboral);

        $this->registrarBitacora(
            'areas_laborales',
            'ELIMINAR',
            "Área laboral eliminada: {$area->nombre} (ID: {$idAreaLaboral})"
        );
    }
}
