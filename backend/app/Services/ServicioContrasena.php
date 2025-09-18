<?php

namespace App\Services;

use Illuminate\Support\Facades\Hash;

class ServicioContrasena
{
    /** Genera un hash seguro (bcrypt por defecto). */
    public function generarHash(string $textoPlano): string
    {
        return Hash::make($textoPlano);
    }

    /** Verifica que el texto en claro coincide con el hash. */
    public function verificar(string $textoPlano, string $hash): bool
    {
        return Hash::check($textoPlano, $hash);
    }

    /** Rehashea si el algoritmo/coste cambió (migración transparente). */
    public function rehashSiNecesario(string $hashActual, string $textoPlano): ?string
    {
        return Hash::needsRehash($hashActual) ? Hash::make($textoPlano) : null;
    }
}
