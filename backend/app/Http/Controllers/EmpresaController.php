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
            'nombre_empresa' => 'required|string|max:255',
            'cedula_juridica' => 'required|string|max:255|unique:empresas,cedula_juridica',
            'correo' => 'required|email|max:255|unique:empresas,correo',
            'telefono' => 'required|string|max:255',
            'direccion' => 'nullable|string',
            'descripcion' => 'required|string',
            'password' => 'required|string|min:8|confirmed', // 'confirmed' verifica 'password_confirmation'
        ]);

        // Crear la empresa en la base de datos
        $empresa = Empresa::create([
            'nombre_empresa' => $request->nombre_empresa,
            'cedula_juridica' => $request->cedula_juridica,
            'correo' => $request->correo,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
            'descripcion' => $request->descripcion,
            'password' => Hash::make($request->password),
            'rol_id' => 3, // Asigna el rol de empresa
        ]);

        // Puedes retornar una respuesta JSON
        return response()->json([
            'message' => 'Registro de empresa exitoso',
            'empresa' => $empresa
        ], 201);
    }
}