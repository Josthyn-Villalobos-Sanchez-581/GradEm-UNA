<?php

namespace App\Http\Controllers;

use App\Models\Pais;
use App\Models\Provincia;
use App\Models\Canton;
use Illuminate\Http\Request;

class UbicacionController extends Controller
{
    public function getPaises()
    {
        return response()->json(Pais::all());
    }

    public function getProvincias($id_pais)
    {
        return response()->json(
            Provincia::where('id_pais', $id_pais)->get()
        );
    }

    public function getCantones($id_provincia)
    {
        return response()->json(
            Canton::where('id_provincia', $id_provincia)->get()
        );
    }
}

//relaciones Eloquent completas (Pais → Provincias → Cantones), para que si en el futuro agregas otro país se traiga toda la jerarquía de una vez