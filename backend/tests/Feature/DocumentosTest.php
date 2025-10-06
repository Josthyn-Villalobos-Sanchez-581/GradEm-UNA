<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
//use PHPUnit\Framework\Attributes\Test; 
class DocumentosTest extends TestCase
{
    use DatabaseTransactions; // Todo lo que se haga en DB se revierte automáticamente

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear un usuario de prueba con rol 3 (permiso 3)
        $this->usuario = Usuario::factory()->withCredencial()->create([
            'id_rol' => 3,
        ]);

        // Insertar permiso 3 para su rol
        DB::table('roles_permisos')->insert([
            'id_rol' => $this->usuario->id_rol,
            'id_permiso' => 3
        ]);
    }

    /**
     * Test que verifica que la ruta de Documentos esté accesible para usuario autenticado.
     */
public function test_usuario_autenticado_puede_acceder_a_documentos()
{
    $response = $this->actingAs($this->usuario)
                     ->get(route('documentos.index'));

    $response->assertStatus(200);

    // Verifica que Inertia reciba 'userPermisos' con el permiso 3
    $response->assertInertia(fn ($page) =>
        $page->where('userPermisos', fn ($perms) => $perms->contains(3))
    );
}

    /**
     * Test que verifica que un usuario no autenticado es redirigido al login
     */
    public function test_redirecciona_si_usuario_no_autenticado()
    {
        $response = $this->get(route('documentos.index'));
        $response->assertRedirect(route('login'));
    }
}
