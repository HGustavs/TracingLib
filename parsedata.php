<?php

//        (\ /)
//        (. .)           
//       c(")(")  ∴ 
//---------------------
// CREATE TABLE gdata(xres integer, yres integer, tracingtime real, vectortime real, objno integer, pointno integer, vectno integer, updtime datetime, url text, did INTEGER AUTO_INCREMENT, filenme varchar(128), primary key(did));

date_default_timezone_set("Europe/Berlin");

$datan = $_POST['benchmark'];
$filename = $_POST['m'];

$dataarr=explode("\n", $datan);

$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8', DB_USER, DB_PASSWORD);
$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );

$sql = 'DELETE FROM gdata WHERE filenme=":filenme";';
$stmt = $pdo->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
$stmt->bindParam(':filenme', $filename);
$stmt->execute();

foreach($dataarr as $key => $value){
    $dataarrz=explode(",", $value);
    $tracingtime=floatval($dataarrz[2]);
    $vectortime=floatval($dataarrz[3]);
    $objno=floatval($dataarrz[4]);
    $pointno=floatval($dataarrz[5]);
    $vectno=floatval($dataarrz[6]);
    $updtime=date("Y-m-d H:i:s",strtotime($dataarrz[7]));
    $floodtime=$dataarrz[9];
  
    echo $floodtime;
    //print_r($dataarrz);
    if(count($dataarrz)>5){
        $sql = 'INSERT INTO gdata(xres,yres,tracingtime,vectortime, objno, pointno, vectno, updtime, url,filenme,floodtime) VALUES(:xres,:yres,:tracingtime,:vectortime,:objno,:pointno,:vectno,:updtime,:url,:filenme,:floodtime);';
        $stmt = $pdo->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
        $stmt->bindParam(':xres', $dataarrz[0]);
        $stmt->bindParam(':yres', $dataarrz[1]);
        $stmt->bindParam(':tracingtime', $tracingtime);
        $stmt->bindParam(':vectortime', $vectortime);
        $stmt->bindParam(':objno', $objno);
        $stmt->bindParam(':pointno', $pointno);
        $stmt->bindParam(':vectno', $vectno);
        $stmt->bindParam(':updtime', $updtime);
        $stmt->bindParam(':url', $dataarrz[8]);
        $stmt->bindParam(':filenme', $filename);
        $stmt->bindParam(':floodtime', $floodtime);
        $stmt->execute();
    }
      
}

echo "Success!<br>";
print_r($dataarr);

?>