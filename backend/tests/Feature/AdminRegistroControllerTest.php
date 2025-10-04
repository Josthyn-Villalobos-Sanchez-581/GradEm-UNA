<?php
// backend/tests/Feature/AdminRegistroControllerTest.php
namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminRegistroControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $admin;
    protected $subdireccion;

    protected function setUp(): void
    {
        parent::setUp();

        // Usuario con rol Administrador del Sistema (id_usuario=10)
        $this->admin = Usuario::find(10);

        // Usuario con rol Subdirección (id_usuario=7)
        $this->subdireccion = Usuario::find(7);
    }

    /** @test */
    public function un_admin_puede_crear_otro_admin()
    {
        $payload = [
            'nombre_completo' => 'Nuevo Admin',
            'correo' => 'nuevo_admin@example.com',
            'identificacion' => 'IDTEST123',
            'telefono' => '60001234',
            'rol' => 'Administrador del Sistema',
            'universidad' => 'Universidad Test',
            'carrera' => 'Carrera Test',
            'contrasena' => 'Password123',
            'contrasena_confirmation' => 'Password123',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('usuarios.store'), $payload);

        $response->assertRedirect(route('usuarios.index'))
                 ->assertSessionHas('success', 'Usuario registrado correctamente');

        $this->assertDatabaseHas('usuarios', [
            'correo' => 'nuevo_admin@example.com',
            'nombre_completo' => 'Nuevo Admin'
        ]);
    }

    /** @test */
    public function no_se_puede_crear_usuario_con_correo_duplicado()
    {
        $payload = [
            'nombre_completo' => 'Duplicado',
            'correo' => $this->admin->correo, // correo ya existente
            'identificacion' => 'OTRAID123',
            'telefono' => '60002222',
            'rol' => 'Administrador del Sistema',
            'contrasena' => 'Password123',
            'contrasena_confirmation' => 'Password123',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('usuarios.store'), $payload);

        $response->assertSessionHasErrors(['correo']);
    }

    /** @test */
    public function un_admin_puede_actualizar_un_usuario()
    {
        $usuario = Usuario::create([
            'id_usuario' => 200,
            'nombre_completo' => 'Admin Viejo',
            'correo' => 'viejo@example.com',
            'identificacion' => 'VIEJO123',
            'telefono' => '60009999',
            'id_rol' => $this->admin->id_rol,
            'fecha_registro' => now(),
            'estado_id' => 1,
        ]);

        $payload = [
            'nombre_completo' => 'Admin Actualizado',
            'correo' => 'actualizado@example.com',
            'identificacion' => 'VIEJO123', // misma identificación
            'telefono' => '60008888',
            'rol' => 'Administrador del Sistema',
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.actualizar', $usuario->id_usuario), $payload);

        $response->assertRedirect(route('usuarios.index'))
                 ->assertSessionHas('success', 'Usuario actualizado correctamente');

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario,
            'correo' => 'actualizado@example.com',
            'nombre_completo' => 'Admin Actualizado'
        ]);
    }

    /** @test */
    public function un_admin_puede_eliminar_un_usuario()
    {
        $usuario = Usuario::create([
            'id_usuario' => 201,
            'nombre_completo' => 'Eliminar Test',
            'correo' => 'eliminar@example.com',
            'identificacion' => 'DEL123',
            'telefono' => '60007777',
            'id_rol' => $this->admin->id_rol,
            'fecha_registro' => now(),
            'estado_id' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.eliminar', $usuario->id_usuario));

        $response->assertRedirect(route('usuarios.index'))
                 ->assertSessionHas('success', 'Usuario eliminado correctamente');

        $this->assertDatabaseMissing('usuarios', [
            'id_usuario' => $usuario->id_usuario
        ]);
    }

    /** @test */
    public function un_usuario_subdireccion_no_puede_eliminar_un_usuario()
    {
        $usuario = Usuario::create([
            'id_usuario' => 202,
            'nombre_completo' => 'Victima',
            'correo' => 'victima@example.com',
            'identificacion' => 'VICTIMA123',
            'telefono' => '60006666',
            'id_rol' => $this->admin->id_rol,
            'fecha_registro' => now(),
            'estado_id' => 1,
        ]);

        $response = $this->actingAs($this->subdireccion)
            ->delete(route('admin.eliminar', $usuario->id_usuario));

        $response->assertRedirect(route('usuarios.index'))
                 ->assertSessionHas('error', 'No tiene permisos para eliminar usuarios.');

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario
        ]);
    }

    /** @test */
    public function index_lista_usuarios_admins()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('usuarios.index'));

        $response->assertStatus(200);
    }
}
