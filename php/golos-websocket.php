<?php
//подключение библиотеки
require('vendor/autoload.php');
use WebSocket\Client;

//создание клиента
$client = new Client("wss://ws.golos.io/");

//основной запрос
$a = json_encode(
  [
    'id' => 1, 'method' => 'get_dynamic_global_properties'
  ]
);

//запрос на пользователей
$b = json_encode(
  [
    'id' => 2, 'method'=>'get_accounts', 'params'=>[['tristamoff', 'mir', 'qqc']]
  ]
);

//отправка запроса
$client->send($b);

//получение ответа
$response = json_decode($client->receive());
if (!empty($response->result)) {
  //ответ получен, перебираем массив пользователей
  foreach ($response->result as $user) {
    //вывод фото
    $json_metadata = json_decode($user->json_metadata);
    if (!empty($json_metadata->user_image)) {
      echo '<img src="' . $json_metadata->user_image . '" style="max-width:200px;" /><br />';
    }

    echo 'Зарегистрирован: ' . $user->created . '<br />';
    echo 'Постов: ' . $user->post_count . '<br />';
    echo 'Золота: ' . $user->sbd_balance . '<br />';
    echo '<hr />';
  }
}


//вывод блока
$c = json_encode(
  [
    'id' => 3, 'method'=>'get_block', 'params'=>[3452345]
  ]
);
$client->send($c);
//вывод ответа
echo '<pre>';
print_r(json_decode($client->receive()));
echo '</pre>';

//закрытие соединения
$client->close();