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

class CertificadosControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        // Simula el almacenamiento (no toca archivos reales)
        Storage::fake('public');

        $this->usuario = Usuario::factory()->withCredencial()->create([
            'id_rol' => 2,
        ]);

        // Mock de permisos
        if (!function_exists('getUserPermisos')) {
            function getUserPermisos() {
                return [1, 2, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16];
            }
        }

        // Mock de Inertia
        Inertia::macro('render', function ($component, $props = []) {
            return response()->json([
                'component' => $component,
                'props' => $props,
            ]);
        });
    }

    protected function tearDown(): void
    {
        // Limpieza segura del sandbox
        if (app()->environment('testing')) {
            Storage::disk('public')->deleteDirectory('certificados');
        }

        parent::tearDown();
    }

    #[Test]
    public function index_carga_muestra_certificados_del_usuario()
    {
        DocumentoAdjunto::factory()->create([
            'id_usuario' => $this->usuario->id_usuario,
            'tipo' => 'certificado',
        ]);

        $response = $this->actingAs($this->usuario)
                         ->get(route('certificados.index'));

        $response->assertStatus(200);

        $response->assertInertia(fn(Assert $page) =>
            $page->component('CertificadosCargados/Index')
                 ->has('documentos', 1)
                 ->where('documentos.0.tipo', 'certificado')
                 ->where('userPermisos', [1, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16])
        );
    }

    #[Test]
public function upload_permite_subir_varios_certificados_validos()
{
    $files = [
        UploadedFile::fake()->create('cert1.pdf', 500, 'application/pdf'),
        UploadedFile::fake()->image('cert2.jpg', 600, 600),
    ];

    // Actuar como usuario y subir archivos
    $response = $this->actingAs($this->usuario)->post(route('certificados.upload'), [
        'archivos' => $files,
    ]);

    // Verificar redirección y mensaje de éxito
    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Obtener archivos subidos
    $archivos = Storage::disk('public')->allFiles('certificados');

    // Asegurarse de que hay archivos
    $this->assertNotEmpty($archivos, 'No se guardó ningún archivo en certificados/');

    /** 
     * @var \Illuminate\Filesystem\FilesystemAdapter&\Illuminate\Testing\FilesystemAssertions $disk
     */
    $disk = Storage::disk('public');

    // Verificar que los archivos existen
    $disk->assertExists($archivos[0]);
    $disk->assertExists($archivos[1]);
}

    #[Test]
    public function upload_falla_si_no_envia_archivos()
    {
        $response = $this->actingAs($this->usuario)
                         ->post(route('certificados.upload'), []);

        $response->assertSessionHasErrors(['archivos']);
    }

    #[Test]
    public function upload_falla_con_formato_invalido()
    {
        $archivo = UploadedFile::fake()->create('virus.exe', 100, 'application/octet-stream');

        $response = $this->actingAs($this->usuario)->post(route('certificados.upload'), [
            'archivos' => [$archivo],
        ]);

        $response->assertSessionHasErrors(['archivos.0']);
    }

   #[Test]
public function delete_elimina_certificado_existente()
{
    // Crear archivo falso y guardarlo en Storage
    $file = UploadedFile::fake()->create('cert.pdf', 100, 'application/pdf');
    $path = $file->store('certificados', 'public');

    // Crear registro en la base de datos
    $doc = DocumentoAdjunto::factory()->create([
        'id_usuario' => $this->usuario->id_usuario,
        'ruta_archivo' => $path,
    ]);

    // Ejecutar eliminación del certificado
    $response = $this->actingAs($this->usuario)->delete(route('certificados.delete'), [
        'id_documento' => $doc->id_documento,
    ]);

    // Verificar redirección y mensaje de éxito
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Certificado eliminado correctamente.');

    /** 
     * @var \Illuminate\Filesystem\FilesystemAdapter&\Illuminate\Testing\FilesystemAssertions $disk
     */
    $disk = Storage::disk('public');

    // Verificar que el archivo fue eliminado
    $disk->assertMissing($path);
}
    #[Test]
    public function delete_falla_si_certificado_no_existe_o_no_pertenece_al_usuario()
    {
        $otroUsuario = Usuario::factory()->withCredencial()->create();
        $doc = DocumentoAdjunto::factory()->create([
            'id_usuario' => $otroUsuario->id_usuario,
        ]);

        $response = $this->actingAs($this->usuario)->delete(route('certificados.delete'), [
            'id_documento' => $doc->id_documento,
        ]);

        $response->assertSessionHasErrors();
    }
}
