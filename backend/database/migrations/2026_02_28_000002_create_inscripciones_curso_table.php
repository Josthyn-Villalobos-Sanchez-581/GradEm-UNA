<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La tabla inscripciones_curso ya existe en la BD.
 * Esta migración agrega el unique constraint (id_curso, id_usuario)
 * para garantizar inscripción única por usuario/curso.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inscripciones_curso', function (Blueprint $table) {
            // Un usuario solo puede inscribirse una vez por curso
            $table->unique(['id_curso', 'id_usuario'], 'uq_inscripcion_curso_usuario');
        });
    }

    public function down(): void
    {
        Schema::table('inscripciones_curso', function (Blueprint $table) {
            $table->dropUnique('uq_inscripcion_curso_usuario');
        });
    }
};
