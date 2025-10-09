<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\DocumentoAdjunto;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
use Inertia\Testing\AssertableInertia as Assert;
use Inertia\Inertia;

class TitulosControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->usuario = Usuario::factory()->withCredencial()->create([
            'id_rol' => 2,
        ]);

        if (!function_exists('getUserPermisos')) {
            function getUserPermisos() {
                return [1, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16];
            }
        }

        Inertia::macro('render', function ($component, $props = []) {
            return response()->json([
                'component' => $component,
                'props' => $props,
            ]);
        });
    }

    protected function tearDown(): void
    {
        if (app()->environment('testing')) {
            Storage::disk('public')->deleteDirectory('titulos');
        }

        parent::tearDown();
    }

    #[Test]
    public function index_carga_muestra_titulos_del_usuario()
    {
        DocumentoAdjunto::factory()->create([
            'id_usuario' => $this->usuario->id_usuario,
            'tipo' => 'titulo',
        ]);

        $response = $this->actingAs($this->usuario)
                         ->get(route('titulos.index'));

        $response->assertStatus(200);

        $response->assertInertia(fn(Assert $page) =>
            $page->component('TitulosCargados/Index')
                 ->has('documentos', 1)
                 ->where('documentos.0.tipo', 'titulo')
                 ->where('userPermisos', [1, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16])
        );
    }

  #[Test]
public function upload_permite_subir_varios_titulos_validos()
{
    $files = [
        UploadedFile::fake()->create('titulo1.pdf', 500, 'application/pdf'),
        UploadedFile::fake()->image('titulo2.jpg', 600, 600),
    ];

    $response = $this->actingAs($this->usuario)->post(route('titulos.upload'), [
        'archivos' => $files,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $archivos = Storage::disk('public')->allFiles('titulos');
    $this->assertNotEmpty($archivos, 'No se guardó ningún archivo en titulos/');

    /** 
     * @var \Illuminate\Filesystem\FilesystemAdapter&\Illuminate\Testing\FilesystemAssertions $disk
     */
    $disk = Storage::disk('public');
    $disk->assertExists($archivos[0]);
    $disk->assertExists($archivos[1]);
}

    #[Test]
    public function upload_falla_si_no_envia_archivos()
    {
        $response = $this->actingAs($this->usuario)
                         ->post(route('titulos.upload'), []);

        $response->assertSessionHasErrors(['archivos']);
    }

    #[Test]
    public function upload_falla_con_formato_invalido()
    {
        $archivo = UploadedFile::fake()->create('malware.exe', 100, 'application/octet-stream');

        $response = $this->actingAs($this->usuario)->post(route('titulos.upload'), [
            'archivos' => [$archivo],
        ]);

        $response->assertSessionHasErrors(['archivos.0']);
    }

    #[Test]
public function delete_elimina_titulo_existente()
{
    $file = UploadedFile::fake()->create('titulo.pdf', 100, 'application/pdf');
    $path = $file->store('titulos', 'public');

    $doc = DocumentoAdjunto::factory()->create([
        'id_usuario' => $this->usuario->id_usuario,
        'ruta_archivo' => $path,
        'tipo' => 'titulo',
    ]);

    $response = $this->actingAs($this->usuario)->delete(route('titulos.delete'), [
        'id_documento' => $doc->id_documento,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Título eliminado correctamente.');

    /** 
     * @var \Illuminate\Filesystem\FilesystemAdapter&\Illuminate\Testing\FilesystemAssertions $disk
     */
    $disk = Storage::disk('public');
    $disk->assertMissing($path);
}

    #[Test]
    public function delete_falla_si_titulo_no_existe_o_no_pertenece_al_usuario()
    {
        $otroUsuario = Usuario::factory()->withCredencial()->create();
        $doc = DocumentoAdjunto::factory()->create([
            'id_usuario' => $otroUsuario->id_usuario,
            'tipo' => 'titulo',
        ]);

        $response = $this->actingAs($this->usuario)->delete(route('titulos.delete'), [
            'id_documento' => $doc->id_documento,
        ]);

        $response->assertSessionHasErrors();
    }
}
