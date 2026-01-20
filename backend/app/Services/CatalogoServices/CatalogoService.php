<?php

namespace App\Services\CatalogoServices;

use App\Repositories\CatalogoRepositories\CatalogoRepository;

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
        $paises        = $this->catalogoRepository->obtenerPaisesOrdenados();
        $provincias    = $this->catalogoRepository->obtenerProvinciasOrdenadas();
        $cantones      = $this->catalogoRepository->obtenerCantonesOrdenados();
        $universidades = $this->catalogoRepository->obtenerUniversidadesOrdenadas();
        $carreras      = $this->catalogoRepository->obtenerCarrerasOrdenadas();
        $estados       = $this->catalogoRepository->obtenerEstadosOrdenados();
        $modalidades   = $this->catalogoRepository->obtenerModalidadesOrdenadas();
        $idiomas       = $this->catalogoRepository->obtenerIdiomasOrdenados();
        $areasLaborales= $this->catalogoRepository->obtenerAreasLaboralesOrdenadas();

        return [
            'paises' => $paises->map(fn($p) => [
                'id'     => $p->id_pais,
                'nombre' => $p->nombre,
            ]),
            'provincias' => $provincias->map(fn($p) => [
                'id'      => $p->id_provincia,
                'nombre'  => $p->nombre,
                'id_pais' => $p->id_pais,
            ]),
            'cantones' => $cantones->map(fn($c) => [
                'id'           => $c->id_canton,
                'nombre'       => $c->nombre,
                'id_provincia' => $c->id_provincia,
            ]),
            'universidades' => $universidades->map(fn($u) => [
                'id'        => $u->id_universidad,
                'nombre'    => $u->nombre,
                'sigla'     => $u->sigla,
            ]),
            'carreras' => $carreras->map(fn($c) => [
                'id'            => $c->id_carrera,
                'nombre'        => $c->nombre,
                'id_universidad'=> $c->id_universidad,
            ]),
            'estados' => $estados->map(fn($e) => [
                'id'            => $e->id_estado,
                'nombre_estado' => $e->nombre_estado,
            ]),
            'modalidades' => $modalidades->map(fn($m) => [
                'id'     => $m->id_modalidad,
                'nombre' => $m->nombre,
            ]),
            'idiomas' => $idiomas->map(fn($i) => [
                'id'     => $i->id_idioma_catalogo,
                'nombre' => $i->nombre,
            ]),
            'areas_laborales' => $areasLaborales->map(fn($a) => [
                'id'     => $a->id_area_laboral,
                'nombre' => $a->nombre,
            ]),
        ];
    }

    // ========================= PAISES =========================
    public function guardarPais(?int $id, string $nombre): void
    {
        $this->catalogoRepository->guardarPais($id, $nombre);
    }

    public function puedeEliminarPais(int $idPais): bool
    {
        return ! $this->catalogoRepository->paisTieneProvincias($idPais);
    }

    public function eliminarPais(int $idPais): void
    {
        $this->catalogoRepository->eliminarPais($idPais);
    }

    // ========================= PROVINCIAS =========================
    public function guardarProvincia(?int $id, string $nombre, int $idPais): void
    {
        $this->catalogoRepository->guardarProvincia($id, $nombre, $idPais);
    }

    public function puedeEliminarProvincia(int $idProvincia): bool
    {
        return ! $this->catalogoRepository->provinciaTieneCantones($idProvincia);
    }

    public function eliminarProvincia(int $idProvincia): void
    {
        $this->catalogoRepository->eliminarProvincia($idProvincia);
    }

    // ========================= CANTONES =========================
    public function guardarCanton(?int $id, string $nombre, int $idProvincia): void
    {
        $this->catalogoRepository->guardarCanton($id, $nombre, $idProvincia);
    }

    public function eliminarCanton(int $idCanton): void
    {
        $this->catalogoRepository->eliminarCanton($idCanton);
    }

    // ========================= UNIVERSIDADES =========================
    public function guardarUniversidad(?int $id, string $nombre, string $sigla): void
    {
        $this->catalogoRepository->guardarUniversidad($id, $nombre, $sigla);
    }

    public function eliminarUniversidad(int $idUniversidad): void
    {
        $this->catalogoRepository->eliminarUniversidad($idUniversidad);
    }

    // ========================= CARRERAS =========================
    public function guardarCarrera(?int $id, string $nombre, int $idUniversidad): void
    {
        $this->catalogoRepository->guardarCarrera($id, $nombre, $idUniversidad);
    }

    public function eliminarCarrera(int $idCarrera): void
    {
        $this->catalogoRepository->eliminarCarrera($idCarrera);
    }

    // ========================= ESTADOS =========================
    public function guardarEstado(?int $id, string $nombreEstado): void
    {
        $this->catalogoRepository->guardarEstado($id, $nombreEstado);
    }

    public function eliminarEstado(int $idEstado): void
    {
        $this->catalogoRepository->eliminarEstado($idEstado);
    }

    // ========================= MODALIDADES =========================
    public function guardarModalidad(?int $id, string $nombre): void
    {
        $this->catalogoRepository->guardarModalidad($id, $nombre);
    }

    public function eliminarModalidad(int $idModalidad): void
    {
        $this->catalogoRepository->eliminarModalidad($idModalidad);
    }

    // ========================= IDIOMAS =========================
    public function guardarIdioma(?int $id, string $nombre): void
    {
        $this->catalogoRepository->guardarIdioma($id, $nombre);
    }

    public function eliminarIdioma(int $idIdioma): void
    {
        $this->catalogoRepository->eliminarIdioma($idIdioma);
    }

    // ========================= ÁREAS LABORALES =========================
    public function guardarAreaLaboral(?int $id, string $nombre): void
    {
        $this->catalogoRepository->guardarAreaLaboral($id, $nombre);
    }

    public function eliminarAreaLaboral(int $idAreaLaboral): void
    {
        $this->catalogoRepository->eliminarAreaLaboral($idAreaLaboral);
    }
}
