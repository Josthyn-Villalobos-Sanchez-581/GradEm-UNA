<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Models\Usuario;
use App\Models\Rol;
use Inertia\Testing\AssertableInertia as Assert;

class UsuariosConsultaControllerTest extends TestCase
{
    use DatabaseTransactions;

    public function test_index_muestra_usuarios_y_permisos()
    {
        $this->withoutMiddleware();

        $rol = Rol::factory()->create(['nombre_rol' => 'Estudiante/Egresado']);
        $usuario = Usuario::factory()->create(['id_rol' => $rol->id_rol]);
/** @var \App\Models\Usuario $usuario */
        $this->be($usuario);

        $response = $this->get('/usuarios/perfiles');

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('Usuarios/PerfilesUsuarios')
                 ->has('usuarios')
                 ->has('userPermisos')
                 ->where('usuarios', fn ($usuarios) =>
                     collect($usuarios)->contains('id_usuario', $usuario->id_usuario)
                 )
        );
    }

    public function test_index_filtra_por_rol_estudiante_egresado()
    {
        $this->withoutMiddleware();

        $rolCorrecto = Rol::factory()->create(['nombre_rol' => 'Estudiante/Egresado']);
        $rolIncorrecto = Rol::factory()->create(['nombre_rol' => 'Administrador']);

        $usuario1 = Usuario::factory()->create(['id_rol' => $rolCorrecto->id_rol]);
        Usuario::factory()->create(['id_rol' => $rolIncorrecto->id_rol]);
/** @var \App\Models\Usuario $usuario1 */
        $this->be($usuario1);

        $response = $this->get('/usuarios/perfiles');

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('Usuarios/PerfilesUsuarios')
                 ->where('usuarios', fn ($usuarios) =>
                     collect($usuarios)->contains('id_usuario', $usuario1->id_usuario)
                 )
        );
    }

    public function test_index_sin_usuario_autenticado_retorna_permisos_vacios()
    {
        $this->withoutMiddleware();

        $response = $this->get('/usuarios/perfiles');

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('Usuarios/PerfilesUsuarios')
                 ->where('userPermisos', [])
        );
    }
}
