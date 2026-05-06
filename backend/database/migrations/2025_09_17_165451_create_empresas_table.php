<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('empresas')) {
            return;
        }

        Schema::create('empresas', function (Blueprint $table) {
            $table->id('id_empresa');
            $table->string('nombre_empresa')->unique();
            $table->string('cedula_juridica')->unique();
            $table->string('correo')->unique();
            $table->string('telefono');
            $table->string('direccion')->nullable();
            $table->string('descripcion');
            $table->string('password');
            $table->integer('rol_id')->default(3); // Debe coincidir con el tipo de roles.id_rol (INT)
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('rol_id')->references('id_rol')->on('roles'); // Crea una llave foránea si tienes una tabla de roles
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('empresas')) {
            Schema::dropIfExists('empresas');
        }
    }
};
