<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\DashboardServices\DashboardService;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('login');
        }

        // Toda la lógica se delega al servicio
        $datosDashboard = $this->dashboardService->obtenerDatosDashboard($usuario);

        return Inertia::render('Dashboard', $datosDashboard);
    }
}
