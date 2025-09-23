<?php
// resources/lang/es/validation.php
return [

    /*
    |--------------------------------------------------------------------------
    | Validación de mensajes en Español
    |--------------------------------------------------------------------------
    |
    | Traducciones en español para las reglas de validación de Laravel.
    |
    */

    'accepted'             => 'El :attribute debe ser aceptado.',
    'accepted_if'          => 'El :attribute debe ser aceptado cuando :other es :value.',
    'active_url'           => 'El :attribute no es una URL válida.',
    'after'                => 'El :attribute debe ser una fecha posterior a :date.',
    'after_or_equal'       => 'El :attribute debe ser una fecha posterior o igual a :date.',
    'alpha'                => 'El :attribute solo debe contener letras.',
    'alpha_dash'           => 'El :attribute solo debe contener letras, números, guiones y guiones bajos.',
    'alpha_num'            => 'El :attribute solo debe contener letras y números.',
    'array'                => 'El :attribute debe ser un arreglo.',
    'before'               => 'El :attribute debe ser una fecha anterior a :date.',
    'before_or_equal'      => 'El :attribute debe ser una fecha anterior o igual a :date.',
    'between'              => [
        'numeric' => 'El :attribute debe estar entre :min y :max.',
        'file'    => 'El :attribute debe pesar entre :min y :max kilobytes.',
        'string'  => 'El :attribute debe contener entre :min y :max caracteres.',
        'array'   => 'El :attribute debe contener entre :min y :max elementos.',
    ],
    'boolean'              => 'El campo :attribute debe ser verdadero o falso.',
    'confirmed'            => 'La confirmación de :attribute no coincide.',
    'current_password'     => 'La contraseña es incorrecta.',
    'date'                 => 'El :attribute no es una fecha válida.',
    'date_equals'          => 'El :attribute debe ser una fecha igual a :date.',
    'date_format'          => 'El :attribute no coincide con el formato :format.',
    'declined'             => 'El :attribute debe ser rechazado.',
    'declined_if'          => 'El :attribute debe ser rechazado cuando :other es :value.',
    'different'            => 'El :attribute y :other deben ser distintos.',
    'digits'               => 'El :attribute debe tener :digits dígitos.',
    'digits_between'       => 'El :attribute debe tener entre :min y :max dígitos.',
    'dimensions'           => 'El :attribute tiene dimensiones de imagen inválidas.',
    'distinct'             => 'El campo :attribute tiene un valor duplicado.',
    'email'                => 'El :attribute debe ser una dirección de correo válida.',
    'ends_with'            => 'El :attribute debe finalizar con uno de los siguientes valores: :values.',
    'enum'                 => 'El :attribute seleccionado no es válido.',
    'exists'               => 'El :attribute seleccionado no es válido.',
    'file'                 => 'El :attribute debe ser un archivo.',
    'filled'               => 'El campo :attribute debe tener un valor.',
    'gt'                   => [
        'numeric' => 'El :attribute debe ser mayor que :value.',
        'file'    => 'El :attribute debe pesar más de :value kilobytes.',
        'string'  => 'El :attribute debe tener más de :value caracteres.',
        'array'   => 'El :attribute debe tener más de :value elementos.',
    ],
    'gte'                  => [
        'numeric' => 'El :attribute debe ser mayor o igual que :value.',
        'file'    => 'El :attribute debe pesar al menos :value kilobytes.',
        'string'  => 'El :attribute debe tener al menos :value caracteres.',
        'array'   => 'El :attribute debe tener al menos :value elementos.',
    ],
    'image'                => 'El :attribute debe ser una imagen.',
    'in'                   => 'El :attribute seleccionado no es válido.',
    'in_array'             => 'El campo :attribute no existe en :other.',
    'integer'              => 'El :attribute debe ser un número entero.',
    'ip'                   => 'El :attribute debe ser una dirección IP válida.',
    'ipv4'                 => 'El :attribute debe ser una dirección IPv4 válida.',
    'ipv6'                 => 'El :attribute debe ser una dirección IPv6 válida.',
    'json'                 => 'El :attribute debe ser una cadena JSON válida.',
    'lt'                   => [
        'numeric' => 'El :attribute debe ser menor que :value.',
        'file'    => 'El :attribute debe pesar menos de :value kilobytes.',
        'string'  => 'El :attribute debe tener menos de :value caracteres.',
        'array'   => 'El :attribute debe tener menos de :value elementos.',
    ],
    'lte'                  => [
        'numeric' => 'El :attribute debe ser menor o igual que :value.',
        'file'    => 'El :attribute debe pesar como máximo :value kilobytes.',
        'string'  => 'El :attribute debe tener como máximo :value caracteres.',
        'array'   => 'El :attribute no debe tener más de :value elementos.',
    ],
    'mac_address'          => 'El :attribute debe ser una dirección MAC válida.',
    'max'                  => [
        'numeric' => 'El :attribute no debe ser mayor que :max.',
        'file'    => 'El :attribute no debe pesar más de :max kilobytes.',
        'string'  => 'El :attribute no debe tener más de :max caracteres.',
        'array'   => 'El :attribute no debe tener más de :max elementos.',
    ],
    'mimes'                => 'El :attribute debe ser un archivo de tipo: :values.',
    'mimetypes'            => 'El :attribute debe ser un archivo de tipo: :values.',
    'min'                  => [
        'numeric' => 'El :attribute debe ser al menos :min.',
        'file'    => 'El :attribute debe pesar al menos :min kilobytes.',
        'string'  => 'El :attribute debe tener al menos :min caracteres.',
        'array'   => 'El :attribute debe tener al menos :min elementos.',
    ],
    'multiple_of'          => 'El :attribute debe ser múltiplo de :value.',
    'not_in'               => 'El :attribute seleccionado no es válido.',
    'not_regex'            => 'El formato del :attribute no es válido.',
    'numeric'              => 'El :attribute debe ser un número.',
    'password'             => [
        'letters' => 'El :attribute debe contener al menos una letra.',
        'mixed'   => 'El :attribute debe contener al menos una letra mayúscula y una minúscula.',
        'numbers' => 'El :attribute debe contener al menos un número.',
        'symbols' => 'El :attribute debe contener al menos un símbolo.',
        'uncompromised' => 'El :attribute proporcionado ha aparecido en una fuga de datos. Por favor elige otro :attribute.',
    ],
    'present'              => 'El campo :attribute debe estar presente.',
    'prohibited'           => 'El :attribute está prohibido.',
    'prohibited_if'        => 'El :attribute está prohibido cuando :other es :value.',
    'prohibited_unless'    => 'El :attribute está prohibido a menos que :other esté en :values.',
    'prohibits'            => 'El :attribute prohíbe que :other esté presente.',
    'regex'                => 'El formato del :attribute no es válido.',
    'required'             => 'El campo :attribute es obligatorio.',
    'required_if'          => 'El campo :attribute es obligatorio cuando :other es :value.',
    'required_unless'      => 'El campo :attribute es obligatorio a menos que :other esté en :values.',
    'required_with'        => 'El campo :attribute es obligatorio cuando :values está presente.',
    'required_with_all'    => 'El campo :attribute es obligatorio cuando :values están presentes.',
    'required_without'     => 'El campo :attribute es obligatorio cuando :values no está presente.',
    'required_without_all' => 'El campo :attribute es obligatorio cuando ninguno de :values está presente.',
    'same'                 => 'El :attribute y :other deben coincidir.',
    'size'                 => [
        'numeric' => 'El :attribute debe ser :size.',
        'file'    => 'El :attribute debe pesar :size kilobytes.',
        'string'  => 'El :attribute debe contener :size caracteres.',
        'array'   => 'El :attribute debe contener :size elementos.',
    ],
    'starts_with'          => 'El :attribute debe comenzar con uno de los siguientes valores: :values.',
    'string'               => 'El :attribute debe ser una cadena de texto.',
    'timezone'             => 'El :attribute debe ser una zona horaria válida.',
    'unique'               => 'El :attribute ya ha sido registrado.',
    'uploaded'             => 'El :attribute no se pudo subir.',
    'url'                  => 'El formato del :attribute no es válido.',
    'uuid'                 => 'El :attribute debe ser un UUID válido.',

    /*
    |--------------------------------------------------------------------------
    | Mensajes personalizados
    |--------------------------------------------------------------------------
    */
    'custom' => [
        // Ejemplo:
        // 'attribute-name' => [
        //     'rule-name' => 'mensaje personalizado',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Atributos
    |--------------------------------------------------------------------------
    | Aquí puedes mapear los nombres de los campos a textos más amigables.
    */
    'attributes' => [
        'name' => 'nombre',
        'nombre' => 'nombre',
        'nombre_completo' => 'nombre completo',
        'correo' => 'correo institucional',
        'email' => 'correo electrónico',
        'password' => 'contraseña',
        'contrasena' => 'contraseña',
        'contrasena_confirmation' => 'confirmación de contraseña',
        'password_confirmation' => 'confirmación de contraseña',
        'identificacion' => 'número de identificación',
        'telefono' => 'teléfono',
        'rol' => 'rol',
        'universidad' => 'universidad',
        'carrera' => 'carrera',
        'fecha_registro' => 'fecha de registro',
        'fecha_nacimiento' => 'fecha de nacimiento',
        'genero' => 'género',
        'estado_empleo' => 'estado de empleo',
        'estado_estudios' => 'estado de estudios',
    ],

];
