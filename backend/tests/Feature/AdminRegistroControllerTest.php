<?php
// backend/tests/Feature/AdminRegistroControllerTest.php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
class AdminRegistroControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $admin;
    protected $subdireccion;

    protected function setUp(): void
    {
        parent::setUp();

        // Usuarios de prueba con credencial
        $this->admin = Usuario::factory()->withCredencial()->create([
            'id_rol' => 2, // Administrador
        ]);

        $this->subdireccion = Usuario::factory()->withCredencial()->create([
            'id_rol' => 4, // Subdirección
        ]);
    }

    #[Test]
    public function un_admin_puede_crear_otro_admin()
    {
        $payload = [
            'nombre_completo' => 'Nuevo Admin',
            'correo' => 'nuevo_admin@example.com',
            'identificacion' => 'IDTEST123',
            'telefono' => '60001234',
            'rol' => 'Administrador del Sistema',
            'id_universidad' => 1,
            'id_carrera' => 1,
            'contrasena' => 'Password123!',
            'contrasena_confirmation' => 'Password123!',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('usuarios.store'), $payload);

        $response->assertRedirect(route('usuarios.index'));
        $response->assertSessionHas('success');

        $usuario = Usuario::where('correo', $payload['correo'])->first();
        $this->assertNotNull($usuario);
    }

      #[Test]
    public function no_se_puede_crear_usuario_con_correo_duplicado()
    {
        $payload = [
            'nombre_completo' => 'Duplicado',
            'correo' => $this->admin->correo,
            'identificacion' => 'OTRAID123',
            'telefono' => '60002222',
            'rol' => 'Administrador del Sistema',
            'contrasena' => 'Password123!',
            'contrasena_confirmation' => 'Password123!',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('usuarios.store'), $payload);

        $response->assertSessionHasErrors(['correo']);
    }

      #[Test]
    public function un_admin_puede_actualizar_un_usuario()
    {
        $usuario = Usuario::factory()->withCredencial()->create([
            'id_rol' => $this->admin->id_rol,
        ]);

        $payload = [
            'nombre_completo' => 'Admin Actualizado',
            'correo' => 'actualizado@example.com',
            'identificacion' => $usuario->identificacion,
            'telefono' => '60008888',
            'rol' => 'Administrador del Sistema',
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.actualizar', $usuario->id_usuario), $payload);

        $response->assertRedirect(route('usuarios.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario,
            'correo' => 'actualizado@example.com',
            'nombre_completo' => 'Admin Actualizado',
        ]);
    }

    #[Test]
public function un_admin_puede_eliminar_un_usuario()
{
    $usuario = Usuario::factory()->withCredencial()->create([
        'id_rol' => $this->admin->id_rol,
    ]);

    $this->withoutMiddleware();

    $response = $this->actingAs($this->admin)
        ->delete(route('admin.eliminar', $usuario->id_usuario));

    // Espera una respuesta JSON exitosa (200)
    $response->assertStatus(200);
    $response->assertJson([
        'status' => 'success',
        'message' => 'Usuario eliminado correctamente.'
    ]);

    // Verifica que el usuario se eliminó
    $this->assertDatabaseMissing('usuarios', [
        'id_usuario' => $usuario->id_usuario,
    ]);
}

    #[Test]
public function un_usuario_subdireccion_no_puede_eliminar_un_usuario()
{
    $usuario = Usuario::factory()->withCredencial()->create([
        'id_rol' => $this->admin->id_rol,
    ]);

    $this->withoutMiddleware();

    $response = $this->actingAs($this->subdireccion)
        ->delete(route('admin.eliminar', $usuario->id_usuario));

    // Espera un código de prohibido (403)
    $response->assertStatus(403);
    $response->assertJson([
        'status' => 'error',
        'message' => 'No tiene permisos para eliminar usuarios.'
    ]);

    // Verifica que el usuario aún existe
    $this->assertDatabaseHas('usuarios', [
        'id_usuario' => $usuario->id_usuario,
    ]);
}


        #[Test]
    public function index_lista_usuarios_admins()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('usuarios.index'));

        $response->assertStatus(200);
    }
}
