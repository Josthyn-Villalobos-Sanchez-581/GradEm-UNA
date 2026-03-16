<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Models\Usuario;
use App\Models\Rol;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\Test;

class UsuariosConsultaControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuarioEstudiante;
    protected $usuarioEgresado;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();

        // Crear roles individualmente
        $rolEstudiante = Rol::firstOrCreate(['nombre_rol' => 'Estudiante']);
        $rolEgresado = Rol::firstOrCreate(['nombre_rol' => 'Egresado']);
        Rol::firstOrCreate(['nombre_rol' => 'Empresa']);
        Rol::firstOrCreate(['nombre_rol' => 'Administrador del Sistema']);

        // Crear usuarios de prueba
        $this->usuarioEstudiante = Usuario::factory()->create([
            'id_rol' => $rolEstudiante->id_rol,
        ]);

        $this->usuarioEgresado = Usuario::factory()->create([
            'id_rol' => $rolEgresado->id_rol,
        ]);
    }

    #[Test]
    public function index_muestra_usuarios_y_permisos()
    {
        $this->be($this->usuarioEstudiante);

        $response = $this->get(route('usuarios.perfiles'));

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('Usuarios/PerfilesUsuarios')
                 ->has('usuarios')
                 ->has('userPermisos')
                 ->where('usuarios', fn ($usuarios) =>
                     collect($usuarios)->pluck('id_usuario')->contains($this->usuarioEstudiante->id_usuario)
                 )
        );
    }

    #[Test]
    public function index_filtra_por_rol_estudiante_egresado()
    {
        $this->be($this->usuarioEstudiante);

        // Crear un usuario admin para probar que no se incluye
        $rolAdmin = Rol::where('nombre_rol', 'Administrador del Sistema')->first();
        $usuarioAdmin = Usuario::factory()->create(['id_rol' => $rolAdmin->id_rol]);

        $response = $this->get(route('usuarios.perfiles'));

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) =>
            $page->component('Usuarios/PerfilesUsuarios')
                 ->where('usuarios', fn ($usuarios) => 
                     collect($usuarios)->pluck('id_usuario')->contains($this->usuarioEstudiante->id_usuario)
                     && collect($usuarios)->pluck('id_usuario')->contains($this->usuarioEgresado->id_usuario)
                     && !collect($usuarios)->pluck('id_usuario')->contains($usuarioAdmin->id_usuario)
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
