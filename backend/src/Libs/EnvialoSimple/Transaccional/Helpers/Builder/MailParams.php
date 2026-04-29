<?php

namespace App\Libs\EnvialoSimple\Transaccional\Helpers\Builder;

class MailParams {
    private $from;
    private $to;
    private $replyTo;
    private $previewText;
    private $subject;
    private $html;
    private $text;
    private $context = [];

    public function setFrom($email, $name = '') {
        $this->from = $name ? "$name <$email>" : $email;
        return $this;
    }

    public function setTo($email, $name = '') {
        $this->to = $name ? "$name <$email>" : $email;
        return $this;
    }

    public function setReplyTo($email) {
        $this->replyTo = $email;
        return $this;
    }

    public function setPreviewText($text) {
        $this->previewText = $text;
        return $this;
    }

    public function setSubject($subject) {
        $this->subject = $subject;
        return $this;
    }

    public function setHtml($html) {
        $this->html = $html;
        return $this;
    }

    public function setText($text) {
        $this->text = $text;
        return $this;
    }

    public function setContext(array $context) {
        $this->context = $context;
        return $this;
    }

    public function toArray() {
        return [
            'from' => $this->from,
            'to' => $this->to,
            'replyTo' => $this->replyTo,
            'previewText' => $this->previewText,
            'subject' => $this->subject,
            'html' => $this->html,
            'text' => $this->text,
            'context' => $this->context
        ];
    }
}
