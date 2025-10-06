<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\Usuario;
use App\Models\FotoPerfil;

class FotoPerfilControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        // Finge almacenamiento público
        Storage::fake('public');
  $this->withoutMiddleware();
        // Crea usuario de prueba con rol 1 (permiso para acceder al perfil)
        $this->usuario = Usuario::factory()->withCredencial()->create([
            'id_rol' => 1,
        ]);
    }

    /**
     * ✅ Usuario autenticado puede acceder a la vista de foto de perfil
     */
    public function test_usuario_puede_ver_la_vista_de_foto_perfil()
    {
        $response = $this->actingAs($this->usuario)->get(route('perfil.foto.mostrar'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->has('userPermisos')
                 ->has('fotoPerfil')
        );
    }

    /**
     * ✅ Usuario puede subir una foto válida
     */
    public function test_usuario_puede_subir_foto_valida()
    {
        $foto = UploadedFile::fake()->image('perfil.jpg', 600, 600);

        $response = $this->actingAs($this->usuario)
                         ->post(route('perfil.foto.subir'), ['foto' => $foto]);

        $response->assertRedirect(route('perfil.index'));
        $response->assertSessionHas('success', 'Foto de perfil actualizada exitosamente.');

        // Verifica que el archivo se haya "subido" al disco fake
        Storage::disk('public')->assertExists('fotos_perfil/' . $foto->hashName());

        // Verifica que exista el registro en BD
        $this->assertDatabaseHas('fotos_perfil', [
            'id_usuario' => $this->usuario->id_usuario,
        ]);
    }

    /**
     * 🚫 Falla si no se envía una foto
     */
    public function test_error_si_no_envia_foto()
    {
        $response = $this->actingAs($this->usuario)
                         ->post(route('perfil.foto.subir'), []);

        $response->assertSessionHasErrors(['foto']);
    }

    /**
     * 🚫 Falla si el archivo no es imagen
     */
    public function test_error_si_archivo_no_es_imagen()
    {
        $archivo = UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->usuario)
                         ->post(route('perfil.foto.subir'), ['foto' => $archivo]);

        $response->assertSessionHasErrors(['foto']);
    }

    /**
     * ✅ Usuario puede eliminar su foto correctamente
     */
    public function test_usuario_puede_eliminar_foto()
    {
        // Simular una foto ya existente
        $foto = UploadedFile::fake()->image('foto_existente.png', 600, 600);
        $ruta = $foto->store('fotos_perfil', 'public');

        $fotoPerfil = FotoPerfil::create([
            'id_usuario' => $this->usuario->id_usuario,
            'ruta_imagen' => '/storage/' . $ruta,
            'fecha_subida' => now(),
        ]);

        // Ejecutar eliminación
        $response = $this->actingAs($this->usuario)
                         ->post(route('perfil.foto.eliminar'));

        $response->assertRedirect(route('perfil.index'));
        $response->assertSessionHas('success', 'Foto de perfil eliminada exitosamente.');

        // Verificar que se haya borrado del almacenamiento simulado
        Storage::disk('public')->assertMissing($ruta);

        // Verificar que ya no exista en la BD
        $this->assertDatabaseMissing('fotos_perfil', [
            'id_foto' => $fotoPerfil->id_foto,
        ]);
    }

      /**
     * 🚫 Falla si la imagen es más pequeña que 500x500 píxeles
     */
    public function test_error_si_imagen_tiene_dimensiones_invalidas()
    {
        // Crea una imagen pequeña (400x400)
        $fotoPequena = UploadedFile::fake()->image('foto_pequena.jpg', 400, 400);

        $response = $this->actingAs($this->usuario)
                         ->post(route('perfil.foto.subir'), ['foto' => $fotoPequena]);

        $response->assertSessionHasErrors(['foto']);
    }
}
