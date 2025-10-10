<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AreaLaboral extends Model
{
    use HasFactory;

    protected $table = 'areas_laborales';
    protected $primaryKey = 'id_area_laboral';
    public $timestamps = false;

    protected $fillable = ['nombre'];
}
