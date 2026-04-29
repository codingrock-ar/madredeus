<?php

namespace App\Libs\EnvialoSimple;

use App\Libs\EnvialoSimple\Transaccional\Mail;

class Transaccional {
    private $apiKey;
    public $mail;

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
        $this->mail = new Mail($apiKey);
    }
}

namespace App\Libs\EnvialoSimple\Transaccional;

use App\Libs\EnvialoSimple\Transaccional\Helpers\Builder\MailParams;

class Mail {
    private $apiKey;
    private $apiUrl = 'https://backend.envialosimple.email/api/v1/mail/send';

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function send(MailParams $params) {
        $data = $params->toArray();
        
        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        }
        
        error_log("EnvialoSimple Error ($httpCode): " . $response);
        return false;
    }
}
