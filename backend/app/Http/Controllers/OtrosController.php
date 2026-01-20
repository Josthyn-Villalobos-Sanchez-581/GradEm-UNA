<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OtrosServices\OtrosService;

class OtrosController extends Controller
{
    protected $otrosService;

    public function __construct(OtrosService $otrosService)
    {
        $this->otrosService = $otrosService;
    }

    public function indexCarga()
    {
        try {
            return $this->otrosService->indexCarga();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function upload(Request $request)
    {
        try {
            return $this->otrosService->upload($request);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function delete(Request $request)
    {
        try {
            return $this->otrosService->delete($request);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }
}
