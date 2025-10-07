<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
class AuthControllerTest extends TestCase
{
    use DatabaseTransactions;

    #[Test]
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

    #[Test]
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

    #[Test]
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

    #[Test]
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

  #[Test]
public function login_falla_con_usuario_inactivo()
{
    $usuario = Usuario::create([
        'nombre_completo' => 'Usuario Inactivo',
        'correo'          => 'inactivo@example.com',
        'identificacion'  => 'TEST003',
        'telefono'        => '60003333',
        'id_rol'          => 1,
        'fecha_registro'  => now(),
        'estado_id'       => 2, // distinto de 1 = inactivo
    ]);

    Credencial::create([
        'id_usuario'      => $usuario->id_usuario,
        'hash_contrasena' => Hash::make('Password123!'),
        'intentos_fallidos'=> 0,
    ]);

    $response = $this->post('/login', [
        'correo'   => 'inactivo@example.com',
        'password' => 'Password123!',
    ]);

    $response->assertStatus(422)
             ->assertJson([
                 'message' => 'Los datos ingresados son incorrectos'
             ]);
}


#[Test]
public function login_falla_por_intentos_fallidos()
{
    $usuario = Usuario::create([
        'nombre_completo' => 'Usuario Bloqueo',
        'correo'          => 'bloqueo@example.com',
        'identificacion'  => 'TEST005',
        'telefono'        => '60005555',
        'id_rol'          => 1,
        'fecha_registro'  => now(),
        'estado_id'       => 1,
    ]);

    $credencial = Credencial::create([
        'id_usuario'       => $usuario->id_usuario,
        'hash_contrasena'  => Hash::make('Password123!'),
        'intentos_fallidos'=> 3, // ya alcanzó el límite
        'fecha_baneo'      => now()->addMinutes(5), // baneo de 5 minutos
    ]);

    // Intentar login durante baneo
    $response = $this->post('/login', [
        'correo'   => 'bloqueo@example.com',
        'password' => 'Password123!',
    ]);

    $response->assertStatus(422)
             ->assertJson([
                 'message' => 'Los datos ingresados son incorrectos'
             ]);
}


#[Test]
public function login_falla_por_fecha_baneo()
{
    $usuario = Usuario::create([
        'nombre_completo' => 'Usuario Baneo Pasado',
        'correo'          => 'baneopasado@example.com',
        'identificacion'  => 'TEST006',
        'telefono'        => '60006666',
        'id_rol'          => 1,
        'fecha_registro'  => now(),
        'estado_id'       => 1,
    ]);

    $credencial = Credencial::create([
        'id_usuario'       => $usuario->id_usuario,
        'hash_contrasena'  => Hash::make('Password123!'),
        'intentos_fallidos'=> 3,
        'fecha_baneo'      => now()->subMinutes(1), // baneo pasado
    ]);

    // Login correcto después del baneo
    $response = $this->post('/login', [
        'correo'   => 'baneopasado@example.com',
        'password' => 'Password123!',
    ]);

    $response->assertStatus(200)
             ->assertJson([
                 'redirect' => route('dashboard')
             ]);

    // Verificar que los intentos fallidos se resetearon
    $this->assertDatabaseHas('credenciales', [
        'id_usuario'       => $usuario->id_usuario,
        'intentos_fallidos'=> 0,
        'fecha_baneo'      => null,
    ]);
}

}
