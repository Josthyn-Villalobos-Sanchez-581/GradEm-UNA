<?php

namespace App\Repositories\CurriculumRepositories;

use App\Models\Curriculum;
use Illuminate\Support\Facades\Storage;

class CurriculumRepository
{
    public function findByUser($id_usuario)
    {
        return Curriculum::where('id_usuario', $id_usuario)->first();
    }

    public function updateOrCreate(array $attributes, array $values)
    {
        return Curriculum::updateOrCreate($attributes, $values);
    }

    public function create(array $data)
    {
        return Curriculum::create($data);
    }

    public function deleteFileIfExists($ruta)
    {
        if ($ruta && Storage::disk('public')->exists($ruta)) {
            Storage::disk('public')->delete($ruta);
            return true;
        }
        return false;
    }

    public function deleteRecord($curriculum)
    {
        return $curriculum->delete();
    }
}
