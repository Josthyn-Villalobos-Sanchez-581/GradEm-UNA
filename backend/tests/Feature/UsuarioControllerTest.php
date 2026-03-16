<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UsuarioControllerTest extends TestCase
{
    use DatabaseTransactions;

    /** @test */
    public function puede_listar_usuarios()
    {
        Usuario::factory()->count(3)->create();

        $response = $this->get('/usuarios');

        $response->assertStatus(200);
    }

    /** @test */
    public function puede_crear_un_usuario()
    {
        $datos = Usuario::factory()->make()->toArray();

        $response = $this->post('/usuarios', $datos);

        $response->assertRedirect();
    }

    /** @test */
    public function puede_mostrar_un_usuario()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->get("/usuarios/{$usuario->id_usuario}");

        $response->assertStatus(200);
    }

    /** @test */
    public function puede_actualizar_un_usuario()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->put("/usuarios/{$usuario->id_usuario}", [
            'nombre' => 'Nombre Actualizado'
        ]);

        $response->assertRedirect();
    }

    /** @test */
    public function puede_eliminar_un_usuario()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->delete("/usuarios/{$usuario->id_usuario}");

        $response->assertRedirect();
    }
}