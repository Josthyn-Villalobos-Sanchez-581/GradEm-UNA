<?php
//backend/app/Http/Requests/PlataformaExternaRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class PlataformaExternaRequest extends FormRequest
{
    public function authorize()
    {
        return Auth::check();
    }

    public function rules()
    {
        return [
            'url' => [
                'required',
                'string',
                'max:2048',
                'url',
                'regex:/^https:\\/\\/.+/i',
            ],
            'tipo' => ['required', 'string', 'max:50'],
        ];
    }

    public function messages()
    {
        return [
            'url.regex' => 'La URL debe comenzar con https://',
        ];
    }

    // Importante: dejar que Laravel maneje los errores con Inertia
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        parent::failedValidation($validator);
    }
}
