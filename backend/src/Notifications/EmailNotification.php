<?php

namespace App\Notifications;

use App\Services\EmailService;

abstract class EmailNotification implements NotificationInterface {
    protected $to;
    protected $subject;
    protected $body;

    public function __construct($to, $subject) {
        $this->to = $to;
        $this->subject = $subject;
    }

    public function send() {
        return EmailService::send($this->to, $this->subject, $this->body);
    }

    abstract protected function build();
}
