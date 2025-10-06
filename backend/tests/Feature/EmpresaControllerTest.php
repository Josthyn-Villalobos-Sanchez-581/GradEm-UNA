<?php
//backend/tests/Feature/EmpresaControllerTest.php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Models\Usuario;
use App\Models\Empresa;
use App\Models\Credencial;
use Illuminate\Support\Facades\Hash;
//use PHPUnit\Framework\Attributes\Test;
class EmpresaControllerTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test que registra una empresa correctamente con usuarios y credenciales ficticias.
     */
    public function test_registro_empresa_exitoso()
    {
        $password = 'Password123!';
   $payload = [
    'nombre'           => 'Empresa Ficticia ' . substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 5),
    'correo'           => 'empresa' . now()->timestamp . '@example.com',
    'telefono'         => '60012345',
    'persona_contacto' => 'Juan Pérez',
    'identificacion'   => '12345678' . rand(10,99),
    'password'         => $password,
    'password_confirmation' => $password,
];


        // Llamada al endpoint
        $response = $this->postJson(route('registro-empresa.store'), $payload);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Empresa registrada correctamente']);

        // Verificar que el usuario se creó con rol 5
        $usuario = Usuario::where('correo', $payload['correo'])->first();
        $this->assertNotNull($usuario, 'Usuario no fue creado');
        $this->assertEquals(5, $usuario->id_rol);

        // Verificar que la credencial se creó
        $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();
        $this->assertNotNull($credencial, 'Credencial no fue creada');
        $this->assertTrue(Hash::check($password, $credencial->hash_contrasena));

        // Verificar que la empresa se creó
        $empresa = Empresa::where('correo', $payload['correo'])->first();
        $this->assertNotNull($empresa, 'Empresa no fue creada');
      $this->assertEquals($usuario->id_usuario, $empresa->usuario_id);
        $this->assertEquals($payload['nombre'], $empresa->nombre);
    }

    /**
     * Test que valida campos requeridos y errores de validación.
     */
    public function test_registro_empresa_falla_validacion()
    {
        // Enviamos payload vacío
        $payload = [];

        $response = $this->postJson(route('registro-empresa.store'), $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'nombre',
                     'correo',
                     'telefono',
                     'persona_contacto',
                     'identificacion',
                     'password',
                 ]);
    }

    /**
     * Test que falla si el password y password_confirmation no coinciden.
     */
    public function test_registro_empresa_falla_password_confirmation()
    {
        $payload = [
            'nombre'           => 'Empresa Contraseña ' . now()->timestamp,
            'correo'           => 'empresa' . now()->timestamp . '@example.com',
            'telefono'         => '60012345',
            'persona_contacto' => 'Ana Gómez',
            'identificacion'   => '87654321' . rand(10,99),
            'password'         => 'Password123!',
            'password_confirmation' => 'PasswordWrong',
        ];

        $response = $this->postJson(route('registro-empresa.store'), $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }
}
