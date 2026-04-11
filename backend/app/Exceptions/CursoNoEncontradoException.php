<?php

namespace App\Exceptions;

use Exception;

class CursoNoEncontradoException extends Exception
{
    public function __construct(string $message = 'Curso no encontrado.', int $code = 0, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
