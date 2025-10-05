<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PerfilControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear usuario con rol permitido
        $this->usuario = Usuario::factory()->withCredencial()->create([
            'id_rol' => 1, // permiso 1 según middleware
        ]);


        /*significa que cada test intenta insertar nuevamente un país con id_pais = 1 (por ejemplo “Costa Rica”),
         pero esa clave primaria ya existe en la base de datos de pruebas o en una transacción anterior.*/

         /*Esto suele pasar cuando los tests insertan datos con IDs fijos (como id_pais = 1) 
         o cuando hay seeders que ya crearon el país en la BD antes de que empiece el test. */

         // por eso todas las demas se ponen con updateOrInsert, por si ya existe, no da error 
      DB::table('roles_permisos')->updateOrInsert(
    ['id_rol' => $this->usuario->id_rol, 'id_permiso' => 1],
    []
);

        // Datos base necesarios para relaciones
       DB::table('paises')->updateOrInsert(
    ['id_pais' => 1],
    ['nombre' => 'Costa Rica']
);
        DB::table('provincias')->updateOrInsert(
    ['id_provincia' => 1],
    ['nombre' => 'San José', 'id_pais' => 1]
);
        DB::table('cantones')->updateOrInsert(
    ['id_canton' => 1],
    ['nombre' => 'Escazú', 'id_provincia' => 1]
);
        DB::table('universidades')->updateOrInsert(
    ['id_universidad' => 1],
    ['nombre' => 'UNA', 'sigla' => 'UNA']
);
        DB::table('carreras')->updateOrInsert(
    ['id_carrera' => 1],
    ['nombre' => 'Ingeniería', 'id_universidad' => 1, 'area_conocimiento' => 'Tecnología']
);
        DB::table('areas_laborales')->updateOrInsert(
    ['id_area_laboral' => 1],
    ['nombre' => 'Desarrollo de Software']
);
    }

    /** @test */
    public function test_usuario_puede_ver_perfil_index()
    {
        $response = $this->actingAs($this->usuario)
                         ->get(route('perfil.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Perfil/Index')
                 ->has('usuario')
                 ->has('userPermisos')
                 ->has('areaLaborales')
                 ->has('paises')
                 ->has('provincias')
                 ->has('cantones')
                 ->has('universidades')
                 ->has('carreras')
        );
    }

    /** @test */
    public function test_usuario_puede_ver_perfil_edit()
    {
        $response = $this->actingAs($this->usuario)
                         ->get(route('perfil.edit'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Perfil/Editar')
                 ->has('usuario')
                 ->has('userPermisos')
                 ->has('paises')
        );
    }

    /** @test */
    public function test_usuario_puede_actualizar_datos_perfil()
    {
        $payload = [
            'nombre_completo' => 'Froy Rivera',
            'correo' => 'nuevo@example.com',
            'identificacion' => '123456789',
            'telefono' => '88888888',
            'fecha_nacimiento' => '2000-01-01',
            'area_laboral_id' => 1,
            'id_canton' => 1,
            'id_universidad' => 1,
            'id_carrera' => 1,
        ];

        $response = $this->actingAs($this->usuario)
                         ->put(route('perfil.update'), $payload);

        $response->assertRedirect(route('perfil.index'));
        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $this->usuario->id_usuario,
            'correo' => 'nuevo@example.com',
            'telefono' => '88888888',
        ]);
    }

    /** @test */
    public function test_error_validacion_en_update()
    {
        $payload = [
            'nombre_completo' => '', // vacío → falla validación
            'correo' => 'noesuncorreo',
        ];

        $response = $this->actingAs($this->usuario)
                         ->put(route('perfil.update'), $payload);

        $response->assertSessionHasErrors(['nombre_completo', 'correo']);
    }

    /** @test */
    public function test_update_no_modifica_datos_si_no_hay_cambios()
    {
        $originalCorreo = $this->usuario->correo;

        $response = $this->actingAs($this->usuario)
                         ->put(route('perfil.update'), [
                             'nombre_completo' => $this->usuario->nombre_completo,
                             'correo' => $originalCorreo,
                             'identificacion' => $this->usuario->identificacion,
                         ]);

        $response->assertRedirect(route('perfil.index'));
        $this->assertDatabaseHas('usuarios', ['correo' => $originalCorreo]);
    }

    /** @test */
    public function test_update_rechaza_datos_invalidos_en_relaciones()
    {
        $payload = [
            'nombre_completo' => 'Usuario Prueba',
            'correo' => 'test@example.com',
            'identificacion' => '999999999',
            'id_universidad' => 999, // no existe
            'id_carrera' => 999,
            'id_canton' => 999,
        ];

        $response = $this->actingAs($this->usuario)
                         ->put(route('perfil.update'), $payload);

        $response->assertSessionHasErrors(['id_universidad', 'id_carrera', 'id_canton']);
    }
}
