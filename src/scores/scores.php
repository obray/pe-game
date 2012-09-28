<?php

    if (!isset($_POST['name']) || !isset($_POST['score'])) {
        return;
    }

    $name = $_POST['name'];
    $score = $_POST['score'];

    $file = file_get_contents('scores.json');
    $json = json_decode($file);

    if (!is_array($json)) {
        $json = array();
    }

    array_push($json, array(
        'name' => $name,
        'score' => $score
    ));

    file_put_contents('scores.json', json_encode($json));
