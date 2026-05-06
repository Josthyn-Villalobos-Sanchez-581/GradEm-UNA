<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('cursos')) {
            return;
        }

        if (!Schema::hasColumn('cursos', 'cupos')) {
            Schema::table('cursos', function (Blueprint $table) {
                $table->unsignedInteger('cupos')->nullable()->after('nombreInstructor');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('cursos')) {
            return;
        }

        if (Schema::hasColumn('cursos', 'cupos')) {
            Schema::table('cursos', function (Blueprint $table) {
                $table->dropColumn('cupos');
            });
        }
    }
};
