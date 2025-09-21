<?php

namespace App\Http\Controllers;

use App\Models\Universidad;
use App\Models\Carrera;
use Illuminate\Http\Request;

class UniversidadController extends Controller
{
    public function getUniversidades()
    {
        return response()->json(Universidad::all());
    }

    public function getCarreras($idUniversidad)
    {
        return response()->json(
            Carrera::where('id_universidad', $idUniversidad)->get()
        );
    }
}
