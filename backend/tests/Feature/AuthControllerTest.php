<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use DatabaseTransactions;

    /** @test */
    public function login_exitoso_con_usuario_temporal()
    {
        $usuario = Usuario::create([
            'nombre_completo' => 'Usuario Activo',
            'correo'          => 'activo@example.com',
            'identificacion'  => 'TEST001',
            'telefono'        => '60001111',
            'id_rol'          => 1,
            'fecha_registro'  => now(),
            'estado_id'       => 1,
        ]);

        Credencial::create([
            'id_usuario'      => $usuario->id_usuario,
            'hash_contrasena' => Hash::make('Password123!'),
            'intentos_fallidos'=> 0,
        ]);

        $response = $this->post('/login', [
            'correo'   => 'activo@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'redirect' => route('dashboard')
                 ]);
    }

    /** @test */
    public function login_falla_con_usuario_inexistente()
    {
        $response = $this->post('/login', [
            'correo'   => 'noexiste@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Los datos ingresados son incorrectos'
                 ]);
    }

    /** @test */
    public function login_falla_con_contrasena_incorrecta()
    {
        $usuario = Usuario::create([
            'nombre_completo' => 'Usuario Contraseña Incorrecta',
            'correo'          => 'incorrecta@example.com',
            'identificacion'  => 'TEST002',
            'telefono'        => '60002222',
            'id_rol'          => 1,
            'fecha_registro'  => now(),
            'estado_id'       => 1,
        ]);

        Credencial::create([
            'id_usuario'      => $usuario->id_usuario,
            'hash_contrasena' => Hash::make('Password123!'),
            'intentos_fallidos'=> 0,
        ]);

        $response = $this->post('/login', [
            'correo'   => 'incorrecta@example.com',
            'password' => 'ClaveIncorrecta!',
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Los datos ingresados son incorrectos'
                 ]);
    }

    /** @test */
    public function logout_exitoso()
    {
        $usuario = Usuario::create([
            'nombre_completo' => 'Usuario Logout',
            'correo'          => 'logout@example.com',
            'identificacion'  => 'TEST004',
            'telefono'        => '60004444',
            'id_rol'          => 1,
            'fecha_registro'  => now(),
            'estado_id'       => 1,
        ]);

        Credencial::create([
            'id_usuario'      => $usuario->id_usuario,
            'hash_contrasena' => Hash::make('Password123!'),
        ]);

        $this->actingAs($usuario);

        $response = $this->post('/logout');

        $response->assertStatus(200)
                 ->assertJson([
                     'redirect' => route('login')
                 ]);
    }

    /** @test */
    public function login_falla_con_usuario_inactivo_pendiente()
    {
        $this->markTestIncomplete('Test pendiente: lógica de usuario inactivo aún no implementada');
    }

    /** @test */
    public function login_falla_por_intentos_fallidos_pendiente()
    {
        $this->markTestIncomplete('Test pendiente: lógica de intentos fallidos aún no implementada');
    }

    /** @test */
    public function login_falla_por_fecha_baneo_pendiente()
    {
        $this->markTestIncomplete('Test pendiente: lógica de fecha de baneo aún no implementada');
    }
}
