<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;

class UsuarioControllerTest extends TestCase
{
    use DatabaseTransactions;

    #[Test]
    public function puede_crear_un_usuario()
    {
        $datos = Usuario::factory()->make()->toArray();

        $response = $this->post('/usuarios', $datos);

        $response->assertRedirect();
    }


    #[Test]
    public function puede_eliminar_un_usuario()
    {
        $usuario = Usuario::factory()->create();

        $response = $this->delete("/usuarios/{$usuario->id_usuario}");

        $response->assertRedirect();
    }
}