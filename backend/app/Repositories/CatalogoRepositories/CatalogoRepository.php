<?php

namespace App\Repositories\CatalogoRepositories;

use App\Models\Pais;
use App\Models\Provincia;
use App\Models\Canton;
use App\Models\Universidad;
use App\Models\Carrera;
use App\Models\CatalogoEstado;
use App\Models\Modalidad;
use App\Models\IdiomaCatalogo;
use App\Models\AreaLaboral;
use Illuminate\Support\Facades\DB;

class CatalogoRepository
{
    // ========================= LISTADOS ORDENADOS =========================

    public function obtenerPaisesOrdenados()
    {
        return Pais::orderBy('id_pais')->get();
    }

    public function obtenerProvinciasOrdenadas()
    {
        return Provincia::orderBy('id_provincia')->get();
    }

    public function obtenerCantonesOrdenados()
    {
        return Canton::orderBy('id_canton')->get();
    }

    public function obtenerUniversidadesOrdenadas()
    {
        return Universidad::orderBy('id_universidad')->get();
    }

    public function obtenerCarrerasOrdenadas()
    {
        return Carrera::orderBy('id_carrera')->get();
    }

    public function obtenerEstadosOrdenados()
    {
        return CatalogoEstado::orderBy('id_estado')->get();
    }

    public function obtenerModalidadesOrdenadas()
    {
        return Modalidad::orderBy('id_modalidad')->get();
    }

    public function obtenerIdiomasOrdenados()
    {
        return IdiomaCatalogo::orderBy('id_idioma_catalogo')->get();
    }

    public function obtenerAreasLaboralesOrdenadas()
    {
        return AreaLaboral::orderBy('id_area_laboral')->get();
    }

    // ========================= OBTENER POR ID =========================

    public function obtenerPaisPorId(int $id): ?Pais
    {
        return Pais::find($id);
    }

    public function obtenerProvinciaPorId(int $id): ?Provincia
    {
        return Provincia::find($id);
    }

    public function obtenerCantonPorId(int $id): ?Canton
    {
        return Canton::find($id);
    }

    public function obtenerUniversidadPorId(int $id): ?Universidad
    {
        return Universidad::find($id);
    }

    public function obtenerCarreraPorId(int $id): ?Carrera
    {
        return Carrera::find($id);
    }

    public function obtenerEstadoPorId(int $id): ?CatalogoEstado
    {
        return CatalogoEstado::find($id);
    }

    public function obtenerModalidadPorId(int $id): ?Modalidad
    {
        return Modalidad::find($id);
    }

    public function obtenerIdiomaPorId(int $id): ?IdiomaCatalogo
    {
        return IdiomaCatalogo::find($id);
    }

    public function obtenerAreaLaboralPorId(int $id): ?AreaLaboral
    {
        return AreaLaboral::find($id);
    }


    // ========================= PAISES =========================

    public function guardarPais(?int $id, string $nombre): Pais
    {
        return Pais::updateOrCreate(
            ['id_pais' => $id],
            ['nombre' => $nombre]
        );
    }

    public function paisTieneProvincias(int $idPais): bool
    {
        return Provincia::where('id_pais', $idPais)->exists();
    }

    public function eliminarPais(int $idPais): void
    {
        Pais::findOrFail($idPais)->delete();
    }

    // ========================= PROVINCIAS =========================

    public function guardarProvincia(?int $id, string $nombre, int $idPais): Provincia
    {
        return Provincia::updateOrCreate(
            ['id_provincia' => $id],
            [
                'nombre' => $nombre,
                'id_pais' => $idPais,
            ]
        );
    }

    public function provinciaTieneCantones(int $idProvincia): bool
    {
        return Canton::where('id_provincia', $idProvincia)->exists();
    }

    public function eliminarProvincia(int $idProvincia): void
    {
        Provincia::findOrFail($idProvincia)->delete();
    }

    // ========================= CANTONES =========================

    public function guardarCanton(?int $id, string $nombre, int $idProvincia): Canton
    {
        return Canton::updateOrCreate(
            ['id_canton' => $id],
            [
                'nombre' => $nombre,
                'id_provincia' => $idProvincia,
            ]
        );
    }

    public function eliminarCanton(int $idCanton): void
    {
        Canton::findOrFail($idCanton)->delete();
    }

    // ========================= UNIVERSIDADES =========================

    public function guardarUniversidad(?int $id, string $nombre, string $sigla): Universidad
    {
        return Universidad::updateOrCreate(
            ['id_universidad' => $id],
            [
                'nombre' => $nombre,
                'sigla' => $sigla,
            ]
        );
    }

    public function eliminarUniversidad(int $idUniversidad): void
    {
        Universidad::findOrFail($idUniversidad)->delete();
    }

    // ========================= CARRERAS =========================

    public function guardarCarrera(?int $id, string $nombre, int $idUniversidad): Carrera
    {
        return Carrera::updateOrCreate(
            ['id_carrera' => $id],
            [
                'nombre' => $nombre,
                'id_universidad' => $idUniversidad,
            ]
        );
    }

    public function eliminarCarrera(int $idCarrera): void
    {
        Carrera::findOrFail($idCarrera)->delete();
    }

    // ========================= ESTADOS =========================

    public function guardarEstado(?int $id, string $nombreEstado): CatalogoEstado
    {
        return CatalogoEstado::updateOrCreate(
            ['id_estado' => $id],
            ['nombre_estado' => $nombreEstado]
        );
    }

    public function eliminarEstado(int $idEstado): void
    {
        CatalogoEstado::findOrFail($idEstado)->delete();
    }

    // ========================= MODALIDADES =========================

    public function guardarModalidad(?int $id, string $nombre): Modalidad
    {
        return Modalidad::updateOrCreate(
            ['id_modalidad' => $id],
            ['nombre' => $nombre]
        );
    }

    public function eliminarModalidad(int $idModalidad): void
    {
        Modalidad::findOrFail($idModalidad)->delete();
    }

    // ========================= IDIOMAS =========================

    public function guardarIdioma(?int $id, string $nombre): IdiomaCatalogo
    {
        return IdiomaCatalogo::updateOrCreate(
            ['id_idioma_catalogo' => $id],
            ['nombre' => $nombre]
        );
    }

    public function eliminarIdioma(int $idIdioma): void
    {
        IdiomaCatalogo::findOrFail($idIdioma)->delete();
    }

    // ========================= ÁREAS LABORALES =========================

    public function guardarAreaLaboral(?int $id, string $nombre): AreaLaboral
    {
        return AreaLaboral::updateOrCreate(
            ['id_area_laboral' => $id],
            ['nombre' => $nombre]
        );
    }

    public function eliminarAreaLaboral(int $idAreaLaboral): void
    {
        AreaLaboral::findOrFail($idAreaLaboral)->delete();
    }

    /**
     * Registrar un cambio en la bitácora.
     */
    public function registrarBitacora(string $tabla, string $operacion, string $descripcion, ?int $usuarioId): void
    {
        DB::table('bitacora_cambios')->insert([
            'tabla_afectada'     => $tabla,
            'operacion'          => $operacion,
            'usuario_responsable' => $usuarioId,
            'descripcion_cambio' => $descripcion,
            'fecha_cambio'       => now(),
        ]);
    }
}
