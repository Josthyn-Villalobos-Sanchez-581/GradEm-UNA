<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TitulosServices\TituloService;

class TitulosController extends Controller
{
    protected $tituloService;

    public function __construct(TituloService $tituloService)
    {
        $this->tituloService = $tituloService;
    }

    public function indexCarga()
    {
        try {
            return $this->tituloService->indexCarga();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function upload(Request $request)
    {
        try {
            return $this->tituloService->upload($request);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function delete(Request $request)
    {
        try {
            return $this->tituloService->delete($request);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }
}
