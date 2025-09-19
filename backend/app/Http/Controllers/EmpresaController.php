<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmpresaController extends Controller
{
    /**
     * Store a newly created company in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validación de datos
        $request->validate([
            'nombre'           => 'required|string|max:100',
            'correo'           => 'required|email|unique:empresas,correo',
            'telefono'         => 'required|string|max:20',
            'persona_contacto' => 'required|string|max:100',
            'password' => 'required|string|min:8|confirmed', // 'confirmed' verifica 'password_confirmation'
        ]);

        // Crear la empresa en la base de datos
        $empresa = Empresa::create([
            'nombre'           => $request->nombre,
            'correo'           => $request->correo,
            'telefono'         => $request->telefono,
            'persona_contacto' => $request->persona_contacto,
            'password' => Hash::make($request->password),
            'rol_id' => 5, // Asigna el rol de empresa
        ]);

        // Puedes retornar una respuesta JSON
        return response()->json([
            'message' => 'Registro de empresa exitoso',
            'empresa' => $empresa
        ], 201);
    }
}