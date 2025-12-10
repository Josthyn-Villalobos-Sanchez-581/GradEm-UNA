<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CertificadosServices\CertificadoService;

class CertificadosController extends Controller
{
    protected $certificadoService;

    public function __construct(CertificadoService $certificadoService)
    {
        $this->certificadoService = $certificadoService;
    }

    public function indexCarga()
    {
        try {
            return $this->certificadoService->indexCarga();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function upload(Request $request)
    {
        try {
            return $this->certificadoService->upload($request);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function delete(Request $request)
    {
        try {
            return $this->certificadoService->delete($request);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }
}
